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
    role: "Ouvre sur l'action : gros plan sur l'œil et sur la tâche, l'œil bouge avant 0,5 s.",
    params: 'texte',
    jouer(ctx) {
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
  boucler: {
    mesures: 2,
    role: 'Plan large, une nouvelle tâche descend, et la caméra revient au cadrage du début : la vidéo boucle.',
    params: 'texte',
    jouer(ctx) {
      ctx.camera(0, 'large', [], 0.8);
      ctx.humeur(ctx.b(1), 'neutre');
      ctx.teinte(ctx.b(2), ctx.depart.couleur);
      ctx.mouche('descendre', ctx.b(3), { vers: ctx.point('tache.depart'), duree: ctx.b(5) - ctx.b(3) });
      ctx.regarder(ctx.b(4.5), 'tache.depart', 0.25);
      ctx.geste('mousse', 'pointer', ctx.b(3), { duree: ctx.b(5.5) - ctx.b(3) });
      ctx.retourCamera(ctx.b(8) - 1.2, 1.2);
      return { parties: ['plein', 'plein'] };
    },
  },
};

module.exports = { TEMPS_FORTS, ETIQUETTES };
