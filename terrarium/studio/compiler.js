/*
 * Le compilateur du studio : épisode (temps forts, en mesures) → feuille de route.
 * Fonction pure : même épisode, même feuille de route. Aucun navigateur nécessaire.
 *
 * La feuille de route contient tout ce que le lecteur (studio/runtime.js) doit jouer :
 * la caméra, les gestes datés, les textes, les étiquettes, les sons et l'arrangement musical.
 * Le compilateur suit l'état de la scène (où est la tâche, ce que regarde l'IA, l'humeur de Mousse…)
 * pour que chaque geste parte toujours de là où le précédent s'est arrêté.
 */
'use strict';
const { morceaux, LECTURE } = require('../shared/scenarios.js');
const { TEMPS_FORTS } = require('./temps-forts.js');

const RIGS = { cameleon: require('./rigs/cameleon.js'), mouche: require('./rigs/mouche.js'), mousse: require('./rigs/mousse.js') };
const DECORS = { branche: require('./decors/branche.js') };
const MUSIQUES = { drift: { tempo: 145 } };
const CADRAGES = { large: 1, 'plan-moyen': 1.55, 'gros-plan': 2.3 };
const POUSSEE = 1.05; // la caméra avance de 5 % pendant un plan
const PARTIES = ['intro', 'creux', 'montee', 'plein'];
// Bruitages déduits des gestes (fichiers de videos/sons).
const SONS = {
  'cameleon.langue': [{ f: 'fwip.wav', v: 0.9 }],
  'cameleon.avaler': [{ f: 'gloup.wav', v: 0.7, d: 0.05 }],
  'mouche.esquiver': [{ f: 'souffle.wav', v: 0.35 }],
  'mouche.yoyo': [{ f: 'bzz.wav', v: 0.3 }],
  'mouche.descendre': [{ f: 'bzz.wav', v: 0.3 }],
  'mouche.revenir': [{ f: 'bzz.wav', v: 0.3 }],
  'mousse.expression': [{ f: 'bip.wav', v: 0.4 }],
  'mousse.sauter': [{ f: 'pop.wav', v: 0.55 }],
};
const SON_TEXTE = { f: 'clavier.wav', v: 0.35 };
const SON_CAMERA = { f: 'souffle.wav', v: 0.22 };

const r = (n, d = 3) => +Number(n).toFixed(d);
const borne = (v, a, b) => Math.min(Math.max(v, a), b);

// Une vue de caméra : le point (x, y) du décor au 2/5 de l'écran, avec le zoom z.
function vueSur(points, cadrage) {
  const zMax = CADRAGES[cadrage];
  if (zMax === 1 || !points.length) return { x: 540, y: 768, z: 1 };
  const cx = points.reduce((a, p) => a + p[0], 0) / points.length;
  const cy = points.reduce((a, p) => a + p[1], 0) / points.length;
  const dx = Math.max(...points.map((p) => Math.abs(p[0] - cx)));
  const dy = Math.max(...points.map((p) => Math.abs(p[1] - cy)));
  let z = zMax;
  if (dx > 0) z = Math.min(z, 330 / dx);
  if (dy > 0) z = Math.min(z, 300 / dy);
  return borner({ x: cx, y: cy, z: Math.max(1, z) });
}
// La vue ne sort jamais du décor dessiné (1080 × 1920 au cadrage large).
function borner(v) {
  const z = v.z;
  return { x: r(borne(v.x, 540 / z, 1080 - 540 / z), 2), y: r(borne(v.y, 768 / z, 1920 - 1152 / z), 2), z: r(z, 4) };
}
const ecran = (v, p) => [r(540 + v.z * (p[0] - v.x), 1), r(768 + v.z * (p[1] - v.y), 1)];

