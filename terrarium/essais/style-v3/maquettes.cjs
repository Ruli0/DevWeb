// Étape 1 du plan V3 : maquettes fixes des trois variantes de style (DA-V3.md, section 9).
// Usage : NODE_PATH=$(npm root -g) node essais/style-v3/maquettes.cjs [sortie-dir]
// Produit une image 1080×1920 par variante et par scène, puis une planche.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ICI = __dirname;
const SORTIE = path.resolve(process.argv[2] || path.join(ICI, 'sortie'));
fs.mkdirSync(SORTIE, { recursive: true });
const police = (f) => 'file://' + path.join(ICI, '..', '..', 'studio', 'polices', f + '.woff2');

const VARIANTES = {
  v1: {
    nom: 'Encre et ambre',
    fond: '#14110f', fond2: '#1d1814', texte: '#f2ece1', accent: '#e8a23c',
    serif: 'Instrument Serif', sans: 'Inter Tight', mono: 'JetBrains Mono',
    serifPoids: 400, grille: false,
  },
  v2: {
    nom: 'Papier de nuit',
    fond: '#0f1a17', fond2: '#142420', texte: '#f1e9d8', accent: '#e8674a',
    serif: 'Fraunces', sans: 'Geist', mono: 'JetBrains Mono',
    serifPoids: 400, grille: false,
  },
  v3: {
    nom: 'Laboratoire',
    fond: '#0d1117', fond2: '#121a24', texte: '#e9eef3', accent: '#7fb6d9',
    serif: 'Space Grotesk', sans: 'Space Grotesk', mono: 'JetBrains Mono',
    serifPoids: 500, grille: true,
  },
};

const FONTES = `
@font-face{font-family:'Instrument Serif';src:url(${police('instrument-serif-latin-400-normal')})}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(${police('instrument-serif-latin-400-italic')})}
@font-face{font-family:'Inter Tight';font-weight:500;src:url(${police('inter-tight-latin-500-normal')})}
@font-face{font-family:'Inter Tight';font-weight:600;src:url(${police('inter-tight-latin-600-normal')})}
@font-face{font-family:'Inter Tight';font-weight:700;src:url(${police('inter-tight-latin-700-normal')})}
@font-face{font-family:'JetBrains Mono';src:url(${police('jetbrains-mono-latin-400-normal')})}
@font-face{font-family:'Fraunces';src:url(${police('fraunces-latin-400-normal')})}
@font-face{font-family:'Fraunces';font-style:italic;src:url(${police('fraunces-latin-400-italic')})}
@font-face{font-family:'Geist';font-weight:500;src:url(${police('geist-sans-latin-500-normal')})}
@font-face{font-family:'Geist';font-weight:700;src:url(${police('geist-sans-latin-700-normal')})}
@font-face{font-family:'Space Grotesk';font-weight:500;src:url(${police('space-grotesk-latin-500-normal')})}
@font-face{font-family:'Space Grotesk';font-weight:700;src:url(${police('space-grotesk-latin-700-normal')})}`;

// Cerveau de profil, face à gauche, au trait. Repère 820 × 620.
const { CERVEAU } = require('../../studio/dessins/cerveau.js');

