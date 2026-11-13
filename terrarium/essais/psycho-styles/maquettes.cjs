// Maquettes de style pour la série « psycho en métaphores » (épisode « la peur du jugement »).
// 4 styles × 2 moments, en images fixes : node essais/psycho-styles/maquettes.cjs
//   (NODE_PATH=$(npm root -g) pour Playwright). Sortie : essais/psycho-styles/planche.png
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');
const DEPOT = path.join(__dirname, '../..');
const { G } = require(path.join(DEPOT, 'essais/direction-artistique/vecteur.cjs'));
const gardien = require(path.join(DEPOT, 'public/js/art/gardien.js'));
const branche = require(path.join(DEPOT, 'studio/decors/branche.js'));

// --- La mise en place, commune aux quatre styles (coordonnées d'écran 1080 × 1920) ---
const CAM = { x: 480, y: 940, s: 2 };
const OEIL = [CAM.x + 112 * CAM.s, CAM.y - 72 * CAM.s];
const CENTRE_CAM = [CAM.x + 30 * CAM.s, CAM.y - 60 * CAM.s];
const MOUCHE = [870, 700];
const GRENOUILLE = { x: 175, y: 1235, s: 1.55 };
const LUCIOLES = [[130, 720], [235, 650], [335, 735]];
const vers = (de, a, d) => { const ang = Math.atan2(a[1] - de[1], a[0] - de[0]); return [+(d * Math.cos(ang)).toFixed(1), +(d * Math.sin(ang)).toFixed(1)]; };

const recolorer = (s, m) => Object.entries(m).reduce((a, [de, v]) => a.split(de).join(v), s);

