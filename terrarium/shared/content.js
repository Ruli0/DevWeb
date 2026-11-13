/*
 * Contenu pédagogique des chapitres. Servi par l'API Node.js (/api/chapters),
 * et chargé directement par le navigateur pour la démo hors ligne.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.Terrarium = root.Terrarium || {};
    root.Terrarium.content = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const chapters = [
    {
      id: 'bocal',
      numero: 1,
      titre: 'La boîte en verre',
      concept: 'Fenêtre de contexte et context engineering',
      resume: 'Un volume limité : tout ce que le modèle voit doit y tenir.',
      intro: [
        "Un modèle ne voit que ce qui est dans son contexte, comme les habitants du vivarium ne disposent que de ce qui est dans la boîte en verre. Et cette boîte a une taille fixe, comptée en tokens (des morceaux de mots).",
        "Le context engineering, c'est l'art de choisir ce qu'on y met : la consigne, la demande, les outils, et seulement les extraits utiles des documents. Quand l'ancien prend trop de place, on le composte : on le remplace par un résumé.",
      ],
      consigne: 'Fais tenir les sept éléments dans la boîte. Touche un élément pour l\'ajouter, puis composte ce qui prend trop de place.',
      retenir: [
        'Ce qui déborde est perdu : le modèle ne le voit plus.',
        'Un bon contexte est choisi, pas rempli : un extrait utile vaut mieux qu\'un document entier.',
        'Compacter, c\'est résumer l\'ancien pour garder de la place au nouveau.',
      ],
      code: {
        titre: 'Assembler le contexte',
        source: `// Choisir quoi mettre dans le contexte, et dans quel ordre
function construireContexte(demande: string, memoire: Memoire) {
  const contexte = [
    consigneSysteme,                  // stable, en premier
    ...definitionsOutils,
    ...memoire.extraitsUtiles(demande, { max: 3 }), // pas la doc entière
    memoire.resumeHistorique(),       // l'ancien, compacté
    ...memoire.derniersMessages(4),   // le récent, intact
    { role: "user", content: demande },
  ];

  if (compterTokens(contexte) > LIMITE * 0.8) {
    memoire.compacter();              // résumer avant de déborder
    return construireContexte(demande, memoire);
  }
  return contexte;
}`,
      },
      quiz: [
        {
          question: 'Le contexte est plein et la conversation continue. Que fait-on ?',
          options: [
            'On supprime la consigne système, elle est déjà connue',
            'On résume les anciens échanges pour libérer de la place',
            'Rien : le modèle se souvient tout seul du début',
          ],
          reponse: 1,
          explication: "Le modèle ne se souvient que de ce qui est dans son contexte. On compacte l'ancien, et on garde la consigne.",
        },
        {
          question: 'Pour répondre à une question sur un manuel de 300 pages, le mieux est de…',
          options: [
            'Mettre le manuel entier dans le contexte',
            'Ne rien mettre et laisser le modèle deviner',
            'Mettre seulement les passages utiles à la question',
          ],
          reponse: 2,
          explication: 'Trop de contexte noie l\'information utile et coûte cher. On sélectionne les extraits pertinents.',
        },
      ],
    },
    {
      id: 'cycle',
      numero: 2,
      titre: 'Le caméléon',
      concept: "La boucle d'outils",
      resume: 'Viser, lancer la langue, avaler, recommencer : le moteur de tout agent.',
      intro: [
        "Un agent n'est pas une réponse unique : c'est une boucle. Le modèle réfléchit, demande à utiliser un outil, reçoit le résultat, puis réfléchit à nouveau avec cette information en plus.",
        "Le caméléon chasse exactement comme ça. Il repère une proie et vise : le modèle réfléchit. Il lance sa langue : c'est l'appel d'outil. Il ramène la proie : c'est le résultat. Sa couleur change : le résultat enrichit son contexte. Puis il recommence, jusqu'à ce qu'il n'ait plus faim. C'est lui qui décide quand s'arrêter, comme le modèle qui répond sans demander d'outil.",
      ],
      consigne: "Ici, l'agent s'occupe de l'humidité du vivarium. Avance étape par étape et suis la goutte autour de la boucle. Compte les tours avant la réponse finale.",
      retenir: [
        'Le modèle ne lance pas l\'outil lui-même : il le demande, et le programme l\'exécute.',
        'Chaque résultat d\'outil retourne dans le contexte avant le tour suivant.',
        'La boucle s\'arrête quand le modèle répond sans appeler d\'outil.',
      ],
      code: {
        titre: 'La boucle, en entier',
        source: `async function boucleAgent(demande: string) {
  const messages = [{ role: "user", content: demande }];

  while (true) {
    const reponse = await modele.generer({ messages, outils });
    messages.push(reponse.message);

    if (reponse.appelsOutils.length === 0) {
      return reponse.texte;          // plus d'outil demandé : c'est fini
    }
    for (const appel of reponse.appelsOutils) {
      const resultat = await outils[appel.nom].executer(appel.arguments);
      messages.push({ role: "tool", id: appel.id, content: resultat });
    }                                // et on repart pour un tour
  }
}`,
      },
      quiz: [
        {
          question: 'Qui exécute réellement l\'outil « vaporiser » ?',
          options: [
            'Le modèle, directement',
            'Le programme autour du modèle, qui lui renvoie le résultat',
            'L\'utilisateur, à la main',
          ],
          reponse: 1,
          explication: "Le modèle produit seulement une demande d'appel. C'est le programme (la boucle) qui exécute l'outil et renvoie le résultat.",
        },
        {
          question: 'Quand la boucle s\'arrête-t-elle ?',
          options: [
            'Après exactement trois tours',
            'Dès qu\'un outil renvoie un résultat',
            'Quand le modèle répond sans demander d\'outil',
          ],
          reponse: 2,
          explication: "Le nombre de tours n'est pas fixé d'avance. La boucle finit quand le modèle estime avoir terminé.",
        },
      ],
    },
    {
      id: 'couches',
      numero: 3,
      titre: 'Le ruisseau',
      concept: 'Le middleware',
      resume: 'Chaque requête traverse des couches à l\'aller, et la réponse au retour.',
      intro: [
        "Dans le vivarium, l'eau de la cascade n'arrive jamais directement au bassin. Elle traverse du sable, de la mousse, du terreau et des galets. Chaque couche a un rôle : filtrer, retenir, freiner.",
        "Un middleware, c'est pareil : une couche placée entre la demande et le modèle. La requête descend à travers toutes les couches, la réponse remonte par le même chemin. Chaque couche peut observer, modifier, ou arrêter le passage. Et leur ordre change tout.",
      ],
      consigne: 'Verse une requête : dans cet ordre, une donnée sensible fuit. Trouve le bon ordre des couches, puis verse la même requête deux fois pour voir le cache.',
      retenir: [
        'Une couche voit passer la requête à la descente et la réponse à la remontée.',
        'Une couche peut court-circuiter : le cache répond sans appeler le modèle.',
        'L\'ordre compte : un journal placé avant le filtre enregistre les données sensibles.',
      ],
      code: {
        titre: 'Des couches que l\'on compose',
        source: `type Suite = (requete: Requete) => Promise<Reponse>;
type Middleware = (requete: Requete, suite: Suite) => Promise<Reponse>;

const journal: Middleware = async (requete, suite) => {
  console.log("→", requete.texte);       // à la descente
  const reponse = await suite(requete);
  console.log("←", reponse.texte);       // à la remontée
  return reponse;
};

const cache: Middleware = async (requete, suite) => {
  const connue = memoire.get(requete.texte);
  if (connue) return connue;              // court-circuit : pas d'appel au modèle
  const reponse = await suite(requete);
  memoire.set(requete.texte, reponse);
  return reponse;
};

// L'ordre compte : la première de la liste est la couche du dessus
const appeler = composer([filtre, journal, cache, limiteDebit], appelerModele);`,
      },
      quiz: [
        {
          question: 'Le journal est placé au-dessus du filtre de données sensibles. Que se passe-t-il ?',
          options: [
            'Le journal enregistre l\'adresse e-mail en clair',
            'Rien de spécial, l\'ordre ne compte pas',
            'Le filtre ne fonctionne plus du tout',
          ],
          reponse: 0,
          explication: 'Le journal voit la requête avant qu\'elle soit masquée. Le filtre doit passer en premier.',
        },
        {
          question: 'Le cache reconnaît une requête déjà vue. Que fait-il ?',
          options: [
            'Il la transmet quand même au modèle',
            'Il renvoie la réponse gardée, sans appeler le modèle',
            'Il bloque la requête avec une erreur',
          ],
          reponse: 1,
          explication: 'C\'est un court-circuit : la réponse remonte directement, et les couches du dessous ne voient rien.',
        },
      ],
    },
    {
      id: 'capteurs',
      numero: 4,
      titre: 'Les capteurs',
      concept: 'Les hooks',
      resume: 'Des déclencheurs avant et après chaque action, qui peuvent la bloquer.',
      intro: [
        "Dans le vivarium, la dionée ne réfléchit pas : dès qu'un insecte touche ses poils, elle se referme. La grenouille, elle, coasse après coup pour signaler ce qui vient de se passer. Un hook fonctionne de la même façon : il se déclenche tout seul, au bon moment.",
        "C'est un petit programme branché sur un moment précis de la boucle : juste avant qu'un outil s'exécute, ou juste après. Avant, il peut bloquer ou modifier l'action. Après, il peut noter ce qui s'est passé ou ajouter une information au contexte. Le modèle ne peut pas l'ignorer : le hook s'exécute à coup sûr.",
      ],
      consigne: 'Lance l\'agent sans capteur et regarde le résultat. Branche ensuite les capteurs un par un et relance.',
      retenir: [
        'Une consigne demande au modèle de bien se comporter. Un hook le garantit.',
        'Avant l\'action : bloquer ou modifier. Après l\'action : noter ou informer.',
        'Quand un hook bloque, le modèle reçoit la raison et peut choisir une autre action.',
      ],
      code: {
        titre: 'Brancher des hooks',
        source: `agent.hook("avantOutil", { outil: "arracher_plantes" }, () => {
  return { decision: "bloquer", raison: "Interdit d'arracher toutes les plantes." };
});

agent.hook("avantOutil", { outil: "vaporiser" }, (appel) => {
  const ml = Math.min(appel.arguments.ml, 50);
  return { decision: "modifier", arguments: { ...appel.arguments, ml } };
});

agent.hook("apresOutil", { outil: "*" }, (appel, resultat) => {
  carnet.noter(appel.nom, appel.arguments, resultat); // observer sans rien changer
});

agent.hook("apresOutil", { outil: "vaporiser" }, async () => {
  const humidite = await hygrometre.lire();
  return { ajouterAuContexte: \`Humidité après arrosage : \${humidite} %\` };
});`,
      },
      quiz: [
        {
          question: 'Pourquoi utiliser un hook plutôt qu\'écrire « n\'arrache jamais les plantes » dans la consigne ?',
          options: [
            'Parce que le hook s\'exécute à coup sûr, quoi que décide le modèle',
            'Parce que le modèle ne lit pas la consigne',
            'Parce qu\'un hook rend le modèle plus rapide',
          ],
          reponse: 0,
          explication: 'Une consigne est suivie la plupart du temps. Un hook est du code : il s\'applique à chaque fois.',
        },
        {
          question: 'Un hook « avant l\'action » bloque un outil. Que se passe-t-il ensuite ?',
          options: [
            'L\'agent s\'arrête définitivement',
            'L\'outil s\'exécute quand même, mais plus tard',
            'Le modèle reçoit la raison du refus et peut essayer autre chose',
          ],
          reponse: 2,
          explication: 'Le refus revient au modèle comme un résultat d\'outil. La boucle continue, et il adapte son plan.',
        },
      ],
    },
    {
      id: 'ecosysteme',
      numero: 5,
      titre: "L'écosystème",
      concept: 'Le système multi-agents',
      resume: 'Un jardinier qui délègue à des spécialistes, chacun dans son propre bocal.',
      intro: [
        "Dans le vivarium, la fourmilière ne fait pas tout elle-même. Elle envoie des éclaireuses, chacune de son côté, et chacune ne rapporte que l'essentiel. Au sol, les cloportes nettoient et les collemboles mangent les moisissures.",
        "Dans un système multi-agents, un orchestrateur (le jardinier) découpe la tâche et confie chaque morceau à un sous-agent. Chaque sous-agent travaille dans son propre contexte, un mini-bocal isolé, et ne renvoie qu'un court résumé. Le bocal du jardinier reste léger, et les sous-agents peuvent travailler en même temps.",
      ],
      consigne: 'Lance la même tâche des deux façons et compare le bocal du jardinier.',
      retenir: [
        'Un sous-agent part d\'un contexte neuf : il ne sait que ce que dit son brief.',
        'Seul le résumé remonte. Le travail détaillé reste dans le mini-bocal.',
        'Déléguer a un coût : un brief vague donne un mauvais résultat.',
      ],
      code: {
        titre: 'Orchestrer des sous-agents',
        source: `async function preparerHiver(demande: string) {
  const taches = await orchestrateur.decouper(demande);

  // Chaque sous-agent part avec un contexte neuf : juste son brief
  const rapports = await Promise.all(
    taches.map((tache) =>
      lancerSousAgent({
        consigne: tache.brief,
        outils: tache.outils,
        retour: "un résumé de 5 lignes maximum",
      })
    )
  );

  // L'orchestrateur ne voit que les résumés,
  // pas les 28 400 tokens de travail détaillé
  return orchestrateur.synthetiser(demande, rapports);
}`,
      },
      quiz: [
        {
          question: 'Que reçoit l\'orchestrateur quand un sous-agent a terminé ?',
          options: [
            'Tout le contexte du sous-agent, en entier',
            'Un résumé de son travail',
            'Rien : le sous-agent répond directement à l\'utilisateur',
          ],
          reponse: 1,
          explication: 'C\'est tout l\'intérêt : le travail détaillé reste isolé, et seul l\'essentiel remonte.',
        },
        {
          question: 'Que sait un sous-agent au moment où il démarre ?',
          options: [
            'Toute la conversation de l\'orchestrateur',
            'Ce que savent les autres sous-agents',
            'Seulement ce que contient son brief',
          ],
          reponse: 2,
          explication: 'Son contexte est neuf. Si une information manque dans le brief, il ne peut pas la deviner.',
        },
      ],
    },
  ];

  const resume = (c) => ({ id: c.id, numero: c.numero, titre: c.titre, concept: c.concept, resume: c.resume });

  return {
    chapters,
    ids: chapters.map((c) => c.id),
    list: () => chapters.map(resume),
    get: (id) => chapters.find((c) => c.id === id) || null,
  };
});