function cerveauSVG(v, { lien = true } = {}) {
  const a = v.accent;
  return `<svg viewBox="0 0 820 620" width="900" height="680" style="overflow:visible">
    <defs>
      <radialGradient id="halo"><stop offset="0" stop-color="${a}" stop-opacity=".32"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
      <clipPath id="dans"><path d="${CERVEAU.contour}"/></clipPath>
    </defs>
    <ellipse cx="240" cy="230" rx="220" ry="190" fill="url(#halo)"/>
    <ellipse cx="${CERVEAU.amygdale.x}" cy="${CERVEAU.amygdale.y}" rx="110" ry="90" fill="url(#halo)" opacity=".7"/>
    <g fill="none" stroke="${v.texte}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CERVEAU.contour}" stroke-opacity=".7" stroke-width="2.4"/>
      <path d="${CERVEAU.cervelet}" stroke-opacity=".5" stroke-width="2"/>
      ${CERVEAU.cerveletPlis.map((d) => `<path d="${d}" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}
      <path d="${CERVEAU.tronc}" stroke-opacity=".45" stroke-width="2"/>
      <g clip-path="url(#dans)">${CERVEAU.sillons.map((d) => `<path d="${d}" stroke-opacity=".2" stroke-width="1.5"/>`).join('')}</g>
    </g>
    <radialGradient id="zone" cx="210" cy="230" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${a}" stop-opacity=".55"/><stop offset=".6" stop-color="${a}" stop-opacity=".22"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
    <path d="${CERVEAU.contour}" fill="url(#zone)"/>
    <path d="${CERVEAU.contour}" fill="none" stroke="${a}" stroke-width="2.6" stroke-dasharray="0" clip-path="url(#avant)"/>
    <clipPath id="avant"><rect x="0" y="0" width="330" height="390"/></clipPath>
    <path d="${CERVEAU.striatum}" fill="none" stroke="${v.texte}" stroke-opacity=".4" stroke-width="1.6" stroke-dasharray="5 6"/>
    <circle cx="${CERVEAU.amygdale.x}" cy="${CERVEAU.amygdale.y}" r="19" fill="${a}" fill-opacity=".9"/>
    <circle cx="${CERVEAU.amygdale.x}" cy="${CERVEAU.amygdale.y}" r="34" fill="none" stroke="${a}" stroke-opacity=".5" stroke-width="1.6"/>
    <circle cx="${CERVEAU.amygdale.x}" cy="${CERVEAU.amygdale.y}" r="52" fill="none" stroke="${a}" stroke-opacity=".22" stroke-width="1.4"/>
    ${lien ? `<path d="M338 398 C306 360 286 330 262 284" fill="none" stroke="${a}" stroke-width="2.2" stroke-dasharray="2 10" stroke-linecap="round"/>
    <circle cx="292" cy="338" r="7" fill="${a}"/>` : ''}
  </svg>`;
}

function grain(op) {
  return `<svg class="grain" width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="${op}"/></svg>`;
}

const ECH = 900 / 820;
const E = (n) => Math.round(n * ECH);

function page(v, scene) {
  const it = v.serif === 'Space Grotesk' ? 'normal' : 'italic';
  const motCle = (t) => `<em style="font-style:${it};color:${v.accent}">${t}</em>`;
  const tete = `<div class="tete"><span>CERVEAU · 45 s</span><span>N° 01 — PROCRASTINATION</span></div>`;
  const pied = (s) => `<div class="source">${s}</div>`;
  let corps = '';
  if (scene === 'chiffre') {
    corps = `
      <div class="bloc">
        <div class="kicker">jusqu’à</div>
        <div class="chiffre">95<span class="pc">%</span></div>
        <div class="filet"></div>
        <p class="legende">des étudiants disent ${motCle('repousser')} des tâches importantes.</p>
        ${pied('Steel, 2007 · Psychological Bulletin')}
      </div>`;
  } else {
    corps = `
      <p class="phrase">Ce n’est pas de la paresse. C’est une ${motCle('alarme')}.</p>
      <div class="schema">${cerveauSVG(v)}
        <div class="etiq" style="left:${E(190)}px;top:-92px"><b>Cortex préfrontal</b><span>le frein</span></div>
        <div class="etiq" style="left:${E(336)}px;top:${E(524)}px"><b>Amygdale</b><span>l’alarme</span></div>
        <svg class="renvoi" width="900" height="760" style="overflow:visible">
          <path d="M${E(CERVEAU.amygdale.x)} ${E(518)} L${E(CERVEAU.amygdale.x)} ${E(CERVEAU.amygdale.y) + 58}" fill="none" stroke="${v.texte}" stroke-opacity=".45" stroke-width="1.5"/>
          <path d="M${E(184)} -82 L${E(184)} ${E(150)}" fill="none" stroke="${v.texte}" stroke-opacity=".45" stroke-width="1.5"/>
        </svg>
      </div>
      <div style="position:absolute;top:1388px">${pied('schéma simplifié')}</div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTES}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1920px;overflow:hidden;color:${v.texte};font-family:'${v.sans}';
    background:radial-gradient(120% 80% at 30% 35%, ${v.fond2}, ${v.fond} 70%)}
  ${v.grille ? `body::before{content:'';position:absolute;inset:0;background-image:radial-gradient(${v.texte}22 1.6px, transparent 1.8px);background-size:40px 40px}` : ''}
  .grain{position:absolute;inset:0;mix-blend-mode:overlay;pointer-events:none}
  .cadre{position:absolute;left:80px;right:80px;top:0;bottom:0}
  .tete{position:absolute;top:170px;left:0;right:0;display:flex;justify-content:space-between;font:400 28px '${v.mono}';letter-spacing:.06em;opacity:.55}
  .bloc{position:absolute;top:470px;left:0;right:0;display:flex;flex-direction:column}
  .kicker{font:${v.serifPoids} ${it === 'italic' ? 'italic' : ''} 84px/1 '${v.serif}';opacity:.8}
  .chiffre{margin:10px 0 0 -14px;font:700 440px/.86 '${v.sans}';letter-spacing:-.05em}
  .chiffre .pc{font-size:210px;color:${v.accent};margin-left:10px;letter-spacing:0;vertical-align:.9em}
  .filet{margin:70px 0 44px;width:180px;height:3px;background:${v.accent}}
  .legende{width:880px;font:${v.serifPoids} ${v.grille ? 78 : 92}px/1.05 '${v.serif}';letter-spacing:-.01em;margin-bottom:56px}
  .phrase{position:absolute;top:270px;width:900px;font:${v.serifPoids} 96px/1.04 '${v.serif}';letter-spacing:-.015em}
  .schema{position:absolute;top:668px;left:-30px;width:900px;height:640px}
  .schema>svg:first-child{position:absolute;left:0;top:0}
  .renvoi{position:absolute;left:0;top:0}
  .etiq{position:absolute;display:flex;flex-direction:column;gap:6px}
  .etiq b{font:600 38px '${v.sans}';color:${v.accent}}
  .etiq span{font:400 28px '${v.mono}';opacity:.6}
  .etiq span{white-space:nowrap}
  .sous{position:absolute;top:1306px;width:900px;font:500 54px/1.2 '${v.sans}';opacity:.88}
  .source{font:400 28px '${v.mono}';opacity:.6;letter-spacing:.02em;white-space:nowrap}
  .source::before{content:'';display:inline-block;width:28px;height:2px;background:currentColor;vertical-align:middle;margin-right:14px}
  .marque{position:absolute;bottom:60px;left:80px;font:400 26px '${v.mono}';opacity:.3}
  </style></head><body>${grain(0.12)}<div class="cadre">${tete}${corps}</div>
  <div class="marque">maquette ${v.nom.toLowerCase()} — chiffre à vérifier</div></body></html>`;
}

module.exports = { VARIANTES, FONTES, CERVEAU, grain };
if (require.main === module) (async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  const images = [];
  for (const scene of ['chiffre', 'cerveau']) {
    for (const [id, v] of Object.entries(VARIANTES)) {
      const html = path.join(SORTIE, `${id}-${scene}.html`);
      fs.writeFileSync(html, page(v, scene));
      await p.goto('file://' + html);
      await p.evaluate(() => document.fonts.ready.then(() => true));
      const png = path.join(SORTIE, `${id}-${scene}.png`);
      await p.screenshot({ path: png });
      images.push(png);
    }
  }
  await nav.close();
  // Planche : 3 colonnes (variantes) × 2 lignes (scènes), réduites de moitié.
  const entrees = images.flatMap((f) => ['-i', f]);
  const filtres = images.map((_, i) => `[${i}]scale=540:960[s${i}]`).join(';');
  const disp = '0_0|540_0|1080_0|0_960|540_960|1080_960';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entrees, '-filter_complex',
    `${filtres};${images.map((_, i) => `[s${i}]`).join('')}xstack=inputs=6:layout=${disp}`,
    path.join(SORTIE, 'planche.png')]);
  console.log(path.join(SORTIE, 'planche.png'));
})();