// --- Les personnages, paramétrés par un style ---
function cameleon(st, m) {
  const c = st.cam; const [ox, oy] = G.oeil;
  const p = vers(OEIL, m === 'imaginer' ? [OEIL[0] + 200, OEIL[1] + 300] : MOUCHE, 7);
  const cache = m === 'penser';
  const membres = (coul, larg, extra = '') => `<path d="${G.queue}" stroke="${coul}" stroke-width="${larg + 3}" fill="none" stroke-linecap="round" ${extra}/>
    <path d="${G.patteAv}" stroke="${coul}" stroke-width="${larg}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>
    <path d="${G.patteAr}" stroke="${coul}" stroke-width="${larg}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  return `<g transform="translate(${CAM.x} ${CAM.y}) scale(${CAM.s})" ${c.filtre ? `filter="url(#${c.filtre})"` : ''} opacity="${cache ? 0.22 : 1}">
    ${c.lueur && !cache ? `<g filter="url(#lueur-forte)" opacity="0.9">${membres(c.lueur, 16)}<path d="${G.corps}" fill="none" stroke="${c.lueur}" stroke-width="5"/></g>` : ''}
    ${membres(c.membres, 11)}
    <path d="${G.corps}" fill="${c.corps}" ${c.bord ? `stroke="${c.bord}" stroke-width="${c.bordL || 1.6}"` : ''}/>
    ${c.dos ? `<path d="M -80 -22 C -92 -72 -42 -112 18 -108 C 50 -106 66 -98 78 -104 L 100 -134 L 96 -120 C 70 -90 20 -96 -20 -92 C -60 -86 -80 -60 -80 -22 Z" fill="${c.dos}"/>` : ''}
    <path d="${G.ventre}" fill="${c.ventre}"/>
    ${G.taches.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.taches}" ${c.lueur ? 'filter="url(#lueur)"' : ''}/>`).join('')}
    ${c.joue ? `<ellipse cx="128" cy="-44" rx="13" ry="8" fill="${c.joue}" opacity="0.8"/>` : ''}
    <path d="${G.bouche}" stroke="${c.trait}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="${ox}" cy="${oy}" r="24" fill="${c.oeilFond}" ${c.bord ? `stroke="${c.bord}" stroke-width="${c.bordL || 1.6}"` : ''}/>
    <circle cx="${ox}" cy="${oy}" r="16" fill="${c.sclere}" ${c.lueur ? 'filter="url(#lueur)"' : ''}/>
    <circle cx="${ox + p[0]}" cy="${oy + p[1]}" r="8" fill="${c.pupille}"/><circle cx="${ox + p[0] + 2.5}" cy="${oy + p[1] - 2.5}" r="2.4" fill="#fff"/>
    ${m === 'imaginer' && c.sueur ? `<path d="M138 -118 q6 10 0 16 q-6 -6 0 -16Z M150 -100 q5 8 0 13 q-5 -5 0 -13Z" fill="${c.sueur}" stroke="${c.bord || 'none'}" stroke-width="1.2"/>` : ''}
    ${c.attaches ? [[52, -20], [-40, -18], [-78, -26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#d9b45a" stroke="#7a5a1e" stroke-width="1.2"/>`).join('') : ''}
  </g>`;
}
function grenouille(st, m) {
  const g = st.gr; const S = GRENOUILLE.s;
  const cible = m === 'imaginer' ? CENTRE_CAM : [GRENOUILLE.x + 120, GRENOUILLE.y - 420];
  const oeil = (dx) => {
    const centre = [GRENOUILLE.x + dx * S, GRENOUILLE.y - 92 * S];
    const p = vers(centre, cible, m === 'imaginer' ? 9 : 7);
    const r = m === 'imaginer' ? 21 : 17;
    return `<circle cx="${dx}" cy="-92" r="25" fill="${g.corps}" ${g.bord ? `stroke="${g.bord}" stroke-width="${g.bordL || 1.6}"` : ''}/>
      <circle cx="${dx}" cy="-92" r="${r}" fill="${m === 'imaginer' && g.fixe ? g.fixe : g.sclere}" ${g.lueur ? 'filter="url(#lueur)"' : ''}/>
      <circle cx="${dx + p[0]}" cy="${-92 + p[1]}" r="${m === 'imaginer' ? 6 : 9}" fill="${g.pupille}"/>`;
  };
  return `<g transform="translate(${GRENOUILLE.x} ${GRENOUILLE.y}) scale(${S})" ${g.filtre ? `filter="url(#${g.filtre})"` : ''}>
    ${g.lueur ? `<ellipse cx="0" cy="-48" rx="74" ry="52" fill="none" stroke="${g.lueur}" stroke-width="5" filter="url(#lueur-forte)"/>` : ''}
    <ellipse cx="-56" cy="-14" rx="32" ry="18" fill="${g.pattes}"/><ellipse cx="56" cy="-14" rx="32" ry="18" fill="${g.pattes}"/>
    <ellipse cx="0" cy="-48" rx="70" ry="50" fill="${g.corps}" ${g.bord ? `stroke="${g.bord}" stroke-width="${g.bordL || 1.6}"` : ''}/>
    <ellipse cx="0" cy="-28" rx="40" ry="22" fill="${g.gorge}"/>
    ${g.taches ? `<circle cx="-34" cy="-68" r="7" fill="${g.taches}" ${g.lueur ? 'filter="url(#lueur)"' : ''}/><circle cx="30" cy="-74" r="6" fill="${g.taches}" ${g.lueur ? 'filter="url(#lueur)"' : ''}/><circle cx="-8" cy="-80" r="5" fill="${g.taches}" ${g.lueur ? 'filter="url(#lueur)"' : ''}/>` : ''}
    <path d="M-40 -52 Q0 -30 40 -52" stroke="${g.trait}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${g.joue ? `<ellipse cx="-44" cy="-44" rx="10" ry="6" fill="${g.joue}"/><ellipse cx="44" cy="-44" rx="10" ry="6" fill="${g.joue}"/>` : ''}
    <ellipse cx="-22" cy="-3" rx="16" ry="7" fill="${g.pattes}"/><ellipse cx="22" cy="-3" rx="16" ry="7" fill="${g.pattes}"/>
    ${oeil(-28)}${oeil(28)}
  </g>`;
}
function lucioles(st, m) {
  const l = st.lu;
  return LUCIOLES.map(([x, y], i) => {
    const p = vers([x, y], m === 'imaginer' ? CENTRE_CAM : [x + (i - 1) * 40, y - 200], m === 'imaginer' ? 3 : 2.4);
    const e = m === 'imaginer' ? 6.5 : 5;
    return `<g transform="translate(${x} ${y}) scale(2.3)" ${l.filtre ? `filter="url(#${l.filtre})"` : ''}>
      <ellipse cx="-9" cy="-12" rx="8" ry="11" fill="${l.aile}" opacity="0.7" transform="rotate(-25 -9 -12)"/><ellipse cx="9" cy="-12" rx="8" ry="11" fill="${l.aile}" opacity="0.7" transform="rotate(25 9 -12)"/>
      <circle cy="11" r="11" fill="${l.lumiere}" ${l.lueur ? 'filter="url(#lueur)"' : ''}/>
      <circle r="10" fill="${l.corps}" ${l.bord ? `stroke="${l.bord}" stroke-width="1.2"` : ''}/>
      <circle cx="-4" cy="-2" r="${e}" fill="#fff"/><circle cx="4" cy="-2" r="${e}" fill="#fff"/>
      <circle cx="${-4 + p[0]}" cy="${-2 + p[1]}" r="2.4" fill="#111"/><circle cx="${4 + p[0]}" cy="${-2 + p[1]}" r="2.4" fill="#111"/>
    </g>`;
  }).join('');
}
function mouche(st) {
  const f = st.mo;
  return `<g transform="translate(${MOUCHE[0]} ${MOUCHE[1]})">
    ${f.fil ? `<line x1="0" y1="-30" x2="0" y2="-1200" stroke="${f.fil}" stroke-width="2.6" opacity="0.75"/>` : ''}
    <g transform="scale(2.1)" ${f.filtre ? `filter="url(#${f.filtre})"` : ''}>
      ${f.halo ? '<circle r="30" fill="url(#halo-mouche)"/>' : ''}
      <ellipse cx="-11" cy="-13" rx="9" ry="13" fill="${f.aile}" opacity="0.7" transform="rotate(-25 -11 -13)"/><ellipse cx="11" cy="-13" rx="9" ry="13" fill="${f.aile}" opacity="0.7" transform="rotate(25 11 -13)"/>
      <circle r="13" fill="${f.corps}" ${f.halo ? 'filter="url(#lueur)"' : ''} ${f.bord ? `stroke="${f.bord}" stroke-width="1.4"` : ''}/>
      <circle cx="-5.5" cy="-3" r="6" fill="#fff"/><circle cx="5.5" cy="-3" r="6" fill="#fff"/>
      <circle cx="-4" cy="-2" r="2.8" fill="#111"/><circle cx="7" cy="-2" r="2.8" fill="#111"/>
      <path d="M-3.5 5 q3.5 3 7 0" stroke="#111" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </g></g>`;
}
function mousse(st, m) {
  let s = recolorer(gardien.mousse(), st.mousse);
  if (m === 'imaginer') s = s.replace(/<g id="oeil-neutre">/, '<g id="oeil-neutre" opacity="0">').replace(/<g id="oeil-surpris" opacity="0">/, '<g id="oeil-surpris">');
  return `<g ${st.mousseFiltre ? `filter="url(#${st.mousseFiltre})"` : ''}>${s}</g>`;
}
// La bulle de pensée de la grenouille (moment 2), avec une mouche dedans.
function pensee(st) {
  const p = st.pensee;
  const [bx, by] = [360, 960];
  return `<g ${p.filtre ? `filter="url(#${p.filtre})"` : ''}>
    <circle cx="215" cy="1085" r="11" fill="${p.fond}" stroke="${p.bord}" stroke-width="${p.bordL}"/><circle cx="262" cy="1040" r="17" fill="${p.fond}" stroke="${p.bord}" stroke-width="${p.bordL}"/>
    <path d="M${bx - 130} ${by} C${bx - 150} ${by - 70} ${bx - 70} ${by - 110} ${bx - 20} ${by - 90} C${bx + 10} ${by - 140} ${bx + 110} ${by - 130} ${bx + 120} ${by - 70} C${bx + 180} ${by - 60} ${bx + 170} ${by + 30} ${bx + 120} ${by + 40} C${bx + 110} ${by + 90} ${bx + 20} ${by + 90} ${bx - 10} ${by + 60} C${bx - 60} ${by + 90} ${bx - 140} ${by + 70} ${bx - 130} ${by} Z" fill="${p.fond}" stroke="${p.bord}" stroke-width="${p.bordL}" ${p.lueur ? 'filter="url(#lueur)"' : ''}/>
    <g transform="translate(${bx} ${by - 20}) scale(2.4)">
      <ellipse cx="-11" cy="-13" rx="9" ry="13" fill="${p.aile}" opacity="0.8" transform="rotate(-25 -11 -13)"/><ellipse cx="11" cy="-13" rx="9" ry="13" fill="${p.aile}" opacity="0.8" transform="rotate(25 11 -13)"/>
      <circle r="13" fill="${p.mouche}"/><circle cx="-5.5" cy="-3" r="6" fill="#fff"/><circle cx="5.5" cy="-3" r="6" fill="#fff"/><circle cx="-4" cy="-2" r="2.8" fill="#111"/><circle cx="7" cy="-2" r="2.8" fill="#111"/>
    </g>
    <path d="M${bx + 60} ${by + 10} l12 -12 m-6 22 l16 -4" stroke="${p.coeur}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${bx + 92} ${by - 52} c0 -10 14 -10 14 0 c0 -10 14 -10 14 0 c0 12 -14 18 -14 22 c0 -4 -14 -10 -14 -22Z" fill="${p.coeur}"/>
  </g>`;
}

// --- Les quatre styles ---
const FILTRES = `
  <filter id="lueur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="lueur-forte" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="ombre-douce" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2a1f5c" flood-opacity="0.35"/></filter>
  <filter id="encre" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="m"/><feFlood flood-color="#111"/><feComposite in2="m" operator="in" result="trait"/><feMerge><feMergeNode in="trait"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="encre-fine" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.5" result="m"/><feFlood flood-color="#111"/><feComposite in2="m" operator="in" result="trait"/><feMerge><feMergeNode in="trait"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="papier" x="-15%" y="-15%" width="135%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="9" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feDropShadow in="d" dx="7" dy="11" stdDeviation="6" flood-color="#2a1a10" flood-opacity="0.5"/></filter>
  <filter id="fibre"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 0.98  0 0 0 0 0.92  0 0 0 0 0.8  0 0 0 0.7 0"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/></filter>
  <radialGradient id="halo-mouche"><stop offset="0" stop-color="#eaff7a" stop-opacity="0.55"/><stop offset="1" stop-color="#eaff7a" stop-opacity="0"/></radialGradient>
  <pattern id="trame" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="8" cy="8" r="3.2" fill="#000" opacity="0.28"/></pattern>`;

const deco = branche.dessin();
const STYLES = {
  s1: {
    nom: 'S1 · Ombres lumineuses',
    defs: deco.defs + '<radialGradient id="spot" cx="590" cy="880" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.45"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient><radialGradient id="vignette" cx="540" cy="880" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient>',
    fond: deco.fond + deco.calques.map((c) => c.svg).join('') + `<path d="M-60 1330 C 60 1250 220 1240 330 1270 C 240 1300 120 1320 -60 1380 Z" fill="#03080d" stroke="#5fbf9a" stroke-width="2" opacity="0.95"/>`,
    cam: { corps: '#050b12', membres: '#050b12', ventre: '#0d2a1a', taches: '#b6ff5c', bord: '#c9ff8a', lueur: '#8dff6a', oeilFond: '#050b12', sclere: '#eafff0', pupille: '#050b12', trait: '#2c5a3c', sueur: '#9af8ff' },
    gr: { corps: '#050b12', pattes: '#050b12', gorge: '#0d2a1a', bord: '#9af8ff', lueur: '#5ef2ff', sclere: '#eafff0', fixe: '#ff6fb5', pupille: '#050b12', trait: '#2c6a7a', taches: '#9af8ff' },
    lu: { corps: '#050b12', lumiere: '#eaff7a', aile: '#d8f6ff', lueur: true, bord: '#c9ff8a' },
    mo: { corps: '#f6ff7a', aile: '#d8f6ff', halo: true, fil: '#e9ffd8' },
    mousse: { '#2a3550': '#0b1424', '#151c2e': '#04080f', '#3fa34d': '#163d28', '#3b2a24': '#06070a', '#0a1020': '#02050a' },
    pensee: { fond: '#030a08', bord: '#b6ff5c', bordL: 4, lueur: true, mouche: '#f6ff7a', aile: '#d8f6ff', coeur: '#ff6fb5' },
    imaginer: '<rect width="1080" height="1920" fill="#000" opacity="0.55"/><polygon points="430,0 650,0 900,1080 300,1080" fill="url(#spot)"/><rect width="1080" height="1920" fill="url(#spot)"/>',
    apres: '<rect width="1080" height="1920" fill="url(#vignette)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.06"/>',
    police: 'Baloo+2:wght@800',
    css: `.texte { font: 800 100px/0.98 "Baloo 2"; color: #fbfff6; -webkit-text-stroke: 6px #0a3a16; paint-order: stroke fill; text-shadow: 0 0 8px #b6ff5c, 0 0 26px #8dff6a, 0 0 60px rgba(141,255,106,.8); display: inline-block; padding: 22px 40px 30px; border-radius: 48px; background: rgba(2,6,10,.72); box-shadow: 0 0 40px 30px rgba(2,6,10,.55); }
      .texte b { display: block; font-size: 150px; line-height: .95; color: #fbfeff; -webkit-text-stroke: 6px #063040; text-shadow: 0 0 8px #9af8ff, 0 0 26px #5ef2ff, 0 0 60px rgba(94,242,255,.85); }`,
  },
  s2: {
    nom: 'S2 · Doux et pastel',
    defs: '<linearGradient id="ciel2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d3b86"/><stop offset="0.55" stop-color="#7d73c4"/><stop offset="1" stop-color="#e9a9c4"/></linearGradient><radialGradient id="lune2" cx="820" cy="380" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff4d6" stop-opacity="0.9"/><stop offset="0.3" stop-color="#fff4d6" stop-opacity="0.35"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient><radialGradient id="spot2" cx="590" cy="860" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd6ec" stop-opacity="0.8"/><stop offset="1" stop-color="#ffd6ec" stop-opacity="0"/></radialGradient>',
    fond: (() => {
      const R = (() => { let a = 5; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
      const etoiles = Array.from({ length: 26 }, () => { const x = R() * 1080; const y = R() * 800; const r = 3 + R() * 5; return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="#fff6e0" opacity="${0.5 + R() * 0.5}"/>`; }).join('');
      const buisson = (x, y, r, c) => [0, 1, 2, 3].map((k) => `<circle cx="${x + (k - 1.5) * r * 0.8}" cy="${y - (k % 2) * r * 0.35}" r="${r}" fill="${c}"/>`).join('');
      return `<rect width="1080" height="1920" fill="url(#ciel2)"/>${etoiles}<rect width="1080" height="1920" fill="url(#lune2)"/><circle cx="820" cy="380" r="95" fill="#fff4d6"/>
        ${buisson(120, 1600, 160, '#8f86d6')}${buisson(900, 1560, 170, '#9a8fdc')}${buisson(520, 1700, 190, '#a99fe4')}
        <path d="M-60 1095 C 180 1010 360 975 540 962 C 720 948 880 905 1140 835" stroke="#b58a9f" stroke-width="46" fill="none" stroke-linecap="round" filter="url(#ombre-douce)"/>
        <path d="M-60 1080 C 180 995 360 960 540 947 C 720 933 880 890 1140 820" stroke="#d6a9bc" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M-60 1330 C 60 1250 220 1240 330 1270 C 240 1300 120 1320 -60 1380 Z" fill="#8fd9b0" filter="url(#ombre-douce)"/>
        ${buisson(110, 230, 70, '#5f58a8')}${buisson(980, 160, 80, '#5f58a8')}`;
    })(),
    cam: { corps: '#8fe0b0', membres: '#7ccf9e', dos: '#a6ecc3', ventre: '#e6fbe9', taches: '#6cc493', oeilFond: '#a6ecc3', sclere: '#ffffff', pupille: '#3b3368', trait: '#4f8f6d', joue: '#ffb3c8', sueur: '#bfe9ff', filtre: 'ombre-douce' },
    gr: { corps: '#f7c08a', pattes: '#eaa874', gorge: '#fde3c4', sclere: '#ffffff', fixe: '#ffffff', pupille: '#3b3368', trait: '#c27a4b', joue: '#ff9fb8', filtre: 'ombre-douce' },
    lu: { corps: '#6f66b8', lumiere: '#fff1a8', aile: '#ffffff', lueur: true },
    mo: { corps: '#ffe48a', aile: '#ffffff', fil: '#ffffff' },
    mousse: { '#2a3550': '#9aa7e0', '#151c2e': '#7480c4', '#3fa34d': '#93dcae', '#b6ff5c': '#d4f7c4', '#3b2a24': '#c99a8c', '#0a1020': '#3d4380' },
    mousseFiltre: 'ombre-douce',
    pensee: { fond: '#ffffff', bord: '#d9c9ff', bordL: 6, mouche: '#ffd66b', aile: '#cfe8ff', coeur: '#ff8fb1', filtre: 'ombre-douce' },
    imaginer: '<rect width="1080" height="1920" fill="#2b2160" opacity="0.45"/><rect width="1080" height="1920" fill="url(#spot2)"/>',
    apres: '',
    police: 'Fredoka:wght@600;700',
    css: `.texte { font: 600 84px/1.1 "Fredoka"; color: #fff; display: inline-block; padding: 26px 46px 30px; border-radius: 60px; background: rgba(140,120,220,.55); box-shadow: 0 12px 40px rgba(60,40,140,.35); text-shadow: 0 3px 0 rgba(80,60,160,.35); }
      .texte b { display: block; font-weight: 700; font-size: 132px; line-height: 1; color: #fff; background: #ff9fc0; border-radius: 40px; padding: 4px 28px 10px; margin-top: 12px; box-shadow: 0 6px 0 #e77fa6; }`,
  },
  s3: {
    nom: 'S3 · Bande dessinée',
    defs: '<linearGradient id="ciel3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a6b"/><stop offset="1" stop-color="#3f4fa8"/></linearGradient>',
    fond: (() => {
      const feuille = (x, y, a, c) => `<path d="M${x} ${y} q 80 -60 180 -10 q -90 60 -180 10Z" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`;
      return `<rect width="1080" height="1920" fill="url(#ciel3)"/><rect width="1080" height="1920" fill="url(#trame)" opacity="0.6"/>
        <g filter="url(#encre)"><circle cx="840" cy="360" r="110" fill="#ffe14d"/>
        ${feuille(-20, 140, 20, '#2f9e5a')}${feuille(40, 300, -10, '#38b265')}${feuille(1100, 120, 160, '#2f9e5a')}${feuille(1090, 280, 200, '#38b265')}
        ${feuille(-30, 1500, -30, '#2f9e5a')}${feuille(1110, 1450, 210, '#38b265')}${feuille(950, 1700, 230, '#2f9e5a')}
        <path d="M-60 1095 C 180 1010 360 975 540 962 C 720 948 880 905 1140 835" stroke="#8a5a2b" stroke-width="40" fill="none" stroke-linecap="round"/>
        <path d="M-60 1330 C 60 1250 220 1240 330 1270 C 240 1300 120 1320 -60 1380 Z" fill="#38b265"/></g>`;
    })(),
    cam: { corps: '#4fd36a', membres: '#3cb857', dos: '#7ee68f', ventre: '#d6f59b', taches: '#2c9a48', oeilFond: '#7ee68f', sclere: '#ffffff', pupille: '#111', trait: '#111', sueur: '#7fd4ff', bord: '#111', bordL: 3, filtre: 'encre' },
    gr: { corps: '#ff8c3a', pattes: '#e8732a', gorge: '#ffd38a', sclere: '#ffffff', fixe: '#ffffff', pupille: '#111', trait: '#111', bord: '#111', bordL: 3, filtre: 'encre' },
    lu: { corps: '#2a2a3a', lumiere: '#ffe14d', aile: '#ffffff', bord: '#111', filtre: 'encre-fine' },
    mo: { corps: '#ffe14d', aile: '#ffffff', fil: '#ffffff', bord: '#111', filtre: 'encre-fine' },
    mousse: { '#2a3550': '#5a6fd6', '#151c2e': '#2b3580', '#3fa34d': '#38b265', '#b6ff5c': '#c8f56a', '#3b2a24': '#8a5a2b', '#0a1020': '#1b2050' },
    mousseFiltre: 'encre',
    pensee: { fond: '#ffffff', bord: '#111', bordL: 6, mouche: '#ffe14d', aile: '#cfe8ff', coeur: '#ff3b5c' },
    imaginer: `<rect width="1080" height="1920" fill="#111" opacity="0.35"/>${Array.from({ length: 36 }, (_, k) => { const a = (k / 36) * Math.PI * 2; const r1 = 330; const r2 = 1400; const cx = 600; const cy = 860; return `<path d="M${cx + r1 * Math.cos(a)} ${cy + r1 * Math.sin(a)} L${cx + r2 * Math.cos(a + 0.03)} ${cy + r2 * Math.sin(a + 0.03)} L${cx + r2 * Math.cos(a - 0.03)} ${cy + r2 * Math.sin(a - 0.03)}Z" fill="#fff" opacity="0.55"/>`; }).join('')}<text x="760" y="1110" font-family="Bangers" font-size="90" fill="#ff3b5c" stroke="#111" stroke-width="6" paint-order="stroke" transform="rotate(-8 760 1110)">GLOUPS !</text>`,
    apres: '',
    police: 'Bangers',
    css: `.texte { font: 400 92px/1.02 "Bangers"; letter-spacing: .03em; color: #111; display: inline-block; padding: 18px 34px 14px; background: #ffe14d; border: 7px solid #111; box-shadow: 10px 10px 0 #111; transform: rotate(-2deg); text-transform: uppercase; }
      .texte b { display: block; font-weight: 400; font-size: 150px; line-height: .95; color: #ff3b5c; -webkit-text-stroke: 4px #111; paint-order: stroke fill; }`,
  },
  s4: {
    nom: 'S4 · Livre en papier découpé',
    defs: '<linearGradient id="ciel4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a55"/><stop offset="0.6" stop-color="#4a3f73"/><stop offset="1" stop-color="#7a5a6a"/></linearGradient><radialGradient id="spot4" cx="590" cy="860" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a8" stop-opacity="0.7"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>',
    fond: (() => {
      const colline = (y, amp, c, a) => { let d = `M-40 1920 L-40 ${y}`; for (let x = -40; x <= 1120; x += 120) d += ` Q${x + 60} ${y - amp * Math.abs(Math.sin(x + a))} ${x + 120} ${y - amp * 0.4 * Math.abs(Math.cos(x * a))}`; return `<path d="${d} L1120 1920 Z" fill="${c}"/>`; };
      const feuille = (x, y, a, c) => `<path d="M${x} ${y} q 90 -70 200 -10 q -100 70 -200 10Z" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`;
      return `<rect width="1080" height="1920" fill="url(#ciel4)"/>
        <g filter="url(#papier)"><circle cx="840" cy="380" r="115" fill="#f3e6c4"/><circle cx="800" cy="350" r="20" fill="#e6d6ad"/>
        ${colline(1460, 150, '#4f5d8a', 1.3)}${colline(1620, 110, '#3f6b5c', 2.1)}
        ${feuille(-20, 150, 20, '#3f6b5c')}${feuille(1100, 140, 160, '#4d7a63')}
        <path d="M-60 1100 C 180 1015 360 980 540 967 C 720 953 880 910 1140 840" stroke="#7a5236" stroke-width="40" fill="none" stroke-linecap="round"/>
        <path d="M-60 1086 C 180 1001 360 966 540 953 C 720 939 880 896 1140 826" stroke="#9a6c48" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M-60 1330 C 60 1250 220 1240 330 1270 C 240 1300 120 1320 -60 1380 Z" fill="#6f9a52"/></g>`;
    })(),
    cam: { corps: '#74b843', membres: '#4f8f34', dos: '#8fcc5a', ventre: '#c6e08f', taches: '#4f9535', oeilFond: '#8fcc5a', sclere: '#f6edd5', pupille: '#1d1a1a', trait: '#2d5a22', sueur: '#bfe3f2', attaches: true, filtre: 'papier' },
    gr: { corps: '#d98a4a', pattes: '#b86e38', gorge: '#f1d2a0', sclere: '#f6edd5', fixe: '#f6edd5', pupille: '#1d1a1a', trait: '#7a4a24', filtre: 'papier' },
    lu: { corps: '#3b3b4a', lumiere: '#f2d36a', aile: '#f3ecd8', filtre: 'papier' },
    mo: { corps: '#3b3b4a', aile: '#f3ecd8', fil: '#efe6cf', filtre: 'papier' },
    mousse: { '#2a3550': '#4a557e', '#151c2e': '#2c3352', '#3fa34d': '#4f9b45', '#3b2a24': '#5a3c2c', '#0a1020': '#1b2140', '#b6ff5c': '#a8d86a' },
    mousseFiltre: 'papier',
    pensee: { fond: '#f6edd5', bord: '#7a5236', bordL: 4, mouche: '#3b3b4a', aile: '#d9e8f2', coeur: '#d9534f', filtre: 'papier' },
    imaginer: '<rect width="1080" height="1920" fill="#120c1e" opacity="0.5"/><polygon points="470,0 610,0 880,1060 320,1060" fill="url(#spot4)" filter="url(#papier)"/>',
    apres: '<rect width="1080" height="1920" filter="url(#fibre)" opacity="0.13" style="mix-blend-mode:overlay"/>',
    police: 'Patrick+Hand',
    css: `.texte { font: 400 84px/1.05 "Patrick Hand"; color: #3a2414; display: inline-block; padding: 24px 44px 28px; background: #f6edd5; border-radius: 6px; box-shadow: 6px 10px 0 rgba(30,15,5,.45); transform: rotate(-1.5deg); }
      .texte b { display: block; font-weight: 400; font-size: 130px; line-height: 1; color: #b8322c; text-decoration: underline; text-decoration-thickness: 6px; text-underline-offset: 10px; }`,
  },
  s5: {
    nom: 'S5 · Pâte à modeler',
    defs: (() => {
      const pate = (id, clair, base, sombre) => `<radialGradient id="${id}" cx="0.35" cy="0.28" r="0.85"><stop offset="0" stop-color="${clair}"/><stop offset="0.55" stop-color="${base}"/><stop offset="1" stop-color="${sombre}"/></radialGradient>`;
      return `<linearGradient id="ciel5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2547"/><stop offset="0.6" stop-color="#3b3f78"/><stop offset="1" stop-color="#6a5a8c"/></linearGradient>
        <filter id="flou5"><feGaussianBlur stdDeviation="14"/></filter>
        <filter id="pate" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#0b0f24" flood-opacity="0.55"/></filter>
        <radialGradient id="spot5" cx="590" cy="860" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0d0" stop-opacity="0.6"/><stop offset="1" stop-color="#fff0d0" stop-opacity="0"/></radialGradient>
        ${pate('p-cam', '#b8f59a', '#5cc85a', '#2f7d3a')}${pate('p-cam2', '#e8ffd0', '#b9ec98', '#7cbf63')}${pate('p-gr', '#ffd2a0', '#f08b4a', '#a54e22')}${pate('p-gr2', '#fff1d8', '#ffd6a0', '#d9a066')}
        ${pate('p-bois', '#c59265', '#8a5a36', '#4f311c')}${pate('p-feuille', '#8fe0a0', '#3f9a5c', '#1f5a34')}${pate('p-lune', '#fffbe8', '#ffe6a8', '#d9b766')}${pate('p-mouche', '#fffbd0', '#ffe066', '#c79a20')}${pate('p-lu', '#6a6a8a', '#3a3a55', '#1c1c2c')}
        ${pate('p-mousse', '#a5b4f0', '#5e6fc0', '#2c3570')}${pate('p-mousse2', '#c4f5b8', '#62c26e', '#2f7a3c')}`;
    })(),
    fond: `<rect width="1080" height="1920" fill="url(#ciel5)"/>
      <g filter="url(#flou5)" opacity="0.8"><circle cx="160" cy="420" r="60" fill="#ffd58a" opacity="0.5"/><circle cx="900" cy="760" r="40" fill="#9af8ff" opacity="0.45"/><circle cx="300" cy="1500" r="90" fill="#ff9fc0" opacity="0.3"/><circle cx="980" cy="1380" r="70" fill="#ffd58a" opacity="0.35"/></g>
      <g filter="url(#pate)"><circle cx="840" cy="380" r="105" fill="url(#p-lune)"/>
      <path d="M-30 150 q 120 -70 230 20 q -120 60 -230 -20Z" fill="url(#p-feuille)"/><path d="M1110 160 q -120 -60 -220 30 q 120 50 220 -30Z" fill="url(#p-feuille)"/>
      <path d="M-60 1095 C 180 1010 360 975 540 962 C 720 948 880 905 1140 835" stroke="url(#p-bois)" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path d="M-60 1330 C 60 1250 220 1240 330 1270 C 240 1300 120 1320 -60 1380 Z" fill="url(#p-feuille)"/>
      <ellipse cx="160" cy="1720" rx="260" ry="120" fill="url(#p-feuille)"/><ellipse cx="920" cy="1740" rx="280" ry="130" fill="url(#p-feuille)"/></g>`,
    cam: { corps: 'url(#p-cam)', membres: '#3f9a46', dos: 'none', ventre: 'url(#p-cam2)', taches: '#2f7d3a', oeilFond: 'url(#p-cam)', sclere: '#ffffff', pupille: '#1a1a2a', trait: '#24592c', joue: '#ff9fb0', sueur: '#bfe9ff', filtre: 'pate' },
    gr: { corps: 'url(#p-gr)', pattes: '#c86a30', gorge: 'url(#p-gr2)', sclere: '#ffffff', fixe: '#ffffff', pupille: '#1a1a2a', trait: '#7a3a14', joue: '#ff8fa8', filtre: 'pate' },
    lu: { corps: 'url(#p-lu)', lumiere: 'url(#p-mouche)', aile: '#e8f4ff', lueur: true, filtre: 'pate' },
    mo: { corps: 'url(#p-mouche)', aile: '#e8f4ff', fil: '#f4f0e0', filtre: 'pate' },
    mousse: { '#2a3550': 'url(#p-mousse)', '#151c2e': '#3a4790', '#3fa34d': 'url(#p-mousse2)', '#b6ff5c': '#d8ffc8', '#3b2a24': '#7a4a34', '#0a1020': '#1c2150' },
    mousseFiltre: 'pate',
    pensee: { fond: '#fffaf0', bord: '#e6dcc8', bordL: 4, mouche: 'url(#p-mouche)', aile: '#e8f4ff', coeur: '#ff6f8f', filtre: 'pate' },
    imaginer: '<rect width="1080" height="1920" fill="#0b0f24" opacity="0.5"/><rect width="1080" height="1920" fill="url(#spot5)"/>',
    apres: '',
    police: 'Fredoka:wght@700',
    css: '.texte { font: 700 90px/1.05 "Fredoka"; color: #fff; } .texte b { display: block; font-size: 130px; color: #ffe066; }',
  },
  s6: {
    nom: 'S6 · Aplats géométriques',
    defs: '<linearGradient id="ciel6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3b4f"/><stop offset="1" stop-color="#1f6f78"/></linearGradient><radialGradient id="spot6" cx="590" cy="860" r="480" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf5a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient>',
    fond: `<rect width="1080" height="1920" fill="url(#ciel6)"/>
      <circle cx="840" cy="380" r="140" fill="#ffcf5a" opacity="0.25"/><circle cx="840" cy="380" r="100" fill="#ffcf5a"/>
      <polygon points="-40,1520 220,1180 480,1520" fill="#145560"/><polygon points="360,1560 680,1150 1000,1560" fill="#185f6a"/><polygon points="760,1540 1000,1240 1240,1540" fill="#145560"/>
      <rect y="1500" width="1080" height="420" fill="#0c3640"/>
      <polygon points="0,90 260,260 0,380" fill="#1f8a6e"/><polygon points="1080,60 820,240 1080,330" fill="#1f8a6e"/>
      <path d="M-60 1095 C 180 1010 360 975 540 962 C 720 948 880 905 1140 835" stroke="#e07a3c" stroke-width="40" fill="none"/>
      <path d="M-60 1080 C 180 995 360 960 540 947 C 720 933 880 890 1140 820" stroke="#f29a5a" stroke-width="8" fill="none"/>
      <polygon points="-60,1330 330,1265 -60,1385" fill="#2fb08a"/>`,
    cam: { corps: '#2fd1a0', membres: '#24a882', dos: '#5ee8bd', ventre: '#c8f7e6', taches: '#1f8a6e', oeilFond: '#5ee8bd', sclere: '#ffffff', pupille: '#0c2a33', trait: '#145560', sueur: '#9ad8ff' },
    gr: { corps: '#f25f5c', pattes: '#c94744', gorge: '#ffb8a8', sclere: '#ffffff', fixe: '#ffffff', pupille: '#0c2a33', trait: '#8a2a28' },
    lu: { corps: '#0c2a33', lumiere: '#ffcf5a', aile: '#ffffff' },
    mo: { corps: '#ffcf5a', aile: '#ffffff', fil: '#ffffff' },
    mousse: { '#2a3550': '#3d5a80', '#151c2e': '#293d5a', '#3fa34d': '#2fb08a', '#b6ff5c': '#9ff0d0', '#3b2a24': '#e07a3c', '#0a1020': '#0c2a33' },
    pensee: { fond: '#ffffff', bord: '#0c2a33', bordL: 4, mouche: '#ffcf5a', aile: '#d0f0ff', coeur: '#f25f5c' },
    imaginer: '<rect width="1080" height="1920" fill="#06222a" opacity="0.5"/><polygon points="470,0 620,0 900,1080 300,1080" fill="url(#spot6)"/>',
    apres: '',
    police: 'Fredoka:wght@700',
    css: '.texte { font: 700 90px/1.05 "Fredoka"; color: #fff; } .texte b { display: block; font-size: 130px; color: #ffcf5a; }',
  },
};

function page(st, m, avecTexte = true) {
  const texte = m === 'imaginer' ? 'il croit que tout le monde le <b>regarde</b>' : 'la grenouille pense à <b>sa mouche</b>';
  return `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=${st.police}&display=block" rel="stylesheet">
  <style>*{box-sizing:border-box}html,body{margin:0;background:#000}#r{position:relative;width:1080px;height:1920px;overflow:hidden}
  .bandeau{position:absolute;left:60px;width:880px;top:180px;text-align:center}${st.css}</style></head><body><div id="r">
  <svg width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${FILTRES}${st.defs}</defs>
  ${st.fond}
  ${m === 'imaginer' ? '' : ''}
  ${mouche(st)}
  ${cameleon(st, m)}
  ${grenouille(st, m)}
  ${lucioles(st, m)}
  ${m === 'imaginer' ? st.imaginer : ''}
  ${m === 'imaginer' ? cameleon(st, m) + grenouille(st, m) + lucioles(st, m) : ''}
  ${m === 'penser' ? pensee(st) : ''}
  ${mousse(st, m)}
  ${st.apres}
  </svg>${avecTexte ? `<div class="bandeau"><span class="texte">${texte}</span></div>` : ''}</div></body></html>`;
}

(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const images = [];
  // « styles » : décor et personnages seuls (sans texte), au moment « tout le monde le regarde ».
  const seulStyle = process.argv.includes('styles');
  for (const [id, st] of Object.entries(STYLES)) {
    if (!seulStyle && (id === 's5' || id === 's6')) continue;
    for (const m of seulStyle ? ['imaginer'] : ['imaginer', 'penser']) {
      const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
      await p.setContent(page(st, m, !seulStyle));
      await p.evaluate(() => document.fonts.ready.then(() => true));
      await p.waitForTimeout(500);
      const f = `/tmp/maquette-${id}-${m}.png`;
      await p.screenshot({ path: f });
      images.push(f);
      await p.close();
    }
  }
  await b.close();
  const n = images.length; const col = seulStyle ? 3 : 4;
  const sortie = path.join(__dirname, seulStyle ? 'planche-styles.png' : 'planche.png');
  execSync(`ffmpeg -v error -y ${images.map((f) => `-i ${f}`).join(' ')} -filter_complex "${images.map((_, i) => `[${i}:v]scale=432:768[v${i}]`).join(';')};${images.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${n}:layout=${images.map((_, i) => `${(i % col) * 432}_${Math.floor(i / col) * 768}`).join('|')}" ${sortie}`);
  console.log(`Planche écrite : ${path.relative(path.join(__dirname, '../..'), sortie)}`);
})();
