/*
 * Le style V3 validé (variante « Laboratoire », étape 1 du plan, 14 nov. 2026).
 * Seule source des couleurs, polices, tailles et mouvements pour les scènes. Voir production/DA-V3.md.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.style = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const couleurs = {
    fond: '#0d1117', fond2: '#121a24', texte: '#e9eef3', accent: '#7fb6d9',
    secondaire: 0.6, trait: 0.35, grille: 0.13, grain: 0.12,
  };
  // Accent par thème d'épisode : un seul par vidéo.
  const accents = {
    attention: '#7fb6d9', motivation: '#e8a23c', stress: '#e8674a', sommeil: '#8fb89a', emotions: '#b49be0',
  };
  const polices = {
    titre: 'Space Grotesk', donnees: 'Space Grotesk', mono: 'JetBrains Mono',
    fichiers: {
      'Space Grotesk': { 500: 'space-grotesk-latin-500-normal.woff2', 700: 'space-grotesk-latin-700-normal.woff2' },
      'JetBrains Mono': { 400: 'jetbrains-mono-latin-400-normal.woff2' },
    },
    dossier: 'studio/polices',
  };
  const tailles = {
    chiffre: 440, pourcent: 210, kicker: 84, phrase: 96, legende: 78, texte: 60,
    etiquette: 38, source: 28, tete: 28,
  };
  const mise = {
    largeur: 1080, hauteur: 1920, marge: 80, haut: 220, bas: 1380,
    zoneSure: { x0: 60, x1: 940, y0: 150, y1: 1440 }, grillePas: 40,
  };
  const mouvement = {
    entree: 'M0,0 C0.16,1 0.3,1 1,1',      // CustomEase « entree »
    sortie: 'power2.in',
    trace: 'power2.inOut', morph: 'power3.inOut', compteur: 'power2.out',
    dureeEntree: 0.8, decalageLignes: 0.09, dureeSortie: 0.45, decalageSortie: 0.05,
    dureeTrace: 0.9, decalageTraces: 0.035, dureeMorph: 1.1, dureeCompteur: 1.4,
    derive: 0.035,                            // zoom lent de toute la scène sur sa durée
    interdits: ['back', 'elastic', 'bounce'],
  };
  return { nom: 'laboratoire', couleurs, accents, polices, tailles, mise, mouvement };
});
