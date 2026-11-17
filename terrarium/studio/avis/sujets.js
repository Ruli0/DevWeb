/*
 * Les sujets reconnus par le premier montage automatique (scripts/brouillon.js) : des mots-clés (écrits sans accent, en minuscules)
 * et le décor qui les illustre. Ce n'est qu'un point de départ : l'auteur ou le modèle retouche l'épisode ensuite.
 * L'ordre compte en cas d'égalité : le premier décor de la liste gagne.
 */
'use strict';
module.exports = {
  decors: [
    { decor: 'supermarche', mots: /supermarch|rayon|legume|courses|magasin|caddie|chariot/ },
    { decor: 'champ', mots: /paysan|agriculteur|cultiv|champ|recolte|planter|semer|ferme|potager/ },
    { decor: 'robot', mots: /\bia\b|intelligence artificielle|robot|machine|algorithme|chatgpt|claude|modele|entrain/ },
    { decor: 'cave', mots: /\bcode\b|coder|programm|developpe|ingenieur|ecran|ordinateur|informatique|bug/ },
    { decor: 'mur', mots: /grimp|escalade|bloc\b|prise|voie\b|chausson|reglette|pince|carre|aplat|adherence|crochet|talon/ },
    { decor: 'scene', mots: /theatre|impro|scene|micro\b|masque|public|spectacle/ },
    { decor: 'salon', mots: /salon|fenetre|thermometre|temperature|maison|piece\b|canape/ },
    { decor: 'riziere', mots: /vietnam|riziere|voyage|terrasse|buffle/ },
  ],
  // Les fonds unis, quand aucun sujet n'est reconnu : ils alternent.
  unis: ['papier', 'nuit', 'accent'],
  // Mots après lesquels le mot suivant est mis en valeur.
  appuis: /^(exactement|surtout|jamais|toujours|vraiment|seulement|uniquement|plus|moins|pire|meilleur)$/,
  // Mots trop courts ou trop vides pour être un mot fort.
  vides: /^(le|la|les|un|une|des|de|du|et|ou|mais|donc|que|qui|quoi|dans|pour|par|sur|avec|sans|est|sont|c'est|il|elle|on|tu|je|nous|vous|ils|a|au|aux|en|ce|se|ne|pas|plus|ca|cela|ces|son|sa|ses|ton|ta|tes|mon|ma|mes)$/,
};
