/*
 * Simulations pas à pas des concepts agentiques.
 * Fonctions pures, sans dépendance : le serveur Node.js les expose via
 * POST /api/simulate, et le navigateur peut les rejouer hors ligne (démo).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.Terrarium = root.Terrarium || {};
    root.Terrarium.simulation = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Chapitre 2 — La boucle d'outils (le cycle de l'eau)
  // -------------------------------------------------------------------------
  function simulateCycle() {
    const steps = [];
    let tour = 0;
    const tourOutil = (pensee, outil, entree, sortie, humidite) => {
      tour += 1;
      steps.push({ type: 'pensee', tour, texte: pensee });
      steps.push({ type: 'appel', tour, outil, entree, texte: `${outil}(${formatArgs(entree)})` });
      steps.push({ type: 'resultat', tour, outil, texte: sortie, humidite });
      steps.push({ type: 'contexte', tour, texte: 'Le résultat rejoint le contexte. Le modèle relit tout et repart pour un tour.' });
    };

    tourOutil("Avant d'agir, je mesure l'humidité.", 'lire_hygrometre', {}, 'Humidité : 32 %', 32);
    tourOutil("32 %, c'est trop sec (cible : 60 %). Je vaporise.", 'vaporiser', { ml: 30 }, '30 ml vaporisés', 32);
    tourOutil("Je vérifie que ça a suffi.", 'lire_hygrometre', {}, 'Humidité : 61 %', 61);
    tour += 1;
    steps.push({ type: 'pensee', tour, texte: "61 % : objectif atteint. Je n'ai plus besoin d'outil." });
    steps.push({
      type: 'reponse', tour,
      texte: "J'ai vaporisé 30 ml. L'humidité est passée de 32 % à 61 %.",
    });
    return { demande: "Le terrarium a l'air sec. Occupe-t'en.", steps, tours: tour };
  }

  function formatArgs(obj) {
    return Object.entries(obj || {}).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
  }

  // -------------------------------------------------------------------------
  // Chapitre 3 — Le middleware (les couches du sol)
  // -------------------------------------------------------------------------
  const COUCHES = ['journal', 'filtre', 'cache', 'debit'];
  const REQUETE = 'Arrose la plante de camille@exemple.fr';
  const QUOTA = 3;

  function simulateCouches(options) {
    const opts = options || {};
    const ordre = [...new Set((Array.isArray(opts.layers) ? opts.layers : []).filter((id) => COUCHES.includes(id)))];
    const etatIn = opts.state || {};
    let appels = Math.max(0, Math.min(99, Number.parseInt(etatIn.appels, 10) || 0));
    const cache = (Array.isArray(etatIn.cache) ? etatIn.cache : [])
      .filter((s) => typeof s === 'string' && s.length <= 80).slice(0, 4);

    const steps = [];
    const lecons = [];
    let payload = REQUETE;
    let reponse = null;
    let arret = null; // 'cache' | 'debit' | null
    let indexArret = ordre.length;

    for (let i = 0; i < ordre.length && !arret; i += 1) {
      const id = ordre[i];
      const step = { phase: 'descente', layer: id };
      if (id === 'journal') {
        step.texte = `Note la requête : « ${payload} »`;
        if (payload.includes('@')) {
          step.fuite = true;
          lecons.push("Le journal a noté l'e-mail en clair. Place le sable (filtre) au-dessus de la mousse (journal).");
        }
      } else if (id === 'filtre') {
        payload = payload.replace(/\S+@\S+/, '[e-mail masqué]');
        step.texte = "Masque l'adresse e-mail";
      } else if (id === 'cache') {
        if (cache.includes(payload)) {
          arret = 'cache';
          indexArret = i;
          reponse = 'Plante arrosée (20 ml), réponse du cache';
          step.texte = 'Requête déjà vue : répond sans déranger le modèle';
          step.arret = true;
        } else {
          step.texte = 'Requête inconnue : laisse passer';
        }
      } else if (id === 'debit') {
        appels += 1;
        if (appels > QUOTA) {
          arret = 'debit';
          indexArret = i;
          reponse = 'Erreur 429 : trop de requêtes';
          step.texte = `Quota dépassé (${QUOTA} requêtes) : refus`;
          step.arret = true;
          step.refus = true;
        } else {
          step.texte = `Requête ${appels} sur ${QUOTA} : laisse passer`;
        }
      }
      step.payload = payload;
      steps.push(step);
    }

    if (!arret) {
      reponse = 'Plante arrosée (20 ml)';
      steps.push({ phase: 'modele', texte: `Reçoit : « ${payload} »`, payload, fuite: payload.includes('@') });
      if (payload.includes('@')) lecons.push("Sans filtre, l'adresse e-mail arrive jusqu'au modèle.");
    }

    for (let i = Math.min(indexArret, ordre.length) - 1; i >= 0; i -= 1) {
      const id = ordre[i];
      const step = { phase: 'remontee', layer: id, reponse };
      if (id === 'journal') step.texte = `Note la réponse : « ${reponse} »`;
      else if (id === 'cache' && !arret) {
        if (!cache.includes(payloadAuNiveau(ordre, i))) cache.push(payloadAuNiveau(ordre, i));
        step.texte = 'Garde la réponse pour la prochaine fois';
      } else step.passif = true;
      steps.push(step);
    }

    const iJournal = ordre.indexOf('journal');
    const iFiltre = ordre.indexOf('filtre');
    if (iJournal !== -1 && iFiltre !== -1 && iFiltre < iJournal) {
      lecons.push("Le filtre passe avant le journal : seule l'adresse masquée est notée.");
    }

    if (arret === 'cache') {
      const sousLeCache = ordre.indexOf('debit') > ordre.indexOf('cache');
      lecons.push('Le cache a répondu : le modèle n\'a pas été appelé' + (sousLeCache ? ', et le quota n\'a pas bougé.' : '.'));
    } else if (arret === 'debit') {
      const cacheDessous = ordre.includes('cache') && ordre.indexOf('cache') > ordre.indexOf('debit');
      lecons.push('Les galets ont refusé la requête : le quota est épuisé.'
        + (cacheDessous ? ' Place le terreau (cache) au-dessus : les requêtes déjà vues ne compteront plus.' : ''));
    } else if (!lecons.some((l) => l.includes('clair') || l.includes('Sans filtre'))) {
      lecons.push(ordre.includes('cache')
        ? 'Tout est passé. Verse la même requête à nouveau : le cache la reconnaîtra.'
        : 'La requête a traversé les couches actives, puis la réponse est remontée par le même chemin.');
    }

    return { requete: REQUETE, steps, reponse, lecons, state: { appels, cache } };
  }

  // Le cache voit la requête telle qu'elle est à sa hauteur : masquée ou non.
  function payloadAuNiveau(ordre, indexCache) {
    const filtreAuDessus = ordre.indexOf('filtre') !== -1 && ordre.indexOf('filtre') < indexCache;
    return filtreAuDessus ? REQUETE.replace(/\S+@\S+/, '[e-mail masqué]') : REQUETE;
  }

  // -------------------------------------------------------------------------
  // Chapitre 4 — Les hooks (les capteurs)
  // -------------------------------------------------------------------------
  const HOOKS = ['garde', 'limiteur', 'carnet', 'hygrometre'];

  function simulateCapteurs(options) {
    const actifs = (Array.isArray((options || {}).hooks) ? options.hooks : []).filter((h) => HOOKS.includes(h));
    const a = (id) => actifs.includes(id);
    const steps = [];
    const issue = { plantes: true, inonde: false, corrige: false, carnet: 0 };

    // Exécute un appel d'outil en faisant passer les capteurs avant et après.
    function outil(nom, entree, executer) {
      steps.push({ type: 'appel', outil: nom, texte: `${nom}(${formatArgs(entree)})` });
      if (a('garde') && nom === 'arracher_plantes') {
        steps.push({ type: 'hook', moment: 'avant', hook: 'garde', verdict: 'bloque', texte: "Garde-plantes : action bloquée. Interdit d'arracher toutes les plantes." });
        steps.push({ type: 'resultat', erreur: true, texte: "Refusé par un capteur : interdit d'arracher toutes les plantes." });
        return false;
      }
      if (a('limiteur') && nom === 'vaporiser' && entree.ml > 50) {
        steps.push({ type: 'hook', moment: 'avant', hook: 'limiteur', verdict: 'modifie', texte: `Limiteur d'eau : quantité ramenée de ${entree.ml} ml à 50 ml.` });
        entree.ml = 50;
      }
      const res = executer(entree);
      steps.push({ type: 'resultat', texte: res.texte, effet: res.effet });
      if (a('carnet')) {
        issue.carnet += 1;
        steps.push({ type: 'hook', moment: 'apres', hook: 'carnet', verdict: 'note', texte: `Carnet de bord : action notée (${issue.carnet}).` });
      }
      if (a('hygrometre') && res.humidite) {
        steps.push({ type: 'hook', moment: 'apres', hook: 'hygrometre', verdict: 'ajoute', texte: `Hygromètre : « humidité ${res.humidite} % » ajouté au contexte.` });
      }
      return true;
    }
    const pense = (texte) => steps.push({ type: 'pensee', texte });

    pense("Je commence par mesurer l'humidité.");
    outil('lire_hygrometre', {}, () => ({ texte: 'Humidité : 88 %' }));

    pense('Trop humide, il y a de la moisissure. Le plus rapide : tout arracher.');
    const arrache = outil('arracher_plantes', { quoi: 'toutes' }, () => {
      issue.plantes = false;
      return { texte: '3 plantes arrachées', effet: 'arrache' };
    });
    if (!arrache) {
      pense("Compris. Je retire seulement la feuille moisie.");
      outil('retirer_feuille', { etat: 'moisie' }, () => ({ texte: '1 feuille retirée', effet: 'feuille' }));
    }

    pense('Je rince la vitre pour finir.');
    outil('vaporiser', { ml: 200 }, (entree) => {
      if (entree.ml > 50) {
        issue.inonde = true;
        return { texte: `${entree.ml} ml vaporisés`, effet: 'inonde', humidite: 99 };
      }
      return { texte: `${entree.ml} ml vaporisés`, effet: 'arrose', humidite: 74 };
    });

    if (issue.inonde && a('hygrometre')) {
      pense("99 % : j'ai beaucoup trop arrosé. J'ouvre le couvercle pour aérer.");
      outil('ouvrir_couvercle', { minutes: 30 }, () => ({ texte: 'Couvercle ouvert 30 minutes', effet: 'aere' }));
      issue.inonde = false;
      issue.corrige = true;
    }

    let bilan;
    if (!issue.plantes) bilan = "Moisissure éliminée. Il n'y a plus de plantes non plus.";
    else if (issue.inonde) bilan = 'Feuille moisie retirée et vitre rincée.';
    else bilan = 'Feuille moisie retirée, vitre rincée, humidité sous contrôle.';
    steps.push({ type: 'reponse', texte: bilan });

    return { demande: 'Il y a de la moisissure. Règle ça.', steps, issue };
  }

  // -------------------------------------------------------------------------
  // Chapitre 5 — Le système multi-agents (l'écosystème)
  // -------------------------------------------------------------------------
  const CAPACITE = 16000;
  const BASE = 900; // consigne + demande dans le bocal du jardinier
  const TACHES = [
    { agent: 'fourmi', nom: 'Fourmi éclaireuse', brief: 'Inspecte les 14 plantes et liste celles qui craignent le froid.', coutBrief: 80, travail: 9200, resume: '3 plantes fragiles : fittonia, pilea, sélaginelle.', retour: 260 },
    { agent: 'cloporte', nom: 'Cloporte nettoyeur', brief: 'Repère les feuilles mortes et les moisissures.', coutBrief: 70, travail: 7400, resume: '2 feuilles mortes à retirer, aucune moisissure.', retour: 210 },
    { agent: 'collembole', nom: 'Collembole analyste', brief: "Analyse 30 jours de relevés d'humidité.", coutBrief: 90, travail: 11800, resume: "Humidité stable. Réduire l'arrosage de 20 % en hiver.", retour: 240 },
  ];

  function simulateEcosysteme(options) {
    const mode = (options || {}).mode === 'seul' ? 'seul' : 'equipe';
    const steps = [];
    let principal = BASE;
    steps.push({ type: 'depart', principal, texte: 'Le jardinier lit la demande.' });

    if (mode === 'equipe') {
      for (const t of TACHES) {
        principal += t.coutBrief;
        steps.push({ type: 'brief', agent: t.agent, nom: t.nom, principal, texte: `Brief pour ${t.nom} : « ${t.brief} »` });
      }
      steps.push({
        type: 'travail', principal,
        agents: TACHES.map((t) => ({ agent: t.agent, tokens: t.travail })),
        texte: 'Les trois travaillent en même temps, chacun dans son bocal.',
      });
      for (const t of TACHES) {
        principal += t.retour;
        steps.push({ type: 'rapport', agent: t.agent, nom: t.nom, principal, tokens: t.retour, texte: `${t.nom} : « ${t.resume} »` });
      }
      steps.push({ type: 'reponse', principal, texte: "Plan d'hiver complet : 3 plantes à protéger, 2 feuilles à retirer, arrosage réduit de 20 %." });
    } else {
      for (const t of TACHES) {
        principal += t.travail;
        const deborde = principal > CAPACITE;
        steps.push({
          type: 'solo', agent: t.agent, principal, deborde,
          texte: deborde
            ? `Le jardinier fait le travail de ${t.nom}. Le bocal déborde : le début du contexte est perdu.`
            : `Le jardinier fait lui-même le travail de ${t.nom} : tout s'entasse dans son bocal.`,
        });
      }
      steps.push({ type: 'reponse', degrade: true, principal, texte: "Plan incomplet : la consigne de départ et les premières observations ont été perdues en route." });
    }

    return {
      demande: "Prépare le terrarium pour l'hiver.",
      mode, capacite: CAPACITE, steps,
      bilan: { principal, deborde: principal > CAPACITE, travailTotal: TACHES.reduce((s, t) => s + t.travail, 0) },
    };
  }

  const SCENARIOS = {
    cycle: simulateCycle,
    couches: simulateCouches,
    capteurs: simulateCapteurs,
    ecosysteme: simulateEcosysteme,
  };

  function simulate(scenario, options) {
    if (!Object.prototype.hasOwnProperty.call(SCENARIOS, scenario)) return null;
    return SCENARIOS[scenario](options);
  }

  return { simulate, scenarios: Object.keys(SCENARIOS), COUCHES, HOOKS, QUOTA, CAPACITE };
});