function compiler(episode) {
  const erreurs = [];
  const non = (cond, msg) => { if (!cond) erreurs.push(msg); };
  const ep = episode || {};
  non(/^[a-z0-9-]+$/.test(ep.id || ''), 'id : lettres minuscules, chiffres et tirets');
  non(DECORS[ep.decor || 'branche'], `décor inconnu (${ep.decor})`);
  non(Array.isArray(ep.temps) && ep.temps.length > 0, 'temps : au moins un temps fort');
  const roles = Object.assign({ ia: 'cameleon', tache: 'mouche' }, ep.roles);
  non(roles.ia === 'cameleon' && roles.tache === 'mouche', 'rôles : pour l\'instant, ia = cameleon et tache = mouche');
  const musique = ep.musique === undefined ? 'drift' : ep.musique;
  non(musique === null || MUSIQUES[musique], `musique inconnue (${musique})`);
  if (erreurs.length) return { erreurs };

  const decor = DECORS[ep.decor || 'branche'];
  const tempo = musique ? MUSIQUES[musique].tempo : 145;
  const T = 60 / tempo;
  const M = 4 * T;
  const place = decor.PLACES;
  const ia = RIGS[roles.ia];

  // L'état de la scène, suivi tout au long de l'épisode.
  const depart = { regard: ia.angleVers(place.ia, place.tache), couleur: 'vert', humeur: 'neutre', mouche: { pos: place.tache.slice(), visible: true } };
  const etat = JSON.parse(JSON.stringify(depart));
  const camera = []; const ordres = []; const textes = []; const etiquettes = []; const parties = []; const coupures = [];
  let vueCible = null;

  const point = (spec) => {
    if (Array.isArray(spec)) return spec;
    const [role, quoi] = String(spec).split('.');
    if (role === 'ia') return ia.ancre(place.ia, quoi || 'corps');
    if (role === 'tache') return quoi === 'depart' ? place.tache.slice() : etat.mouche.pos.slice();
    erreurs.push(`point inconnu : ${spec}`);
    return [540, 768];
  };

  let t0 = 0;
  const ctx = {
    T, M, depart,
    b: (n) => r(t0 + n * T, 4),
    point,
    decale: (spec, dx, dy) => { const p = point(spec); return [r(p[0] + dx, 1), r(p[1] + dy, 1)]; },
    erreur: (msg) => { erreurs.push(msg); return {}; },
    geste(qui, nom, t, p = {}) {
      const id = qui === 'mousse' ? 'mousse' : roles[qui];
      if (!RIGS[id] || !RIGS[id].GESTES[nom]) { erreurs.push(`geste inconnu : ${qui}.${nom}`); return; }
      const params = Object.assign({}, p);
      if (id === 'cameleon' && nom === 'langue') params.place = place.ia;
      ordres.push({ t: r(t), qui: id, geste: nom, p: params });
    },
    regarder(t, cible, duree, ease) {
      const vers = ia.angleVers(place.ia, point(cible));
      if (Math.abs(vers - etat.regard) < 0.5) return;
      ctx.geste('ia', 'regarder', t, { de: etat.regard, vers, duree: r(duree, 3), ease });
      etat.regard = vers;
    },
    mouche(nom, t, p = {}) {
      const m = etat.mouche;
      if (nom === 'esquiver' || nom === 'revenir') { ctx.geste('tache', nom, t, Object.assign({ de: m.pos.slice() }, p)); m.pos = p.vers.slice(); }
      else if (nom === 'yoyo') ctx.geste('tache', nom, t, Object.assign({ de: m.pos.slice() }, p));
      else if (nom === 'descendre') { ctx.geste('tache', nom, t, p); m.pos = p.vers.slice(); m.visible = true; }
      else if (nom === 'disparaitre') { ctx.geste('tache', nom, t, p); m.visible = false; }
      else ctx.geste('tache', nom, t, p);
    },
    humeur(t, h) {
      if (h === etat.humeur) return;
      ctx.geste('mousse', 'expression', t, { de: etat.humeur, vers: h });
      etat.humeur = h;
    },
    teinte(t, couleur) {
      if (couleur === etat.couleur) return;
      ctx.geste('ia', 'teinte', t, { de: etat.couleur, vers: couleur });
      etat.couleur = couleur;
    },
    // n : en temps, depuis le début du temps fort.
    camera(n, cadrage, sur, duree, ease, poussee) {
      if (!CADRAGES[cadrage]) { erreurs.push(`cadrage inconnu : ${cadrage}`); return; }
      const vers = vueSur(sur.map(point), cadrage);
      camera.push({ t: ctx.b(n), duree: camera.length ? duree : 0, vers, ease, poussee: poussee !== false });
      vueCible = vers;
    },
    retourCamera(t, duree) {
      camera.push({ t: r(t, 4), duree, vers: camera[0].vers, ease: 'power2.inOut', poussee: false });
      vueCible = camera[0].vers;
    },
    etiquette(t, duree, sur, texte) {
      const a = ecran(vueCible, point(sur));
      const l = texte.length * 25 + 48;
      const bx = borne(a[0] + (a[0] > 540 ? -190 : 190), 60 + l / 2, 940 - l / 2);
      const by = borne(a[1] - 190, 450, 1300);
      etiquettes.push({ t: r(t), duree: r(duree), texte, ancre: a, bulle: [r(bx, 1), r(by, 1)] });
    },
  };

  // --- Les temps forts, bout à bout.
  ep.temps.forEach((tf, i) => {
    const def = TEMPS_FORTS[tf.fort];
    if (!def) { erreurs.push(`temps ${i + 1} : temps fort inconnu (${tf.fort})`); return; }
    const mesures = tf.mesures || def.mesures;
    const res = def.jouer(ctx, tf) || {};
    const p = res.parties || [];
    for (let k = 0; k < mesures; k += 1) parties.push(p[k] || p[p.length - 1] || 'plein');
    (res.coupures || []).forEach((t) => coupures.push(r(t)));
    const fin = r(t0 + mesures * M, 4);
    if (tf.texte) {
      const plan = { debut: r(t0, 4), fin, legende: [].concat(tf.texte) };
      morceaux(plan).forEach((m) => {
        const brut = m.texte.replace(/\*/g, '');
        non(brut.length <= LECTURE.caracteresMax, `temps ${i + 1} : « ${brut} » dépasse ${LECTURE.caracteresMax} caractères`);
        non(m.fin - m.debut >= m.besoin - 1e-6, `temps ${i + 1} : « ${brut} » reste ${(m.fin - m.debut).toFixed(2)} s, il en faut ${m.besoin}`);
        textes.push({ debut: r(m.debut), fin: r(m.fin), texte: m.texte });
      });
    }
    t0 = fin;
  });
  const duree = r(t0, 3);
  if (erreurs.length) return { erreurs };

  // --- La caméra : chaque mouvement part de la vue précédente ; entre deux mouvements, elle avance un peu.
  const cam = [];
  let courante = camera[0].vers;
  camera.sort((a, b) => a.t - b.t).forEach((k, i) => {
    const suivant = camera[i + 1];
    cam.push({ t: k.t, duree: k.duree, de: courante, vers: k.vers, ease: k.ease });
    courante = k.vers;
    const debut = r(k.t + k.duree, 4);
    if (suivant && k.poussee && suivant.t - debut > 0.4) {
      const avance = borner({ x: k.vers.x, y: k.vers.y, z: k.vers.z * POUSSEE });
      cam.push({ t: debut, duree: r(suivant.t - debut, 4), de: courante, vers: avance, ease: 'none' });
      courante = avance;
    }
  });

  // --- Contrôles : gestes dans la vidéo, pas de chevauchement sur un même canal, et la boucle.
  ordres.sort((a, b) => a.t - b.t);
  const canaux = {};
  ordres.forEach((o) => {
    const g = RIGS[o.qui].GESTES[o.geste];
    const debut = o.t - (g.avant || 0);
    const fin = o.t + g.duree(o.p, T);
    non(debut >= -1e-6 && fin <= duree + 1e-6, `${o.qui}.${o.geste} à ${o.t} s : hors de la vidéo`);
    const cle = `${o.qui}.${g.canal}`;
    const prec = canaux[cle];
    non(!prec || debut >= prec.fin - 0.005, `${o.qui}.${o.geste} à ${o.t} s chevauche ${prec ? prec.nom : ''}`);
    canaux[cle] = { fin, nom: `${o.qui}.${o.geste} à ${o.t} s` };
  });
  const memeVue = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.z - b.z) < 0.01;
  non(memeVue(courante, cam[0].vers), 'boucle : la caméra ne revient pas au cadrage du début');
  non(Math.abs(etat.regard - depart.regard) < 0.5, 'boucle : le regard ne revient pas à son départ');
  non(etat.couleur === depart.couleur && etat.humeur === depart.humeur, 'boucle : couleur ou humeur différente du début');
  non(etat.mouche.visible && Math.hypot(etat.mouche.pos[0] - depart.mouche.pos[0], etat.mouche.pos[1] - depart.mouche.pos[1]) < 1, 'boucle : la tâche n\'est pas revenue à sa place');
  parties.forEach((x) => non(PARTIES.includes(x), `partie de musique inconnue : ${x}`));
  if (erreurs.length) return { erreurs };

  // --- Les sons.
  const sons = [];
  ordres.forEach((o) => (SONS[`${o.qui}.${o.geste}`] || []).forEach((s) => sons.push({ f: s.f, t: r(o.t + (s.d || 0)), v: s.v })));
  textes.forEach((m) => sons.push({ f: SON_TEXTE.f, t: m.debut, v: SON_TEXTE.v }));
  cam.forEach((k) => { if (k.duree >= 0.4 && k.ease !== 'none' && Math.abs(k.vers.z - k.de.z) > 0.25) sons.push({ f: SON_CAMERA.f, t: k.t, v: SON_CAMERA.v }); });
  sons.sort((a, b) => a.t - b.t || a.f.localeCompare(b.f));

  return {
    erreurs: [],
    feuille: {
      id: ep.id, titre: ep.titre || ep.id, tempo, duree, decor: decor.id, musique,
      depart: { cameleon: { regard: depart.regard }, mouche: { pos: depart.mouche.pos, visible: true }, mousse: { humeur: depart.humeur } },
      camera: cam, ordres, textes, etiquettes, sons,
      arrangement: { parties, coupures },
    },
  };
}

module.exports = { compiler, vueSur, RIGS, DECORS, CADRAGES, PARTIES, SONS };
