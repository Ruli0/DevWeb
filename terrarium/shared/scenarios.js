/*
 * Format des scénarios vidéo (videos/scenarios/*.json) et leur validation.
 *
 * {
 *   "id": "cameleon",            identifiant (nom du fichier, de la composition)
 *   "chapitre": "cycle",         chapitre du site illustré par la scène
 *   "titre": "Le caméléon",      "concept": "La boucle d'outils",
 *   "duree": 38,                 secondes
 *   "decor": { "cameleon": 0.3 | "promenade", "mouche": "cachee" | "libre" },
 *   "plans": [{
 *     "debut": 0, "fin": 3,                       secondes, bout à bout
 *     "camera": { "cible": "cameleon-oeil" | [x, y], "zoom": 3, "duree": 0.9, "ease": "power2.inOut" },
 *     "legende": "texte à l'écran", "voix": "texte de la voix off",
 *     "actions": [{ "type": "cameleon.langue", "a": 0.3, ...paramètres }],   "a" : décalage dans le plan
 *     "carte": { "type": "code" | "etapes" | "barres", "titre": "…", ... }
 *   }]
 * }
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.scenarios = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ACTIONS = [
    'cadre.lueur', 'plantes.grandir', 'cadre.alerte', 'plantes.tailler', 'cadre.apaiser',
    'cameleon.balayer', 'cameleon.marcher', 'cameleon.tourner', 'mouche.venir', 'cameleon.viser',
    'cameleon.langue', 'cameleon.ramener', 'cameleon.avaler', 'cameleon.teinte', 'cameleon.repos',
    'pousse.trembler', 'scarabee.avancer', 'dionee.fermer', 'dionee.ouvrir', 'grenouille.coasser',
    'goutte.apparaitre', 'goutte.couler', 'goutte.eclaircir', 'filtre.signaler', 'goutte.bassin',
    'fourmiliere.agiter', 'fourmis.ecarter', 'fourmis.revenir', 'eclaireuses.partir',
    'eclaireuses.fouiller', 'eclaireuses.revenir', 'butin.montrer', 'butin.cacher',
  ];
  const CIBLES = ['ensemble', 'branche', 'cascade', 'sable', 'mousse', 'galets', 'bassin', 'pousse',
    'dionee', 'grenouille', 'fourmiliere', 'sol', 'cameleon', 'cameleon-oeil'];
  const COULEURS = ['vert', 'turquoise', 'orange'];
  const CARTES = ['code', 'etapes', 'barres'];

  function valider(sc) {
    const err = [];
    const non = (cond, msg) => { if (!cond) err.push(msg); };
    non(sc && typeof sc === 'object', 'le scénario doit être un objet');
    if (err.length) return err;
    non(/^[a-z0-9-]+$/.test(sc.id || ''), 'id : lettres minuscules, chiffres et tirets');
    non(typeof sc.titre === 'string' && sc.titre, 'titre manquant');
    non(typeof sc.concept === 'string' && sc.concept, 'concept manquant');
    non(typeof sc.duree === 'number' && sc.duree > 0 && sc.duree <= 60, 'duree : entre 0 et 60 secondes');
    non(Array.isArray(sc.plans) && sc.plans.length > 0, 'plans : au moins un plan');
    if (!Array.isArray(sc.plans)) return err;

    let attendu = 0;
    sc.plans.forEach((p, i) => {
      const ici = `plan ${i + 1}`;
      non(p.debut === attendu, `${ici} : commence à ${p.debut} s au lieu de ${attendu} s (les plans se suivent sans trou)`);
      non(p.fin > p.debut, `${ici} : fin avant le début`);
      attendu = p.fin;
      if (p.legende !== undefined) non(typeof p.legende === 'string' && p.legende.length <= 70, `${ici} : légende de 70 caractères au plus`);
      if (p.camera) {
        const c = p.camera;
        non(c.cible === undefined || CIBLES.includes(c.cible) || (Array.isArray(c.cible) && c.cible.length === 2), `${ici} : cible de caméra inconnue (${c.cible})`);
        non(c.zoom === undefined || (c.zoom >= 1 && c.zoom <= 5), `${ici} : zoom entre 1 et 5`);
      }
      (p.actions || []).forEach((a) => {
        non(ACTIONS.includes(a.type), `${ici} : action inconnue (${a.type})`);
        const t = p.debut + (a.a || 0);
        non(t >= p.debut && t < p.fin, `${ici} : l'action ${a.type} démarre hors du plan`);
        if (a.type === 'cameleon.teinte') non(COULEURS.includes(a.couleur), `${ici} : couleur inconnue (${a.couleur})`);
        if (a.type === 'goutte.couler' || a.type === 'cameleon.marcher') {
          non(a.depuis >= 0 && a.depuis <= 1 && a.vers >= 0 && a.vers <= 1, `${ici} : ${a.type} attend depuis et vers entre 0 et 1`);
        }
        if (a.type === 'filtre.signaler') non(['sable', 'mousse', 'galets'].includes(a.filtre), `${ici} : filtre inconnu (${a.filtre})`);
      });
      if (p.carte) {
        non(CARTES.includes(p.carte.type), `${ici} : type de carte inconnu (${p.carte.type})`);
        non(typeof p.carte.titre === 'string', `${ici} : carte sans titre`);
        non(p.fin - p.debut >= 3, `${ici} : une carte reste au moins 3 s à l'écran`);
      }
    });
    non(attendu === sc.duree, `les plans finissent à ${attendu} s, la durée annoncée est ${sc.duree} s`);
    return err;
  }

  return { valider, ACTIONS, CIBLES };
});
