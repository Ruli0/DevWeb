/*
 * Le montage « avis » : épisode ("version": 4) + voix préparée (videos/voix/<id>/mots.json) → feuille de route.
 * Fonction pure : montage(episode, voix) → { erreurs, feuille }.
 *   1. on retire les silences (il en reste une respiration) et les passages listés dans "retirer" ;
 *   2. chaque mot reçoit son instant dans la voix montée ; les sous-titres en découlent ;
 *   3. chaque plan visuel commence sur le mot donné par son ancre "a".
 */
'use strict';
const S = require('./style.js');
const PLANS = require('./plans.js');
const ILLUS = require('./illustrations.js');
const DECORS = require('./decors.js');
const UNIS = ['nuit', 'papier', 'accent'];                       // les fonds unis, qui alternent quand rien n'est précisé
const DECORS3D = require('./decors3d.js');
const FONDS = [...UNIS, ...Object.keys(DECORS), ...Object.keys(DECORS3D), 'photo'];        // + les décors illustrés + une photo de l'auteur
const TRANSITIONS = ['cercle', 'volet', 'biseau', 'rideau'];
const RECOUVREMENT = 0.6;   // un plan reste affiché sous le suivant pendant sa transition

const arrondi = (x) => +x.toFixed(3);
const cle = (m) => String(m).toLowerCase().replace(/[’']/g, "'").replace(/[.,;:!?«»"()\u00a0]/g, '').trim();

// Cherche une suite de mots (« ancre ») dans la transcription, à partir de l'indice `depuis`. Renvoie l'indice du premier mot, ou -1.
function chercher(mots, ancre, depuis = 0) {
  const a = cle(ancre).split(/\s+/).filter(Boolean);
  for (let i = depuis; i + a.length <= mots.length; i += 1) if (a.every((x, k) => cle(mots[i + k].m) === x)) return i;
  return -1;
}

// Réunit des intervalles qui se touchent ou se chevauchent.
function reunir(liste) {
  const tri = liste.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  const out = [];
  tri.forEach(([a, b]) => { const d = out[out.length - 1]; if (d && a <= d[1] + 1e-6) d[1] = Math.max(d[1], b); else out.push([a, b]); });
  return out;
}

// Les passages de la voix d'origine que l'on garde, d'après les silences et les passages à retirer.
function garder(voix, retraits, reglages) {
  const { respiration, marge } = reglages;
  const sil = voix.silences;
  const coupes = [];
  sil.forEach(([a, b]) => {
    if (a <= 0.01) coupes.push([0, b - marge]);                       // silence de début
    else if (b >= voix.duree - 0.01) coupes.push([a + 0.25, voix.duree]); // silence de fin : on garde la retombée
    else if (b - a > respiration) coupes.push([a + respiration / 2, b - respiration / 2]);
  });
  // Un passage retiré va du silence qui précède son premier mot au silence qui précède le mot suivant.
  const bord = (t) => { const s = sil.find(([a, b]) => t >= a - 0.3 && t <= b + 0.3); return s || null; };
  retraits.forEach(([i, j]) => {
    const s0 = bord(voix.mots[i].d), suivant = voix.mots[j + 1];
    const s1 = suivant ? bord(suivant.d) : null;
    const debut = s0 ? (s0[0] <= 0.01 ? 0 : s0[0] + respiration / 2) : voix.mots[i].d;
    const fin = suivant ? (s1 ? s1[1] - respiration / 2 : suivant.d) : voix.duree;
    coupes.push([debut, fin]);
  });
  const c = reunir(coupes);
  const garde = [];
  let t = 0;
  c.forEach(([a, b]) => { if (a > t) garde.push([arrondi(t), arrondi(a)]); t = b; });
  if (t < voix.duree) garde.push([arrondi(t), arrondi(voix.duree)]);
  return garde;
}

