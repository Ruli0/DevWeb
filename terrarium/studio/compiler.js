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

const RIGS = {
  cameleon: require('./rigs/cameleon.js'), mouche: require('./rigs/mouche.js'), mousse: require('./rigs/mousse.js'),
  outils: require('./rigs/outils.js'), schema: require('./rigs/schema.js'),
  grenouille: require('./rigs/grenouille.js'), lucioles: require('./rigs/lucioles.js'),
  pensees: require('./rigs/pensees.js'), ambiance: require('./rigs/ambiance.js'),
};
const DECORS = { branche: require('./decors/branche.js') };
const MUSIQUES = { drift: { tempo: 145 } };
const CADRAGES = { large: 1, 'plan-moyen': 1.55, 'gros-plan': 2.3 };
const CY = require('./runtime.js').CY; // hauteur d'écran où la caméra place le sujet
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
  'mouche.remonter': [{ f: 'souffle.wav', v: 0.25 }],
  'outils.descendre': [{ f: 'pop.wav', v: 0.35 }],
  'outils.attrape': [{ f: 'gloup.wav', v: 0.6, d: 0.05 }],
  'cameleon.absorber': [{ f: 'carillon.wav', v: 0.3 }],
  'cameleon.repondre': [{ f: 'pop.wav', v: 0.6 }],
  'schema.apparaitre': [{ f: 'clic.wav', v: 0.5 }],
  'grenouille.coasser': [{ f: 'croa.wav', v: 0.6 }],
  'ambiance.projecteur': [{ f: 'souffle.wav', v: 0.4 }],
  'pensees.penser': [{ f: 'pop.wav', v: 0.5 }],
  'lucioles.danser': [{ f: 'bzz.wav', v: 0.25 }],
  'lucioles.entrer': [{ f: 'bzz.wav', v: 0.3 }],
  'cameleon.camoufler': [{ f: 'souffle.wav', v: 0.3 }],
};
const SON_TEXTE = { f: 'clavier.wav', v: 0.35 };
const SON_CAMERA = { f: 'souffle.wav', v: 0.22 };

const r = (n, d = 3) => +Number(n).toFixed(d);
const borne = (v, a, b) => Math.min(Math.max(v, a), b);

