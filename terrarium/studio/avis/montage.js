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
const PERSO = require('./personnage.js');
const ORBE = require('./orbe.js');
const { PALETTES } = require('./palettes.js');
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
    if (a <= 0.3) coupes.push([0, b - marge]);                        // silence de début (même s'il est précédé d'un petit bruit)
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
  if (ep.allure && !PERSO.ALLURES[ep.allure]) erreurs.push(`"allure" : une parmi ${Object.keys(PERSO.ALLURES).join(', ')}`);
  if (ep.musique && !['avis', 'aucune', 'labo', 'funk', 'electro', 'acoustique', 'house', 'house-nue', 'house-plate'].includes(ep.musique)) erreurs.push('"musique" : labo, house-plate, house, house-nue, funk, electro, acoustique, avis ou aucune');
  if (ep.indicatif && !['A', 'B', 'C'].includes(ep.indicatif)) erreurs.push('"indicatif" : A, B ou C');
  if (ep.ouverture && !['vive', 'calme'].includes(ep.ouverture)) erreurs.push('"ouverture" : « vive » (défaut) ou « calme »');
  if (ep.aspect3d && !['doux', 'decoupe'].includes(ep.aspect3d)) erreurs.push('"aspect3d" : « doux » ou « decoupe »');
  if (ep.palette && !PALETTES[ep.palette]) erreurs.push(`"palette" : une parmi ${Object.keys(PALETTES).join(', ')}`);
  const pal = PALETTES[ep.palette] || PALETTES[S.palette];
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
  const avecPlace = (ep.plans || []).map((pl, n) => (PERSO.PLACES[pl.fond] && pl.personnage === undefined ? n : -1)).filter((n) => n >= 0);
  const premierAvecPlace = avecPlace[0], dernierAvecPlace = avecPlace[avecPlace.length - 1];
  const plans = [];
  let curseur = 0, apres = 0;
  (ep.plans || []).forEach((pl, n) => {
    const def = PLANS[pl.plan];
    const ou = `plan ${n + 1} (${pl.plan})`;
    if (!def) { erreurs.push(`${ou} : inconnu. Plans possibles : ${Object.keys(PLANS).join(', ')}`); return; }
    const p = JSON.parse(JSON.stringify(pl)); delete p.plan; delete p.a; delete p.apres; delete p.fond; delete p.transition;
    // La photo de l'auteur : "photo": "fichier.jpg", ou { "fichier", "cadrage" (0 à 1 : la partie horizontale gardée, 0,5 = le centre),
    // "naturel" : vrai pour garder les couleurs de la photo, sans l'étalonnage de la palette }. Les fichiers sont dans videos/medias/.
    if (pl.fond === 'photo') {
      const ph = typeof p.photo === 'string' ? { fichier: p.photo } : (p.photo || {});
      if (!ph.fichier || !/^[\w.-]+\.(jpe?g|png|webp)$/i.test(ph.fichier)) erreurs.push(`${ou} : le fond « photo » demande "photo": "fichier.jpg" (un fichier de videos/medias/)`);
      if (ph.cadrage != null && !(ph.cadrage >= 0 && ph.cadrage <= 1)) erreurs.push(`${ou} : "cadrage" de la photo : entre 0 et 1`);
      p.photo = { fichier: ph.fichier, cadrage: ph.cadrage == null ? 0.5 : ph.cadrage, naturel: !!ph.naturel };
    }
    // Le collage : des photos détourées (scripts/decouper.py) posées sur le décor, chacune arrivant sur un mot.
    (p.collage || []).forEach((co, k) => {
      if (!co.image || !/^[\w.-]+\.png$/i.test(co.image)) erreurs.push(`${ou} : collage ${k + 1} : "image" doit être un PNG détouré de videos/medias/`);
      if (![co.x, co.y].every((v) => Number.isFinite(v))) erreurs.push(`${ou} : collage ${k + 1} : "x" et "y" (en pixels, image de 1080 × 1920) sont nécessaires`);
      if (co.taille != null && !(co.taille >= 0.1 && co.taille <= 1.5)) erreurs.push(`${ou} : collage ${k + 1} : "taille" (largeur en part de 1080) : entre 0.1 et 1.5`);
    });
    
    if (p.illu && !ILLUS[p.illu]) erreurs.push(`${ou} : illustration « ${p.illu} » inconnue. Possibles : ${Object.keys(ILLUS).join(', ')}`);
    if (pl.fond && !FONDS.includes(pl.fond)) erreurs.push(`${ou} : "fond" : un parmi ${FONDS.join(', ')}`);
    if (pl.transition && !TRANSITIONS.includes(pl.transition)) erreurs.push(`${ou} : "transition" : une parmi ${TRANSITIONS.join(', ')}`);
    let t0;
    if (pl.apres) { t0 = dureeVoix + apres; apres += pl.apres; p._duree = pl.apres; } else if (n === 0) t0 = 0;
    else { const r = instant(pl.a || '', curseur, ou); curseur = r.i; t0 = Math.max(0, r.t - 0.12); }
    // Les ancres internes (éléments d'une liste, bascule…) deviennent des instants relatifs au plan.
    (p.collage || []).forEach((co) => { if (co.a) { co.t = arrondi(Math.max(0, instant(co.a, curseur, ou).t - t0 - 0.1)); delete co.a; } else co.t = 0.4; });
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
      p.camera.forEach((c) => {
        if (c.vitesse && !['vif', 'lent'].includes(c.vitesse)) erreurs.push(`${ou} : "vitesse" d’un mouvement de caméra : « vif » ou « lent » (ou rien)`);
        if (c.force != null && !(c.force >= 0.5 && c.force <= 2)) erreurs.push(`${ou} : "force" d’un mouvement de caméra : entre 0.5 et 2`);
      });
    }
    def.textes(p).forEach((x) => { const nu = String(x || '').replace(/\*/g, ''); if (nu.length > def.max) erreurs.push(`${ou} : « ${nu} » fait ${nu.length} caractères (au plus ${def.max})`); });
    // Sans consigne, les fonds et les transitions alternent : deux plans voisins n'ont jamais le même fond.
    // Le personnage récurrent : "personnage": "salue" sur un plan, ou "personnage": true dans l'épisode (pose par défaut de chaque décor).
    // "personnage": false sur un plan l'enlève. Il ne se tient que dans les décors qui lui ont fait une place.
    {
      // L'auteur ne veut pas le voir trop souvent : avec "personnage": true, il n'apparaît que dans le premier et le dernier décor qui lui font une place.
      const place = PERSO.PLACES[pl.fond], voulu = pl.personnage !== undefined ? pl.personnage : (ep.personnage ? (n === premierAvecPlace || n === dernierAvecPlace) : false);
      delete p.personnage;
      if (voulu && !place) { if (pl.personnage) erreurs.push(`${ou} : le personnage n’a pas de place dans le décor « ${pl.fond} ». Décors possibles : ${Object.keys(PERSO.PLACES).join(', ')}`); }
      else if (voulu) {
        const pose = voulu === true ? place.poses[0] : voulu;
        if (!place.poses.includes(pose)) erreurs.push(`${ou} : la pose « ${pose} » ne va pas dans le décor « ${pl.fond} ». Poses possibles : ${place.poses.join(', ')}`);
        else p.personnage = pose;
      }
    }
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
  // La question de fin posée dans le décor : "question": { "texte": "…", "apres": 3 } sur le dernier plan. Elle arrive quand la voix
  // se tait et prolonge la vidéo de "apres" secondes.
  (ep.plans || []).forEach((pl, n) => { if (pl.question && n !== (ep.plans.length - 1)) erreurs.push(`plan ${n + 1} (${pl.plan}) : "question" se met sur le dernier plan seulement`); });
  const dernier = plans[plans.length - 1];
  if (dernier && dernier.p.question) {
    const q = dernier.p.question;
    if (!q.texte) erreurs.push('"question" : il manque "texte"');
    else if (String(q.texte).replace(/\*/g, '').length > 44) erreurs.push(`"question" : « ${q.texte} » dépasse 44 caractères`);
    q.apres = q.apres || 3; q.t = arrondi(Math.max(0, dureeVoix - dernier.t0)); apres += q.apres;
  }
  const duree = arrondi(dureeVoix + apres);
  plans.forEach((x, i) => { x.d = arrondi((plans[i + 1] ? plans[i + 1].t0 : duree) - x.t0); x.dClip = arrondi(plans[i + 1] ? Math.min(x.d + RECOUVREMENT, duree - x.t0) : x.d);
    // Les mouvements sans ancre se partagent le plan à parts égales.
    if (x.p.camera) { const n = x.p.camera.length; x.p.camera.forEach((c, k) => { if (c.t == null) c.t = arrondi(k * x.dClip / n); }); x.p.camera.sort((u, v) => u.t - v.t); }
    // Décor 3D : les instants des mots forts (la caméra y donne un petit coup de zoom) ; un seul par groupe de mots rapprochés.
    if (DECORS3D[x.fond]) {
      x.p.accents = [];
      if (i === 0 && ep.ouverture !== 'calme') x.p.accents.push(0.15);   // le coup d'ouverture
      mots.forEach((m) => { const ta = arrondi(m.t - x.t0); if (m.fort && ta >= 0 && ta < x.d && !(x.p.accents.length && ta - x.p.accents[x.p.accents.length - 1] < 1)) x.p.accents.push(ta); });
    } if (x.d < 1.2) erreurs.push(`plan ${i + 1} (${x.id}) : ${x.d} s à l’écran, c’est trop court (au moins 1,2 s)`); });
  plans.forEach((x, i) => { if (i && x.fond === plans[i - 1].fond && x.fond !== 'photo') erreurs.push(`plan ${i + 1} (${x.id}) : même fond « ${x.fond} » que le plan précédent : change "fond"`); });
  if (!plans.length) erreurs.push('aucun plan');
  if (!ep.essai && (duree < 15 || duree > 75)) erreurs.push(`durée ${duree} s : il faut entre 15 et 75 s`);

  // Bruitages : un tic par seconde de compte à rebours et un impact à la fin ; sur un décor 3D, un souffle à chaque
  // changement de mouvement de caméra et, si le décor en a une, son ambiance pendant tout le plan.
  const sons = pauses.flatMap((pa) => [...Array.from({ length: Math.round(pa.d) }, (_, i) => ({ f: 'tic.wav', t: arrondi(pa.t + i), v: 0.4 })), { f: 'impact.wav', t: arrondi(pa.t + pa.d - 0.05), v: 0.3 }]);
  plans.forEach((x) => {
    const d3 = DECORS3D[x.fond]; if (!d3) return;
    (x.p.camera || []).slice(1).forEach((c) => sons.push({ f: 'souffle.wav', t: arrondi(x.t0 + c.t), v: 0.22 }));
    if (d3.ambiance && reglages.ambiance > 0) sons.push({ f: d3.ambiance, t: x.t0, v: reglages.ambiance, duree: x.dClip });
  });
  // Les bruitages calés sur l'image : ceux que déclare le décor du plan, et un « pop » quand une illustration surgit.
  if (reglages.bruitages > 0) plans.forEach((x) => {
    const decor = DECORS[x.fond] || DECORS3D[x.fond];
    ((decor && decor.sons) || []).forEach((b) => { if (b.t < x.d - 0.3) sons.push(Object.assign({ f: b.f, t: arrondi(x.t0 + b.t), v: arrondi(b.v * reglages.bruitages) }, b.boucle ? { duree: arrondi(Math.min(19, x.dClip - b.t)) } : {})); });
    if (x.p.illu) sons.push({ f: 'pop.wav', t: arrondi(x.t0 + 0.4), v: arrondi(0.3 * reglages.bruitages) });
  });
  // L'indicatif du compte : deux notes sur la première image, le motif entier quand la voix se tait.
  const sansMusique = ep.musique === 'aucune';
  if ((ep.musique || S.musique) === 'avis') { sons.push({ f: 'indicatif-court.wav', t: 0, v: 0.5 }); if (duree - dureeVoix > 1.5) sons.push({ f: 'indicatif.wav', t: arrondi(dureeVoix + 0.15), v: 0.6 }); }
  // La musique suit la voix : basse quand l'auteur parle (« creux »), plus forte dans les silences.
  const creux = [];
  groupes.forEach((g) => { const d = creux[creux.length - 1]; if (d && g.t0 - d[1] < 0.9) d[1] = g.t1; else creux.push([g.t0, g.t1]); });

  const feuille = {
    version: 4, format: 'avis', theme: ep.theme && THEMES[ep.theme] ? ep.theme : 'decoupe', aspect3d: ep.aspect3d === 'decoupe' ? 'decoupe' : 'doux', ouverture: ep.ouverture === 'calme' ? 'calme' : 'vive', allure: PERSO.ALLURES[ep.allure] ? ep.allure : S.personnage, id: ep.id, titre: ep.titre || ep.id, numero: ep.numero || 1,
    rubrique: rub ? rub.nom : '', palette: PALETTES[ep.palette] ? ep.palette : S.palette, accent: rub ? (pal.accents[ep.rubrique] || rub.accent) : '#fff', fond: pal.couleurs.fond, texte: pal.couleurs.texte,
    duree, dureeVoix, voix: { id: ep.voix || ep.id, garde, pauses: pausesVoix, vitesse: reglages.vitesse, volume: reglages.volume },
    musique: { nom: sansMusique ? 'aucune' : (ep.musique || S.musique), rubrique: ep.rubrique, indicatif: ep.indicatif || S.indicatif, volume: reglages.musique, seule: Math.max(reglages.musique, reglages.musiqueSeule), creux,
      // L'instant où la musique « entre » (house) : le premier mot fort, sinon 4 s ; jamais avant 2 s.
      plein: arrondi(Math.max(2, (mots.find((m) => m.fort) || { t: 4 }).t)) },
    // Bruitages : un tic par seconde de compte à rebours, un impact à la fin.
    pauses, sons,
    mots: mots.length, groupes, plans, publication: ep.publication || null,
  };
  // L'orbe de voix : "orbe": false dans l'épisode la retire partout, dans un plan elle disparaît pendant ce plan ; elle s'efface aussi dans le plan de la question de fin.
  if (ep.orbe !== false && S.orbe !== false) {
    feuille.orbe = { couleurs: { clair: pal.couleurs.texte, a: pal.accents.voyage, b: pal.accents.travail, c: pal.accents.relations }, pas: 30, niveaux: ORBE.niveaux(mots, duree, 30), cache: plans.map((x, i) => (((ep.plans[i] || {}).orbe === false || (ep.plans[i] || {}).question) ? [x.t0, arrondi(x.t0 + x.d)] : null)).filter(Boolean) };
  }
  feuille.conseils = conseils(feuille, mots);
  if (voix.generee) feuille.conseils.push('la voix est générée par IA (voix clonée de l’auteur) : à signaler à la publication (la case « contenu généré par IA » de TikTok) ; sa vraie voix reste préférable');
  return { erreurs, feuille };
}

