/*
 * « Le chemin vers le château » (décision 104) : fond 3D (Three.js, vrais volumes) d'une colline de conte de fées. La caméra avance
 * en continu (sans coupure) sur un chemin qui serpente jusqu'à la porte d'un château perché, passe sous la porte, un flash doré
 * recouvre l'écran, puis on repart du début (boucle parfaite). Quatre biomes se succèdent sans transition : forêt enchantée,
 * prairie fleurie, lac / pont / cascade, jardin royal. Le ciel, la lumière et le brouillard changent doucement du petit matin au
 * coucher de soleil. Les décors sont dans biomes3d-a.js, biomes3d-b.js et chateau3d.js (spec : production/SPEC-CHEMIN3D.md).
 * Tout est une fonction pure du temps global T (aucun hasard, aucune minuterie) ; les mouvements qui se répètent sont périodiques
 * sur L (durée publiée), sauf la progression de la caméra qui repart de zéro pendant le flash.
 *   creer(canvas, L, opts) → { maj(t) }     opts : { t0 (début de l'étage dans la vidéo), res: [l, h] ignoré (le canvas fixe la taille) }
 *   etat(T) → { s, lacet, courbure, vitesse } (pour caler le vol du hibou sur les virages)
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.chemin = api; if (racine.Avis.fond3d) racine.Avis.fond3d.chemin = api.creer; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // ---------- paramètres du voyage ----------
  const LEN = 345, HC = 46, LARG = 5;                 // longueur du chemin (m), hauteur du plateau du château, largeur du chemin
  const VC = 10.2, T0 = 0.4, RAMP = 2.2;              // vitesse de croisière (m/s), départ (fin de l'amorce), durée de la mise en vitesse
  const T_FLASH = [37.5, 37.95, 38.6];                // montée, pic (la caméra repart de zéro), fin du flash
  const ZONES = { foret: [0, 0.28], prairie: [0.28, 0.52], lac: [0.52, 0.76], jardin: [0.76, 1.0] };
  const S_RIV = 0.64, S_LAC = 0.60;                   // position de la rivière (pont) et du centre du lac le long du chemin
  const lis = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  const mix = (a, b, u) => a + (b - a) * u;
  const mod = (a, b) => ((a % b) + b) % b;
  const suite = (graine) => { let a = graine >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };
  // bruit de valeur 2D lisse, déterministe
  const h2 = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  const bruit = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
    return mix(mix(h2(i, j), h2(i + 1, j), a), mix(h2(i, j + 1), h2(i + 1, j + 1), a), b); };
  const fbm = (x, y) => 0.55 * bruit(x, y) + 0.3 * bruit(x * 2.1 + 7.3, y * 2.1 + 1.7) + 0.15 * bruit(x * 4.3 + 3.1, y * 4.3 + 9.4);

  // ---------- le chemin : s de 0 (départ) à 1 (porte), prolongé en ligne droite au-delà ----------
  const profil = (s) => { s = Math.min(1, Math.max(0, s)); return 0.18 * s + 0.82 * lis(0, 1, s) * (0.4 + 0.6 * lis(0, 1, s)); };
  const yAxe = (z) => HC * profil(-z / LEN);
  const xChemin = (s) => { const a = 24 * lis(0, 0.09, s) * (1 - lis(0.82, 0.985, s)); return a * Math.sin(2 * Math.PI * 1.8 * s); };
  const pointChemin = (s) => { const z = -LEN * s; return [xChemin(Math.min(s, 1)), yAxe(z), z]; };
  const tangente = (s) => { const e = 0.002, a = pointChemin(s - e), b = pointChemin(s + e), dx = b[0] - a[0], dz = b[2] - a[2], n = Math.hypot(dx, dz) || 1; return [dx / n, dz / n]; };
  const chemin = { longueur: LEN, point: pointChemin, tangente, largeur: LARG };
  // eau : rivière en travers du chemin (pont) et lac sur le côté gauche (cascade sur le versant d'amont)
  const zRiv = -LEN * S_RIV, zLac = -LEN * S_LAC;
  const EAU = {
    riviere: { z: zRiv, largeur: 12, niveau: yAxe(zRiv) - 3.0, fond: yAxe(zRiv) - 4.4, x0: -170, x1: 170 },
    lac: { cx: -95, cz: zLac, rx: 52, rz: 60, niveau: yAxe(zLac) - 2.6, fond: yAxe(zLac) - 6.0 },
  };
  // ---------- le terrain ----------
  function hauteur(x, z) {
    const s = -z / LEN, ax = yAxe(z), dx = Math.abs(x);
    let h = ax + 16 * lis(55, 150, dx) * (0.6 + 0.4 * fbm(x * 0.02 + 3, z * 0.02))                  // vallons de chaque côté
      - 40 * lis(25, 95, dx) * lis(0.72, 0.95, s)                                                    // la colline du château tombe de chaque côté
      + 1.1 * (fbm(x * 0.08, z * 0.08) - 0.5) * 2;                                                    // petites bosses
    const sp = Math.min(Math.max(s, 0), 1), xp = xChemin(sp), dist = Math.abs(x - xp);
    h = mix(h, ax, 1 - lis(4.5, 14, dist));                                                            // le sol est plat autour du chemin
    // rivière (lit creusé même sous le pont)
    const cr = Math.abs(z - EAU.riviere.z);
    h = mix(h, EAU.riviere.fond, 1 - lis(5.5, 14, cr));
    // lac (cuvette elliptique)
    const dl = Math.hypot((x - EAU.lac.cx) / EAU.lac.rx, (z - EAU.lac.cz) / EAU.lac.rz);
    const bed = EAU.lac.niveau - 3.4 * (1 - lis(0, 0.95, dl)) + 0.0;
    h = mix(h, Math.min(h, bed), 1 - lis(0.8, 1.5, dl));
    // plateau du château
    const dp = Math.max(Math.abs(x) / 46, Math.abs(z + LEN + 34) / 62);
    h = mix(h, HC, 1 - lis(0.85, 1.55, dp));
    return h;
  }
  // ---------- ciel, lumière : couleurs en fonction de s ----------
  const C = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
  const TOD = [
    { s: 0.00, haut: C(0x3f4a9e), milieu: C(0x8f88cc), hor: C(0xffc7ae), brume: C(0xc4d4dc), soleil: C(0xffd2a6), hS: C(0xa9c4ff), hG: C(0x3f6b5a), hI: 0.85, sI: 1.0, near: 18, far: 430, mont: C(0x8b86c8) },
    { s: 0.38, haut: C(0x5b86e0), milieu: C(0xaecbf6), hor: C(0xffe8d0), brume: C(0xf6e3f1), soleil: C(0xfff0cf), hS: C(0xbcd4ff), hG: C(0x6a9a5a), hI: 0.95, sI: 1.0, near: 50, far: 720, mont: C(0xa8a0dc) },
    { s: 0.64, haut: C(0x3b8cea), milieu: C(0x8ccaf6), hor: C(0xd8f2ff), brume: C(0xd0e9f6), soleil: C(0xfff6df), hS: C(0xc4e2ff), hG: C(0x5a9a7a), hI: 1.0, sI: 1.05, near: 60, far: 800, mont: C(0x9db4e6) },
    { s: 0.86, haut: C(0x5a4fb2), milieu: C(0xe68fc2), hor: C(0xffca8c), brume: C(0xf3c8c2), soleil: C(0xffc58a), hS: C(0xf0b8d8), hG: C(0x6a7a5a), hI: 0.95, sI: 1.1, near: 45, far: 760, mont: C(0xb58ad0) },
    { s: 1.00, haut: C(0x36298c), milieu: C(0xc4519f), hor: C(0xff9a6a), brume: C(0xe8a0a8), soleil: C(0xffb070), hS: C(0xe8a0d0), hG: C(0x6a6a5a), hI: 0.9, sI: 1.15, near: 40, far: 720, mont: C(0xa070c0) },
  ];
  const tod = (s) => {
    s = Math.min(1, Math.max(0, s)); let i = 0; while (i + 2 < TOD.length && s > TOD[i + 1].s) i += 1;
    const a = TOD[i], b = TOD[i + 1], u = lis(0, 1, (s - a.s) / (b.s - a.s)), r = { };
    Object.keys(a).forEach((k) => { r[k] = Array.isArray(a[k]) ? a[k].map((v, j) => mix(v, b[k][j], u)) : mix(a[k], b[k], u); });
    return r;
  };
  // ---------- la progression de la caméra ----------
  // distance parcourue d(T) (mètres) : immobile pendant l'amorce, mise en vitesse douce, croisière, puis le flash remet tout à zéro.
  const distance = (T) => {
    if (T >= T_FLASH[1]) return 0;
    const tau = T - T0; if (tau <= 0) return 0;
    return tau < RAMP ? 0.5 * (VC / RAMP) * tau * tau : VC * (tau - RAMP / 2);
  };
  function etat(T) {
    const d = distance(T), s = d / LEN, tg = tangente(Math.min(s, 1)), tg2 = tangente(Math.min(s + 12 / LEN, 1));
    const lacet = Math.atan2(tg[0], -tg[1]), lacet2 = Math.atan2(tg2[0], -tg2[1]);
    return { s, lacet, courbure: (lacet2 - lacet) / (12 / VC), vitesse: d > 0 ? VC : 0 };
  }

  // ---------- la scène ----------
  function creer(canvas, L, opts) {
    opts = opts || {}; L = opts.L || L;   // période de la boucle : la durée publiée globale, pas celle de l'étage
    const W = canvas.width, H = canvas.height, T0g = opts.t0 || 0;
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(W, H, false);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(62, W / H, 0.3, 3000);
    sc.add(cam);
    sc.fog = new THREE.Fog(0xffffff, 40, 700);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x446644, 0.9), soleil = new THREE.DirectionalLight(0xffffff, 1.0), fill = new THREE.DirectionalLight(0xfff0e0, 0.55);
    soleil.position.set(40, 90, -420); sc.add(soleil); sc.add(soleil.target); soleil.target.position.set(0, 0, -200);
    sc.add(hemi); sc.add(fill); sc.add(fill.target);

    // -- terrain (facettes) --
    const NX = 116, NZ = 190, X0 = -175, X1 = 175, Z0 = -LEN - 125, Z1 = 70;
    const hg = []; for (let k = 0; k <= NZ; k += 1) { const row = []; for (let i = 0; i <= NX; i += 1) row.push(hauteur(X0 + (X1 - X0) * i / NX, Z0 + (Z1 - Z0) * k / NZ)); hg.push(row); }
    const palette = (s, x, z, h, pente) => {
      const n = fbm(x * 0.05, z * 0.05), n2 = bruit(x * 0.3, z * 0.3);
      // couleur d'herbe par biome, mélangée en continu
      const g = [
        [C(0x2f7a62), C(0x3f9a6a)],        // forêt : mousse et sous-bois
        [C(0x86d36a), C(0xa6e47e)],        // prairie : vert printemps
        [C(0x4fae76), C(0x72c98a)],        // lac : vert frais
        [C(0x6cc06a), C(0x8fd882)],        // jardin : pelouse soignée
      ];
      const ss = Math.min(1, Math.max(0, s)), kf = [0.28, 0.52, 0.76];
      let w = [lis(kf[0] - 0.05, kf[0] + 0.05, ss), lis(kf[1] - 0.05, kf[1] + 0.05, ss), lis(kf[2] - 0.05, kf[2] + 0.05, ss)];
      const ws = [1 - w[0], w[0] * (1 - w[1]), w[0] * w[1] * (1 - w[2]), w[0] * w[1] * w[2]];
      let c = [0, 0, 0];
      for (let b = 0; b < 4; b += 1) for (let j = 0; j < 3; j += 1) c[j] += ws[b] * mix(g[b][0][j], g[b][1][j], n);
      const roc = lis(0.45, 0.9, pente) * 0.9;
      c = c.map((v, j) => mix(v, [0.52, 0.46, 0.5][j], roc) * (0.82 + 0.16 * n2));
      const sable = 1 - lis(0, 0.7, Math.abs(h - (EAU.riviere.niveau + 0.3)) / 1.2) * 0 ;
      void sable;
      return c;
    };
    const tp = [], tc = [];
    const pushTri = (a, b, c3) => [a, b, c3].forEach((p) => { tp.push(p[0], p[1], p[2]); tc.push(p[3], p[4], p[5]); });
    const vert = (i, k) => { const x = X0 + (X1 - X0) * i / NX, z = Z0 + (Z1 - Z0) * k / NZ, y = hg[k][i];
      const pente = Math.min(1, Math.hypot((hg[k][Math.min(i + 1, NX)] - hg[k][Math.max(i - 1, 0)]) / 6, (hg[Math.min(k + 1, NZ)][i] - hg[Math.max(k - 1, 0)][i]) / 6) / 0.9);
      let c = palette(-z / LEN, x, z, y, pente);
      // le plateau du château : pierre claire et herbe
      const dp = Math.max(Math.abs(x) / 46, Math.abs(z + LEN + 34) / 62); const pl = 1 - lis(0.4, 0.85, dp);
      c = c.map((v, j) => mix(v, [0.9, 0.84, 0.8][j], pl * 0.55));
      // sable et galets sous l'eau
      if (y < EAU.riviere.niveau + 0.6 && Math.abs(z - EAU.riviere.z) < 16) c = c.map((v, j) => mix(v, [0.78, 0.72, 0.55][j], 0.75));
      const dl = Math.hypot((x - EAU.lac.cx) / EAU.lac.rx, (z - EAU.lac.cz) / EAU.lac.rz);
      if (dl < 1.12 && y < EAU.lac.niveau + 0.7) c = c.map((v, j) => mix(v, [0.74, 0.7, 0.56][j], 0.7));
      return [x, y, z, c[0], c[1], c[2]];
    };
    for (let k = 0; k < NZ; k += 1) for (let i = 0; i < NX; i += 1) {
      const a = vert(i, k), b = vert(i + 1, k), c3 = vert(i, k + 1), d = vert(i + 1, k + 1);
      if ((i + k) % 2) { pushTri(a, c3, b); pushTri(b, c3, d); } else { pushTri(a, c3, d); pushTri(a, d, b); }
    }
    const gt = new THREE.BufferGeometry(); gt.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); gt.setAttribute('color', new THREE.Float32BufferAttribute(tc, 3)); gt.computeVertexNormals();
    sc.add(new THREE.Mesh(gt, new THREE.MeshLambertMaterial({ vertexColors: true })));

    // -- le ruban du chemin (le tablier du pont en fait partie) --
    const NS = Math.round(LEN * 1.12 / 1.5), rp = [], rc = [], ri = [];
    const matPierre = (s, u, x) => {
      const n = bruit(s * 400, u * 3 + 5);
      const cl = [C(0xc9a46a), C(0xefd6a6), C(0xb9b8c8), C(0xf3e6cc), C(0xfff0d0)];
      const kf = [0.28, 0.52, 0.76];
      const w = [lis(kf[0] - 0.04, kf[0] + 0.04, s), lis(kf[1] - 0.04, kf[1] + 0.04, s), lis(kf[2] - 0.04, kf[2] + 0.04, s)];
      const ws = [1 - w[0], w[0] * (1 - w[1]), w[0] * w[1] * (1 - w[2]), w[0] * w[1] * w[2]];
      const c = [0, 0, 0]; for (let b = 0; b < 4; b += 1) for (let j = 0; j < 3; j += 1) c[j] += ws[b] * cl[b][j];
      const bord = lis(0.55, 1, Math.abs(u)); const f = (0.78 + 0.1 * n) * (1 - 0.2 * bord);
      void x; return c.map((v) => v * f);
    };
    for (let k = 0; k <= NS; k += 1) {
      const s = Math.min(k / NS * 1.12, 1.12), p = pointChemin(s), tg = tangente(Math.min(s, 1)), nx = -tg[1], nz = tg[0];
      for (let j = -2; j <= 2; j += 1) {
        const u = j / 2, ofs = u * (LARG / 2 + 0.25 * Math.abs(u)), c = matPierre(Math.min(s, 1), u, p[0]);
        const x = p[0] + nx * ofs, z = p[2] + nz * ofs; rp.push(x, p[1] + 0.06 + 0.04 * (1 - Math.abs(u)), z); rc.push(c[0], c[1], c[2]);
      }
      if (k < NS) for (let j = 0; j < 4; j += 1) { const a = k * 5 + j, b = a + 1, c2 = a + 5, d = c2 + 1; ri.push(a, c2, b, b, c2, d); }
    }
    const gr = new THREE.BufferGeometry(); gr.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); gr.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3)); gr.setIndex(ri); gr.computeVertexNormals();
    sc.add(new THREE.Mesh(gr, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));

    // -- ciel (dôme dégradé + soleil), montagnes lointaines, nuages --
    const U = { uHaut: { value: new THREE.Color() }, uMilieu: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSol: { value: new THREE.Color() }, uSolDir: { value: new THREE.Vector3(0.05, 0.1, -1).normalize() } };
    const ciel = new THREE.Mesh(new THREE.SphereGeometry(2200, 32, 20), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 uHaut, uMilieu, uHor, uSol, uSolDir; varying vec3 vD;
        void main(){ float y = clamp(vD.y, -0.2, 1.0);
          vec3 c = mix(uHor, uMilieu, smoothstep(0.0, 0.32, y)); c = mix(c, uHaut, smoothstep(0.25, 0.85, y));
          float s = max(dot(normalize(vD), normalize(uSolDir)), 0.0);
          c += uSol * (pow(s, 6.0) * 0.28 + pow(s, 40.0) * 0.45 + pow(s, 600.0) * 1.1);
          c += uSol * 0.18 * pow(1.0 - abs(y), 6.0);
          gl_FragColor = vec4(c, 1.0); }` }));
    ciel.renderOrder = -10; ciel.frustumCulled = false; sc.add(ciel);
    const ring = new THREE.Group(), rn = suite(77), mp = [], mcol = [];
    for (let k = 0; k < 44; k += 1) {
      const a = (k / 44) * 2 * Math.PI, R = 1500 + rn() * 300, w = 330 + rn() * 260, h = 150 + rn() * 260, cx = Math.sin(a) * R, cz = -LEN / 2 - Math.cos(a) * R;
      const px = [-w, 0, w, -w * 0.3, w * 0.35], tri = [[0, 1, 3], [3, 1, 2], [3, 2, 4], [0, 3, 3]];
      void px; void tri;
      // montagne : pyramide à 4 faces
      const top = [cx, h, cz], base = [[cx - w, -40, cz - w], [cx + w, -40, cz - w], [cx + w, -40, cz + w], [cx - w, -40, cz + w]];
      for (let f = 0; f < 4; f += 1) { const b1 = base[f], b2 = base[(f + 1) % 4]; [top, b1, b2].forEach((p, j) => { mp.push(p[0], p[1], p[2]); const v = j === 0 ? 1.0 : 0.72; mcol.push(v, v, v); }); }
    }
    const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(mp, 3)); gm.setAttribute('color', new THREE.Float32BufferAttribute(mcol, 3));
    const matMont = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }); const monts = new THREE.Mesh(gm, matMont); monts.frustumCulled = false; ring.add(monts); sc.add(ring);
    const nuages = [], matNuage = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, fog: false, depthWrite: false });
    const rc2 = suite(311);
    for (let k = 0; k < 16; k += 1) {
      const g = new THREE.Group(), n = 3 + Math.floor(rc2() * 3);
      for (let j = 0; j < n; j += 1) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), matNuage); const sx = 24 + rc2() * 26; m.scale.set(sx, 9 + rc2() * 8, 14 + rc2() * 12); m.position.set((j - n / 2) * 26 + rc2() * 10, rc2() * 6, rc2() * 14); g.add(m); }
      g.userData = { x0: -800 + rc2() * 1600, y: 170 + rc2() * 150, z: -80 - rc2() * 900, k: 1 + (k % 3) };
      nuages.push(g); sc.add(g);
    }

    // -- biomes, château, flash --
    const biomes = [];
    const ctxBase = { THREE, rng: suite, L, hauteur, chemin, eau: EAU };
    Object.keys(ZONES).forEach((nom, i) => {
      const B = racine_biomes()[nom];
      if (!B) return;
      const b = B.creer(Object.assign({}, ctxBase, { zone: ZONES[nom], graine: 1000 + 97 * i, rng: suite }));
      sc.add(b.group); biomes.push(b);
    });
    let chateau = null;
    const CH = (typeof self !== 'undefined' ? self : this).Avis && (typeof self !== 'undefined' ? self : this).Avis.chateau3d;
    if (CH) { chateau = CH.creer({ THREE, rng: suite, L, graine: 4242 }); chateau.group.position.set(0, HC, -LEN); sc.add(chateau.group); }
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xfff0b8, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
    flash.position.set(0, 0, -0.6); flash.renderOrder = 999; flash.frustumCulled = false; cam.add(flash);

    const vers = new THREE.Vector3(), cp = new THREE.Vector3();
    const tmp = new THREE.Color();
    function maj(t) {
      const T = T0g + t, d = distance(T), s = d / LEN, K = tod(Math.min(s, 1));
      // caméra : à 2,4 m au-dessus du chemin, regarde 14 m devant ; léger balancement (périodique)
      const ph = 2 * Math.PI * T / L, p = pointChemin(Math.min(s, 1.2));
      const sa = s + 15 / LEN, pa = pointChemin(sa), bal = 0.12 * Math.sin(ph * 14);
      cp.set(p[0] + 0.3 * Math.sin(ph * 9), p[1] + 2.5 + bal, p[2]);
      const cible = s > 1 ? [0, HC + 3.2, -LEN - 60] : [pa[0], pa[1] + 1.3, pa[2]];
      cam.position.copy(cp); vers.set(cible[0], cible[1], cible[2]); cam.lookAt(vers);
      cam.rotateZ(-0.05 * Math.sin(ph * 5 + 1) - 0.4 * etat(T).courbure);
      // ciel, lumière, brouillard
      tmp.setRGB(...K.brume); sc.fog.color.copy(tmp); sc.fog.near = K.near; sc.fog.far = K.far; r.setClearColor(tmp);
      U.uHaut.value.setRGB(...K.haut); U.uMilieu.value.setRGB(...K.milieu); U.uHor.value.setRGB(...K.hor); U.uSol.value.setRGB(...K.soleil);
      ciel.position.copy(cp);
      hemi.color.setRGB(...K.hS); hemi.groundColor.setRGB(...K.hG); hemi.intensity = K.hI * 0.72;
      soleil.color.setRGB(...K.soleil); soleil.intensity = K.sI * 0.68;
      fill.position.set(cp.x - 30 * Math.sin(etat(T).lacet), cp.y + 25, cp.z + 30 * Math.cos(etat(T).lacet)); fill.target.position.copy(cp); fill.color.setRGB(...K.soleil); fill.intensity = 0.26;
      matMont.color.setRGB(...K.mont);
      nuages.forEach((g) => { const u = g.userData; g.position.set(mod(u.x0 + 1600 * u.k * T / L, 1600) - 800, u.y, u.z); });
      matNuage.color.setRGB(mix(1, K.hor[0], 0.35), mix(1, K.hor[1], 0.35), mix(1, K.hor[2], 0.35));
      biomes.forEach((b) => b.maj(T, s));
      if (chateau) { chateau.setPorte(lis(0, 1, (T - 34.0) / 1.8)); chateau.setLueur(lis(0, 1, (T - 34.6) / 2.6)); chateau.maj(T); }
      const f = T < T_FLASH[0] ? 0 : T < T_FLASH[1] ? lis(T_FLASH[0], T_FLASH[1], T) : 1 - lis(T_FLASH[1], T_FLASH[2], T);
      flash.material.opacity = 0.97 * f;
      r.render(sc, cam);
    }
    maj(0);
    return { maj, camera: cam };
  }
  function racine_biomes() { const R = typeof self !== 'undefined' ? self : this; return (R.Avis && R.Avis.biomes3d) || {}; }
  return { creer, etat, hauteur, pointChemin, tangente, EAU, ZONES, LEN, HC, T_FLASH, VC };
});
