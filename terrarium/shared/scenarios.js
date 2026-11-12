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
 *     "legende": ["Ton IA", "ne répond pas."],     morceaux affichés l'un après l'autre (*mot* = mis en valeur)
 *     "actions": [{ "type": "cameleon.langue", "a": 0.3, ...paramètres }],   "a" : décalage dans le plan
 *     "carte": { "type": "phrase" | "code" | "etapes" | "barres", "titre": "…", ... }
 *   }],
 *   "serie": { "nom": "Terrarium IA", "episode": 1, "total": 5 },
 *   "accroches": { "b": ["Autre accroche"], "c": [...] },   variantes de la légende du premier plan
 *   "publication": { "texte": "…", "hashtags": ["#ia"], "commentaire": "…", "couverture": 1.2 }
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
  const CARTES = ['phrase', 'code', 'etapes', 'barres'];

  // Règles de lecture des légendes (sans voix, le texte porte toute la narration).
  const LECTURE = { parMot: 0.3, parMorceau: 0.5, caracteresMax: 34 };
  // Zone sûre TikTok en 1080 × 1920 : hors des icônes à droite et du texte en bas.
  const ZONE_SURE = { x0: 60, y0: 150, x1: 940, y1: 1440 };

  const nettoyer = (texte) => String(texte).replace(/\*/g, '');
  // Un mot contient au moins une lettre ou un chiffre : « : » ou « » » ne comptent pas.
  const nbMots = (texte) => nettoyer(texte).trim().split(/\s+/).filter((m) => /[\p{L}\p{N}]/u.test(m)).length;

  // Découpe la légende d'un plan en morceaux, chacun avec sa part du plan,
  // proportionnelle au temps qu'il faut pour le lire.
  function morceaux(plan) {
    const liste = plan.legende ? [].concat(plan.legende) : [];
    const besoin = liste.map((m) => LECTURE.parMot * nbMots(m) + LECTURE.parMorceau);
    const total = besoin.reduce((a, b) => a + b, 0);
    const duree = plan.fin - plan.debut;
    let t = plan.debut;
    return liste.map((texte, i) => {
      const d = (duree * besoin[i]) / total;
      const m = { texte, debut: +t.toFixed(3), fin: +(t + d).toFixed(3), besoin: +besoin[i].toFixed(2) };
      t += d;
      return m;
    });
  }

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
      if (p.legende !== undefined) {
        const liste = [].concat(p.legende);
        non(liste.every((m) => typeof m === 'string' && m.trim()), `${ici} : légende vide`);
        liste.forEach((m) => non(nettoyer(m).length <= LECTURE.caracteresMax, `${ici} : « ${nettoyer(m)} » dépasse ${LECTURE.caracteresMax} caractères (2 lignes)`));
        morceaux(p).forEach((m) => non(m.fin - m.debut >= m.besoin - 1e-6, `${ici} : « ${nettoyer(m.texte)} » reste ${(m.fin - m.debut).toFixed(2)} s, il en faut ${m.besoin} pour le lire`));
      }
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
    if (sc.accroches) {
      Object.entries(sc.accroches).forEach(([nom, legende]) => {
        non(/^[b-z]$/.test(nom), `accroche « ${nom} » : une lettre de b à z (a est celle du premier plan)`);
        const essai = { ...sc.plans[0], legende };
        morceaux(essai).forEach((m) => non(m.fin - m.debut >= m.besoin - 1e-6 && nettoyer(m.texte).length <= LECTURE.caracteresMax, `accroche ${nom} : « ${nettoyer(m.texte)} » trop longue pour le premier plan`));
      });
    }
    return err;
  }

  // Le scénario d'une variante : la même vidéo, avec une autre accroche.
  function variante(sc, nom) {
    if (!nom || nom === 'a') return sc;
    const legende = (sc.accroches || {})[nom];
    if (!legende) throw new Error(`Variante inconnue : ${nom}`);
    const plans = sc.plans.map((p, i) => (i === 0 ? { ...p, legende } : p));
    return { ...sc, id: `${sc.id}-${nom}`, variante: nom, plans };
  }

  return { valider, morceaux, variante, ACTIONS, CIBLES, LECTURE, ZONE_SURE };
});
