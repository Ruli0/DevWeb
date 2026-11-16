/*
 * Le style de la chaîne « avis » (voix d'abord). Voir production/DA-AVIS.md.
 * Un seul système graphique pour tout le compte ; seule la couleur d'accent change avec la rubrique.
 */
'use strict';
module.exports = {
  couleurs: { fond: '#0c0c0e', texte: '#f3efe6' },
  rubriques: {
    travail: { nom: 'Travail', accent: '#5b8cff' },
    escalade: { nom: 'Escalade', accent: '#ff8a3d' },
    relations: { nom: 'Relations', accent: '#ff5d7a' },
    enigme: { nom: 'Énigme', accent: '#a78bfa' },
    voyage: { nom: 'Voyage', accent: '#3fbf8f' },
  },
  polices: {
    titre: 'Inter Tight', fort: 'Instrument Serif', mono: 'JetBrains Mono',
    fichiers: {
      'Inter Tight': { 500: 'inter-tight-latin-500-normal.woff2', 700: 'inter-tight-latin-700-normal.woff2' },
      'Instrument Serif': { 400: 'instrument-serif-latin-400-italic.woff2' },
      'JetBrains Mono': { 400: 'jetbrains-mono-latin-400-normal.woff2' },
    },
  },
  // Sous-titres : au plus 4 mots et 20 caractères par groupe ; coupure après une ponctuation ou une pause.
  sousTitres: { motsMax: 4, carMax: 20, pause: 0.35, tenue: 0.5 },
  // Montage de la voix : ce qu'on laisse d'un silence, et la marge gardée autour d'une coupe.
  // musique : son volume sous la voix ; musiqueSeule : quand l'auteur se tait ; bruitages : multiplicateur (0 pour les couper).
  voix: { respiration: 0.14, marge: 0.05, vitesse: 1.05, volume: 1, musique: 0.16, musiqueSeule: 0.42, ambiance: 0.5, bruitages: 1 },
  // L'indicatif du compte (scripts/sons-avis.js) : A, B ou C. À fixer quand l'auteur aura choisi à l'oreille.
  indicatif: 'A',
  // L'allure du personnage récurrent (studio/avis/personnage.js) : bonnet, casquette ou boucles. À fixer quand l'auteur aura choisi.
  personnage: 'bonnet',
};
