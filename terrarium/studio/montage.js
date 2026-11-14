/*
 * Le montage V3 : épisode (videos/episodes/<id>.json, "version": 3) → feuille de route.
 * Fonction pure : montage(episode, fiche) → { erreurs, feuille }. Les erreurs disent quoi changer.
 */
'use strict';
const S = require('./style.js');

const NOMS = ['accroche', 'chiffre', 'cerveau', 'mecanisme', 'graphique', 'comparaison', 'citation', 'geste', 'boucle', 'test', 'question', 'revelation', 'appel'];
const SCENES = Object.fromEntries(NOMS.map((n) => [n, require(`./scenes/${n}.js`)]));
const M = S.mouvement;
const TEMPS = 60 / M.bpm;
const MAX_CAR = 70;
const nu = (t) => String(t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const mots = (t) => nu(t).split(' ').filter(Boolean).length;
const arrondi = (x) => +x.toFixed(3);

function montage(ep, fiche) {
  const erreurs = [];
  if (ep.version !== 3) erreurs.push('ajoute "version": 3 (chaîne V3)');
  const liste = ep.scenes || [];
  if (!liste.length) erreurs.push('aucune scène');
  const claims = Object.fromEntries(((fiche && fiche.affirmations) || []).map((a) => [a.id, a]));
  const scenes = [];
  const test = ep.format === 'test';
  let t = 0;
  liste.forEach((s, i) => {
    const sc = SCENES[s.scene];
    const ici = `scène ${i + 1} (${s.scene})`;
    if (!sc) { erreurs.push(`${ici} : inconnue. Scènes possibles : ${NOMS.join(', ')}`); return; }
    const p = Object.assign({}, s); delete p.scene;
    const textes = sc.textes(p).filter(Boolean);
    textes.forEach((x) => { if (nu(x).length > MAX_CAR) erreurs.push(`${ici} : « ${nu(x)} » fait ${nu(x).length} caractères (au plus ${MAX_CAR}) : raccourcis`); });
    if (sc.source) {
      if (!p.source) erreurs.push(`${ici} : un fait scientifique demande "source" (identifiant de la fiche ${ep.id}.sources.json)`);
      else if (!fiche) erreurs.push(`${ici} : la fiche ${ep.id}.sources.json manque (voir production/SOURCES.md)`);
      else if (!claims[p.source]) erreurs.push(`${ici} : la source « ${p.source} » n'existe pas dans la fiche`);
      else {
        const c = claims[p.source];
        if (nu(c.texte_ecran) !== nu(sc.texteSource(p))) erreurs.push(`${ici} : le texte « ${nu(sc.texteSource(p))} » ne correspond pas au texte_ecran de ${p.source} (« ${nu(c.texte_ecran)} »)`);
        p._source = c.affichage_source;
      }
    }
    // Durée : installation + lecture (règle « lente »), au moins le minimum de la scène, arrondie au temps.
    const lecture = textes.reduce((a, x) => a + mots(x) * M.lectureMot + M.lectureMorceau, 0);
    // Une scène peut fixer sa durée en temps de musique (la question et son compte à rebours) ;
    // sinon : temps de lecture (règle « lente »), au moins le minimum, arrondi au temps.
    const brut = sc.temps ? sc.temps(p) * TEMPS : Math.max(sc.min, (test ? 0.3 : 0.8) + lecture + M.dureeSortie, s.duree || 0);
    const d = arrondi(Math.ceil(brut / TEMPS - 1e-6) * TEMPS);
    scenes.push({ id: s.scene, t0: arrondi(t), d, p });
    t += d;
  });
  const duree = arrondi(t);
  const [premiere, derniere] = test ? ['test', 'appel'] : ['accroche', 'boucle'];
  if (scenes.length && scenes[0].id !== premiere) erreurs.push(`la première scène doit être "${premiere}"`);
  if (scenes.length && scenes[scenes.length - 1].id !== derniere) erreurs.push(`la dernière scène doit être "${derniere}"${test ? ' (l’appel à commenter)' : ' (la vidéo reboucle)'}`);
  if (test && scenes.length && !scenes.some((x) => x.id === 'question')) erreurs.push('le format « test » demande au moins une scène "question"');
  if (test && scenes.length && !scenes.some((x) => x.id === 'revelation')) erreurs.push('le format « test » demande au moins une scène "revelation"');
  scenes.forEach((x, i) => { if (!test && SCENES[x.id].format === 'test') erreurs.push(`scène ${i + 1} (${x.id}) : réservée au format « test » (ajoute "format": "test")`); });
  if (scenes.length && !ep.essai && (duree < 30 || duree > 60)) erreurs.push(`durée ${duree} s : il faut entre 30 et 60 s (${duree < 30 ? 'ajoute une scène ou du texte' : 'retire une scène ou raccourcis les textes'})`);
  if (fiche && !['verifie', 'a-verifier'].includes(fiche.statut)) erreurs.push('statut de la fiche : "verifie" ou "a-verifier"');

  // Les bruitages de chaque scène.
  const sons = [];
  scenes.forEach((s) => SCENES[s.id].sons(s.p, s.d, TEMPS).forEach(([f, dt, v]) => { if (dt < s.d) sons.push({ f, t: arrondi(s.t0 + dt), v }); }));
  // L'arrangement de « labo » : intro sur l'accroche, montée avant la première étude, coupure juste avant elle.
  const MES = 4 * TEMPS;
  const mesures = Math.ceil(duree / MES);
  const parties = Array.from({ length: mesures }, () => 'plein');
  const fin0 = scenes.length ? scenes[0].d : 0;
  for (let m = 0; m * MES < fin0 - 1e-6; m += 1) parties[m] = 'intro';
  const etude = scenes.find((s) => SCENES[s.id].source || SCENES[s.id].coupure);
  const coupures = [];
  // Format « test » : la musique se tait juste avant chaque révélation, et repart sur l’impact.
  if (test) { parties.fill('plein'); scenes.filter((s) => SCENES[s.id].coupure).forEach((s) => coupures.push(arrondi(s.t0 - 0.45))); }
  if (etude && !test) {
    const m = Math.floor(etude.t0 / MES) - 1;
    if (m >= 0 && parties[m] !== 'intro') parties[m] = 'montee';
    if (etude.t0 > 1) coupures.push(arrondi(etude.t0 - 0.45));
  }
  const feuille = {
    version: 3, id: ep.id, titre: ep.titre || ep.id, sujet: ep.sujet || '', numero: ep.numero || 1,
    duree, scenes, sons, statutSources: fiche ? fiche.statut : 'absente',
    accent: test ? '#ff7a4d' : (S.accents[ep.theme] || S.couleurs.accent),
    musique: ep.musique || 'labo', arrangement: { parties, coupures, coupure: 0.45 },
    publication: ep.publication || null,
    format: test ? 'test' : 'scenes',
  };
  // Le cerveau vivant : le modèle du réseau (même graine, même réseau) voyage dans la feuille.
  if (test) {
    const reseau = require('./reseau/modele.js');
    feuille.reseau = reseau.generer({ n: ep.neurones || 3200 });
    feuille.zones = reseau.ZONES;
  }
  return { erreurs, feuille };
}

module.exports = { montage, SCENES, NOMS };