// Instant d'origine → instant dans la voix montée (accélérée de `vitesse`).
// `pauses` : des silences ajoutés après certains passages gardés ({ k: indice du passage, d: secondes }), pour un compte à rebours.
function horloge(garde, vitesse, pauses = []) {
  return (t) => {
    let passe = 0, ajoute = 0;
    garde.some(([a, b], k) => {
      if (t <= a) return true;
      passe += Math.min(t, b) - a;
      if (t > b) pauses.forEach((p) => { if (p.k === k) ajoute += p.d; });
      return false;
    });
    return arrondi(passe / vitesse + ajoute);
  };
}

function sousTitres(mots, r) {
  const groupes = [];
  let g = null;
  mots.forEach((m, i) => {
    const precedent = mots[i - 1];
    const long = g ? g.mots.reduce((n, x) => n + x.m.length + 1, 0) + m.m.length : 0;
    const coupe = !g || g.mots.length >= r.motsMax || long > r.carMax || /[.,;:!?]$/.test(precedent.m) || m.t - precedent.f > r.pause;
    if (coupe) { g = { t0: m.t, mots: [] }; groupes.push(g); }
    g.mots.push(m);
  });
  groupes.forEach((x, i) => {
    const fin = x.mots[x.mots.length - 1].f;
    x.t1 = arrondi(groupes[i + 1] ? Math.min(groupes[i + 1].t0, fin + r.tenue) : fin + r.tenue);
  });
  return groupes;
}

