/*
 * Les palettes de la chaîne « avis » : le jeu de couleurs de toute la vidéo, au choix de l'épisode ("palette") ou de la ligne
 * de commande (--palette=). Une palette donne :
 *   couleurs    le fond sombre et le texte clair (fonds unis, étiquettes de sous-titres, illustrations) ;
 *   accents     la couleur d'accent de chaque rubrique ;
 *   etalonnage  un filtre posé sur toute la couche image (décors, photo, hibou, dessins) pour que les décors dessinés en dur
 *               prennent la gamme de la palette : une chaîne de filtre CSS, ou { echelle: [trois couleurs] } pour repeindre
 *               toute l'image en trois teintes (filtre SVG défini une fois dans la page).
 * Les sous-titres, la question de fin et le texte des plans ne sont pas filtrés : ils gardent les couleurs exactes de la palette.
 * « vive » est la palette d'origine (celle de style.js) : sans palette demandée, la sortie est identique à avant.
 */
'use strict';
const S = require('./style.js');

const PALETTES = {
  vive: {
    nom: 'Vive', description: 'La palette d’origine : fond presque noir, couleurs franches.',
    couleurs: { fond: S.couleurs.fond, texte: S.couleurs.texte },
    accents: Object.fromEntries(Object.entries(S.rubriques).map(([k, v]) => [k, v.accent])),
    etalonnage: null,
  },
  pastel: {
    nom: 'Pastel', description: 'Douce et claire : couleurs lavées, fond aubergine.',
    couleurs: { fond: '#1f1b2e', texte: '#fff7ef' },
    accents: { travail: '#8fb5ff', escalade: '#ffb38a', relations: '#ff9fb5', enigme: '#c7b3ff', voyage: '#8fdcbc' },
    etalonnage: 'saturate(.55) brightness(1.14) contrast(.9)',
  },
  coucher: {
    nom: 'Coucher de soleil', description: 'Chaude : orange, rose, violet, jaune.',
    couleurs: { fond: '#1a0f14', texte: '#fff0dc' },
    accents: { travail: '#ff9a5c', escalade: '#ffb03b', relations: '#ff5d7a', enigme: '#c46bff', voyage: '#ffd45c' },
    etalonnage: 'sepia(.45) hue-rotate(-16deg) saturate(1.4)',
  },
  ocean: {
    nom: 'Océan', description: 'Froide : turquoise, bleu profond, vert d’eau.',
    couleurs: { fond: '#07151f', texte: '#eaf6f7' },
    accents: { travail: '#4fc3f7', escalade: '#5ee0d0', relations: '#7fb2ff', enigme: '#9d8cff', voyage: '#4fe0b0' },
    etalonnage: 'hue-rotate(22deg) saturate(1.05) brightness(.97)',
  },
  retro: {
    nom: 'Rétro années 70', description: 'Moutarde, brique, olive, un peu de sépia.',
    couleurs: { fond: '#1d1810', texte: '#f6ead0' },
    accents: { travail: '#d98b2b', escalade: '#c4572a', relations: '#c0584a', enigme: '#a8924a', voyage: '#8fb050' },
    etalonnage: 'sepia(.65) saturate(1.25) hue-rotate(-8deg) contrast(1.08)',
  },
  cobalt: {
    nom: 'Cobalt, deux encres', description: 'Façon risographie : tout l’image repeinte en bleu cobalt, orange vif et crème.',
    couleurs: { fond: '#0b1a63', texte: '#fff0d2' },
    accents: { travail: '#ff5a36', escalade: '#ffb02e', relations: '#ff7aa0', enigme: '#9fc0ff', voyage: '#5ee0c8' },
    etalonnage: { echelle: ['#0b1a63', '#ff5a36', '#fff0d2'] },
  },
};

// Le filtre SVG d'une échelle de couleurs : l'image passe en niveaux de gris, puis chaque niveau reçoit une couleur de l'échelle.
function filtreEchelle(echelle) {
  const canal = (i) => echelle.map((h) => (parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16) / 255).toFixed(3)).join(' ');
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="etalonnage" color-interpolation-filters="sRGB">'
    + '<feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"/>'
    + `<feComponentTransfer><feFuncR type="table" tableValues="${canal(0)}"/><feFuncG type="table" tableValues="${canal(1)}"/><feFuncB type="table" tableValues="${canal(2)}"/></feComponentTransfer>`
    + '</filter></svg>';
}
// La règle CSS de l'étalonnage (vide pour la palette d'origine).
// Elle s'applique aussi aux dessins (.illu), dont certaines couleurs sont écrites en dur.
const regle = (p) => (!p.etalonnage ? '' : `.deco, .illu { filter: ${typeof p.etalonnage === 'string' ? p.etalonnage : 'url(#etalonnage)'}; }`);

// Rapport de contraste (WCAG) entre deux couleurs « #rrggbb » : 1 (aucun) à 21 (noir sur blanc).
function contraste(a, b) {
  const lum = (h) => { const [r, g, v] = [0, 1, 2].map((i) => { const x = parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16) / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * v; };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

module.exports = { PALETTES, filtreEchelle, regle, contraste };
