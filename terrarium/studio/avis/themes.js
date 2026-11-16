/*
 * Les styles (« thèmes ») de la chaîne « avis » : une couche posée sur le même contenu, pour donner au compte un style reconnaissable.
 * Un thème : description, polices (fichiers de studio/polices/), css(f, c) ajouté après le style de base,
 * mot(f, c) : l'aspect d'un mot de sous-titre quand il est dit (« actif »), après (« dit ») et avant (« pale »),
 * filtre (facultatif) : un filtre SVG ajouté à la page.
 * Sans "theme" dans l'épisode : « decoupe », le style du compte. Les autres restent disponibles ("theme": "neon"…).
 */
'use strict';
const police = (famille, fichier, poids = 400) => `@font-face{font-family:'${famille}';font-weight:${poids};src:url(assets/polices/${fichier}) format('woff2');font-display:block}`;

module.exports = {
  base: {
    description: 'Le style d’origine : étiquette sombre, mot en cours dans une pastille de la couleur de la rubrique.',
    polices: [],
    css: () => '',
    mot: (f, c) => ({ pale: 0.4, actif: { backgroundColor: f.accent, color: c.fond }, dit: { backgroundColor: 'rgba(0,0,0,0)', color: c.texte }, fort: f.accent }),
  },
  // LE STYLE DU COMPTE, choisi par l'auteur le 16 nov. 2026 (« le papier découpé mais avec des couleurs plus vives comme le néon »).
  // Papier découpé : cadre crème, calques avec une ombre nette, étiquettes de papier posées de travers.
  decoupe: {
    description: 'Papier découpé : cadre crème autour de l’image, calques du décor avec une ombre nette, sous-titres sur une étiquette de papier un peu de travers.',
    polices: ['bricolage-grotesque-latin-800-normal.woff2'],
    css: (f, c) => `${police('Bricolage Grotesque', 'bricolage-grotesque-latin-800-normal.woff2', 800)}
#root::after { content: ''; position: absolute; inset: 0; border: 26px solid ${c.texte}; z-index: 97; pointer-events: none; box-shadow: inset 0 0 0 3px ${c.fond}22, inset 0 0 90px #00000055; }
.decor-svg, .photo-img { filter: saturate(1.4) contrast(1.12); }
.decor-3d { filter: saturate(1.15) contrast(1.06); }
.decor-3d.ascii { filter: none; }
.decor-svg .milieu, .decor-svg .pres { filter: drop-shadow(0 16px 0 #00000040); }
.illu { filter: drop-shadow(8px 10px 0 #00000030); }
.grand, .moyen { font-family: 'Bricolage Grotesque'; font-weight: 800; letter-spacing: -.035em; }
.question p { font-family: 'Bricolage Grotesque'; font-weight: 800; }
.st div { background: ${c.texte}; color: ${c.fond}; border: 0; border-radius: 10px; box-shadow: 9px 9px 0 ${c.fond}; font-family: 'Bricolage Grotesque'; font-weight: 800; padding: 14px 20px 18px; }
.st:nth-child(odd) div { transform: rotate(-1.6deg); } .st:nth-child(even) div { transform: rotate(1.4deg); }
.st span { border-radius: 8px; }`,
    mot: (f, c) => ({ pale: 0.32, actif: { backgroundColor: f.accent, color: c.fond }, dit: { backgroundColor: 'rgba(0,0,0,0)', color: c.fond }, fort: c.fond }),
  },
  // Néon : image plus sombre et plus contrastée, grosses capitales sans étiquette, cernées de noir, le mot en cours s'allume.
  neon: {
    description: 'Néon : image assombrie et contrastée, lignes d’écran, grosses capitales cernées de noir sans étiquette ; le mot en cours s’allume dans la couleur de la rubrique.',
    polices: ['anton-latin-400-normal.woff2'],
    css: (f, c) => `${police('Anton', 'anton-latin-400-normal.woff2')}
.decor-svg, .photo-img { filter: saturate(1.35) contrast(1.18) brightness(.72); }
.plan::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(to bottom, #ffffff08 0 2px, transparent 2px 6px), radial-gradient(120% 80% at 50% 45%, transparent 55%, #000000b0 100%); }
.grand, .moyen { font-family: 'Anton'; font-weight: 400; text-transform: uppercase; letter-spacing: .005em; line-height: 1.06; text-shadow: 0 0 34px ${f.accent}aa; }
.grand { font-size: 124px; } .grand.geant { font-size: 190px; }
em { font: inherit; color: var(--ac); }
.tete b { background: transparent; border: 2px solid ${f.accent}; color: ${f.accent}; box-shadow: 0 0 22px ${f.accent}88; }
.st div { background: transparent; border: 0; box-shadow: none; padding: 0; font: 400 118px/1.02 'Anton'; text-transform: uppercase; letter-spacing: .01em; color: #fff; -webkit-text-stroke: 14px ${c.fond}; paint-order: stroke fill; }
.st span { padding: 0 .1em; margin: 0; }`,
    mot: (f) => ({ pale: 0.55, actif: { color: f.accent, textShadow: `0 0 36px ${f.accent}` }, dit: { color: '#ffffff', textShadow: '0 0 0px rgba(0,0,0,0)' }, fort: f.accent }),
  },
  // Feutre : tout le dessin tremble comme un trait fait à la main, écriture au feutre, surligneur jaune.
  feutre: {
    description: 'Carnet au feutre : les contours tremblent comme un dessin à la main, écriture au pinceau, mot en cours passé au surligneur jaune.',
    polices: ['caveat-brush-latin-400-normal.woff2'],
    filtre: '<svg width="0" height="0" style="position:absolute"><filter id="tremble" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="4" result="b"/><feDisplacementMap in="SourceGraphic" in2="b" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></svg>',
    css: (f, c) => `${police('Caveat Brush', 'caveat-brush-latin-400-normal.woff2')}
.decor-svg, .illu { filter: url(#tremble) saturate(.88); }
.plan::after { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(#ffffff0d 2px, transparent 2px); background-size: 100% 64px; }
.grand, .moyen { font-family: 'Caveat Brush'; font-weight: 400; letter-spacing: 0; line-height: 1; }
.grand { font-size: 136px; } .grand.geant { font-size: 210px; }
em { font: inherit; color: var(--ac); }
.tete b { font-family: 'Caveat Brush'; font-size: 38px; letter-spacing: .02em; text-transform: none; background: ${c.texte}; color: ${c.fond}; transform: rotate(-2deg); }
.st div { background: ${c.texte}; color: ${c.fond}; border: 0; border-radius: 6px; box-shadow: 0 10px 0 #00000033; font: 400 96px/1 'Caveat Brush'; letter-spacing: 0; padding: 14px 26px 20px; }
.st:nth-child(odd) div { transform: rotate(-1.2deg); } .st:nth-child(even) div { transform: rotate(1deg); }
.st span { border-radius: 4px; padding: 0 .12em 4px; }`,
    mot: (f, c) => ({ pale: 0.3, actif: { backgroundColor: '#ffe45c', color: c.fond }, dit: { backgroundColor: 'rgba(0,0,0,0)', color: c.fond }, fort: c.fond }),
  },
  // Affiche : deux encres (une encre sombre et le papier), trame de points, capitales en blocs.
  affiche: {
    description: 'Affiche en deux encres : le décor passe en une seule encre sombre sur papier crème, avec une trame de points ; sous-titres en capitales, un bloc par mot.',
    polices: ['anton-latin-400-normal.woff2'],
    css: (f, c) => `${police('Anton', 'anton-latin-400-normal.woff2')}
.decor-svg, .photo-img { filter: grayscale(1) contrast(1.5) brightness(1.15); }
.deco { isolation: isolate; } .contenu { z-index: 5; }
.decor .deco::before, .photo .deco::before { content: ''; position: absolute; inset: 0; z-index: 2; background: #1c2260; mix-blend-mode: screen; }
.decor .deco::after, .photo .deco::after { content: ''; position: absolute; inset: 0; z-index: 3; background: radial-gradient(#00000033 1.6px, transparent 2px) 0 0 / 9px 9px, ${c.texte}; mix-blend-mode: multiply; }
.voile { z-index: 4; background: linear-gradient(to bottom, #1c2260e6 0, #1c2260b0 620px, #1c226000 980px); }
.grand, .moyen { font-family: 'Anton'; font-weight: 400; text-transform: uppercase; letter-spacing: .005em; line-height: 1.08; }
.grand { font-size: 124px; } .grand.geant { font-size: 190px; }
em { font: inherit; color: var(--ac); }
.plan.decor, .plan.photo { --ac: ${f.accent}; }
.tete b { background: ${f.accent}; color: ${c.fond}; border-radius: 0; }
.tete b::before { background: ${c.fond}; }
.st div { background: transparent; border: 0; box-shadow: none; padding: 0; font: 400 96px/1.2 'Anton'; text-transform: uppercase; letter-spacing: .02em; }
.st span { background: ${c.fond}; color: ${c.texte}; border-radius: 0; padding: 4px .18em 8px; margin: 0 5px; }`,
    mot: (f, c) => ({ pale: 0.5, actif: { backgroundColor: f.accent, color: c.fond }, dit: { backgroundColor: c.fond, color: c.texte }, fort: f.accent }),
  },
};