// Une vue de caméra : le point (x, y) du décor montré en (540, CY), avec le zoom z.
function vueSur(points, cadrage) {
  const zMax = CADRAGES[cadrage];
  if (zMax === 1 || !points.length) return { x: 540, y: CY, z: 1 };
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
  return { x: r(borne(v.x, 540 / z, 1080 - 540 / z), 2), y: r(borne(v.y, CY / z, 1920 - (1920 - CY) / z), 2), z: r(z, 4) };
}
const ecran = (v, p) => [r(540 + v.z * (p[0] - v.x), 1), r(CY + v.z * (p[1] - v.y), 1)];

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
  // L'état de départ. « depart » de l'épisode : { "tache": "cachee" } pour commencer sans la tâche.
  const outilsDepart = {};
  Object.entries(place.outils || {}).forEach(([id, pos]) => { outilsDepart[id] = { pos: pos.slice(), visible: false }; });
  const depart = {
    regard: ia.angleVers(place.ia, place.tache), couleur: 'vert', humeur: 'neutre',
    mouche: { pos: place.tache.slice(), visible: !(ep.depart && ep.depart.tache === 'cachee') },
    outils: outilsDepart,
    schema: { visible: false, etape: 'aucune', angle: -90, centre: false, compteur: { tour: 0, s: 0, k: 0 } },
    camoufle: false, projecteur: false,
    voisins: { grenouille: { regard: [0, 0], fixe: false }, lucioles: [0, 1, 2].map(() => ({ regard: [0, 0], fixe: false })), luciolesIci: false },
  };
  // « voisins » : la grenouille, les trois lucioles, les bulles de pensée et le projecteur sont dans la scène.
  const voisins = Boolean(ep.voisins);
  const etat = JSON.parse(JSON.stringify(depart));
  const camera = []; const ordres = []; const textes = []; const etiquettes = []; const parties = []; const coupures = [];
  let vueCible = null;

  const point = (spec) => {
    if (Array.isArray(spec)) return spec;
    const [role, quoi] = String(spec).split('.');
    if (role === 'ia' && quoi === 'langue') return (etat.langueBout || ia.ancre(place.ia, 'bouche')).slice();
    if (role === 'ia') return ia.ancre(place.ia, quoi || 'corps');
    if (role === 'tache') return quoi === 'depart' ? place.tache.slice() : etat.mouche.pos.slice();
    if (role === 'outil' && etat.outils[quoi]) return etat.outils[quoi].pos.slice();
    if (role === 'grenouille') return RIGS.grenouille.ancre(place.grenouille, quoi || 'corps');
    if (role === 'luciole' && place.lucioles[Number(quoi)]) return place.lucioles[Number(quoi)].slice();
    if (role === 'lucioles') { const l = place.lucioles; return [r(l.reduce((a, p) => a + p[0], 0) / l.length, 1), r(l.reduce((a, p) => a + p[1], 0) / l.length, 1)]; }
    erreurs.push(`point inconnu : ${spec}`);
    return [540, 768];
  };

  let t0 = 0;
  const ctx = {
    T, M, depart, etat,
    b: (n) => r(t0 + n * T, 4),
    point,
    decale: (spec, dx, dy) => { const p = point(spec); return [r(p[0] + dx, 1), r(p[1] + dy, 1)]; },
    erreur: (msg) => { erreurs.push(msg); return {}; },
    geste(qui, nom, t, p = {}) {
      const id = RIGS[qui] ? qui : roles[qui];
      if (!RIGS[id] || !RIGS[id].GESTES[nom]) { erreurs.push(`geste inconnu : ${qui}.${nom}`); return; }
      const params = Object.assign({}, p);
      if (id === 'cameleon' && nom === 'langue') params.place = place.ia;
      ordres.push({ t: r(t), qui: id, geste: nom, p: params });
    },
    // Les outils suspendus (loupe, page) : leur état est suivi pour la boucle.
    outil(nom, t, p) {
      const o = etat.outils[p.id];
      if (!o) { erreurs.push(`outil inconnu : ${p.id}`); return; }
      if (nom === 'descendre') { ordres.push({ t: r(t), qui: 'outils', geste: nom, p: Object.assign({ vers: o.pos.slice() }, p) }); o.visible = true; }
      else if (nom === 'remonter') { ordres.push({ t: r(t), qui: 'outils', geste: nom, p: Object.assign({ de: o.pos.slice() }, p) }); o.visible = false; }
      else if (nom === 'attrape') { ordres.push({ t: r(t), qui: 'outils', geste: nom, p }); o.visible = false; }
    },
    // Le schéma de la boucle et ses compteurs.
    schema(nom, t, p = {}) {
      const sc = etat.schema;
      const push = (geste, params) => ordres.push({ t: r(t), qui: 'schema', geste, p: params });
      if (nom === 'apparaitre' || nom === 'disparaitre') { if (sc.visible !== (nom === 'apparaitre')) { push(nom, {}); sc.visible = nom === 'apparaitre'; } }
      else if (nom === 'etape') {
        // La comète tourne toujours dans le même sens, jusqu'à l'étape demandée (« aucune » : retour en haut).
        const ANG = RIGS.schema.ETAPES;
        const cible = p.vers === 'aucune' ? -90 : ANG[p.vers];
        const angle = cible === undefined ? sc.angle : sc.angle + ((((cible - sc.angle) % 360) + 360) % 360);
        push('etape', { de: sc.etape, vers: p.vers, angleDe: sc.angle, angleVers: angle, erreur: p.erreur });
        sc.etape = p.vers; sc.angle = angle;
      } else if (nom === 'compteur') {
        const vers = p.vers || { tour: sc.compteur.tour + (p.tour || 0), s: sc.compteur.s + (p.s || 0), k: sc.compteur.k + (p.k || 0) };
        push('compteur', { de: Object.assign({}, sc.compteur), vers, duree: p.duree });
        sc.compteur = vers;
      } else if (nom === 'centrer') { if (sc.centre !== Boolean(p.vers)) { push('centrer', { vers: Boolean(p.vers) }); sc.centre = Boolean(p.vers); } }
    },
    // --- Les voisins (grenouille, lucioles), les bulles, le projecteur, le camouflage.
    exigerVoisins() { if (!voisins && !ctx.dejaSignale) { ctx.dejaSignale = true; erreurs.push('cet épisode utilise les voisins : ajouter "voisins": true'); } return voisins; },
    camoufler(t, vers) {
      if (vers === etat.camoufle) return;
      ctx.geste('ia', 'camoufler', t, { vers }); etat.camoufle = vers;
    },
    trembler(t, duree) { ctx.geste('ia', 'trembler', t, { duree: r(duree, 3) }); },
    projecteur(t, allumer) {
      if (!ctx.exigerVoisins() || allumer === etat.projecteur) return;
      ctx.geste('ambiance', 'projecteur', t, { etat: allumer ? 'allumer' : 'eteindre' }); etat.projecteur = allumer;
    },
    pensee(sur, t, duree) { if (ctx.exigerVoisins()) ctx.geste('pensees', 'penser', t, { sur, duree: r(duree, 3) }); },
    // Les lucioles entrent en volant par le haut (une à une), ou ressortent.
    lucioles(t, entrent) {
      if (!ctx.exigerVoisins() || etat.voisins.luciolesIci === entrent) return;
      [0, 1, 2].forEach((i) => ctx.geste('lucioles', entrent ? 'entrer' : 'sortir', t + 0.14 * i, { i }));
      etat.voisins.luciolesIci = entrent;
    },
    // Le regard d'un voisin : ses pupilles vont vers un point (cible), de la même façon que celles du caméléon.
    regarderVoisin(qui, i, t, cible, duree = 0.3) {
      if (!ctx.exigerVoisins()) return;
      const e = qui === 'grenouille' ? etat.voisins.grenouille : etat.voisins.lucioles[i];
      const centre = qui === 'grenouille' ? RIGS.grenouille.centreOeil(place.grenouille) : RIGS.lucioles.centreOeil(place.lucioles[i], place.echelleLucioles);
      const cb = point(cible); const dx = cb[0] - centre[0]; const dy = cb[1] - centre[1]; const d = Math.hypot(dx, dy) || 1;
      const vers = [r((dx / d) * RIGS[qui].AMP, 2), r((dy / d) * RIGS[qui].AMP, 2)];
      if (Math.abs(vers[0] - e.regard[0]) < 0.05 && Math.abs(vers[1] - e.regard[1]) < 0.05) return;
      ctx.geste(qui, 'regarder', t, Object.assign(qui === 'lucioles' ? { i } : {}, { de: e.regard.slice(), vers, duree: r(duree, 3) }));
      e.regard = vers;
    },
    fixerVoisin(qui, i, t, fixe) {
      if (!ctx.exigerVoisins()) return;
      const e = qui === 'grenouille' ? etat.voisins.grenouille : etat.voisins.lucioles[i];
      if (e.fixe === fixe) return;
      ctx.geste(qui, fixe ? 'fixer' : 'relacher', t, qui === 'lucioles' ? { i } : {}); e.fixe = fixe;
    },
    reflechir(t, duree) { ctx.geste('ia', 'reflechir', t, { regard: etat.regard, duree: r(duree, 3) }); },
    // Remet la scène dans son état de départ (la tâche, les outils, le schéma), entre t0 et t1 : la vidéo boucle.
    restaurer(t0, t1) {
      const m = etat.mouche; const dm = depart.mouche;
      if (dm.visible && !m.visible) ctx.mouche('descendre', t0 + (t1 - t0) * 0.4, { vers: dm.pos, duree: (t1 - t0) * 0.5 });
      else if (!dm.visible && m.visible) { ctx.geste('tache', 'remonter', t0, { de: m.pos.slice(), duree: 0.6 }); m.visible = false; m.pos = dm.pos.slice(); }
      else if (m.visible && Math.hypot(m.pos[0] - dm.pos[0], m.pos[1] - dm.pos[1]) > 1) ctx.mouche('revenir', t0, { vers: dm.pos, duree: (t1 - t0) * 0.5 });
      Object.entries(etat.outils).forEach(([id, o], k) => { if (o.visible) ctx.outil('remonter', t0 + 0.1 * (k + 1), { id }); });
      const sc = etat.schema;
      if (sc.centre) ctx.schema('centrer', t0, { vers: false });
      if (sc.compteur.tour || sc.compteur.s || sc.compteur.k) ctx.schema('compteur', t0 + 0.7, { vers: { tour: 0, s: 0, k: 0 }, duree: (t1 - t0) * 0.45 });
      if (sc.etape !== 'aucune') ctx.schema('etape', t0 + 0.7, { vers: 'aucune' });
      if (sc.visible && !depart.schema.visible) ctx.schema('disparaitre', t1 - 0.3);
      if (voisins) {
        ctx.camoufler(t0, false); ctx.projecteur(t0, false); ctx.lucioles(t1 - 1.4, false);
        ctx.fixerVoisin('grenouille', 0, t0 + 0.2, false);
        [0, 1, 2].forEach((i) => { ctx.fixerVoisin('lucioles', i, t0 + 0.2, false); ctx.regarderVoisin('lucioles', i, t0 + 0.5, 'ia.corps', 0.5); });
        ctx.regarderVoisin('grenouille', 0, t0 + 0.5, 'ia.corps', 0.5);
      }
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
      else if (nom === 'remonter') { ctx.geste('tache', nom, t, Object.assign({ de: m.pos.slice() }, p)); m.visible = false; }
      else ctx.geste('tache', nom, t, p);
    },
    // La langue : vers la tâche, ou seulement une partie du chemin (portee entre 0 et 1).
    langue(t, p = {}) {
      const b = ia.ancre(place.ia, 'bouche');
      const vise = point(p.vers || 'tache');
      const k = p.portee || 1;
      const cible = [r(b[0] + (vise[0] - b[0]) * k, 1), r(b[1] + (vise[1] - b[1]) * k, 1)];
      etat.langueBout = cible;
      ctx.geste('ia', 'langue', t, { cible, rate: Boolean(p.rate || k < 1), tenir: p.tenir });
      return cible;
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
    etiquette(t, duree, sur, texte, o = {}) {
      const a = ecran(vueCible, point(sur));
      const l = texte.length * 31 + 64;
      const bx = borne(a[0] + (o.dx !== undefined ? o.dx : a[0] > 540 ? -190 : 190), 60 + l / 2, 940 - l / 2);
      const by = borne(a[1] + (o.dy !== undefined ? o.dy : -190), 450, 1300);
      etiquettes.push({ t: r(t), duree: r(duree), texte, ancre: a, bulle: [r(bx, 1), r(by, 1)] });
    },
  };

  // --- Les temps forts, bout à bout.
  ep.temps.forEach((tf, i) => {
    const def = TEMPS_FORTS[tf.fort];
    if (!def) { erreurs.push(`temps ${i + 1} : temps fort inconnu (${tf.fort})`); return; }
    const mesures = tf.mesures || def.mesures;
    const res = def.jouer(ctx, tf) || {};
    const p = tf.parties || res.parties || [];
    for (let k = 0; k < mesures; k += 1) parties.push(p[k] || p[p.length - 1] || 'plein');
    (res.coupures || []).forEach((t) => coupures.push(r(t)));
    const fin = r(t0 + mesures * M, 4);
    if (tf.texte) {
      const liste = [].concat(tf.texte);
      // Texte par mesure : le morceau k s'affiche exactement pendant la mesure k.
      const parMesure = def.texteParMesure && liste.length === mesures;
      if (def.texteParMesure && !parMesure) erreurs.push(`temps ${i + 1} : ${tf.fort} attend un texte par mesure (${mesures})`);
      const plan = { debut: r(t0, 4), fin, legende: liste };
      const ms = parMesure
        ? liste.map((texte, k) => ({ texte, debut: r(t0 + k * M, 4), fin: r(t0 + (k + 1) * M, 4), besoin: morceaux({ debut: 0, fin: 1, legende: [texte] })[0].besoin }))
        : morceaux(plan);
      ms.forEach((m) => {
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
    const cle = `${o.qui}.${g.canal}${o.p && o.p.id ? `.${o.p.id}` : ''}${o.p && o.p.i !== undefined ? `.${o.p.i}` : ''}${o.p && o.p.sur ? `.${o.p.sur}` : ''}`;
    const prec = canaux[cle];
    non(!prec || debut >= prec.fin - 0.005, `${o.qui}.${o.geste} à ${o.t} s chevauche ${prec ? prec.nom : ''}`);
    canaux[cle] = { fin, nom: `${o.qui}.${o.geste} à ${o.t} s` };
  });
  const memeVue = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.z - b.z) < 0.01;
  non(memeVue(courante, cam[0].vers), 'boucle : la caméra ne revient pas au cadrage du début');
  non(Math.abs(etat.regard - depart.regard) < 0.5, 'boucle : le regard ne revient pas à son départ');
  non(etat.couleur === depart.couleur && etat.humeur === depart.humeur, 'boucle : couleur ou humeur différente du début');
  non(etat.mouche.visible === depart.mouche.visible && (!etat.mouche.visible || Math.hypot(etat.mouche.pos[0] - depart.mouche.pos[0], etat.mouche.pos[1] - depart.mouche.pos[1]) < 1), 'boucle : la tâche n\'est pas revenue à son état de départ');
  non(Object.values(etat.outils).every((o) => !o.visible), 'boucle : un outil est encore là à la fin');
  non(etat.camoufle === depart.camoufle && etat.projecteur === depart.projecteur, 'boucle : le caméléon est encore camouflé, ou le projecteur allumé');
  non(!etat.voisins.grenouille.fixe && etat.voisins.lucioles.every((l) => !l.fixe), 'boucle : un voisin fixe encore le caméléon');
  non(!etat.voisins.luciolesIci, 'boucle : les lucioles sont encore là à la fin (elles doivent ressortir)');
  const sc = etat.schema;
  non(sc.visible === depart.schema.visible && !sc.centre && sc.etape === 'aucune' && !sc.compteur.tour && !sc.compteur.s && !sc.compteur.k, 'boucle : le schéma n\'est pas revenu à son départ');
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
      depart: {
        cameleon: { regard: depart.regard }, mouche: { pos: depart.mouche.pos, visible: depart.mouche.visible }, mousse: { humeur: depart.humeur },
        outils: { items: depart.outils }, schema: {},
        ...(voisins ? { grenouille: { regard: depart.voisins.grenouille.regard }, lucioles: { regards: depart.voisins.lucioles.map((l) => l.regard), visibles: false }, pensees: {}, ambiance: {} } : {}),
      },
      voisins,
      camera: cam, ordres, textes, etiquettes, sons,
      arrangement: { parties, coupures },
    },
  };
}

module.exports = { compiler, vueSur, RIGS, DECORS, CADRAGES, PARTIES, SONS };