function montage(ep, voix) {
  const erreurs = [];
  if (ep.version !== 4) erreurs.push('ajoute "version": 4 (chaîne « avis »)');
  const THEMES = require('./themes.js');
  if (ep.theme && !THEMES[ep.theme]) erreurs.push(`"theme" : un parmi ${Object.keys(THEMES).join(', ')}`);
  const rub = S.rubriques[ep.rubrique];
  if (!rub) erreurs.push(`"rubrique" : une parmi ${Object.keys(S.rubriques).join(', ')}`);
  if (!voix) { erreurs.push(`la voix manque : python3 scripts/voix.py <enregistrement> ${ep.voix || ep.id}`); return { erreurs, feuille: null }; }
  const reglages = Object.assign({}, S.voix, ep.reglages || {});

  // 1. Les passages retirés, donnés par leurs premiers et derniers mots.
  const retraits = [];
  (ep.retirer || []).forEach(([de, a]) => {
    const i = chercher(voix.mots, de), j0 = chercher(voix.mots, a, Math.max(0, i));
    if (i < 0 || j0 < 0) { erreurs.push(`"retirer" : « ${i < 0 ? de : a} » introuvable dans la voix`); return; }
    retraits.push([i, j0 + cle(a).split(/\s+/).length - 1]);
  });
  const garde = garder(voix, retraits, reglages);
  // Les pauses demandées ("pauses": [{ "apres": "derniers mots", "duree": 5 }]) : un silence ajouté à la fin du passage qui contient ces mots.
  const pausesVoix = [];
  (ep.pauses || []).forEach((pa) => {
    const i = chercher(voix.mots, pa.apres);
    if (i < 0) { erreurs.push(`"pauses" : « ${pa.apres} » introuvable dans la voix`); return; }
    const fin = voix.mots[i + cle(pa.apres).split(/\s+/).length - 1].f;
    const k = garde.findIndex(([, b]) => b >= fin - 0.05);
    if (k < 0) { erreurs.push(`"pauses" : « ${pa.apres} » tombe dans un passage retiré`); return; }
    pausesVoix.push({ k, d: pa.duree });
  });
  const h = horloge(garde, reglages.vitesse, pausesVoix);
  // L'instant où commence chaque pause dans la vidéo.
  const pauses = pausesVoix.map((pa) => ({ t: arrondi(h(garde[pa.k][1])), d: pa.d }));
  const dureeVoix = h(voix.duree);

  // 2. Les mots affichés : sans les passages retirés, avec les corrections d'orthographe et les mots forts.
  const retire = (k) => retraits.some(([i, j]) => k >= i && k <= j);
  const forts = new Set();
  (ep.forts || []).forEach((f) => {
    const n = cle(f).split(/\s+/).length;
    let i = chercher(voix.mots, f);
    if (i < 0) erreurs.push(`"forts" : « ${f} » introuvable dans la voix`);
    while (i >= 0) { for (let k = 0; k < n; k += 1) forts.add(i + k); i = chercher(voix.mots, f, i + 1); }
  });
  const corrections = ep.corrections || {};
  const mots = [];
  voix.mots.forEach((m, k) => {
    if (retire(k)) return;
    const texte = Object.prototype.hasOwnProperty.call(corrections, k) ? corrections[k] : m.m;
    if (!texte) return;
    mots.push({ m: texte, t: h(m.d), f: Math.max(h(m.f), h(m.d) + 0.05), fort: forts.has(k) || undefined });
  });
  const groupes = sousTitres(mots, S.sousTitres);

  // 3. Les plans : chacun commence sur son ancre, et dure jusqu'au suivant.
  const instant = (ancre, depuis, ou) => {
    const i = chercher(voix.mots, ancre, depuis);
    if (i < 0) { erreurs.push(`${ou} : l’ancre « ${ancre} » est introuvable dans la voix (après le mot ${depuis})`); return { i: depuis, t: 0 }; }
    if (retire(i)) erreurs.push(`${ou} : l’ancre « ${ancre} » tombe dans un passage retiré`);
    return { i, t: h(voix.mots[i].d) };
  };
  const plans = [];
  let curseur = 0, apres = 0;
  (ep.plans || []).forEach((pl, n) => {
    const def = PLANS[pl.plan];
    const ou = `plan ${n + 1} (${pl.plan})`;
    if (!def) { erreurs.push(`${ou} : inconnu. Plans possibles : ${Object.keys(PLANS).join(', ')}`); return; }
    const p = JSON.parse(JSON.stringify(pl)); delete p.plan; delete p.a; delete p.apres; delete p.fond; delete p.transition;
    if (pl.fond === 'photo' && !p.photo) erreurs.push(`${ou} : le fond « photo » demande "photo": "fichier.jpg" (dans videos/medias/)`);
    if (p.illu && !ILLUS[p.illu]) erreurs.push(`${ou} : illustration « ${p.illu} » inconnue. Possibles : ${Object.keys(ILLUS).join(', ')}`);
    if (pl.fond && !FONDS.includes(pl.fond)) erreurs.push(`${ou} : "fond" : un parmi ${FONDS.join(', ')}`);
    if (pl.transition && !TRANSITIONS.includes(pl.transition)) erreurs.push(`${ou} : "transition" : une parmi ${TRANSITIONS.join(', ')}`);
    let t0;
    if (pl.apres) { t0 = dureeVoix + apres; apres += pl.apres; p._duree = pl.apres; } else if (n === 0) t0 = 0;
    else { const r = instant(pl.a || '', curseur, ou); curseur = r.i; t0 = Math.max(0, r.t - 0.12); }
    // Les ancres internes (éléments d'une liste, bascule…) deviennent des instants relatifs au plan.
    def.ancres(p).forEach(([objet, champ]) => {
      if (!objet || !objet[champ]) return;
      objet.t = arrondi(Math.max(0, instant(objet[champ], curseur, ou).t - t0 - 0.1));
    });
    // Les mouvements de caméra (décors 3D) : "camera": ["tour", { "m": "zoom:paysan", "a": "le paysan" }]. Une ancre fixe le début du mouvement.
    if (p.camera) {
      p.camera = p.camera.map((c) => (typeof c === 'string' ? { m: c } : Object.assign({}, c)));
      p.camera.forEach((c) => { if (c.a) { c.t = arrondi(Math.max(0, instant(c.a, curseur, ou).t - t0 - 0.15)); delete c.a; } });
      const d3 = DECORS3D[pl.fond] || DECORS3D[`${pl.fond}3d`];
      if (d3 && d3.mouvements) p.camera.forEach((c) => { const [m, cible] = String(c.m).split(':'); if (!d3.mouvements.includes(m) || (cible && !d3.cibles.includes(cible))) erreurs.push(`${ou} : mouvement de caméra « ${c.m} » inconnu. Mouvements : ${d3.mouvements.join(', ')} ; cibles : ${d3.cibles.join(', ')}`); });
    }
    def.textes(p).forEach((x) => { const nu = String(x || '').replace(/\*/g, ''); if (nu.length > def.max) erreurs.push(`${ou} : « ${nu} » fait ${nu.length} caractères (au plus ${def.max})`); });
    // Sans consigne, les fonds et les transitions alternent : deux plans voisins n'ont jamais le même fond.
    // Un compte à rebours se cale sur la première pause qui suit le début du plan.
    if (pl.plan === 'rebours') {
      const pa = pauses.find((x) => x.t >= t0 - 0.01);
      if (!pa) erreurs.push(`${ou} : aucune pause après ce plan (ajoute "pauses": [{ "apres": "…", "duree": 5 }])`);
      else { p.t = arrondi(pa.t - t0); p.secondes = pa.d; }
    }
    // "decors3d": true dans l'épisode (ou --3d en ligne de commande) : un décor passe à sa version 3D quand elle existe (mur → mur3d).
    if (ep.decors3d && pl.fond && DECORS3D[`${pl.fond}3d`]) pl = Object.assign({}, pl, { fond: `${pl.fond}3d` });
    plans.push({ id: pl.plan, t0: arrondi(t0), p, fond: pl.fond || UNIS[n % UNIS.length], transition: pl.transition || TRANSITIONS[n % TRANSITIONS.length] });
  });
  const duree = arrondi(dureeVoix + apres);
  plans.forEach((x, i) => { x.d = arrondi((plans[i + 1] ? plans[i + 1].t0 : duree) - x.t0); x.dClip = arrondi(plans[i + 1] ? Math.min(x.d + RECOUVREMENT, duree - x.t0) : x.d);
    // Les mouvements sans ancre se partagent le plan à parts égales.
    if (x.p.camera) { const n = x.p.camera.length; x.p.camera.forEach((c, k) => { if (c.t == null) c.t = arrondi(k * x.dClip / n); }); x.p.camera.sort((u, v) => u.t - v.t); } if (x.d < 1.2) erreurs.push(`plan ${i + 1} (${x.id}) : ${x.d} s à l’écran, c’est trop court (au moins 1,2 s)`); });
  plans.forEach((x, i) => { if (i && x.fond === plans[i - 1].fond && x.fond !== 'photo') erreurs.push(`plan ${i + 1} (${x.id}) : même fond « ${x.fond} » que le plan précédent : change "fond"`); });
  if (!plans.length) erreurs.push('aucun plan');
  if (!ep.essai && (duree < 15 || duree > 75)) erreurs.push(`durée ${duree} s : il faut entre 15 et 75 s`);

  const feuille = {
    version: 4, format: 'avis', theme: ep.theme && THEMES[ep.theme] ? ep.theme : 'decoupe', id: ep.id, titre: ep.titre || ep.id, numero: ep.numero || 1,
    rubrique: rub ? rub.nom : '', accent: rub ? rub.accent : '#fff', fond: S.couleurs.fond, texte: S.couleurs.texte,
    duree, dureeVoix, voix: { id: ep.voix || ep.id, garde, pauses: pausesVoix, vitesse: reglages.vitesse, volume: reglages.volume },
    musique: { nom: ep.musique || 'labo', volume: reglages.musique },
    // Bruitages : un tic par seconde de compte à rebours, un impact à la fin.
    pauses, sons: pauses.flatMap((pa) => [...Array.from({ length: Math.round(pa.d) }, (_, i) => ({ f: 'tic.wav', t: arrondi(pa.t + i), v: 0.4 })), { f: 'impact.wav', t: arrondi(pa.t + pa.d - 0.05), v: 0.3 }]),
    mots: mots.length, groupes, plans, publication: ep.publication || null,
  };
  return { erreurs, feuille };
}

module.exports = { UNIS, FONDS, TRANSITIONS, montage, chercher, garder, horloge, sousTitres, reunir };
