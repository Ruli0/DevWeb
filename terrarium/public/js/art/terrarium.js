/*
 * Le vivarium illustré : une boîte en verre, une cascade, un ruisseau, des
 * plantes qui bougent chacune à leur rythme et des animaux qui vivent leur vie.
 * Tout est dessiné en SVG par ce fichier, et animé avec GSAP.
 */
(function () {
  'use strict';
  const T = (window.Terrarium = window.Terrarium || {});

  // Hasard reproductible : le dessin est le même à chaque chargement.
  function graine(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let R = graine(7);
  const entre = (a, b) => a + (b - a) * R();
  const f = (n) => n.toFixed(1);
  const rad = (d) => (d * Math.PI) / 180;

  const C = {
    feuille: ['#1f6b47', '#2f8a5a', '#174f37'],
    fougere: ['#3f9457', '#6dbb6a'],
    mousse: ['#5fa04a', '#9ad25f'],
    bois: ['#5b4030', '#7c5c45', '#3f2b20'],
    roche: ['#6f7570', '#8f968f', '#555b57'],
    eau: ['#7fd0de', '#c8f0f5', '#3d93ad'],
  };

  // --- Formes de base --------------------------------------------------------
  function feuille(x, y, len, w, ang, c1, c2, nervure) {
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
      <path d="M0 0 C${f(len * 0.25)} ${f(-w)} ${f(len * 0.75)} ${f(-w * 0.9)} ${f(len)} 0 C${f(len * 0.75)} ${f(w * 0.9)} ${f(len * 0.25)} ${f(w)} 0 0Z" fill="${c1}"/>
      <path d="M0 0 C${f(len * 0.25)} ${f(-w)} ${f(len * 0.75)} ${f(-w * 0.9)} ${f(len)} 0Z" fill="${c2}"/>
      ${nervure ? `<path d="M0 0 L${f(len * 0.92)} 0" stroke="${nervure}" stroke-width="1.2" fill="none"/>` : ''}</g>`;
  }

  // Une fronde de fougère : une tige courbe et ses folioles, en deux tracés.
  function fronde(bx, by, angle, L, c1, c2, amp) {
    const tx = bx + L * Math.sin(rad(angle));
    const ty = by - L * Math.cos(rad(angle));
    const cx = bx + (tx - bx) * 0.25;
    const cy = by + (ty - by) * 0.85;
    let d = '';
    const n = Math.round(L / 9);
    for (let i = 2; i <= n; i += 1) {
      const t = i / (n + 1);
      const px = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * tx;
      const py = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * ty;
      const dx = 2 * (1 - t) * (cx - bx) + 2 * t * (tx - cx);
      const dy = 2 * (1 - t) * (cy - by) + 2 * t * (ty - cy);
      const a = Math.atan2(dy, dx);
      const l = L * 0.24 * Math.sqrt(1 - t) * Math.min(1, t * 5);
      for (const cote of [-1, 1]) {
        const b = a + cote * rad(62);
        const ex = px + l * Math.cos(b);
        const ey = py + l * Math.sin(b);
        const mx = (px + ex) / 2;
        const my = (py + ey) / 2;
        const nx = -Math.sin(b) * l * 0.2;
        const ny = Math.cos(b) * l * 0.2;
        d += `M${f(px)} ${f(py)}Q${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)}Q${f(mx - nx)} ${f(my - ny)} ${f(px)} ${f(py)}Z`;
      }
    }
    return `<g class="sway" data-o="${f(bx)} ${f(by)}" data-amp="${amp || 3}">
      <path d="${d}" fill="${c1}"/>
      <path d="M${f(bx)} ${f(by)} Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}" stroke="${c2}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  }

  function fougere(bx, by, n, L, ouverture, penche, c) {
    let s = '';
    for (let i = 0; i < n; i += 1) {
      const a = penche - ouverture / 2 + (ouverture * i) / (n - 1) + entre(-5, 5);
      const centre = 1 - Math.abs(i - (n - 1) / 2) / n;
      s += fronde(bx + entre(-4, 4), by, a, L * (0.7 + centre * 0.4), c[0], c[1], entre(2, 4.5));
    }
    return s;
  }

  // Feuille de monstera : un cœur dont le bord est réellement découpé.
  function monsteraFeuille(s, ang) {
    const cote = (k) => {
      const pts = [];
      for (let i = 0; i <= 48; i += 1) {
        const t = i / 48;
        let x = s * 0.92 * Math.pow(Math.sin(Math.PI * t), 0.75) * (1 - 0.22 * t);
        for (const c of [0.36, 0.54, 0.71]) x *= 1 - 0.62 * Math.exp(-Math.pow((t - c) / 0.028, 2));
        pts.push(`${f(k * x)} ${f(-1.28 * s * t)}`);
      }
      return pts;
    };
    const droite = cote(1);
    const gauche = cote(-1).reverse();
    return `<g transform="rotate(${f(ang)})">
      <path d="M${droite.join('L')}L${gauche.join('L')}Z" fill="${C.feuille[0]}"/>
      <path d="M${droite.join('L')}Z" fill="${C.feuille[1]}"/>
      <path d="M0 0 L0 ${f(-s * 1.22)}" stroke="#8fd07a" stroke-width="1.6" opacity="0.75"/>
      <path d="M0 ${f(-s * 0.26)} L${f(s * 0.5)} ${f(-s * 0.44)} M0 ${f(-s * 0.45)} L${f(s * 0.52)} ${f(-s * 0.64)} M0 ${f(-s * 0.63)} L${f(s * 0.42)} ${f(-s * 0.82)} M0 ${f(-s * 0.26)} L${f(-s * 0.5)} ${f(-s * 0.44)} M0 ${f(-s * 0.45)} L${f(-s * 0.52)} ${f(-s * 0.64)} M0 ${f(-s * 0.63)} L${f(-s * 0.42)} ${f(-s * 0.82)}" stroke="#8fd07a" stroke-width="0.9" opacity="0.45" fill="none"/></g>`;
  }

  function monstera(bx, by, feuilles) {
    return feuilles.map(([dx, dy, s, ang]) => {
      const x = bx + dx;
      const y = by + dy;
      return `<g class="sway" data-o="${bx} ${by}" data-amp="${f(entre(1.5, 3))}">
        <path d="M${bx} ${by} Q${f(bx + dx * 0.2)} ${f(by + dy * 0.7)} ${x} ${y}" stroke="#2c6e4a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <g transform="translate(${x} ${y})"><g class="sway" data-o="0 0" data-amp="${f(entre(3, 6))}">${monsteraFeuille(s, ang)}</g></g></g>`;
    }).join('');
  }

  function liane(points, taille) {
    const [x0, y0, cx, cy, x1, y1] = points;
    let s = `<path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" stroke="#2c6e4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const n = 7;
    for (let i = 1; i <= n; i += 1) {
      const t = i / n;
      const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      const cote = i % 2 ? 1 : -1;
      s += feuille(px, py, taille * (0.8 + t * 0.4), taille * 0.42, 90 + cote * 48, '#3f9c5c', '#74c476', '#bfe8a8');
    }
    return `<g class="sway" data-o="${x0} ${y0}" data-amp="2.2">${s}</g>`;
  }

  function herbes(bx, by, n, h) {
    let s = '';
    for (let i = 0; i < n; i += 1) {
      const x = bx + i * 6 + entre(-2, 2);
      const haut = h * entre(0.55, 1);
      const p = entre(-16, 16);
      s += `<path class="sway" data-o="${f(x)} ${by}" data-amp="${f(entre(3, 7))}" d="M${f(x)} ${by} Q${f(x + p * 0.2)} ${f(by - haut * 0.6)} ${f(x + p)} ${f(by - haut)} Q${f(x + p * 0.2 + 3)} ${f(by - haut * 0.55)} ${f(x + 4)} ${by}Z" fill="${i % 2 ? '#7cc15b' : '#4f9c4a'}"/>`;
    }
    return s;
  }

  function champignon(x, y, r) {
    return `<g class="sway" data-o="${x} ${y}" data-amp="1.5">
      <path d="M${x - r * 0.22} ${y} C${x - r * 0.3} ${y - r * 0.7} ${x - r * 0.18} ${y - r} ${x} ${y - r} C${x + r * 0.18} ${y - r} ${x + r * 0.3} ${y - r * 0.7} ${x + r * 0.22} ${y}Z" fill="#f2e6cf"/>
      <path d="M${x - r} ${y - r * 0.95} A${r} ${r * 0.85} 0 0 1 ${x + r} ${y - r * 0.95} Q${x} ${y - r * 0.7} ${x - r} ${y - r * 0.95}Z" fill="#d6483c"/>
      <path d="M${x - r} ${y - r * 0.95} A${r} ${r * 0.85} 0 0 1 ${x} ${y - r * 1.8} Q${x - r * 0.4} ${y - r * 1.2} ${x - r} ${y - r * 0.95}Z" fill="#e8685a"/>
      <circle cx="${x - r * 0.4}" cy="${y - r * 1.25}" r="${r * 0.13}" fill="#fff6e8"/><circle cx="${x + r * 0.3}" cy="${y - r * 1.35}" r="${r * 0.16}" fill="#fff6e8"/><circle cx="${x + r * 0.55}" cy="${y - r * 1.08}" r="${r * 0.1}" fill="#fff6e8"/></g>`;
  }

  function orchidee(x, y, s) {
    let p = '';
    for (let i = 0; i < 5; i += 1) {
      p += `<ellipse cx="0" cy="${-s * 0.62}" rx="${s * 0.34}" ry="${s * 0.62}" transform="rotate(${i * 72})" fill="${i % 2 ? '#f7a8c4' : '#ea6f9d'}"/>`;
    }
    return `<g transform="translate(${x} ${y})"><g class="sway" data-o="0 0" data-amp="5">${p}<circle r="${s * 0.26}" fill="#ffd95e"/><circle r="${s * 0.1}" fill="#c9482f"/></g></g>`;
  }

  function roche(points, i) {
    const pts = points.map((p) => p.join(',')).join(' ');
    const haut = points.slice(0, Math.ceil(points.length / 2) + 1).map((p) => p.join(',')).join(' ');
    return `<polygon points="${pts}" fill="${C.roche[0]}" stroke="${C.roche[0]}" stroke-width="10" stroke-linejoin="round"/>
      <polygon points="${haut}" fill="${C.roche[1]}" opacity="${i % 2 ? 0.55 : 0.8}" stroke="${C.roche[1]}" stroke-width="4" stroke-linejoin="round"/>`;
  }

  function coussinMousse(x, y, w) {
    let s = `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.3}" fill="${C.mousse[0]}"/>`;
    for (let i = 0; i < w / 4; i += 1) {
      s += `<circle cx="${f(x + entre(-w * 0.8, w * 0.8))}" cy="${f(y + entre(-w * 0.2, w * 0.1))}" r="${f(entre(2, 4.5))}" fill="${C.mousse[1]}" opacity="${f(entre(0.5, 0.95))}"/>`;
    }
    return s;
  }

  // --- Animaux ---------------------------------------------------------------
  function cameleon() {
    return `<g id="cam" class="hot" data-v="cycle"><g id="cam-flip"><g transform="translate(0 -9)"><g id="cam-corps">
      <path class="cam-trait2" d="M12 -14 L17 -2 L11 2" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="cam-trait2" d="M-28 -12 L-33 -1 L-27 2" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="cam-trait" d="M-40 -18 C-62 -22 -74 -6 -66 6 C-59 15 -45 11 -47 2 C-48 -4 -55 -4 -55 1" stroke-width="7.5" fill="none" stroke-linecap="round"/>
      <path class="cam-peau" d="M-44 -14 C-40 -42 -2 -50 26 -38 C38 -33 42 -24 39 -15 C30 -4 -22 -3 -44 -14Z"/>
      <path class="cam-ventre" d="M-40 -12 C-20 -3 28 -4 38 -14 C28 -10 -14 -9 -40 -12Z"/>
      <path class="cam-raie" d="M-22 -40 C-26 -28 -24 -18 -18 -10 M-6 -45 C-10 -32 -8 -20 -2 -9 M10 -45 C6 -34 8 -22 14 -11" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path class="cam-crete" d="M-38 -24 l3 -6 l3 5 l4 -7 l3 6 l4 -7 l3 6 l4 -7 l3 6 l4 -6 l3 6 l4 -6 l3 6 l4 -5 l3 6" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <g id="cam-tete">
        <path class="cam-peau" d="M20 -38 C26 -58 46 -56 54 -38 L66 -29 C62 -19 48 -14 35 -17 C26 -20 20 -28 20 -38Z"/>
        <path class="cam-ventre" d="M36 -17 C48 -15 62 -20 66 -29 C58 -23 46 -21 36 -17Z"/>
        <path d="M66 -29 L47 -25" stroke="#143524" stroke-width="1.6" stroke-linecap="round"/>
        <circle class="cam-oeil" cx="46" cy="-36" r="8"/>
        <circle cx="46" cy="-36" r="5.4" fill="#f4f0d8"/>
        <g id="cam-pupille"><circle cx="48.6" cy="-36" r="2.5" fill="#12261b"/></g>
      </g>
      <g id="cam-langue" opacity="0"><line id="cam-langue-fil" x1="64" y1="-28" x2="64" y2="-28" stroke="#e8667a" stroke-width="3.5" stroke-linecap="round"/><circle id="cam-langue-bout" cx="64" cy="-28" r="4.5" fill="#f08a9a"/></g>
      <g id="cam-patte-av"><path class="cam-trait" d="M24 -18 L29 -4 L22 1" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g id="cam-patte-ar"><path class="cam-trait" d="M-18 -14 L-23 -2 L-16 2" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g></g></g></g>`;
  }

  function grenouille(x, y) {
    return `<g id="grenouille" transform="translate(${x} ${y})"><g id="grenouille-in">
      <ellipse cx="0" cy="2" rx="24" ry="5" fill="#2f7d4f"/>
      <ellipse cx="-13" cy="-4" rx="9" ry="6" fill="#3f9c4c"/><ellipse cx="13" cy="-4" rx="9" ry="6" fill="#3f9c4c"/>
      <path d="M-15 -4 C-15 -22 15 -22 15 -4 C12 2 -12 2 -15 -4Z" fill="#5cb85a"/>
      <g id="grenouille-sac"><ellipse id="grenouille-gorge" cx="0" cy="-5" rx="9" ry="5.5" fill="#e9f2b8"/></g>
      <path d="M-9 -12 Q0 -8 9 -12" stroke="#2c6e3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="-8" cy="-19" r="5.5" fill="#5cb85a"/><circle cx="8" cy="-19" r="5.5" fill="#5cb85a"/>
      <circle cx="-8" cy="-19.5" r="3.4" fill="#fbe38a"/><circle cx="8" cy="-19.5" r="3.4" fill="#fbe38a"/>
      <g class="grenouille-yeux"><ellipse cx="-8" cy="-19.5" rx="1.3" ry="2.6" fill="#16261b"/><ellipse cx="8" cy="-19.5" rx="1.3" ry="2.6" fill="#16261b"/></g>
      <path d="M-14 -8 q-3 3 -1 6 M14 -8 q3 3 1 6" stroke="#2c6e3a" stroke-width="1.2" fill="none"/>
    </g>
    <g id="grenouille-ondes" fill="none" stroke="#fdf6c9" stroke-width="2" stroke-linecap="round">
      <path d="M18 -22 q8 6 0 14"/><path d="M26 -27 q12 11 0 24"/><path d="M-18 -22 q-8 6 0 14"/><path d="M-26 -27 q-12 11 0 24"/></g></g>`;
  }

  function papillon(id, c1, c2) {
    const aile = `<path d="M0 0 C-4 -16 -20 -20 -22 -8 C-23 0 -10 3 0 0Z" fill="${c1}"/><path d="M0 0 C-10 2 -18 8 -14 15 C-9 20 -2 10 0 0Z" fill="${c2}"/><circle cx="-14" cy="-9" r="2.4" fill="#fff8e0" opacity="0.85"/>`;
    return `<g id="${id}" class="papillon"><g class="aile">${aile}</g><g transform="scale(-1 1)"><g class="aile">${aile}</g></g><ellipse rx="1.6" ry="7" fill="#2a2018"/></g>`;
  }

  // Vue de dessus : la fourmi peut tourner dans tous les sens sans se retrouver sur le dos.
  function fourmi(classe, charge) {
    return `<g class="fourmi ${classe}"><g class="fourmi-corps"><path d="M-7 0 l-3 6 M-7 0 l-3 -6 M0 0 v7 M0 0 v-7 M7 0 l3 6 M7 0 l3 -6 M9 -1 l5 -3 M9 1 l5 3" stroke="#1d1410" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <ellipse cx="-7" rx="4.6" ry="3.6" fill="#2a1c15"/><circle r="2.8" fill="#2a1c15"/><circle cx="7" r="3.4" fill="#2a1c15"/>${charge || ''}</g></g>`;
  }

  function escargot(x, y) {
    return `<g id="escargot" transform="translate(${x} ${y})"><g id="escargot-in">
      <path d="M-20 0 C-14 -7 14 -7 26 -5 C31 -4 31 0 26 0Z" fill="#e2c89a"/>
      <path d="M22 -5 l5 -11 M26 -4 l8 -8" stroke="#e2c89a" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="-16" r="1.8" fill="#3a2a1c"/><circle cx="34" cy="-12" r="1.8" fill="#3a2a1c"/>
      <circle cx="-2" cy="-14" r="14" fill="#b9743c"/><circle cx="-2" cy="-14" r="14" fill="none" stroke="#8a4f24" stroke-width="2"/>
      <path d="M-2 -14 m-8 0 a8 8 0 1 1 8 8 a5 5 0 1 1 -5 -5 a2.5 2.5 0 1 1 2.5 2.5" fill="none" stroke="#8a4f24" stroke-width="2" stroke-linecap="round"/>
      <path d="M-11 -22 a12 12 0 0 1 12 -5" stroke="#dfa468" stroke-width="2.5" fill="none" stroke-linecap="round"/></g></g>`;
  }

  // La dionée : deux mâchoires dentelées qui se referment.
  function dionee(x, y) {
    const lobe = `<path d="M0 0 C-17 -9 -20 -32 0 -43 C5 -30 5 -13 0 0Z" fill="#86c44e"/><path d="M0 -3 C-9 -10 -11 -27 -1 -37 C2 -27 2 -13 0 -3Z" fill="#e0647c"/>
      <path d="M-11 -8 l-6 -1 M-15 -16 l-7 -2 M-16 -25 l-7 -4 M-13 -33 l-5 -6 M-7 -39 l-3 -7" stroke="#cfe9a0" stroke-width="1.6" stroke-linecap="round"/>`;
    return `<g id="dionee" class="hot" data-v="capteurs">
      <path d="M${x - 46} ${y + 4} Q${x - 50} ${y - 30} ${x - 36} ${y - 52}" stroke="#4f9c4a" stroke-width="3" fill="none"/>
      <g transform="translate(${x - 36} ${y - 52}) rotate(-14) scale(0.72)"><g transform="rotate(-24)">${lobe}</g><g transform="rotate(24) scale(-1 1)">${lobe}</g></g>
      <path d="M${x + 30} ${y + 6} Q${x + 40} ${y - 24} ${x + 30} ${y - 40}" stroke="#4f9c4a" stroke-width="3" fill="none"/>
      <g transform="translate(${x + 30} ${y - 40}) rotate(16) scale(0.62)"><g transform="rotate(-22)">${lobe}</g><g transform="rotate(22) scale(-1 1)">${lobe}</g></g>
      <ellipse cx="${x}" cy="${y + 3}" rx="16" ry="5" fill="#4f9c4a"/>
      <g transform="translate(${x} ${y})"><g id="dionee-g">${lobe}</g><g transform="scale(-1 1)"><g id="dionee-d">${lobe}</g></g></g></g>`;
  }

  function scarabee() {
    return `<g id="scarabee" opacity="0"><path d="M-9 4 l-4 5 M0 5 l0 6 M9 4 l4 5 M-13 -3 l-6 -4" stroke="#141a2e" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <ellipse rx="12" ry="8" fill="#27408b"/><path d="M-9 -5 a12 8 0 0 1 18 0" stroke="#7fa6ff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M0 -8 V8" stroke="#141a2e" stroke-width="1.2"/><circle cx="-14" r="4.5" fill="#141a2e"/></g>`;
  }

  const PEAU = {
    vert: ['#6fbf4a', '#3f8f3a'],
    turquoise: ['#3fb5a8', '#1f7f86'],
    orange: ['#e9a13a', '#b9661f'],
  };

  // Feuilles taillées : cachées au repos. Chacune porte sa chute (départ, arrivée,
  // rotation) pour que le site et les vidéos les fassent tomber de la même façon.
  function feuillesTombantes() {
    const r = graine(41);
    let out = '';
    for (let i = 0; i < 12; i += 1) {
      const x = 70 + r() * 460;
      const y = 110 + r() * 170;
      const a = r() * 360;
      const dx = (r() - 0.5) * 80;
      const yFin = 596 + r() * 40;
      const da = r() * 400 - 200;
      const d = 1.6 + r();
      const retard = r() * 0.4;
      out += `<g class="feuille-chute" opacity="0" data-x="${f(x)}" data-y="${f(y)}" data-a="${f(a)}" data-dx="${f(dx)}" data-yfin="${f(yFin)}" data-da="${f(da)}" data-d="${f(d)}" data-retard="${f(retard)}">${feuille(0, 0, 22 + r() * 16, 8, 0, '#2f8a5a', '#6dbb6a')}</g>`;
    }
    return out;
  }

  // --- La scène complète -----------------------------------------------------
  const BRANCHE = 'M44 566 C150 524 250 442 330 372 C382 326 430 252 506 214';
  const RUISSEAU = 'M452 316 L452 462 C446 496 404 516 380 548 C356 580 300 596 248 612 C226 619 208 624 190 628';
  const PISTE = 'M500 654 C470 672 420 676 384 668 C352 661 322 672 296 676 C322 684 352 676 384 682 C420 690 474 686 500 654';

  function svg() {
    R = graine(11);
    let gouttes = '';
    for (let i = 0; i < 26; i += 1) {
      const x = entre(48, 552);
      const y = entre(70, 190);
      const r = entre(1.5, 4.5);
      gouttes += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 1.25)}" fill="#ffffff" opacity="${f(entre(0.12, 0.4))}"/>`;
    }
    let lucioles = '';
    for (let i = 0; i < 14; i += 1) {
      lucioles += `<circle class="luciole" cx="${f(entre(60, 540))}" cy="${f(entre(120, 600))}" r="${f(entre(1.2, 2.6))}" fill="#f6ffb0"/>`;
    }
    let galets = '';
    for (let i = 0; i < 46; i += 1) {
      galets += `<ellipse cx="${f(entre(36, 566))}" cy="${f(entre(673, 682))}" rx="${f(entre(3, 7))}" ry="${f(entre(2, 4))}" fill="${i % 3 ? '#a3a79f' : '#c7c9c1'}"/>`;
    }
    let fond = '';
    for (let i = 0; i < 9; i += 1) {
      const x = 40 + i * 64 + entre(-14, 14);
      fond += `<g class="sway" data-o="${f(x)} 560" data-amp="1.5">${feuille(x, 560, entre(170, 300), entre(26, 44), entre(-112, -68), '#7fb596', '#8fc2a5')}</g>`;
    }
    let milieu = '';
    for (let i = 0; i < 7; i += 1) {
      const x = 60 + i * 80 + entre(-18, 18);
      milieu += `<g class="sway" data-o="${f(x)} 580" data-amp="2">${feuille(x, 580, entre(120, 210), entre(22, 34), entre(-118, -62), '#4b8a70', '#5a9a7d')}</g>`;
    }

    return `<svg id="vivarium" viewBox="0 0 600 744" role="img" aria-label="Un vivarium en verre avec une cascade, un ruisseau, des plantes, un caméléon sur une branche, une grenouille, des papillons et des fourmis.">
    <defs>
      <linearGradient id="g-fond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2f4e6"/><stop offset="0.45" stop-color="#9ccdb0"/><stop offset="1" stop-color="#2a5444"/></linearGradient>
      <linearGradient id="g-chute" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fafc"/><stop offset="1" stop-color="#7fd0de"/></linearGradient>
      <linearGradient id="g-bassin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fdbe6"/><stop offset="1" stop-color="#2f7f9a"/></linearGradient>
      <linearGradient id="g-verre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.4" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.08"/></linearGradient>
      <clipPath id="clip-vitre"><rect x="34" y="60" width="532" height="622" rx="6"/></clipPath>
    </defs>

    <rect x="18" y="22" width="564" height="704" rx="20" fill="#1b2925"/>
    <g clip-path="url(#clip-vitre)">
      <rect x="34" y="60" width="532" height="622" fill="url(#g-fond)"/>
      <g id="rayons" fill="#ffffff"><polygon points="90,60 170,60 330,682 150,682" opacity="0.10"/><polygon points="230,60 280,60 520,682 420,682" opacity="0.07"/><polygon points="40,60 70,60 110,682 34,682" opacity="0.08"/></g>
      <g opacity="0.75">${fond}</g>
      <g>${milieu}</g>
      <path d="M34 520 C120 474 220 500 300 522 C380 544 470 474 566 482 V682 H34Z" fill="#2f5a3f"/>

      <g id="plante-monstera" class="pousse" data-o="112 524">${monstera(112, 524, [[-52, -150, 44, -28], [8, -214, 54, 6], [70, -140, 46, 34], [-10, -96, 36, -12], [48, -70, 30, 40]])}</g>

      <g id="rochers">
        ${roche([[388, 338], [436, 304], [520, 300], [566, 330], [566, 570], [372, 570], [366, 440]], 0)}
        <polygon points="470,330 566,360 566,570 500,570" fill="${C.roche[2]}" opacity="0.6"/>
        ${coussinMousse(516, 302, 44)}${coussinMousse(408, 322, 22)}
        <g>${fougere(528, 300, 5, 62, 110, 10, C.fougere)}</g>
        <path id="chute" d="M440 314 Q452 308 466 314 L468 466 Q452 474 438 466Z" fill="url(#g-chute)" opacity="0.92"/>
        <g class="chute-fil" stroke="#ffffff" stroke-linecap="round" fill="none"><path d="M446 318 V462" stroke-width="2.5" stroke-dasharray="26 22" opacity="0.9"/><path d="M454 318 V462" stroke-width="2" stroke-dasharray="16 30" opacity="0.7"/><path d="M461 318 V462" stroke-width="2.5" stroke-dasharray="30 26" opacity="0.85"/></g>
        ${roche([[330, 486], [392, 458], [452, 470], [470, 520], [450, 580], [316, 580]], 1)}
        ${coussinMousse(352, 476, 26)}
        ${escargot(382, 462)}
      </g>

      <path d="M34 604 C110 572 190 592 260 614 C330 634 420 602 566 592 V682 H34Z" fill="#3d2f24"/>
      <path d="M34 604 C110 572 190 592 260 614 C330 634 420 602 566 592" stroke="${C.mousse[0]}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M34 600 C110 568 190 588 260 610 C330 630 420 598 566 588" stroke="${C.mousse[1]}" stroke-width="4" fill="none" stroke-dasharray="3 9" stroke-linecap="round"/>

      <g id="eau" class="hot" data-v="couches">
        <path d="${RUISSEAU.replace('M452 316 L452 462', 'M452 462')}" stroke="#2f7f9a" stroke-width="27" fill="none" stroke-linecap="round" opacity="0.55"/>
        <path d="${RUISSEAU.replace('M452 316 L452 462', 'M452 462')}" stroke="${C.eau[0]}" stroke-width="21" fill="none" stroke-linecap="round"/>
        <g id="filtres">
          <g id="filtre-sable"><ellipse cx="424.7" cy="503.9" rx="19" ry="8" fill="#d9bd82"/><ellipse cx="421.7" cy="501.9" rx="11" ry="4" fill="#ecd7a6"/></g>
          <g id="filtre-mousse"><ellipse cx="341.1" cy="578.2" rx="17" ry="9" fill="#5fa04a"/><circle cx="334.1" cy="575.2" r="5" fill="#9ad25f"/><circle cx="347.1" cy="576.2" r="6" fill="#86c44e"/><circle cx="341.1" cy="581.2" r="4" fill="#9ad25f"/></g>
          <g id="filtre-galets" fill="#b9bdb4"><ellipse cx="244.2" cy="611.4" rx="7" ry="5"/><ellipse cx="255.2" cy="607.4" rx="6" ry="4.5" fill="#d5d8cf"/><ellipse cx="263.2" cy="613.4" rx="7" ry="5" fill="#9b9f97"/></g>
        </g>
        <path class="courant" d="${RUISSEAU.replace('M452 316 L452 462', 'M452 462')}" stroke="${C.eau[1]}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 22"/>
        <path class="courant lent" d="${RUISSEAU.replace('M452 316 L452 462', 'M452 462')}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="5 38" opacity="0.8" transform="translate(4 -5)"/>
        <ellipse cx="178" cy="634" rx="108" ry="27" fill="#2b2119"/>
        <ellipse cx="178" cy="632" rx="100" ry="23" fill="url(#g-bassin)"/>
        <g id="rides" fill="none" stroke="#ffffff" stroke-width="1.6"><ellipse class="ride" cx="230" cy="626" rx="10" ry="3"/><ellipse class="ride" cx="230" cy="626" rx="10" ry="3"/><ellipse class="ride" cx="120" cy="636" rx="8" ry="2.5"/></g>
        <g id="ecume" fill="#ffffff"><circle class="bulle" cx="444" cy="466" r="6"/><circle class="bulle" cx="454" cy="470" r="8"/><circle class="bulle" cx="464" cy="466" r="6"/><circle class="bulle" cx="450" cy="460" r="5"/></g>
        <g class="nenuphar"><path d="M146 634 a22 7 0 1 0 6 -5 l12 5Z" fill="#4f9c4a"/><path d="M228 642 a15 5 0 1 0 5 -4 l8 4Z" fill="#5cab52"/>
          <g transform="translate(238 640)"><ellipse rx="3.5" ry="7" cy="-5" fill="#f7a8c4" transform="rotate(-30)"/><ellipse rx="3.5" ry="7" cy="-5" fill="#f7a8c4" transform="rotate(30)"/><ellipse rx="3.5" ry="8" cy="-6" fill="#fbd0df"/></g></g>
        <path id="ruisseau" d="${RUISSEAU}" fill="none" stroke="none"/>
        <g id="eclats" fill="none" stroke="#ffffff" stroke-width="2"><ellipse cx="196" cy="628" rx="10" ry="3" opacity="0"/><ellipse cx="196" cy="628" rx="10" ry="3" opacity="0"/><ellipse cx="196" cy="628" rx="10" ry="3" opacity="0"/></g>
      </g>
      ${grenouille(166, 630)}
      <g>${herbes(268, 632, 9, 92)}</g>

      <rect x="34" y="660" width="532" height="10" fill="#c9a86a"/><path d="M34 661 q14 -4 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" stroke="#3d2f24" stroke-width="4" fill="none"/>
      <rect x="34" y="670" width="532" height="12" fill="#7d7f78"/>${galets}

      <g id="branche">
        <path d="M300 398 C326 338 340 300 372 262" stroke="${C.bois[0]}" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="${BRANCHE}" stroke="${C.bois[2]}" stroke-width="24" fill="none" stroke-linecap="round"/>
        <path d="${BRANCHE}" stroke="${C.bois[0]}" stroke-width="20" fill="none" stroke-linecap="round"/>
        <path d="${BRANCHE}" stroke="${C.bois[1]}" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(-2 -5)" stroke-dasharray="60 14 110 10"/>
        <path d="${BRANCHE}" stroke="${C.bois[2]}" stroke-width="1.5" fill="none" transform="translate(1 4)" stroke-dasharray="26 40" opacity="0.7"/>
        <path id="branche-chemin" d="${BRANCHE}" fill="none" stroke="none"/>
        ${coussinMousse(206, 468, 20)}
        ${orchidee(372, 258, 15)}${orchidee(352, 290, 11)}${orchidee(392, 282, 9)}
      </g>
      ${cameleon()}

      <g id="plante-liane-d" class="pousse" data-o="476 60">${liane([476, 60, 540, 150, 498, 250], 22)}${liane([530, 60, 500, 110, 540, 170], 18)}</g>
      <g id="plante-liane-g" class="pousse" data-o="120 60">${liane([120, 60, 60, 120, 96, 190], 18)}</g>

      <g id="plante-fougere-g">${fougere(40, 664, 6, 118, 120, 4, C.fougere)}</g>
      <g id="plante-fougere-d">${fougere(572, 640, 5, 104, 100, -22, ['#357f4c', '#62ad5f'])}</g>
      <g id="pousse-tendre"><path d="M318 652 Q316 636 320 626" stroke="#9ad25f" stroke-width="2.5" fill="none" stroke-linecap="round"/>${feuille(320, 627, 15, 6, -150, '#b5e36f', '#d3f39a')}${feuille(320, 627, 15, 6, -30, '#b5e36f', '#d3f39a')}</g>
      ${dionee(398, 648)}
      ${champignon(452, 648, 13)}${champignon(470, 652, 8)}${champignon(438, 654, 6)}
      <g id="fourmiliere" class="hot" data-v="ecosysteme"><path d="M474 662 Q500 626 526 662Z" fill="#6b4a33"/><path d="M482 660 Q500 636 512 648" stroke="#8a6344" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="500" cy="647" rx="6" ry="3.5" fill="#22160f"/><g id="butin"><path d="M486 656 q8 -9 16 0 q-8 9 -16 0Z" fill="#9ad25f" opacity="0"/><circle cx="508" cy="658" r="5.5" fill="#7cc15b" opacity="0"/><circle cx="497" cy="664" r="5.5" fill="#8fdbe6" opacity="0"/></g></g>
      <path id="piste" d="${PISTE}" fill="none" stroke="none"/>
      <path id="piste-a" d="M500 654 C456 676 384 672 326 654" fill="none" stroke="none"/>
      <path id="piste-b" d="M500 654 C548 610 560 470 524 318" fill="none" stroke="none"/>
      <path id="piste-c" d="M500 654 C486 610 452 556 446 486" fill="none" stroke="none"/>
      <g id="fourmis">${fourmi('amb')}${fourmi('amb')}${fourmi('amb')}${fourmi('amb')}${fourmi('amb')}
        ${fourmi('eclaireuse e-a', '<g class="charge" opacity="0"><path d="M9 0 q8 -9 16 0 q-8 9 -16 0Z" fill="#9ad25f"/></g>')}
        ${fourmi('eclaireuse e-b', '<g class="charge" opacity="0"><circle cx="15" r="5.5" fill="#7cc15b"/><circle cx="16.5" cy="-1.5" r="2.2" fill="#c6ec8f"/></g>')}
        ${fourmi('eclaireuse e-c', '<g class="charge" opacity="0"><circle cx="15" r="5.5" fill="#8fdbe6"/><circle cx="13.5" cy="-1.5" r="1.8" fill="#ffffff"/></g>')}</g>
      ${scarabee()}
      
      ${papillon('papillon-1', '#f2a33a', '#e0662f')}${papillon('papillon-2', '#7fb4f0', '#4f7fd6')}
      <g id="mouche"><g id="mouche-in">
        <ellipse cx="-6.5" cy="-4.5" rx="6.5" ry="3.4" fill="#dff3fe" opacity="0.8" class="aile-m"/><ellipse cx="6.5" cy="-4.5" rx="6.5" ry="3.4" fill="#dff3fe" opacity="0.8" class="aile-m"/>
        <ellipse cx="0" cy="4.6" rx="3.8" ry="4.2" fill="#f6ffb1"/>
        <circle r="5.2" fill="#2b2b37"/>
        <path d="M-2.6 -5 q-1.6 -3 -3.4 -3.2 M2.6 -5 q1.6 -3 3.4 -3.2" stroke="#2b2b37" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        <circle cx="-2.3" cy="-0.9" r="2.2" fill="#fffffe"/><circle cx="2.3" cy="-0.9" r="2.2" fill="#fffffe"/>
        <g id="mouche-pupilles"><circle cx="-2.3" cy="-0.7" r="1.05" fill="#111112"/><circle cx="2.3" cy="-0.7" r="1.05" fill="#111112"/></g>
        <path d="M-1.5 2.4 q1.5 1.3 3 0" stroke="#fffffe" stroke-width="0.6" fill="none" stroke-linecap="round"/>
      </g></g>
      <g id="goutte-requete" opacity="0"><path d="M0 -15 C8 -5 11 2 11 7 A11 11 0 0 1 -11 7 C-11 2 -8 -5 0 -15Z" fill="#8a6a3a" stroke="#ffffff" stroke-width="2.5"/><circle cx="-3" cy="4" r="2.5" fill="#ffffff" opacity="0.7"/></g>
      <g id="chutes-feuilles">${feuillesTombantes()}</g>
      <g>${lucioles}</g>

      <rect x="34" y="60" width="532" height="622" fill="url(#g-verre)" pointer-events="none"/>
      <polygon points="120,60 190,60 60,360 34,330 34,240" fill="#ffffff" opacity="0.07" pointer-events="none"/>
      <polygon points="400,60 430,60 566,330 566,270" fill="#ffffff" opacity="0.05" pointer-events="none"/>
      <g pointer-events="none">${gouttes}</g>
    </g>
    <rect id="cadre" class="hot" data-v="bocal" x="34" y="60" width="532" height="622" rx="6" fill="none" stroke="#dff3ea" stroke-width="3" opacity="0.9" pointer-events="stroke"/>
    <rect id="cadre-lueur" x="34" y="60" width="532" height="622" rx="6" fill="none" stroke="#ffe08a" stroke-width="10" opacity="0" pointer-events="none"/>
    <g id="couvercle"><rect x="18" y="22" width="564" height="40" rx="14" fill="#22332e"/><g fill="#0f1a17"><rect x="210" y="36" width="36" height="6" rx="3"/><rect x="258" y="36" width="36" height="6" rx="3"/><rect x="306" y="36" width="36" height="6" rx="3"/><rect x="354" y="36" width="36" height="6" rx="3"/></g><rect x="18" y="22" width="564" height="10" rx="5" fill="#2f443d"/></g>
    <rect x="18" y="682" width="564" height="44" rx="14" fill="#22332e"/><rect x="18" y="682" width="564" height="8" fill="#2f443d"/>
    <g id="reperes" fill="none" stroke="#ffffff" stroke-width="2.5" pointer-events="none"></g>
  </svg>`;
  }

  // État de repos des habitants, commun au site et aux vidéos.
  function etatInitial(racine) {
    const qa = (s) => racine.querySelectorAll(s);
    gsap.set(qa('#grenouille-ondes, #scarabee, #goutte-requete'), { opacity: 0 });
    gsap.set(qa('#dionee-g, #dionee-d'), { rotation: -30, svgOrigin: '0 0' });
    gsap.set(qa('.cam-peau, .cam-oeil'), { fill: PEAU.vert[0] });
    gsap.set(qa('.cam-trait'), { stroke: PEAU.vert[0] });
    gsap.set(qa('.cam-trait2, .cam-raie, .cam-crete'), { stroke: PEAU.vert[1] });
    gsap.set(qa('.cam-ventre'), { fill: '#cfe9a0' });
    gsap.set(qa('.eclaireuse'), { opacity: 0 });
    gsap.set(qa('#cam-flip'), { scaleX: 1, svgOrigin: '0 0' });
  }

  // --- Vie du vivarium (site, en temps réel) ------------------------------------
  function animer(racine) {
    const q = (s) => racine.querySelector(s);
    const qa = (s) => racine.querySelectorAll(s);
    const calme = T.reduce;
    R = graine(23);

    // Chaque plante a son propre rythme.
    if (!calme) {
      qa('.sway').forEach((el) => {
        const amp = Number(el.dataset.amp) || 3;
        gsap.fromTo(el, { rotation: -amp, svgOrigin: el.dataset.o }, {
          rotation: amp, svgOrigin: el.dataset.o, duration: entre(2.6, 5.4), delay: -entre(0, 5),
          ease: 'sine.inOut', repeat: -1, yoyo: true,
        });
      });
      gsap.to(qa('.chute-fil path'), { strokeDashoffset: -96, duration: 0.9, ease: 'none', repeat: -1, stagger: 0.2 });
      gsap.to(qa('.courant'), { strokeDashoffset: -72, duration: 1.6, ease: 'none', repeat: -1 });
      gsap.to(qa('.courant.lent'), { strokeDashoffset: -86, duration: 2.6, ease: 'none', repeat: -1 });
      gsap.to(qa('.bulle'), { scale: 1.5, opacity: 0.4, transformOrigin: '50% 50%', duration: 0.5, stagger: { each: 0.13, repeat: -1, yoyo: true } });
      gsap.fromTo(qa('.ride'), { scale: 0.4, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3.2, opacity: 0, duration: 2.6, ease: 'power1.out', stagger: { each: 1.2, repeat: -1 } });
      gsap.to(q('#rayons'), { opacity: 0.55, duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      qa('.luciole').forEach((l) => {
        gsap.to(l, { x: () => entre(-34, 34), y: () => entre(-40, 40), duration: () => entre(4, 8), ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true });
        gsap.fromTo(l, { opacity: 0.15 }, { opacity: 0.95, duration: entre(0.9, 2.2), repeat: -1, yoyo: true, delay: entre(0, 3) });
      });

      // Papillons : les ailes battent, le vol erre.
      qa('.papillon').forEach((p, i) => {
        gsap.set(p, { x: i ? 150 : 380, y: i ? 200 : 250 });
        gsap.to(p.querySelectorAll('.aile'), { scaleX: 0.15, svgOrigin: '0 0', duration: 0.16, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        const voler = () => gsap.to(p, {
          x: entre(70, 530), y: entre(110, 430), rotation: entre(-25, 25), duration: entre(3, 6), ease: 'sine.inOut', onComplete: voler,
        });
        voler();
      });

      // La grenouille respire et cligne des yeux.
      gsap.to(q('#grenouille-gorge'), { scaleY: 1.5, scaleX: 1.15, transformOrigin: '50% 30%', duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(qa('.grenouille-yeux ellipse'), { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.09, repeat: -1, yoyo: true, repeatDelay: 3.4 });
      gsap.to(q('#grenouille-in'), { y: 1.5, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(q('.nenuphar'), { y: 1.5, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      // L'escargot avance très lentement.
      gsap.to(q('#escargot-in'), { x: 34, duration: 40, ease: 'none', repeat: -1, yoyo: true });
      gsap.to(q('#escargot-in'), { scaleX: 1.05, transformOrigin: '0% 100%', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    etatInitial(racine);

    // Les fourmis suivent leur piste.
    const marches = [...qa('.fourmi.amb')].map((a, i) => gsap.to(a, {
      motionPath: { path: '#piste', autoRotate: true },
      duration: 20, ease: 'none', repeat: -1, paused: calme,
    }).time(i * 4 + 0.01));
    const fourmisAmb = {
      pause() { marches.forEach((m) => m.pause()); },
      play() { if (!calme) marches.forEach((m) => m.play()); },
    };

    // La mouche tourne en rond dans les hauteurs.
    const mouche = q('#mouche');
    let moucheLibre = true;
    function errer() {
      if (!moucheLibre) return;
      gsap.to(mouche, { x: entre(330, 530), y: entre(100, 190), duration: entre(0.7, 1.6), ease: 'sine.inOut', onComplete: errer });
    }
    gsap.set(mouche, { x: 430, y: 150 });
    if (!calme) {
      gsap.to(qa('.aile-m'), { scaleY: 0.2, transformOrigin: '50% 100%', duration: 0.05, repeat: -1, yoyo: true });
      errer();
    }

    // Le caméléon se promène sur sa branche, s'arrête, regarde, fait demi-tour.
    const cam = q('#cam');
    const chemin = { path: '#branche-chemin', autoRotate: true };
    const pas = gsap.timeline({ repeat: -1, paused: true })
      .to('#cam-patte-av', { rotation: 16, svgOrigin: '24 -18', duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1 })
      .to('#cam-patte-ar', { rotation: -16, svgOrigin: '-18 -14', duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.45)
      .to('#cam-corps', { y: -1.6, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
    const regarder = (d) => gsap.timeline()
      .to('#cam-pupille', { rotation: -120, svgOrigin: '46 -36', duration: 0.5, ease: 'power2.inOut' })
      .to('#cam-pupille', { rotation: 60, svgOrigin: '46 -36', duration: 0.6, ease: 'power2.inOut' }, `+=${d * 0.3}`)
      .to('#cam-pupille', { rotation: 0, svgOrigin: '46 -36', duration: 0.5, ease: 'power2.inOut' }, `+=${d * 0.3}`);

    gsap.set(cam, { motionPath: { ...chemin, start: 0.2, end: 0.2 } });
    const balade = gsap.timeline({ repeat: -1, paused: calme })
      .call(() => pas.play())
      .to(cam, { motionPath: { ...chemin, start: 0.2, end: 0.66 }, duration: 15, ease: 'sine.inOut' })
      .call(() => pas.pause())
      .add(regarder(2))
      .to('#cam-flip', { scaleX: -1, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, '+=0.4')
      .call(() => pas.play())
      .to(cam, { motionPath: { ...chemin, autoRotate: 180, start: 0.66, end: 0.16 }, duration: 16, ease: 'sine.inOut' })
      .call(() => pas.pause())
      .add(regarder(1.5))
      .to('#cam-flip', { scaleX: 1, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, '+=0.4');
    if (calme) gsap.set(cam, { motionPath: { ...chemin, start: 0.45, end: 0.45 } });

    return {
      chemin, balade, pas, fourmisAmb,
      mouche: {
        liberer() { moucheLibre = true; gsap.set(mouche, { opacity: 1 }); if (!calme) errer(); },
        retenir() { moucheLibre = false; gsap.killTweensOf(mouche); },
      },
    };
  }

  T.art = {
    // Dessin seul : une chaîne SVG, calculable aussi en Node (sans DOM ni GSAP).
    svg,
    feuille,
    graine,
    PEAU,
    etatInitial,
    // Site : dessin + vie en temps réel.
    monter(conteneur) {
      conteneur.innerHTML = svg();
      const vie = animer(conteneur);
      return { svg: conteneur.querySelector('#vivarium'), ...vie, feuille, PEAU };
    },
  };
})();
