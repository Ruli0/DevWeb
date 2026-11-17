// Le premier montage automatique : d'une voix transcrite (videos/voix/<id>/mots.json, fait par scripts/voix.py) à un épisode proposé.
//   node scripts/brouillon.js <id> [--rubrique=travail] [--sortie=chemin.json]
// Écrit videos/episodes/<id>.json S'IL N'EXISTE PAS (jamais d'écrasement : l'épisode est la source, on le retouche ensuite),
// puis le monte pour afficher les erreurs et les conseils d'accroche. Voir production/PASSATION-AVIS.md.
// Fonction pure : brouillon(voix, { id, rubrique, numero }) → épisode (objet).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const SUJETS = require('../studio/avis/sujets.js');
const PERSO = require('../studio/avis/personnage.js');
const { PALETTES } = require('../studio/avis/palettes.js');

const PONCT = /^[?!.…,;:]+$/;
const FIN = /[.?!…]$/;
const sans = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const net = (m) => String(m).replace(/[?!.…,;:«»"()]/g, '').trim();

// Les segments : des suites de mots coupées à chaque fin de phrase, virgule ou silence de plus de 0,6 s.
function segments(mots) {
  const seg = []; let cur = null;
  mots.forEach((m, i) => {
    if (PONCT.test(m.m)) { if (cur) { cur.fin = cur.fin || /[?!.…]/.test(m.m); cur.question = cur.question || /\?/.test(m.m); } return; }
    if (!cur) { cur = { i0: i, i1: i, t0: m.d, t1: m.f, fin: false, question: false }; seg.push(cur); }
    cur.i1 = i; cur.t1 = m.f;
    const suivant = mots.slice(i + 1).find((x) => !PONCT.test(x.m));
    const dur = FIN.test(m.m) || (suivant && suivant.d - m.f > 0.6) || /,$/.test(m.m);
    if (FIN.test(m.m)) { cur.fin = true; cur.question = cur.question || /\?$/.test(m.m); }
    if (dur || !suivant) cur = null;
  });
  // Un segment de plus de 5 s sans ponctuation (une voix générée n'en met presque pas) est coupé au milieu : à la plus grande pause,
  // sinon sur une conjonction (et, mais, donc, car, puis) proche du milieu.
  const CONJ = /^(et|mais|donc|car|puis|alors)$/;
  const sortie = [];
  seg.forEach((s0) => {
    const mid = (s0.t0 + s0.t1) / 2;
    if (s0.t1 - s0.t0 <= 5) { sortie.push(s0); return; }
    let coupe = -1, meilleur = Infinity;
    for (let i = s0.i0 + 1; i <= s0.i1; i += 1) {
      if (PONCT.test(mots[i].m) || PONCT.test(mots[i - 1].m)) continue;
      const trou = mots[i].d - mots[i - 1].f, ok = trou > 0.25 || CONJ.test(sans(net(mots[i].m)));
      const reste = Math.min(mots[i].d - s0.t0, s0.t1 - mots[i].d);
      if (ok && reste >= 1.4 && Math.abs(mots[i].d - mid) < meilleur) { meilleur = Math.abs(mots[i].d - mid); coupe = i; }
    }
    if (coupe < 0) { sortie.push(s0); return; }
    sortie.push(Object.assign({}, s0, { i1: coupe - 1, t1: mots[coupe - 1].f, fin: false, question: false }), Object.assign({}, s0, { i0: coupe, t0: mots[coupe].d }));
  });
  return sortie;
}

// Les plans : on fusionne les segments voisins jusqu'à 3,5 s au moins (8 s au plus), puis on absorbe les plans de moins de 2 s
// (seuils réduits pour une vidéo courte).
function plansDe(seg, duree = 40) {
  // Les seuils s'adaptent aux vidéos très courtes (un POV de 9 s ne se coupe pas comme une vidéo de 40 s).
  const CIBLE = Math.max(1.8, Math.min(3.5, duree / 4)), MINI = Math.max(1.4, Math.min(2, duree / 5));
  const plans = [];
  seg.forEach((s) => {
    const p = plans[plans.length - 1];
    if (p && !p.clos && (s.t1 - p.t0) <= 8) { p.i1 = s.i1; p.t1 = s.t1; p.fin = s.fin; p.question = s.question; } else plans.push(Object.assign({ clos: false }, s));
    const q = plans[plans.length - 1];
    if (q.t1 - q.t0 >= CIBLE) q.clos = true;
  });
  for (let k = plans.length - 1; k >= 1; k -= 1) {
    if (plans[k].t1 - plans[k].t0 < MINI) { plans[k - 1].i1 = plans[k].i1; plans[k - 1].t1 = plans[k].t1; plans[k - 1].question = plans[k].question; plans.splice(k, 1); }
  }
  if (plans.length > 1 && plans[0].t1 - plans[0].t0 < MINI) { plans[1].i0 = plans[0].i0; plans[1].t0 = plans[0].t0; plans.shift(); }
  return plans;
}

// Les mots forts : sigles, nombres, mot après un « appui », puis le dernier mot de chaque phrase longue. Au plus quatre.
function forts(mots) {
  const niv = [[], [], [], []];
  const ajout = (n, m) => { const t = net(m); if (t.length > 2 && !SUJETS.vides.test(sans(t)) && !niv.flat().includes(t.toLowerCase())) niv[n].push(t.toLowerCase()); };
  mots.forEach((m, i) => {
    const t = net(m.m);
    if (/^[A-ZÉ]{2,}$/.test(t)) niv[0].push(t.toLowerCase());
    else if (/\d/.test(t)) ajout(1, m.m);
    else if (i && SUJETS.appuis.test(sans(net(mots[i - 1].m)))) ajout(2, m.m);
  });
  let debut = 0;
  mots.forEach((m, i) => {
    if (FIN.test(m.m)) { if (i - debut + 1 > 4) ajout(3, m.m); debut = i + 1; }
  });
  // « IA » est cherché tel qu'il est dit (la recherche ne tient pas compte des majuscules).
  return [...new Set(niv.flat())].slice(0, 4);
}

// Les corrections d'affichage : « Tchad, GPT » → « ChatGPT » ; « 10% » → « 10 % ».
function corrections(mots) {
  const c = {};
  mots.forEach((m, i) => {
    if (/^tchad,?$/i.test(m.m) && mots[i + 1] && /^gpt/i.test(mots[i + 1].m)) { c[i] = `ChatGPT${/,$/.test(mots[i + 1].m) ? ',' : ''}`; c[i + 1] = ''; }
    else if (/^\d+%[.,]?$/.test(m.m)) c[i] = m.m.replace('%', ' %');
  });
  return c;
}

function brouillon(voix, { id = 'brouillon', rubrique = 'travail', numero = 1 } = {}) {
  const mots = voix.mots;
  const plans = plansDe(segments(mots), voix.duree);
  const phrase = (p) => mots.slice(p.i0, p.i1 + 1).filter((m) => !PONCT.test(m.m));
  const texteDe = (p) => phrase(p).map((m) => m.m).join(' ');
  let uni = 0, precedent = null;
  const sortie = plans.map((p, n) => {
    const t = sans(texteDe(p));
    const score = SUJETS.decors.map((d) => ({ decor: d.decor, n: (t.match(new RegExp(d.mots.source, 'g')) || []).length })).filter((d) => d.n > 0).sort((a, b) => b.n - a.n);
    let fond = (score.find((d) => d.decor !== precedent) || {}).decor;
    const illustre = !!fond;
    if (!fond) { fond = SUJETS.unis[uni % SUJETS.unis.length]; uni += 1; if (fond === precedent) { fond = SUJETS.unis[uni % SUJETS.unis.length]; uni += 1; } }
    precedent = fond;
    const pl = { plan: 'visuel', fond };
    if (n) { const ancre = phrase(p).slice(0, 3).map((m) => m.m).join(' '); pl.a = ancre; }
    if (!illustre) { if (p.question) pl.illu = 'question'; else pl._conseil = 'aucun décor reconnu : choisis un décor ou une illustration'; }
    return pl;
  });
  // L'accroche : un titre sur la première phrase, raccourcie.
  // La première phrase : jusqu'au premier mot qui finit une phrase ou jusqu'à un signe « . ? ! » isolé (la transcription les sépare parfois).
  const debutPhrase = []; let question = false;
  for (const m of mots) {
    if (PONCT.test(m.m)) { if (/[.?!…]/.test(m.m)) { question = /\?/.test(m.m); break; } continue; }
    debutPhrase.push(m); if (FIN.test(m.m)) { question = /\?$/.test(m.m); break; }
  }
  // Le titre : six mots au plus, sans mot vide à la fin ; le dernier mot est mis en valeur.
  const court = debutPhrase.slice(0, 6).map((m) => net(m.m));
  while (court.length > 2 && SUJETS.vides.test(sans(court[court.length - 1]))) court.pop();
  if (court.length) {
    const k = court.length - 1; court[k] = `*${court[k]}*`;
    sortie[0].plan = 'titre'; sortie[0].texte = court.join(' ') + (question && debutPhrase.length === court.length ? ' ?' : '');
    if (debutPhrase.length > 12) sortie[0]._conseil = `la première phrase fait ${debutPhrase.length} mots : une accroche tient en 12 mots ; coupe le préambule avec "retirer"`;
  }
  if (PERSO.PLACES[sortie[0].fond]) sortie[0].personnage = true;
  // La fin : la dernière phrase si c'est une question courte, sinon une question à écrire.
  const dernier = sortie[sortie.length - 1], dp = plans[plans.length - 1];
  const finale = phrase(dp).map((m) => net(m.m));
  if (dp.question && finale.length <= 8 && finale.join(' ').length <= 40) dernier.question = { texte: `${finale.slice(0, -1).join(' ')} *${finale[finale.length - 1]}* ?`.trim(), apres: 3 };
  else dernier.question = { texte: 'Et toi ?', apres: 3, _a_ecrire: true };
  const ep = {
    version: 4, format: 'avis', id, titre: texteDe(plans[0]).slice(0, 70), rubrique: PALETTES.vive.accents[rubrique] ? rubrique : 'travail', numero, voix: id,
    corrections: corrections(mots), forts: forts(mots), plans: sortie,
    publication: { texte: '', hashtags: [], _a_ecrire: true },
  };
  if (voix.duree < 18) ep.essai = true;
  if (!Object.keys(ep.corrections).length) delete ep.corrections;
  if (!ep.forts.length) delete ep.forts;
  return ep;
}

module.exports = { brouillon, segments, plansDe, forts, corrections };

if (require.main === module) {
  const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1];
  const [id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!id) { console.error('Usage : node scripts/brouillon.js <id> [--rubrique=travail] [--sortie=chemin.json]'); process.exit(1); }
  const racine = path.join(__dirname, '..');
  const chemin = path.join(racine, 'videos/voix', id, 'mots.json');
  if (!fs.existsSync(chemin)) { console.error(`la voix manque : python3 scripts/voix.py <enregistrement> ${id}`); process.exit(1); }
  const sortie = arg('sortie') || path.join(racine, 'videos/episodes', `${id}.json`);
  if (fs.existsSync(sortie)) { console.error(`${path.relative(racine, sortie)} existe déjà : le brouillon ne l'écrase jamais (utilise --sortie=autre.json pour comparer)`); process.exit(1); }
  const voix = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  const numero = fs.readdirSync(path.join(racine, 'videos/episodes')).filter((f) => f.endsWith('.json') && !f.endsWith('.sources.json')).length;
  const ep = brouillon(voix, { id, rubrique: arg('rubrique') || 'travail', numero });
  fs.writeFileSync(sortie, `${JSON.stringify(ep, null, 2)}\n`);
  console.log(`Brouillon écrit : ${path.relative(racine, sortie)} (${ep.plans.length} plans)`);
  const { montage } = require('../studio/avis/montage.js');
  const { erreurs, feuille } = montage(ep, voix);
  ep.plans.forEach((p, i) => console.log(`  ${String(i + 1).padStart(2)}. ${p.plan.padEnd(6)} ${p.fond.padEnd(11)} ${p.a ? `« ${p.a} »` : '(début)'}${p.texte ? `  → ${p.texte}` : ''}${p._conseil ? `  ⚠ ${p._conseil}` : ''}`));
  if (erreurs.length) console.log(`À corriger avant de monter :\n  - ${erreurs.join('\n  - ')}`);
  else if (feuille.conseils.length) console.log(`Conseils : \n  - ${feuille.conseils.join('\n  - ')}`);
  console.log('À écrire à la main : la question de fin si elle porte "_a_ecrire", et "publication". Puis : npm run video -- ' + id);
}
