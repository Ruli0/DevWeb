/*
 * Les temps forts : les briques de la narration. Chacun dure un nombre entier de mesures
 * et place, sur la grille des temps de la musique, la caméra, les gestes et les réactions de Mousse.
 *
 * Un temps fort reçoit le contexte du compilateur (ctx) et ses paramètres (p).
 * ctx.b(n) : l'instant du n-ième temps depuis le début du temps fort.
 * Les rôles : « ia » (le caméléon), « tache » (la mouche). Mousse réagit toujours.
 */
'use strict';

const ETIQUETTES = { ia: "l'IA", tache: 'la tâche', outil: "l'outil" };

const TEMPS_FORTS = {
  accroche: {
    mesures: 1,
    role: "Ouvre sur l'action : gros plan sur l'œil (et sur la tâche si elle est là), l'œil bouge avant 0,5 s. Sans tâche, l'IA réfléchit.",
    params: 'texte ; mesures',
    jouer(ctx, p) {
      if (!ctx.etat.mouche.visible) {
        // Pas encore de tâche : l'IA réfléchit, longtemps (c'est le gag : elle « rame »).
        ctx.camera(0, 'gros-plan', ['ia.oeil'], 0);
        ctx.geste('ia', 'cligner', ctx.b(0.4), { fois: 1 });
        ctx.reflechir(ctx.b(1), ctx.b(3.5) - ctx.b(1));
        ctx.geste('mousse', 'pencher', ctx.b(1), { duree: ctx.b(3.8) - ctx.b(1) });
        if ((p.mesures || 1) > 1) {
          ctx.reflechir(ctx.b(4.2), ctx.b(7) - ctx.b(4.2));
          ctx.humeur(ctx.b(5), 'blase');
          ctx.geste('mousse', 'depit', ctx.b(5), { duree: ctx.b(7.6) - ctx.b(5) });
        }
        return { parties: ['plein'] };
      }
      ctx.camera(0, 'gros-plan', ['ia.oeil', 'tache'], 0);
      ctx.geste('ia', 'cligner', ctx.b(0.5), { fois: 1 });
      ctx.regarder(ctx.b(1.2), ctx.decale('tache', 0, -140), 0.2);
      ctx.regarder(ctx.b(2.2), 'tache', 0.2);
      ctx.geste('mousse', 'pencher', ctx.b(1), { duree: ctx.b(3.6) - ctx.b(1) });
      ctx.mouche('yoyo', ctx.b(2.5), { fois: 1, amplitude: 40 });
      return { parties: ['plein'] };
    },
  },
  presenter: {
    mesures: 1,
    role: 'Gros plan sur un rôle, avec son étiquette ; Mousse le désigne avec sa lanterne.',
    params: 'qui (ia, tache ou outil) ; etiquette ; texte',
    jouer(ctx, p) {
      const qui = p.qui || 'ia';
      if (!ETIQUETTES[qui]) return ctx.erreur(`presenter : qui doit être ${Object.keys(ETIQUETTES).join(', ')} (${qui})`);
      const sur = { ia: ['ia.tete'], tache: ['tache'], outil: ['ia.bouche', 'tache'] }[qui];
      ctx.camera(0, 'gros-plan', sur, 0.45, 'power3.inOut', false);
      ctx.geste('mousse', 'pointer', ctx.b(0), { duree: ctx.b(3.6) - ctx.b(0) });
      if (qui === 'outil') {
        // La langue sort à mi-chemin et reste dehors le temps de la montrer.
        ctx.langue(ctx.b(0.5), { portee: 0.5, tenir: ctx.b(3) - ctx.b(0.5) });
        ctx.etiquette(ctx.b(1), ctx.b(3.2) - ctx.b(1), 'ia.langue', p.etiquette || ETIQUETTES.outil);
        return { parties: ['plein'] };
      }
      ctx.etiquette(ctx.b(1), ctx.b(3.9) - ctx.b(1), sur[0], p.etiquette || ETIQUETTES[qui]);
      if (qui === 'tache') ctx.mouche('yoyo', ctx.b(1.5), { fois: 1, amplitude: 40 });
      else ctx.geste('ia', 'cligner', ctx.b(1.5), { fois: 2 });
      return { parties: ['plein'] };
    },
  },
  rater: {
    mesures: 2,
    role: "L'IA agit et rate : à l'aveugle (la tâche esquive) ou trop court (la langue s'arrête avant, la tâche rit). La musique se tait un temps, Mousse se cache l'œil.",
    params: 'facon (aveugle ou court) ; texte',
    jouer(ctx, p) {
      ctx.camera(0, 'plan-moyen', ['ia', 'tache'], 0.5);
      if (p.facon === 'court') {
        ctx.langue(ctx.b(3), { portee: 0.62, tenir: 0.25 });
        ctx.mouche('yoyo', ctx.b(4), { fois: 2, amplitude: 30 });
        ctx.humeur(ctx.b(4), 'blase');
        ctx.geste('mousse', 'depit', ctx.b(4), { duree: ctx.b(7.5) - ctx.b(4) });
        ctx.geste('ia', 'cligner', ctx.b(6), { fois: 2 });
        return { parties: ['plein', 'creux'], coupures: [ctx.b(4)] };
      }
      ctx.langue(ctx.b(3), { rate: true });
      ctx.mouche('esquiver', ctx.b(3) + 0.02, { vers: ctx.decale('tache', -120, -100) });
      ctx.regarder(ctx.b(3) + 0.16, 'tache', 0.15);
      ctx.humeur(ctx.b(4), 'blase');
      ctx.geste('mousse', 'depit', ctx.b(4), { duree: ctx.b(7.5) - ctx.b(4) });
      ctx.geste('ia', 'cligner', ctx.b(5), { fois: 2 });
      return { parties: ['plein', 'creux'], coupures: [ctx.b(4)] };
    },
  },
  narguer: {
    mesures: 2,
    role: "La tâche se moque : elle fait le yoyo sur son fil, l'œil de l'IA la suit.",
    params: 'texte',
    jouer(ctx) {
      ctx.camera(0, 'gros-plan', ['tache', 'ia.oeil'], 0.45);
      const haut = ctx.point('tache');
      ctx.mouche('yoyo', ctx.b(1), { fois: 4, amplitude: 70 });
      for (let k = 0; k < 4; k += 1) {
        ctx.regarder(ctx.b(1 + k), [haut[0], haut[1] + 70], ctx.T / 2, 'power2.in');
        ctx.regarder(ctx.b(1.5 + k), haut, ctx.T / 2, 'power2.out');
      }
      ctx.geste('mousse', 'pencher', ctx.b(4.5), { duree: ctx.b(7.5) - ctx.b(4.5) });
      return { parties: ['creux', 'creux'] };
    },
  },
  reussir: {
    mesures: 2,
    role: "La tâche revient, l'IA vise et l'attrape sur le premier temps de la 2e mesure (la basse revient), elle change de couleur, Mousse saute.",
    params: 'couleur (turquoise) ; texte',
    jouer(ctx, p) {
      const depart = ctx.point('tache.depart');
      ctx.camera(0, 'plan-moyen', ['ia', 'tache.depart'], 0.4);
      ctx.mouche('revenir', ctx.b(0), { vers: depart, duree: ctx.b(2.5) - ctx.b(0) });
      ctx.regarder(ctx.b(1.2), ctx.decale('tache', 60, -40), 0.3);
      ctx.regarder(ctx.b(2.6), depart, 0.2);
      ctx.humeur(ctx.b(3), 'surpris');
      ctx.geste('ia', 'langue', ctx.b(4) - 0.1, { cible: depart });
      ctx.mouche('disparaitre', ctx.b(4));
      ctx.humeur(ctx.b(4), 'content');
      ctx.geste('mousse', 'sauter', ctx.b(4.2), { fois: 2, duree: ctx.b(7.6) - ctx.b(4.2) });
      ctx.geste('ia', 'avaler', ctx.b(4.8));
      ctx.teinte(ctx.b(5), p.couleur || 'turquoise');
      ctx.regarder(ctx.b(5.5), ctx.decale('ia.oeil', 200, 0), 0.25);
      return { parties: ['montee', 'plein'] };
    },
  },
  etapes: {
    mesures: 3,
    texteParMesure: true,
    role: "La boucle d'outils, une mesure par étape : observer (l'œil suit la tâche qui revient), agir (la langue l'attrape sur le premier temps, la basse revient), vérifier (il avale, change de couleur, Mousse saute).",
    params: 'couleur (turquoise) ; texte : un morceau par mesure',
    jouer(ctx, p) {
      const depart = ctx.point('tache.depart');
      // 1. Observer.
      ctx.camera(0, 'gros-plan', ['ia.oeil', 'tache'], 0.4);
      ctx.humeur(ctx.b(0), 'neutre');
      ctx.geste('mousse', 'pencher', ctx.b(0.3), { duree: ctx.b(3.4) - ctx.b(0.3) });
      ctx.mouche('revenir', ctx.b(0.5), { vers: depart, duree: ctx.b(3) - ctx.b(0.5) });
      ctx.regarder(ctx.b(1.2), ctx.decale('tache.depart', -40, -90), 0.3);
      ctx.regarder(ctx.b(2.2), ctx.decale('tache.depart', 50, -60), 0.3);
      ctx.regarder(ctx.b(3), depart, 0.25);
      // 2. Agir : la langue arrive sur le premier temps de la mesure.
      ctx.camera(3.4, 'plan-moyen', ['ia', 'tache.depart'], 0.5);
      ctx.langue(ctx.b(4) - 0.1, { vers: depart });
      ctx.mouche('disparaitre', ctx.b(4));
      ctx.humeur(ctx.b(4), 'surpris');
      // 3. Vérifier.
      ctx.camera(8, 'gros-plan', ['ia.tete'], 0.4);
      ctx.geste('ia', 'avaler', ctx.b(8));
      ctx.humeur(ctx.b(8), 'content');
      ctx.geste('mousse', 'sauter', ctx.b(8.2), { fois: 2, duree: ctx.b(11.6) - ctx.b(8.2) });
      ctx.teinte(ctx.b(8.6), p.couleur || 'turquoise');
      ctx.regarder(ctx.b(9.5), ctx.decale('ia.oeil', 200, 0), 0.25);
      return { parties: ['montee', 'plein', 'plein'] };
    },
  },
  reveler: {
    mesures: 3,
    texteParMesure: true,
    role: 'Plan large, la phrase qui révèle le concept, une mesure par morceau ; Mousse désigne la scène, puis rit.',
    params: 'texte : un morceau par mesure',
    jouer(ctx) {
      ctx.camera(0, 'large', [], 0.8);
      ctx.geste('mousse', 'pointer', ctx.b(0.5), { duree: ctx.b(4) - ctx.b(0.5) });
      ctx.geste('ia', 'cligner', ctx.b(4.5), { fois: 2 });
      ctx.geste('mousse', 'rire', ctx.b(8.5), { duree: ctx.b(11) - ctx.b(8.5) });
      return { parties: ['plein', 'plein', 'plein'] };
    },
  },
  outils: {
    mesures: 1,
    role: "Plan large : les outils de l'IA descendent sur leurs fils (loupe, page, et la tâche), le schéma de la boucle apparaît.",
    params: 'texte',
    jouer(ctx) {
      ctx.camera(0, 'large', [], 0.6);
      ctx.geste('mousse', 'pointer', ctx.b(0), { duree: ctx.b(3.6) - ctx.b(0) });
      ctx.humeur(ctx.b(0), 'neutre');
      ctx.outil('descendre', ctx.b(0.8), { id: 'loupe' });
      ctx.outil('descendre', ctx.b(1.4), { id: 'page' });
      if (!ctx.etat.mouche.visible) ctx.mouche('descendre', ctx.b(2), { vers: ctx.point('tache.depart'), duree: 0.8 });
      ctx.schema('apparaitre', ctx.b(2.6));
      ctx.regarder(ctx.b(1), 'outil.loupe', 0.25);
      ctx.regarder(ctx.b(2.2), 'outil.page', 0.25);
      return { parties: ['plein'] };
    },
  },
  tour: {
    mesures: 2,
    role: "Un tour de boucle d'agent : il pense, il appelle un outil (la langue l'attrape sur le 1er temps de la 2e mesure), il lit le résultat ; le schéma suit et le compteur avance (tour, temps, tokens). Avec rate : la tâche (le bug) esquive, silence d'un temps.",
    params: "outil (loupe, page ou tache) ; rate ; etiquette (nom de l'outil) ; parties ; texte",
    jouer(ctx, p) {
      const outil = p.outil || 'loupe';
      const cible = outil === 'tache' ? 'tache' : `outil.${outil}`;
      const NOMS = { loupe: 'recherche web', page: 'lire une page', tache: 'écrire du code' };
      ctx.camera(0, 'plan-moyen', ['ia', cible], 0.45);
      ctx.schema('etape', ctx.b(0), { vers: 'pense' });
      ctx.reflechir(ctx.b(0.2), ctx.b(2.2) - ctx.b(0.2));
      ctx.geste('mousse', 'pencher', ctx.b(0.3), { duree: ctx.b(3) - ctx.b(0.3) });
      ctx.regarder(ctx.b(2.4), cible, 0.2);
      ctx.schema('etape', ctx.b(2.5), { vers: 'outil' });
      ctx.etiquette(ctx.b(2.5), ctx.b(4.4) - ctx.b(2.5), cible, p.etiquette || NOMS[outil], { dy: -150 });
      const cout = { tour: 1, s: 30, k: 1100, duree: ctx.b(6.5) - ctx.b(4.5) };
      if (p.rate) {
        ctx.langue(ctx.b(4) - 0.1, { vers: cible, rate: true });
        ctx.mouche('esquiver', ctx.b(4) - 0.08, { vers: ctx.decale('tache', -150, -60) });
        ctx.regarder(ctx.b(4) + 0.12, 'tache', 0.15);
        ctx.mouche('yoyo', ctx.b(5.5), { fois: 2, amplitude: 40 });
        ctx.humeur(ctx.b(4), 'blase');
        ctx.geste('mousse', 'depit', ctx.b(4), { duree: ctx.b(7.5) - ctx.b(4) });
        ctx.schema('etape', ctx.b(4.5), { vers: 'resultat', erreur: true });
        ctx.schema('compteur', ctx.b(4.5), cout);
        return { parties: ['plein', 'creux'], coupures: [ctx.b(4)] };
      }
      ctx.langue(ctx.b(4) - 0.1, { vers: cible });
      if (outil === 'tache') ctx.mouche('disparaitre', ctx.b(4));
      else ctx.outil('attrape', ctx.b(4), { id: outil });
      ctx.geste('ia', 'absorber', ctx.b(4.6));
      ctx.humeur(ctx.b(4.2), 'content');
      ctx.schema('etape', ctx.b(4.5), { vers: 'resultat' });
      ctx.schema('compteur', ctx.b(4.5), cout);
      ctx.humeur(ctx.b(7), 'neutre');
      return { parties: ['plein', 'plein'] };
    },
  },
  reponse: {
    mesures: 1,
    role: "L'agent a fini : une bulle de réponse sort, il change de couleur, Mousse saute ; tout le schéma s'allume.",
    params: 'couleur (turquoise) ; texte',
    jouer(ctx, p) {
      ctx.camera(0, 'plan-moyen', ['ia.tete'], 0.4);
      ctx.schema('etape', ctx.b(0), { vers: 'tout' });
      ctx.humeur(ctx.b(0), 'content');
      ctx.geste('ia', 'repondre', ctx.b(0.5), { duree: ctx.b(3.6) - ctx.b(0.5) });
      ctx.teinte(ctx.b(0.5), p.couleur || 'turquoise');
      ctx.geste('mousse', 'sauter', ctx.b(0.3), { fois: 2, duree: ctx.b(3.7) - ctx.b(0.3) });
      return { parties: ['plein'] };
    },
  },
  formule: {
    mesures: 2,
    texteParMesure: true,
    role: "La définition : plan large, étiquettes sur l'IA et sur ses outils, puis le schéma passe au centre et la comète fait un tour complet.",
    params: 'texte : un morceau par mesure',
    jouer(ctx) {
      ctx.camera(0, 'large', [], 0.7, 'power2.inOut', false);
      ctx.outil('descendre', ctx.b(0.4), { id: 'loupe' });
      ctx.outil('descendre', ctx.b(0.8), { id: 'page' });
      if (!ctx.etat.mouche.visible) ctx.mouche('descendre', ctx.b(1.2), { vers: ctx.point('tache.depart'), duree: 0.8 });
      ctx.etiquette(ctx.b(1), ctx.b(3.8) - ctx.b(1), 'ia.tete', "l'IA", { dx: -120, dy: -200 });
      ctx.etiquette(ctx.b(1.8), ctx.b(3.8) - ctx.b(1.8), 'outil.page', 'outils', { dx: -150, dy: -110 });
      ctx.schema('centrer', ctx.b(4), { vers: true });
      ctx.schema('etape', ctx.b(4.8), { vers: 'pense' });
      ctx.schema('etape', ctx.b(5.6), { vers: 'outil' });
      ctx.schema('etape', ctx.b(6.4), { vers: 'resultat' });
      ctx.schema('etape', ctx.b(7.2), { vers: 'pense' });
      ctx.geste('mousse', 'pointer', ctx.b(4.3), { duree: ctx.b(7.6) - ctx.b(4.3) });
      return { parties: ['plein', 'plein'] };
    },
  },
  cout: {
    mesures: 2,
    role: 'Le prix de la boucle : le schéma reste au centre, tout allumé, avec le temps et les tokens dépensés ; Mousse rit jaune.',
    params: 'texte',
    jouer(ctx) {
      ctx.schema('etape', ctx.b(0), { vers: 'tout' });
      ctx.geste('ia', 'cligner', ctx.b(2), { fois: 2 });
      ctx.humeur(ctx.b(3.5), 'blase');
      ctx.geste('mousse', 'rire', ctx.b(4.5), { duree: ctx.b(7.5) - ctx.b(4.5) });
      return { parties: ['plein', 'plein'] };
    },
  },
  boucler: {
    mesures: 2,
    role: 'Plan large, la scène revient à son état de départ (la tâche, les outils, le schéma), et la caméra revient au cadrage du début : la vidéo boucle.',
    params: 'texte',
    jouer(ctx) {
      ctx.camera(0, 'large', [], 0.8);
      ctx.humeur(ctx.b(1), 'neutre');
      ctx.teinte(ctx.b(2), ctx.depart.couleur);
      ctx.restaurer(ctx.b(1), ctx.b(6));
      ctx.regarder(ctx.b(4.5), 'tache.depart', 0.25);
      ctx.geste('mousse', 'pointer', ctx.b(3), { duree: ctx.b(5.5) - ctx.b(3) });
      ctx.retourCamera(ctx.b(8) - 1.2, 1.2);
      return { parties: ['plein', 'plein'] };
    },
  },
};

module.exports = { TEMPS_FORTS, ETIQUETTES };