// Les conseils d'accroche : des avertissements, jamais des erreurs. Voir production/ACCROCHES.md.
function conseils(f, mots) {
  const c = [];
  if (!mots.length || !f.plans.length) return c;
  if (mots[0].t > 0.3) c.push(`la voix commence à ${String(mots[0].t).replace('.', ',')} s : la première image doit déjà parler (coupe le début avec "retirer")`);
  const fin = mots.findIndex((m) => /[.?!…]$/.test(m.m));
  const phrase = mots.slice(0, fin < 0 ? mots.length : fin + 1);
  const duree = phrase[phrase.length - 1].f - phrase[0].t;
  if (phrase.length > 12 || duree > 4) c.push(`la première phrase fait ${phrase.length} mots et ${duree.toFixed(1).replace('.', ',')} s : une accroche tient en 12 mots et 4 s`);
  const p0 = f.plans[0];
  if (UNIS.includes(p0.fond) && !p0.p.illu) c.push('le premier plan est un fond uni sans illustration : ouvre sur un décor ou un dessin');
  const present = f.plans.filter((x) => x.p.personnage).reduce((n, x) => n + x.d, 0);
  if (present > 0.4 * f.duree) c.push(`le personnage est à l’écran ${Math.round(100 * present / f.duree)} % du temps : l’auteur ne veut pas le voir trop souvent (au plus 40 %)`);
  if (f.duree > 45) c.push(`la vidéo dure ${Math.round(f.duree)} s : au-delà de 45 s, peu de gens vont au bout (à vérifier sur tes chiffres)`);
  return c;
}

module.exports = { conseils, UNIS, FONDS, TRANSITIONS, montage, chercher, garder, horloge, sousTitres, reunir };
