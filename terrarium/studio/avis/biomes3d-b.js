/*
 * « Le chemin vers le château » : biomes 3D du milieu et de la fin du voyage (spec : production/SPEC-CHEMIN3D.md).
 *   lac    [0,52 → 0,76] : après-midi lumineux, rivière sous un pont de pierre en arche, cascade et arc-en-ciel, cygnes, nénuphars, saules.
 *   jardin [0,76 → 1,00] : coucher de soleil, jardin royal (haies, topiaires, arches de roses, fontaine, lampadaires, bannières) puis allée solennelle.
 * Chaque biome : creer(ctx) → { group, maj(T, sCam) }. Tout est déterministe : l'aléa vient de ctx.rng, les mouvements sont des
 * fonctions pures de T, périodiques sur ctx.L (nombre entier de cycles). Les décors fixes sont fusionnés par carreaux de terrain
 * (peu d'appels de dessin, élimination hors champ) ; les objets répétés qui bougent sont des InstancedMesh.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.biomes3d = Object.assign(racine.Avis.biomes3d || {}, api); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI, PI2 = Math.PI * 2;
  const borne = (x, a, b) => Math.min(b, Math.max(a, x));
  const lis = (a, b, x) => { x = borne((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const mix = (a, b, u) => a + (b - a) * u;
  const fr = (x) => x - Math.floor(x);
  const hs = (x) => fr(Math.sin(x * 12.9898) * 43758.5453);
  const K = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
  const mc = (a, b, u) => [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
  const tn = (c, f) => [c[0] * f, c[1] * f, c[2] * f];

  /*
   * Boîte à outils : primitives à facettes, collecteurs de sommets par carreau de terrain, tubes, triangles orientés.
   * Un « collecteur » est { P: positions, C: couleurs } ; chaque carreau en a trois : pl (Lambert, faces avant), pd (Lambert, double face),
   * ba (MeshBasic, éléments lumineux).
   */
  function outils(ctx, CS) {
    const TH = ctx.THREE;
    const eu = new TH.Euler(), qu = new TH.Quaternion(), m4 = new TH.Matrix4(), p3 = new TH.Vector3(), s3 = new TH.Vector3();
    const cache = {};
    const plat = (g) => { const n = g.index ? g.toNonIndexed() : g; const p = n.attributes.position.array; let y0 = 1e9, y1 = -1e9; for (let i = 1; i < p.length; i += 3) { y0 = Math.min(y0, p[i]); y1 = Math.max(y1, p[i]); } return { p, y0, y1 }; };
    // primitives : « base » posées sur y = 0 (boîte, cylindre/cône), « centre » centrées (sphère, octaèdre)
    const pr = (nom, a, b) => {
      const k = nom + ':' + a + ':' + b; if (cache[k]) return cache[k];
      let g;
      if (nom === 'box') { g = new TH.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); }
      else if (nom === 'cyl') { g = new TH.CylinderGeometry(b === undefined ? 1 : b, 1, 1, a, 1); g.translate(0, 0.5, 0); }
      else if (nom === 'sph') g = new TH.IcosahedronGeometry(1, a || 0);
      else if (nom === 'oct') g = new TH.OctahedronGeometry(1, 0);
      else if (nom === 'disc') { g = new TH.CircleGeometry(1, a || 8); g.rotateX(-PI / 2); }
      else if (nom === 'pad') { g = new TH.CircleGeometry(1, 10, 0.5, PI2 - 0.55); g.rotateX(-PI / 2); }
      else if (nom === 'ring') { g = new TH.RingGeometry(0.82, 1, a || 24); g.rotateX(-PI / 2); }
      else if (nom === 'dome') { g = new TH.SphereGeometry(1, a || 8, 4, 0, PI2, 0, PI / 2); }
      return (cache[k] = plat(g));
    };
    const cells = {};
    const cell = (x, z) => { const k = Math.floor(x / CS) + ',' + Math.floor(z / CS); return cells[k] || (cells[k] = { pl: { P: [], C: [] }, pd: { P: [], C: [] }, ba: { P: [], C: [] } }); };
    // pose une primitive (position, échelle, rotation, couleur, dégradé facultatif, vacillement de teinte par facette)
    function A(d, p, x, y, z, sx, sy, sz, ry, col, o) {
      o = o || {};
      eu.set(o.rx || 0, ry || 0, o.rz || 0, 'YXZ'); qu.setFromEuler(eu); p3.set(x, y, z); s3.set(sx, sy, sz); m4.compose(p3, qu, s3);
      const m = m4.elements, q = p.p, c2 = o.c2, jt = o.j == null ? 0.07 : o.j, dy = p.y1 - p.y0 || 1, PP = d.P, CC = d.C;
      for (let i = 0; i < q.length; i += 9) {
        const f = 1 + jt * (hs(i * 0.173 + x * 1.31 + z * 2.17 + y * 0.7) * 2 - 1);
        for (let k = 0; k < 9; k += 3) {
          const a = q[i + k], b = q[i + k + 1], c = q[i + k + 2];
          PP.push(m[0] * a + m[4] * b + m[8] * c + m[12], m[1] * a + m[5] * b + m[9] * c + m[13], m[2] * a + m[6] * b + m[10] * c + m[14]);
          if (c2) { const t = (b - p.y0) / dy; CC.push((col[0] + (c2[0] - col[0]) * t) * f, (col[1] + (c2[1] - col[1]) * t) * f, (col[2] + (c2[2] - col[2]) * t) * f); }
          else CC.push(col[0] * f, col[1] * f, col[2] * f);
        }
      }
    }
    const pl = (p, x, y, z, sx, sy, sz, ry, col, o) => A(cell(x, z).pl, p, x, y, z, sx, sy, sz, ry, col, o);
    const pd = (p, x, y, z, sx, sy, sz, ry, col, o) => A(cell(x, z).pd, p, x, y, z, sx, sy, sz, ry, col, o);
    const ba = (p, x, y, z, sx, sy, sz, ry, col, o) => A(cell(x, z).ba, p, x, y, z, sx, sy, sz, ry, col, Object.assign({ j: 0 }, o || {}));
    // triangle orienté : la normale doit regarder du côté de « dir » (vecteur), sinon on inverse
    function tri(d, a, b, c, ca, cb, cc, dir) {
      if (dir) {
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        if (nx * dir[0] + ny * dir[1] + nz * dir[2] < 0) { const t = b; b = c; c = t; const u = cb; cb = cc; cc = u; }
      }
      d.P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      d.C.push(ca[0], ca[1], ca[2], cb[0], cb[1], cb[2], cc[0], cc[1], cc[2]);
    }
    const quad = (d, a, b, c, e, ca, cb, cc, ce, dir) => { tri(d, a, b, c, ca, cb, cc, dir); tri(d, a, c, e, ca, cc, ce, dir); };
    // tube le long d'une ligne brisée (n côtés ; 2 côtés = ruban plat ; r et col peuvent être des fonctions de t)
    function tube(d, pts, r, col, o) {
      o = o || {}; const n = o.n || 4, ref = o.ref || [0, 1, 0], N = pts.length, ring = [];
      for (let i = 0; i < N; i += 1) {
        const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, N - 1)];
        let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2]; const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        let nx = ty * ref[2] - tz * ref[1], ny = tz * ref[0] - tx * ref[2], nz = tx * ref[1] - ty * ref[0]; let nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-3) { nx = 1; ny = 0; nz = 0; nl = 1; } nx /= nl; ny /= nl; nz /= nl;
        const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx, t = i / (N - 1), rr = typeof r === 'function' ? r(t) : r;
        const cl = typeof col === 'function' ? col(t, i) : col, row = [];
        for (let k = 0; k < n; k += 1) {
          const a2 = (k / n) * PI2 + (o.rot || 0), ca = Math.cos(a2) * rr, sa = Math.sin(a2) * rr;
          row.push({ p: [pts[i][0] + nx * ca + bx * sa, pts[i][1] + ny * ca + by * sa, pts[i][2] + nz * ca + bz * sa], c: cl, o: [nx * Math.cos(a2) + bx * Math.sin(a2), ny * Math.cos(a2) + by * Math.sin(a2), nz * Math.cos(a2) + bz * Math.sin(a2)] });
        }
        ring.push(row);
      }
      const dest = o.dest || (typeof d === 'function' ? d : () => d);
      for (let i = 0; i < N - 1; i += 1) for (let k = 0; k < n; k += 1) {
        const k2 = (k + 1) % n; if (n === 2 && k === 1) break;
        const a = ring[i][k], b = ring[i + 1][k], c = ring[i + 1][k2], e = ring[i][k2], dest2 = dest(a.p);
        if (n === 2) { quad(dest2, a.p, b.p, c.p, e.p, a.c, b.c, c.c, e.c); quad(dest2, a.p, e.p, c.p, b.p, a.c, e.c, c.c, b.c); }
        else quad(dest2, a.p, b.p, c.p, e.p, a.c, b.c, c.c, e.c, a.o);
      }
    }
    // géométrie à partir d'un collecteur
    const geo = (d, normales) => { const g = new TH.BufferGeometry(); g.setAttribute('position', new TH.Float32BufferAttribute(d.P, 3)); g.setAttribute('color', new TH.Float32BufferAttribute(d.C, 3)); if (normales !== false) g.computeVertexNormals(); return g; };
    const matL = new TH.MeshLambertMaterial({ vertexColors: true });
    const matD = new TH.MeshLambertMaterial({ vertexColors: true, side: TH.DoubleSide });
    const matB = new TH.MeshBasicMaterial({ vertexColors: true });
    let tris = 0;
    // construit les maillages fixes dans « groupe »
    function construire(groupe) {
      Object.keys(cells).sort().forEach((k) => {
        const c = cells[k];
        [['pl', matL], ['pd', matD], ['ba', matB]].forEach(([t, mat]) => {
          if (!c[t].P.length) return;
          const m = new TH.Mesh(geo(c[t], t !== 'ba'), mat); tris += c[t].P.length / 9; groupe.add(m);
        });
      });
      return tris;
    }
    // maillage instancié (géométrie issue d'un collecteur), n instances ; set(i, x, y, z, rx, ry, rz, sx, sy, sz)
    function inst(d, mat, n) {
      const m = new TH.InstancedMesh(geo(d, mat.type !== 'MeshBasicMaterial'), mat, n); m.frustumCulled = false;
      const set = (i, x, y, z, rx, ry, rz, sx, sy, sz) => { eu.set(rx, ry, rz, 'YXZ'); qu.setFromEuler(eu); p3.set(x, y, z); s3.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); m4.compose(p3, qu, s3); m.setMatrixAt(i, m4); };
      const clr = new TH.Color();
      const col = (i, c) => { clr.setRGB(c[0], c[1], c[2]); m.setColorAt(i, clr); };
      m.userData.tris = d.P.length / 9 * n;
      return { mesh: m, set, col, fin: () => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } };
    }
    const compte = () => { let n = 0; Object.keys(cells).forEach((k) => { const c = cells[k]; n += (c.pl.P.length + c.pd.P.length + c.ba.P.length) / 9; }); return n; };
    const etapes = {}; let dernier = 0;
    const etape = (nom) => { const n = compte(); etapes[nom] = Math.round(n - dernier); dernier = n; };
    return { pr, cell, A, pl, pd, ba, tri, quad, tube, geo, construire, inst, matL, matD, matB, TH, etape, etapes, get tris() { return tris; } };
  }

  // chemin : placement par abscisse s et décalage latéral l (l > 0 : à droite en regardant vers l'avant)
  function reperes(ctx) {
    const pc = ctx.chemin, H = ctx.hauteur, LEN = pc.longueur;
    const place = (s, l) => { s = borne(s, 0, 1); const p = pc.point(s), t = pc.tangente(s), x = p[0] - t[1] * l, z = p[2] + t[0] * l; return [x, H(x, z), z, t]; };
    // décalage latéral d'un point (x, z) par rapport à la ligne centrale (le chemin est paramétré par z : s = −z / longueur)
    const lat = (x, z) => { const s = borne(-z / LEN, 0, 1), p = pc.point(s), t = pc.tangente(s); return -(x - p[0]) * t[1]; };
    const yAxe = (z) => pc.point(borne(-z / LEN, 0, 1))[1];
    return { place, lat, yAxe, LEN };
  }

  // ==========================================================================================================
  //  LAC, PONT ET CASCADE
  // ==========================================================================================================
  const VS_EAU = `attribute float rim; varying float vRim; varying vec3 vW;
    #include <fog_pars_vertex>
    void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vRim = rim; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`;
  const FS_EAU = `uniform float uPh; uniform vec3 uDeep, uShal, uSky; varying float vRim; varying vec3 vW;
    #include <fog_pars_fragment>
    void main(){
      vec3 V = normalize(cameraPosition - vW);
      float fre = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
      vec3 c = mix(uDeep, uShal, smoothstep(0.05, 0.95, vRim));
      float a1 = sin(vW.x * 3.3 + vW.z * 1.9 + 7.0 * uPh);
      float a2 = sin(vW.x * -2.1 + vW.z * 3.9 - 9.0 * uPh + 1.3);
      float a3 = sin(vW.x * 6.1 - vW.z * 4.7 + 13.0 * uPh);
      float sp = smoothstep(2.05, 2.55, a1 + a2 + 0.8 * a3);
      float bd = smoothstep(0.55, 1.0, sin(vW.z * 0.7 + 0.8 * sin(vW.x * 0.19 + 2.0 * uPh) + 3.0 * uPh) * sin(vW.x * 0.33 - 2.0 * uPh + 0.8 * sin(vW.z * 0.21)));
      c = mix(c, uSky, fre * 0.5 + bd * 0.22);
      c += sp * vec3(0.9, 0.96, 1.0) * 0.5;
      gl_FragColor = vec4(c, 1.0);
    #include <fog_fragment>
    }`;
  const VS_CHUTE = `attribute float ph; varying vec2 vUv; varying float vPh;
    #include <fog_pars_vertex>
    void main(){ vUv = uv; vPh = ph; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`;
  const FS_CHUTE = `uniform float uPh; varying vec2 vUv; varying float vPh;
    #include <fog_pars_fragment>
    void main(){
      float w1 = sin(vUv.y * 2.4 - 62.0 * uPh + vPh) * 0.5 + 0.5;
      float w2 = sin(vUv.y * 5.1 + vUv.x * 9.0 - 135.0 * uPh + vPh * 2.0) * 0.5 + 0.5;
      float foam = smoothstep(0.52, 0.92, 0.55 * w1 + 0.45 * w2);
      vec3 c = mix(vec3(0.50, 0.80, 0.96), vec3(0.97, 0.99, 1.0), foam);
      float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(0.0, 0.2, 1.0 - vUv.x);
      gl_FragColor = vec4(c, (0.80 + 0.18 * foam) * edge);
    #include <fog_fragment>
    }`;
  const VS_ARC = `attribute float al; attribute vec3 col; varying float vA; varying vec3 vC;
    void main(){ vA = al; vC = col; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const FS_ARC = `varying float vA; varying vec3 vC; void main(){ gl_FragColor = vec4(vC, vA); }`;

  const lac = {
    creer(ctx) {
      const TH = ctx.THREE, H = ctx.hauteur, pc = ctx.chemin, L = ctx.L, eau = ctx.eau, R = ctx.rng(ctx.graine);
      const S = outils(ctx, 36), W = reperes(ctx), place = W.place, lat = W.lat;
      const group = new TH.Group();
      const zR = eau.riviere.z, nR = eau.riviere.niveau, LK = eau.lac, nL = LK.niveau;
      const sB = -zR / pc.longueur, s0 = ctx.zone[0] - 0.03, s1 = ctx.zone[1] + 0.03;
      const xpR = pc.point(sB)[0];
      const uPh = { value: 0 };
      const rr = (a, b) => a + (b - a) * R();
      const pick = (arr) => arr[Math.floor(R() * arr.length) % arr.length];
      const IC = (v) => v; // identité (lisibilité)

      // ---------- palette : après-midi frais, pastels saturés ----------
      const C = {
        herbe: [K(0x5fbf6a), K(0x7fd870), K(0x4aa862)], feuille: [K(0x6cc86a), K(0x8ad66c), K(0xa5e06a)], saule: [K(0x9ed35a), K(0xb6e063), K(0x86c657)],
        bouleauF: [K(0xb5e06a), K(0xd2ea72), K(0x9ed86c)], ecorce: K(0x6e5646), bouleau: K(0xece5d6), pierre: K(0xcfc5b4), pierreC: K(0xe9dfca), pierreF: K(0x9a8f88),
        roche: [K(0x8f93ad), K(0xa39fb5), K(0x9ba7b0)], mousse: K(0x74b865), fleurs: [K(0xff8fb8), K(0xfff3b8), K(0xffffff), K(0xb69cff), K(0xffb36b), K(0x7fc8ff), K(0xff6f91)],
      };
      const pcol = (t) => pick(t);

      // ---------- le lac : contour suivant la berge réelle (rayons relevés sur le terrain), remparts de terre sous l'eau ----------
      const NA = 72; let Rl = [];
      for (let a = 0; a < NA; a += 1) {
        const th = (a / NA) * PI2; let r = 1.14;
        for (let d = 0.45; d < 1.45; d += 0.02) { const x = LK.cx + Math.cos(th) * d * LK.rx, z = LK.cz + Math.sin(th) * d * LK.rz; if (H(x, z) > nL + 0.35) { r = d + 0.03; break; } }
        Rl.push(r);
      }
      for (let k = 0; k < 2; k += 1) Rl = Rl.map((v, i) => 0.25 * Rl[(i + NA - 1) % NA] + 0.5 * v + 0.25 * Rl[(i + 1) % NA]).map((v, i) => Math.max(v, Rl[i] * 0.9));
      const rayon = (th) => { const u = ((th / PI2) % 1 + 1) % 1 * NA, i = Math.floor(u), f = u - i; return mix(Rl[i % NA], Rl[(i + 1) % NA], f); };
      const dansLac = (x, z) => { const dx = (x - LK.cx) / LK.rx, dz = (z - LK.cz) / LK.rz; return Math.hypot(dx, dz) < rayon(Math.atan2(dz, dx)); };
      // sommets de l'eau (position + rim)
      const eauP = [], eauR = [];
      const pushE = (a, b, c, ra, rb, rc) => { [a, b, c].forEach((p) => eauP.push(p[0], p[1], p[2])); eauR.push(ra, rb, rc); };
      const KR = 14, peau = [];
      for (let k = 0; k <= KR; k += 1) { const row = []; for (let a = 0; a < NA; a += 1) { const th = (a / NA) * PI2, f = k / KR, rd = rayon(th) * f + (k === KR ? 0.01 : 0); row.push([LK.cx + Math.cos(th) * rd * LK.rx, nL, LK.cz + Math.sin(th) * rd * LK.rz]); } peau.push(row); }
      for (let k = 0; k < KR; k += 1) for (let a = 0; a < NA; a += 1) {
        const a2 = (a + 1) % NA, ra = k / KR, rb = (k + 1) / KR;
        pushE(peau[k][a], peau[k + 1][a], peau[k + 1][a2], ra, rb, rb); pushE(peau[k][a], peau[k + 1][a2], peau[k][a2], ra, rb, ra);
      }
      // rempart : là où le terrain est bien plus bas que l'eau, une berge de terre herbue descend jusqu'au sol
      for (let a = 0; a < NA; a += 1) {
        const a2 = (a + 1) % NA, p1 = peau[KR][a], p2 = peau[KR][a2];
        const b1 = Math.min(nL - 0.3, H(p1[0], p1[2]) - 0.7), b2 = Math.min(nL - 0.3, H(p2[0], p2[2]) - 0.7);
        const o = [p1[0] - LK.cx, 0, p1[2] - LK.cz]; const ol = Math.hypot(o[0], o[2]) || 1; o[0] /= ol; o[2] /= ol;
        const haut = mc(K(0x5fb866), K(0x6cc86a), hs(a * 1.7)), bas = K(0x4c7a50);
        const q1 = [p1[0] + o[0] * Math.min(6, nL - b1) * 0.55, b1, p1[2] + o[2] * Math.min(6, nL - b1) * 0.55], q2 = [p2[0] + o[0] * Math.min(6, nL - b2) * 0.55, b2, p2[2] + o[2] * Math.min(6, nL - b2) * 0.55];
        S.quad(S.cell(p1[0], p1[2]).pd, [p1[0], nL - 0.02, p1[2]], [p2[0], nL - 0.02, p2[2]], q2, q1, haut, haut, bas, bas, o);
      }
      // rivière : un seul plan (du bord est jusqu'à la chute dans le lac) ; sa surface est plus haute que celle du lac
      let xe = -175; for (let x = 175; x > -175; x -= 1) { if (dansLac(x, zR) || H(x, zR) < nR - 2.2) { xe = x + 1; break; } }
      const rowsZ = [-13.5, -10, -7, -3.5, 0, 3.5, 7, 9.5, 11.5];
      const rim = (dz) => lis(0.1, 0.62, Math.abs(dz) / 10);
      for (let x = xe; x < 175; x += 29.25) for (let j = 0; j < rowsZ.length - 1; j += 1) {
        const x2 = Math.min(175, x + 29.25), za = zR + rowsZ[j], zb = zR + rowsZ[j + 1], ra = 1 - rim(rowsZ[j]), rb = 1 - rim(rowsZ[j + 1]);
        pushE([x, nR, za], [x, nR, zb], [x2, nR, zb], ra, rb, rb); pushE([x, nR, za], [x2, nR, zb], [x2, nR, za], ra, rb, ra);
      }
      const geoE = new TH.BufferGeometry(); geoE.setAttribute('position', new TH.Float32BufferAttribute(eauP, 3)); geoE.setAttribute('rim', new TH.Float32BufferAttribute(eauR, 1));
      const matE = new TH.ShaderMaterial({ side: TH.DoubleSide, fog: true, vertexShader: VS_EAU, fragmentShader: FS_EAU,
        uniforms: TH.UniformsUtils.merge([TH.UniformsLib.fog, { uPh, uDeep: { value: new TH.Color(0.12, 0.55, 0.78) }, uShal: { value: new TH.Color(0.40, 0.88, 0.86) }, uSky: { value: new TH.Color(0.78, 0.92, 1.0) } }]) });
      const meshE = new TH.Mesh(geoE, matE); meshE.frustumCulled = false; group.add(meshE);
      // fond de la rivière, vu à travers rien (opaque) : pas nécessaire ; le fond du noyau est sous l'eau

      // ---------- le pont de pierre en arche ----------
      const pont = () => {
        const A0 = -19, A1 = 19, dA = 0.8, ech = [];
        for (let a = A0; a <= A1 + 1e-6; a += dA) { const s = sB + a / pc.longueur, p = pc.point(s), t = pc.tangente(s); ech.push({ a, s, p, t, n: [-t[1], t[0]], yd: p[1] + 0.06 }); }
        const demi = 10.6, pierre = K(0xffd9b0), pierreB = K(0xf2c79a), joint = K(0xb0a49a), clair = K(0xffe6c8);
        const yi = (e) => { const u = Math.abs(e.a) / demi; return u >= 1 ? nR - 0.4 : nR + (e.yd - 0.8 - nR) * Math.sqrt(1 - u * u) * 1 + 0; };
        const lt = (e, l, dy) => [e.p[0] + e.n[0] * l, (dy === undefined ? e.yd : dy), e.p[2] + e.n[1] * l];
        // murs latéraux (tympans) : du tablier jusqu'à l'intrados de l'arche ou jusqu'au sol
        [-1, 1].forEach((sg) => {
          for (let i = 0; i < ech.length - 1; i += 1) {
            const e1 = ech[i], e2 = ech[i + 1], l = sg * 3.4;
            const f = (e) => { const p = lt(e, l); const sol = H(p[0], p[2]) - 0.5; return Math.abs(e.a) < demi ? yi(e) : Math.min(yi(e), sol); };
            const t1 = lt(e1, l, e1.yd - 0.02), t2 = lt(e2, l, e2.yd - 0.02), b1 = lt(e1, l, f(e1)), b2 = lt(e2, l, f(e2));
            const cc = (i % 2) ? pierre : pierreB, bas = tn(cc, 0.82);
            S.quad(S.cell(t1[0], t1[2]).pd, t1, t2, b2, b1, cc, cc, bas, bas, [e1.n[0] * sg, 0, e1.n[1] * sg]);
            // dessus du bord (dalle) entre le tablier et le mur
            const u1 = lt(e1, sg * 2.62, e1.yd - 0.015), u2 = lt(e2, sg * 2.62, e2.yd - 0.015), v1 = lt(e1, sg * 3.45, e1.yd - 0.015), v2 = lt(e2, sg * 3.45, e2.yd - 0.015);
            S.quad(S.cell(u1[0], u1[2]).pd, u1, u2, v2, v1, clair, clair, clair, clair, [0, 1, 0]);
            // parapet continu : faces intérieure et extérieure, dessus, puis chaperon plus large
            const prisme = (l0, l1, y0, y1, c0, c1) => {
              const A = (e, l, y) => lt(e, sg * l, e.yd + y), d = S.cell(e1.p[0], e1.p[2]).pd, n1 = [e1.n[0] * sg, 0, e1.n[1] * sg], m1 = [-n1[0], 0, -n1[2]];
              S.quad(d, A(e1, l0, y1), A(e2, l0, y1), A(e2, l0, y0), A(e1, l0, y0), c1, c1, c0, c0, m1);
              S.quad(d, A(e1, l1, y1), A(e2, l1, y1), A(e2, l1, y0), A(e1, l1, y0), c1, c1, c0, c0, n1);
              S.quad(d, A(e1, l0, y1), A(e2, l0, y1), A(e2, l1, y1), A(e1, l1, y1), c1, c1, c1, c1, [0, 1, 0]);
            };
            const pa = (i % 2) ? K(0xffe0bc) : K(0xf8d4ac);
            prisme(2.85, 3.35, 0, 0.7, tn(pa, 0.85), pa);
            prisme(2.78, 3.42, 0.7, 0.84, K(0xe2cba8), K(0xfbeed6));
          }
        });
        // anneau de claveaux (alternance de pierres claires et ocre) sur les deux faces
        [-1, 1].forEach((sg) => {
          const pts = []; for (let a = -demi; a <= demi + 1e-6; a += 0.55) { const s = sB + a / pc.longueur, p = pc.point(s), t = pc.tangente(s), e = { a, p, n: [-t[1], t[0]], yd: p[1] + 0.06 }; const q = lt(e, sg * 3.45, yi(e) + 0.08); pts.push(q); }
          S.tube((p) => 0, pts, 0.3, (t, i) => (i % 2 ? clair : K(0xcdbb9b)), { n: 4, rot: PI / 4, dest: (p) => S.cell(p[0], p[2]).pl });
        });
        // piliers à lanternes (sur le parapet) tous les ~4,8 m, plus gros aux extrémités
        const posts = [-14.4, -7.2, 0, 7.2, 14.4];
        posts.forEach((a, k) => {
          const s = sB + a / pc.longueur, p = pc.point(s), t = pc.tangente(s), nn = [-t[1], t[0]], ang = Math.atan2(t[0], t[1]);
          [-1, 1].forEach((sg) => {
            const x = p[0] + nn[0] * sg * 3.1, z = p[2] + nn[1] * sg * 3.1, y = p[1] + 0.06, big = Math.abs(a) > 14;
            S.pl(S.pr('box'), x, y - 0.02, z, 0.8, 1.35, 0.8, ang, clair, { c2: pierre, j: 0.04 });
            S.pl(S.pr('box'), x, y + 1.33, z, 0.98, 0.14, 0.98, ang, clair, { j: 0.03 });
            S.pl(S.pr('cyl', 4, 0.5), x, y + 1.46, z, 0.62, 0.28, 0.62, ang + PI / 4, pierre, { j: 0.03 });
            S.pl(S.pr('cyl', 6, 1), x, y + 1.72, z, 0.36, 0.08, 0.36, 0, K(0x8a5a7c), { j: 0.03 });
            S.ba(S.pr('cyl', 6, 0.9), x, y + 1.8, z, 0.3, 0.62, 0.3, 0, K(0xffcf6a), { c2: K(0xfff0b0) });
            S.pl(S.pr('cyl', 6, 0.1), x, y + 2.42, z, 0.44, 0.34, 0.44, 0, K(0x9c6b8c), { c2: K(0xc58bb0) });
            S.pl(S.pr('sph', 0), x, y + 2.8, z, 0.07, 0.07, 0.07, 0, K(0xf0c870));
            if (big) S.pl(S.pr('sph', 1), x, y + 1.6, z, 0.18, 0.18, 0.18, 0, K(0xf0c870));
            void k;
          });
        });
        // guirlandes de fleurs sur le parapet (pots de géraniums entre les piliers)
        [-10.8, -3.6, 3.6, 10.8].forEach((a) => {
          const s = sB + a / pc.longueur, p = pc.point(s), t = pc.tangente(s), nn = [-t[1], t[0]];
          [-1, 1].forEach((sg) => {
            const x = p[0] + nn[0] * sg * 3.1, z = p[2] + nn[1] * sg * 3.1, y = p[1] + 0.06 + 0.86;
            S.pl(S.pr('cyl', 6, 0.75), x, y, z, 0.3, 0.26, 0.3, 0, K(0xc9704f));
            for (let k = 0; k < 6; k += 1) { const b = (k / 6) * PI2 + a; S.pl(S.pr('sph', 0), x + Math.cos(b) * 0.14, y + 0.3, z + Math.sin(b) * 0.14, 0.13, 0.13, 0.13, 0, k % 2 ? K(0xff5f86) : K(0xff9db8)); }
            S.pl(S.pr('sph', 0), x, y + 0.32, z, 0.2, 0.15, 0.2, 0, K(0x55b062));
          });
        });
      };
      S.etape('pont');
      pont();
      S.etape('berges0');
      // berges herbues drapées sur le terrain (cachent le gris des talus du noyau) : vert vif en haut, vase olive près de l'eau
      {
        const dx = 1.5, dz = 1.0;
        for (let x = xpR - 36; x < xpR + 46; x += dx) for (let sg = -1; sg <= 1; sg += 2) for (let d = 6.5; d < (sg > 0 ? 30 : 13); d += dz) {
          const co = [[x, d], [x + dx, d], [x + dx, d + dz], [x, d + dz]].map(([xx, dd]) => { const z = zR + sg * dd, h = H(xx, z); return { x: xx, z, h, y: h + 0.045 }; });
          if (co.every((c) => c.h < nR + 0.06) && d < 11.6) continue;
          const hmx = Math.max(...co.map((c) => c.h));
          if (hmx - Math.min(...co.map((c) => c.h)) < 0.2 && hmx > nR + 0.85) continue;
          const mz = (co[0].z + co[2].z) / 2, mx = (co[0].x + co[2].x) / 2;
          if (Math.abs(lat(mx, mz)) < 3.6 && Math.abs(mz - zR) < 22) continue;
          if (d > 12.6 && Math.abs(lat(mx, mz)) < 12) continue;
          const cl = co.map((c) => { const t = Math.max(lis(nR + 0.05, nR + 0.3, c.h), lis(9.0, 10.4, Math.abs(c.z - zR))), n = 0.5 + 0.5 * Math.sin(c.x * 0.37 + c.z * 0.23) * Math.sin(c.z * 0.51 - c.x * 0.11); return mc(mc(K(0x6f9a58), K(0xa3b066), n * 0.5), mc(K(0x3f9a70), K(0x58b583), n * 0.6), t); });
          const d0 = S.cell(mx, mz).pd, P = (c) => [c.x, c.y, c.z];
          S.tri(d0, P(co[0]), P(co[1]), P(co[2]), cl[0], cl[1], cl[2], [0, 1, 0]); S.tri(d0, P(co[0]), P(co[2]), P(co[3]), cl[0], cl[2], cl[3], [0, 1, 0]);
        }
      }
      S.etape('berges');
      // pierres de seuil et massifs aux deux entrées du pont
      [-1, 1].forEach((sg) => {
        const a = sg * 19.5, s = sB + a / pc.longueur, p = pc.point(s), t = pc.tangente(s), nn = [-t[1], t[0]];
        [-1, 1].forEach((side) => {
          const x = p[0] + nn[0] * side * 4.6, z = p[2] + nn[1] * side * 4.6, y = H(x, z);
          S.pl(S.pr('sph', 1), x, y + 0.2, z, 0.9, 0.55, 0.9, R() * 3, pick(C.roche), { c2: C.mousse });
          for (let k = 0; k < 5; k += 1) S.pl(S.pr('sph', 0), x + rr(-1, 1), y + 0.6, z + rr(-1, 1), 0.28, 0.26, 0.28, 0, pcol(C.fleurs));
        });
      });

      // ---------- la cascade : falaise rocheuse (maillage posé sur le terrain), nappes d'eau animées, brume, arc-en-ciel ----------
      const xc = 40, zT = zR - 7, base = nR - 1.5;
      const total = borne(H(xc, zT - 36) + 1.5 - base, 14, 20);
      const paliers = [[0.5, 2.8, 0.36], [8.5, 10.8, 0.33], [17.0, 19.2, 0.31]];
      const profil = (x, d) => {
        let y = base + 0.05 * Math.max(d, 0);
        paliers.forEach((p) => { y += total * p[2] * lis(p[0], p[1], d); });
        y += 0.35 * Math.sin(x * 0.8 + d * 0.55) * lis(0, 6, d) + 0.28 * Math.sin(x * 1.9 - d * 0.9);
        const w = 1 - lis(7, 16, Math.abs(x - xc) + 2.0 * Math.sin(d * 0.35));
        return mix(base - 25, y, w);
      };
      const surf = (x, d) => Math.max(H(x, zT - d) + 0.05, profil(x, d));
      const falaise = () => {
        const dx = 1.0, dd = 0.7, X0 = xc - 21, X1 = xc + 21, D0 = -3, D1 = 40, rows = [];
        for (let d = D0; d <= D1 + 1e-6; d += dd) { const row = []; for (let x = X0; x <= X1 + 1e-6; x += dx) { const y = surf(x, d), h = H(x, zT - d); row.push({ x, z: zT - d, y, dh: y - h, d }); } rows.push(row); }
        const col = (v, r, i) => {
          const sl = Math.abs(rows[Math.min(r + 1, rows.length - 1)][i].y - rows[Math.max(r - 1, 0)][i].y) / (2 * dd);
          const strat = 0.5 + 0.5 * Math.sin(v.y * 1.6 + 1.2 * Math.sin(v.x * 0.35)), strie = 0.5 + 0.5 * Math.sin(v.x * 2.3 + 0.4 * Math.sin(v.d * 0.3));
          const roc = mc(mc(K(0x9a8ab4), K(0xd6b890), strat), K(0x6c6590), strie * 0.3);
          const moussu = mc(K(0x78b868), K(0x9ccc72), 0.5 + 0.5 * Math.sin(v.x * 0.7 + v.d * 0.4));
          const pl = lis(0.4, 1.1, sl), herbe = 1 - Math.min(1, v.dh / 1.0);
          return mc(mc(moussu, roc, pl), K(0x62b868), herbe * (1 - pl));
        };
        for (let r = 0; r < rows.length - 1; r += 1) for (let i = 0; i < rows[r].length - 1; i += 1) {
          const a = rows[r][i], b = rows[r][i + 1], c = rows[r + 1][i + 1], e = rows[r + 1][i];
          if (Math.max(a.dh, b.dh, c.dh, e.dh) < 0.14) continue;
          if (Math.abs(lat(a.x, a.z)) < 5.2) continue;
          const ca = col(a, r, i), cb = col(b, r, i + 1), cc = col(c, r + 1, i + 1), ce = col(e, r + 1, i);
          const d = S.cell(a.x, a.z).pl, P = (v) => [v.x, v.y, v.z];
          if ((i + r) % 2) { S.tri(d, P(a), P(e), P(b), ca, ce, cb, [0, 1, 0]); S.tri(d, P(b), P(e), P(c), cb, ce, cc, [0, 1, 0]); }
          else { S.tri(d, P(a), P(e), P(c), ca, ce, cc, [0, 1, 0]); S.tri(d, P(a), P(c), P(b), ca, cc, cb, [0, 1, 0]); }
        }
      };
      S.etape('falaise');
      falaise();
      // arbres et rochers sur la falaise : bouleaux au sommet, blocs lisses à la base
      for (let k = 0; k < 16; k += 1) { const x = xc + rr(-14, 14), d = rr(-1, 12), p = [x, surf(x, d), zT - d]; if (Math.abs(lat(p[0], p[2])) < 6) continue; S.pl(S.pr('sph', 1), p[0], p[1] + 0.1, p[2], rr(0.9, 2.1), rr(0.6, 1.2), rr(0.9, 1.9), R() * 3, pick(C.roche), { c2: mc(pick(C.roche), C.mousse, 0.55) }); }

      S.etape('rochersFalaise');
      // nappes d'eau (rubans drapés sur le profil) : une grande chute principale et deux filets
      const sheetP = [], sheetU = [], sheetPh = [];
      const nappe = (xo, larg0, larg1, dTop, dBot, ph0) => {
        const pas = 0.4, n = Math.round((dTop - dBot) / pas); let v = 0, prev = null;
        for (let k = 0; k <= n; k += 1) {
          const d = dTop - k * pas, u = k / n, w = mix(larg0, larg1, u) * 0.5, xm = xo + 0.8 * Math.sin(d * 0.2);
          const row = [-1, 1].map((sg) => { const x = xm + sg * w; const y = surf(x, d) + 0.28, z = zT - d + 0.42; return [x, y, z]; });
          if (prev) { v += Math.hypot(row[0][0] - prev.row[0][0], row[0][1] - prev.row[0][1], row[0][2] - prev.row[0][2]); }
          const cur = { row, v };
          if (prev) {
            const qa = prev.row[0], qb = prev.row[1], qc = row[1], qe = row[0];
            [[qa, 0, prev.v], [qb, 1, prev.v], [qc, 1, cur.v], [qa, 0, prev.v], [qc, 1, cur.v], [qe, 0, cur.v]].forEach((o) => { sheetP.push(o[0][0], o[0][1], o[0][2]); sheetU.push(o[1], o[2]); sheetPh.push(ph0); });
          }
          prev = cur;
        }
      };
      nappe(xc + 0.5, 5.0, 8.5, 30, -1.0, 0);
      nappe(xc - 9.5, 1.3, 2.2, 22, 2.0, 2.2);
      nappe(xc + 10.0, 1.5, 2.6, 24, 3.0, 4.1);
      const geoN = new TH.BufferGeometry(); geoN.setAttribute('position', new TH.Float32BufferAttribute(sheetP, 3)); geoN.setAttribute('uv', new TH.Float32BufferAttribute(sheetU, 2)); geoN.setAttribute('ph', new TH.Float32BufferAttribute(sheetPh, 1));
      const matN = new TH.ShaderMaterial({ transparent: true, depthWrite: false, side: TH.DoubleSide, fog: true, vertexShader: VS_CHUTE, fragmentShader: FS_CHUTE, uniforms: TH.UniformsUtils.merge([TH.UniformsLib.fog, { uPh }]) });
      const meshN = new TH.Mesh(geoN, matN); meshN.frustumCulled = false; meshN.renderOrder = 3; group.add(meshN);
      const xP = xc + 0.5, zP = zT + 1.2;   // pied de la chute
      // chute de la rivière dans le lac (petite marche de rochers)
      {
        const pts = [], pu = [], pp = [];
        const xs = xe - 0.5, zs0 = zR - 6.5, zs1 = zR + 6.5, yT = nR, yB = nL + 0.05;
        const n = 8; for (let k = 0; k < n; k += 1) {
          const z1 = zs0 + (zs1 - zs0) * k / n, z2 = zs0 + (zs1 - zs0) * (k + 1) / n, xo = -1.6;
          [[xs, yT, z1, 0, 0], [xs + xo, yB, z1, 0, 3.0], [xs + xo, yB, z2, 1, 3.0], [xs, yT, z1, 0, 0], [xs + xo, yB, z2, 1, 3.0], [xs, yT, z2, 1, 0]].forEach((v) => { pts.push(v[0], v[1], v[2]); pu.push(v[3], v[4]); pp.push(1.3); });
        }
        const g = new TH.BufferGeometry(); g.setAttribute('position', new TH.Float32BufferAttribute(pts, 3)); g.setAttribute('uv', new TH.Float32BufferAttribute(pu, 2)); g.setAttribute('ph', new TH.Float32BufferAttribute(pp, 1));
        const m = new TH.Mesh(g, matN); m.frustumCulled = false; m.renderOrder = 3; group.add(m);
        for (let k = 0; k < 8; k += 1) S.pl(S.pr('sph', 1), xs - 1.2 + rr(-0.6, 0.4), nL + rr(-0.2, 0.4), zR + (k - 3.5) * 1.75 + rr(-0.4, 0.4), rr(0.8, 1.5), rr(0.5, 1.0), rr(0.9, 1.5), R() * 3, pick(C.roche), { c2: C.mousse });
      }
      // arc-en-ciel discret (rubans colorés translucides, plan vertical devant la chute)
      {
        const cx = xc - 1, cy = nR - 2.5, cz = zT + 3.5, R0 = 14.5, bandes = [K(0xff6b8a), K(0xffa86b), K(0xffe56b), K(0x8ae68a), K(0x7fd0ff), K(0x9a8cff)];
        const pp = [], aa = [], cc = [], NSg = 36;
        bandes.forEach((cl, b) => {
          const r1 = R0 + b * 0.55, r2 = r1 + 0.55;
          for (let i = 0; i < NSg; i += 1) {
            const t1 = mix(0.24, PI - 0.24, i / NSg), t2 = mix(0.24, PI - 0.24, (i + 1) / NSg);
            const f1 = Math.sin(PI * i / NSg), f2 = Math.sin(PI * (i + 1) / NSg);
            const v = (r, t, f) => ({ p: [cx + Math.cos(t) * r, cy + Math.sin(t) * r, cz], a: 0.2 * Math.pow(f, 0.7) });
            const q = [v(r1, t1, f1), v(r2, t1, f1), v(r2, t2, f2), v(r1, t1, f1), v(r2, t2, f2), v(r1, t2, f2)];
            q.forEach((o) => { pp.push(o.p[0], o.p[1], o.p[2]); aa.push(o.a); cc.push(cl[0], cl[1], cl[2]); });
          }
        });
        const g = new TH.BufferGeometry(); g.setAttribute('position', new TH.Float32BufferAttribute(pp, 3)); g.setAttribute('al', new TH.Float32BufferAttribute(aa, 1)); g.setAttribute('col', new TH.Float32BufferAttribute(cc, 3));
        const m = new TH.Mesh(g, new TH.ShaderMaterial({ transparent: true, depthWrite: false, side: TH.DoubleSide, vertexShader: VS_ARC, fragmentShader: FS_ARC })); m.frustumCulled = false; m.renderOrder = 4; group.add(m);
      }

      // ---------- végétation et décor fixe ----------
      const sec = (x, z, m) => Math.abs(lat(x, z)) >= m;
      const terre = (x, z, marge) => { if (Math.abs(z - zR) < 22) return H(x, z) > nR + (marge === undefined ? 0.7 : marge); return Math.hypot((x - LK.cx) / LK.rx, (z - LK.cz) / LK.rz) > 1.5; };
      const eauProf = (x, z) => H(x, z) < nR - 0.45 && Math.abs(z - zR) < 9;
      // saule pleureur
      const saule = (x, z, h) => {
        const y = H(x, z) - 0.2, k = h / 7, lean = rr(-0.1, 0.1), tp = [x + lean * 3 * k, y + h * 0.62, z];
        S.pl(S.pr('cyl', 7, 0.55), x, y, z, 0.6 * k, h * 0.62, 0.6 * k, 0, C.ecorce, { rz: -lean, c2: tn(C.ecorce, 1.15) });
        for (let b = 0; b < 3; b += 1) { const a = b * 2.1 + R(); S.pl(S.pr('cyl', 5, 0.5), tp[0], tp[1] - 0.3, tp[2], 0.28 * k, 3.0 * k, 0.28 * k, 0, C.ecorce, { rx: Math.sin(a) * 0.9, rz: -Math.cos(a) * 0.9 }); }
        const cy = y + h * 0.82;
        for (let b = 0; b < 6; b += 1) { const a = b * 1.05 + R() * 0.4; S.pl(S.pr('sph', 1), x + Math.cos(a) * 1.5 * k + lean * 3 * k, cy + rr(-0.3, 0.9) * k, z + Math.sin(a) * 1.5 * k, rr(1.5, 2.2) * k, rr(1.1, 1.5) * k, rr(1.5, 2.2) * k, R() * 3, pick(C.saule), { c2: mc(pick(C.saule), K(0xd8f08a), 0.5) }); }
        S.pl(S.pr('sph', 1), x + lean * 3 * k, cy + 1.3 * k, z, 2.2 * k, 1.5 * k, 2.2 * k, 0, C.saule[1]);
        const nf = Math.round(22 * k + 8);
        for (let f = 0; f < nf; f += 1) {
          const a = (f / nf) * PI2 + R() * 0.3, r0 = rr(1.6, 2.6) * k, len = rr(3.4, 5.4) * Math.min(1.2, k + 0.2), x0 = x + lean * 3 * k + Math.cos(a) * r0, z0 = z + Math.sin(a) * r0, y0 = cy + rr(-0.2, 0.8) * k;
          const pts = []; for (let i = 0; i <= 5; i += 1) { const t = i / 5; pts.push([x0 + Math.cos(a) * (0.5 * t + 0.4 * t * t), y0 - len * t, z0 + Math.sin(a) * (0.5 * t + 0.4 * t * t)]); }
          S.tube(null, pts, (t) => 0.16 * (1 - 0.45 * t), (t) => mc(K(0x58b65a), K(0xcfeb7a), t), { n: 2, ref: [-Math.sin(a), 0, Math.cos(a)], dest: (p) => S.cell(p[0], p[2]).pd });
        }
      };
      const bouleau = (x, z, h) => {
        const y = H(x, z) - 0.15, k = h / 7, lean = rr(-0.12, 0.12), lean2 = rr(-0.1, 0.1);
        S.pl(S.pr('cyl', 6, 0.7), x, y, z, 0.2 * k, h, 0.2 * k, 0, C.bouleau, { rz: lean, rx: lean2, c2: K(0xf6efe0), j: 0.04 });
        for (let b = 0; b < 3; b += 1) { const yy = y + h * (0.12 + 0.2 * b + 0.05 * R()); S.pl(S.pr('cyl', 4, 1), x + lean * (yy - y) * 1.0 * 0.0, yy, z, 0.215 * k, 0.12 * k, 0.215 * k, 0, K(0x4a4a52), { rz: lean, rx: lean2, j: 0 }); }
        const top = [x - Math.sin(lean) * h * 0.95, y + h * 0.95, z + Math.sin(lean2) * h * 0.95];
        const nb = 5 + Math.floor(R() * 3);
        for (let b = 0; b < nb; b += 1) { const a = b * 2.4 + R(), hh = h * rr(0.6, 1.02), rd = rr(0.5, 1.6) * k; S.pl(S.pr('sph', 0), top[0] + Math.cos(a) * rd, y + hh, top[2] + Math.sin(a) * rd, rr(1.1, 1.7) * k, rr(1.0, 1.4) * k, rr(1.1, 1.7) * k, R() * 3, pick(C.bouleauF), { c2: K(0xe6f08a) }); }
      };
      const roche = (x, z, sc) => { const y = H(x, z); S.pl(S.pr('sph', 1), x, y + 0.1 * sc, z, sc * rr(0.9, 1.5), sc * rr(0.55, 0.9), sc * rr(0.9, 1.4), R() * 3, pick(C.roche), { c2: mc(pick(C.roche), C.mousse, 0.45), rx: rr(-0.2, 0.2), rz: rr(-0.2, 0.2) }); };
      const roseau = (x, y, z, h) => {
        const lean = rr(-0.3, 0.3), la = R() * PI2;
        S.pl(S.pr('cyl', 3, 0.25), x, y, z, 0.05, h, 0.05, 0, K(0x4aa05a), { c2: K(0x9ad870), rx: Math.sin(la) * lean, rz: Math.cos(la) * lean, j: 0.1 });
        if (R() < 0.35) S.pl(S.pr('cyl', 5, 1), x + Math.cos(la) * lean * h * 0.9, y + h * 0.78, z - Math.sin(la) * lean * h * 0.9, 0.06, 0.36, 0.06, 0, K(0x8a5636), { j: 0.05 });
      };
      const fleur = (x, y, z, c, h) => {
        S.pl(S.pr('cyl', 3, 0.6), x, y, z, 0.025, h, 0.025, 0, K(0x4aa05a), { j: 0 });
        S.pl(S.pr('sph', 0), x, y + h, z, 0.115, 0.1, 0.115, hs(x * 7 + z), c, { j: 0.1 });
      };
      const touffe = (x, y, z, c) => { for (let b = 0; b < 3; b += 1) S.pl(S.pr('cyl', 3, 0), x + (b - 1) * 0.1, y, z + (b % 2) * 0.08, 0.09, rr(0.3, 0.55), 0.09, 0, c, { rz: (b - 1) * 0.3, c2: mc(c, K(0xc8ef80), 0.5), j: 0.1 }); };
      const nenuphar = (x, z, fl) => {
        const rd = rr(0.5, 0.9);
        S.pd(S.pr('pad'), x, nR + 0.04, z, rd, 1, rd, R() * PI2, mc(K(0x4fb868), K(0x7ad070), R()), { j: 0.05 });
        if (fl) { const c = pick([K(0xff8fc0), K(0xffb0d0), K(0xfff0f6)]); for (let k = 0; k < 7; k += 1) { const a = (k / 7) * PI2; S.pl(S.pr('cyl', 3, 0), x + Math.cos(a) * 0.1, nR + 0.06, z + Math.sin(a) * 0.1, 0.07, 0.3, 0.07, 0, c, { rx: Math.sin(a) * 0.9, rz: -Math.cos(a) * 0.9, c2: mc(c, K(0xffffff), 0.6), j: 0.02 }); } S.pl(S.pr('sph', 0), x, nR + 0.12, z, 0.06, 0.06, 0.06, 0, K(0xffd84a)); }
      };
      void IC;
      S.etape('vegetation_fonctions');
      // rives de la rivière : repérer la berge (l'eau coupe le terrain) puis planter roseaux, rochers, fleurs
      const rive = [];
      for (let x = xpR - 34; x <= xpR + 40; x += 2.2) for (let sg = -1; sg <= 1; sg += 2) {
        let dz = 14; for (; dz > 5; dz -= 0.3) { if (H(x, zR + sg * dz) < nR + 0.12) break; }
        const xj = x + rr(-0.8, 0.8), z = zR + sg * (dz + rr(-0.3, 0.3)); rive.push([xj, z, sg]);
      }
      rive.forEach(([x, z, sg]) => {
        if (!sec(x, z, 6.2)) return;
        const k = 2 + Math.floor(R() * 5);
        for (let b = 0; b < k; b += 1) { const xx = x + rr(-1, 1), zz = z - sg * rr(0.1, 1.6); roseau(xx, Math.max(H(xx, zz), nR) - 0.1, zz, rr(1.2, 2.5)); }
        if (R() < 0.3) roche(x + rr(-1, 1), z + sg * rr(0.2, 1.4), rr(0.5, 1.2));
        if (R() < 0.55) for (let b = 0; b < 3; b += 1) { const xx = x + rr(-1.5, 1.5), zz = z + sg * rr(0.5, 2.5); fleur(xx, H(xx, zz), zz, pcol(C.fleurs), rr(0.25, 0.5)); }
      });
      S.etape('rives');
      // nénuphars sur la rivière et dans le lac
      for (let k = 0; k < 85; k += 1) { const x = rr(-34, 70), z = zR + rr(-6.5, 6.5); if (!eauProf(x, z) || !sec(x, z, 5.6)) continue; nenuphar(x, z, R() < 0.4); }
      for (let k = 0; k < 40; k += 1) { const th = R() * PI2, d = rr(0.3, 0.85) * rayon(th), x = LK.cx + Math.cos(th) * d * LK.rx, z = LK.cz + Math.sin(th) * d * LK.rz; if (H(x, z) > nL - 0.4) continue; const rd = rr(0.5, 0.9); S.pd(S.pr('pad'), x, nL + 0.04, z, rd, 1, rd, R() * PI2, mc(K(0x4fb868), K(0x7ad070), R())); }
      S.etape('nenuphars');
      // saules : près du pont, le long de la rivière
      [[-1, 9.5, -16], [1, 9.5, -17], [-1, 12, 6], [-1, 8, 28]].forEach(([sg, off, a]) => {
        const s = sB + a / pc.longueur, p = place(s, sg * off); if (p[1] > nR + 0.8) saule(p[0], p[2], rr(7.5, 9.5));
      });
      for (let x = -28; x <= 80; x += 11) for (let sg = -1; sg <= 1; sg += 2) { const z = zR + sg * rr(12.5, 16); const xx = x + rr(-3, 3); const vue = sg > 0 ? xx > xpR - 8 && xx < xc + 24 : xx > xc - 24 && xx < xc + 24; if (!vue && sec(xx, z, 8) && terre(xx, z, 1.0) && R() < 0.6) saule(xx, z, rr(6.5, 9.5)); }
      S.etape('saules');
      // bouleaux : bosquets de chaque côté du chemin, sur toute la zone
      for (let g = 0; g < 50; g += 1) {
        const s = mix(s0, s1, R()), sg = R() < 0.5 ? -1 : 1, cen = place(s, sg * rr(7.5, 18));
        const n = 3 + Math.floor(R() * 4); for (let k = 0; k < n; k += 1) {
          const x = cen[0] + rr(-5, 5), z = cen[2] + rr(-5, 5); if (!sec(x, z, 5.6) || !terre(x, z, 1.5) || Math.abs(z - zR) < 15.5) continue; bouleau(x, z, rr(5.5, 8.5));
        }
      }
      S.etape('bouleaux');
      // rochers lisses, fleurs et herbes en bordure du chemin
      for (let k = 0; k < 40; k += 1) { const s = mix(s0, s1, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(5, 20)); if (!terre(p[0], p[2], 1.2) || Math.abs(p[2] - zR) < 15) continue; roche(p[0], p[2], rr(0.45, 1.3)); }
      for (let k = 0; k < 60; k += 1) {
        const s = mix(s0, s1, R()), l = (R() < 0.5 ? -1 : 1) * (4.5 + 17 * R() * R() * R()), p = place(s, l); if (!terre(p[0], p[2], 1.0) || Math.abs(p[2] - zR) < 14.5) continue;
        const c = pcol(C.fleurs), n = 5 + Math.floor(R() * 7), cx = p[0], cz = p[2];
        for (let b = 0; b < n; b += 1) { const x = cx + rr(-1.4, 1.4), z = cz + rr(-1.4, 1.4); if (sec(x, z, 4.4)) fleur(x, H(x, z), z, R() < 0.7 ? c : pcol(C.fleurs), rr(0.35, 0.8)); }
        for (let b = 0; b < 3; b += 1) { const x = cx + rr(-1.5, 1.5), z = cz + rr(-1.5, 1.5); if (sec(x, z, 4.4)) touffe(x, H(x, z) - 0.02, z, pick(C.herbe)); }
      }
      S.etape('fleurs');
      // buissons fleuris autour de la falaise et du pont
      for (let k = 0; k < 26; k += 1) { const x = xc + rr(-18, 18), z = zT + rr(-8, 14); if (!terre(x, z, 1.2) || !sec(x, z, 6.5)) continue; const y = H(x, z); S.pl(S.pr('sph', 1), x, y + 0.3, z, rr(0.7, 1.3), rr(0.5, 0.9), rr(0.7, 1.3), R() * 3, pick(C.feuille)); for (let b = 0; b < 4; b += 1) S.pl(S.pr('sph', 0), x + rr(-0.6, 0.6), y + 0.7, z + rr(-0.6, 0.6), 0.15, 0.15, 0.15, 0, pcol(C.fleurs)); }
      for (let k = 0; k < 60; k += 1) { const x = xc + rr(-17, 17), z = zT + rr(2.5, 15); if (!terre(x, z, 1.5) || !sec(x, z, 6.5)) continue; touffe(x, H(x, z), z, pick(C.herbe)); if (R() < 0.5) fleur(x + 0.3, H(x, z), z, pcol(C.fleurs), 0.5); }

      S.etape('buissons2');
      // bordure fleurie continue le long du chemin
      for (let sc = s0; sc < s1; sc += 0.0042) for (let sg = -1; sg <= 1; sg += 2) {
        const p = place(sc + rr(-0.002, 0.002), sg * rr(4.5, 6.3)); if (!terre(p[0], p[2], 1.0) || (Math.abs(p[2] - zR) < 22 && Math.abs(lat(p[0], p[2])) < 6.0)) continue;
        const c = pcol(C.fleurs);
        for (let b = 0; b < 3; b += 1) { const x = p[0] + rr(-0.7, 0.7), z = p[2] + rr(-0.7, 0.7); if (sec(x, z, 4.3)) fleur(x, H(x, z), z, R() < 0.75 ? c : pcol(C.fleurs), rr(0.35, 0.8)); }
        const x = p[0] + rr(-0.6, 0.6), z = p[2] + rr(-0.6, 0.6); if (sec(x, z, 4.3)) touffe(x, H(x, z) - 0.02, z, pick(C.herbe));
      }
      S.etape('bordure');
      // buissons fleuris
      for (let k = 0; k < 46; k += 1) {
        const s = mix(s0, s1, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(6, 17)); if (!terre(p[0], p[2], 1.2) || Math.abs(p[2] - zR) < 15.5) continue;
        const r0 = rr(0.8, 1.6), c = pcol(C.fleurs);
        S.pl(S.pr('sph', 1), p[0], p[1] + r0 * 0.45, p[2], r0, r0 * 0.7, r0, R() * 3, pick(C.feuille), { c2: tn(pick(C.feuille), 1.12) });
        for (let b = 0; b < 7; b += 1) { const a = R() * PI2, d = rr(0.2, 0.85) * r0; S.pl(S.pr('sph', 0), p[0] + Math.cos(a) * d, p[1] + r0 * (0.55 + 0.4 * R()), p[2] + Math.sin(a) * d, 0.2, 0.2, 0.2, 0, R() < 0.8 ? c : pcol(C.fleurs)); }
      }
      S.etape('buissons');
      // cerisiers en fleurs (conte de fées) et arbres ronds
      const cerisier = (x, z, h) => {
        const y = H(x, z) - 0.1, k = h / 5.5, c1 = pick([K(0xff7fae), K(0xff9fc4), K(0xff6f9f)]);
        S.pl(S.pr('cyl', 6, 0.6), x, y, z, 0.3 * k, h * 0.55, 0.3 * k, 0, K(0x7a5a52), { c2: K(0x8e6a60) });
        for (let b = 0; b < 6; b += 1) { const a = b * 1.05 + R(), d = rr(0.5, 1.6) * k; S.pl(S.pr('sph', 1), x + Math.cos(a) * d, y + h * rr(0.62, 0.9), z + Math.sin(a) * d, rr(1.2, 1.8) * k, rr(0.9, 1.3) * k, rr(1.2, 1.8) * k, R() * 3, mc(c1, K(0xffd0e4), R() * 0.35), { c2: K(0xffd8ea) }); }
        for (let b = 0; b < 6; b += 1) { const a = R() * PI2, d = rr(0.6, 2.4) * k; S.pl(S.pr('sph', 0), x + Math.cos(a) * d, H(x + Math.cos(a) * d, z + Math.sin(a) * d) + 0.04, z + Math.sin(a) * d, 0.2, 0.03, 0.2, 0, K(0xffb6cf), { j: 0 }); }
      };
      for (let k = 0; k < 16; k += 1) { const s = mix(s0 + 0.01, s1, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(7, 20)); if (!terre(p[0], p[2], 1.5) || Math.abs(p[2] - zR) < 16 || (p[0] > xc - 22 && p[0] < xc + 22 && p[2] < zR - 5 && p[2] > zR - 45)) continue; cerisier(p[0], p[2], rr(4.5, 6.5)); }
      S.etape('cerisiers');
      // au sommet de la falaise : bouleaux et buissons
      for (let k = 0; k < 10; k += 1) { const x = xc + rr(-10, 10), d = rr(21, 32), z = zT - d, y = surf(x, d); if (Math.abs(lat(x, z)) < 7) continue; S.pl(S.pr('sph', 1), x, y + 0.5, z, rr(1.0, 1.8), rr(0.7, 1.1), rr(1.0, 1.8), R() * 3, pick(C.feuille)); }

      S.etape('fin');
      group.userData.etapes = S.etapes;
      S.construire(group);

      // ---------- éléments animés (instanciés) ----------
      const anim = [];
      // cygnes
      const cyg = { P: [], C: [] }, blanc = K(0xf4efe6), rose = K(0xe9dad2), pat = (...a) => S.A(cyg, ...a);
      pat(S.pr('sph', 1), 0, 0.34, 0, 0.42, 0.34, 0.74, 0, blanc, { c2: rose, j: 0.03 });
      pat(S.pr('sph', 1), 0, 0.55, -0.68, 0.17, 0.2, 0.42, 0, blanc, { rx: 0.5, j: 0.03 });
      pat(S.pr('sph', 1), 0.34, 0.5, -0.1, 0.12, 0.3, 0.58, 0, rose, { rz: -0.4, rx: 0.05, j: 0.03 });
      pat(S.pr('sph', 1), -0.34, 0.5, -0.1, 0.12, 0.3, 0.58, 0, rose, { rz: 0.4, rx: 0.05, j: 0.03 });
      S.tube(() => cyg, [[0, 0.5, 0.56], [0, 0.72, 0.8], [0, 1.08, 0.84], [0, 1.3, 0.74], [0, 1.4, 0.76]], (t) => 0.13 - 0.06 * t, blanc, { n: 5 });
      pat(S.pr('sph', 1), 0, 1.43, 0.8, 0.14, 0.12, 0.17, 0, blanc, { j: 0 });
      pat(S.pr('cyl', 4, 0.5), 0, 1.4, 0.93, 0.07, 0.24, 0.05, 0, K(0xff9a3c), { rx: PI / 2 + 0.15, j: 0 });
      pat(S.pr('sph', 0), 0.08, 1.46, 0.86, 0.025, 0.025, 0.025, 0, K(0x30283a), { j: 0 }); pat(S.pr('sph', 0), -0.08, 1.46, 0.86, 0.025, 0.025, 0.025, 0, K(0x30283a), { j: 0 });
      const swans = S.inst(cyg, S.matL, 6); group.add(swans.mesh);
      const nageurs = [
        { cx: xpR - 12, cz: zR + 1.0, a: 7.5, b: 3.4, k: 1, ph: 0.0, rot: 0.0 }, { cx: xpR + 12, cz: zR - 1.0, a: 6.0, b: 3.0, k: -1, ph: 2.1, rot: 0.1 },
        { cx: xpR - 30, cz: zR, a: 6.0, b: 3.2, k: 1, ph: 4.0, rot: 0 }, { cx: xpR + 28, cz: zR + 0.5, a: 5.5, b: 3.0, k: 1, ph: 1.0, rot: 0 },
        { cx: LK.cx + 30, cz: LK.cz - 10, a: 10, b: 7, k: 1, ph: 0.7, rot: 0.5 }, { cx: LK.cx + 20, cz: LK.cz + 14, a: 8, b: 6, k: -1, ph: 3.0, rot: -0.3 },
      ];
      const nivN = (i) => (i < 4 ? nR : nL);
      const posCyg = (n, T) => { const ph = PI2 * n.k * T / L + n.ph, c = Math.cos(n.rot), s = Math.sin(n.rot), lx = n.a * Math.cos(ph), lz = n.b * Math.sin(ph), vx = -n.a * Math.sin(ph) * n.k, vz = n.b * Math.cos(ph) * n.k; return [n.cx + lx * c - lz * s, n.cz + lx * s + lz * c, Math.atan2(vx * c - vz * s, vx * s + vz * c)]; };
      // anneaux d'eau : sillages des cygnes, rebonds de galets, éclaboussures des poissons
      const events = [];   // { x, z, t0, dur, r, niv }
      nageurs.forEach((n, i) => { for (let k = 0; k < 6; k += 1) { const t0 = (k / 6) * L, p = posCyg(n, t0); events.push({ x: p[0] - Math.sin(p[2]) * 0.7, z: p[1] - Math.cos(p[2]) * 0.7, t0: t0 + i * 0.3, dur: 3.4, r: 2.0, niv: nivN(i) }); } });
      const cailloux = [[xpR + 4, zR - 3, 3.5], [xpR - 18, zR + 2, 19.6]];
      cailloux.forEach(([x, z, t]) => { for (let k = 0; k < 5; k += 1) events.push({ x: x - k * k * 0.35 - k * 0.7, z: z + k * 0.45, t0: t + 0.12 * k * k * 0.5 + 0.22 * k, dur: 2.0, r: 1.5 - 0.15 * k, niv: nR }); });
      const poissons = [[xpR - 6, zR + 3.4, 8.5], [xpR + 8, zR - 3.6, 15.0], [xpR + 22, zR + 2.0, 24.5], [xpR - 24, zR - 2.5, 31.0]];
      poissons.forEach(([x, z, t]) => { events.push({ x, z, t0: t + 0.55, dur: 2.2, r: 1.6, niv: nR }); events.push({ x: x + 0.3, z: z + 0.2, t0: t + 0.75, dur: 2.2, r: 1.0, niv: nR }); });
      const anneaux = S.inst((() => { const d = { P: [], C: [] }; S.A(d, S.pr('ring', 24), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })(), new TH.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, fog: true, vertexColors: true, depthWrite: false }), events.length);
      group.add(anneaux.mesh); anneaux.mesh.renderOrder = 2;
      // poissons qui sautent
      const poi = { P: [], C: [] };
      S.A(poi, S.pr('sph', 1), 0, 0, 0, 0.1, 0.12, 0.34, 0, K(0xffa24c), { c2: K(0xfff0d0), j: 0.03 });
      S.A(poi, S.pr('cyl', 3, 0), 0, 0, -0.32, 0.1, 0.18, 0.1, 0, K(0xff7a3c), { rx: -PI / 2, j: 0 });
      const fish = S.inst(poi, S.matL, poissons.length); group.add(fish.mesh);
      // libellules et papillons
      const lib = { P: [], C: [] };
      S.A(lib, S.pr('cyl', 4, 0.6), 0, 0, 0, 0.025, 0.42, 0.025, 0, K(0x3a8cd8), { rx: PI / 2, c2: K(0x40d0c0), j: 0 });
      S.A(lib, S.pr('sph', 0), 0, 0, 0.22, 0.05, 0.05, 0.05, 0, K(0x2a6cb8), { j: 0 });
      [-1, 1].forEach((sg) => [0.04, 0.12].forEach((zz) => S.tri(lib, [0.02 * sg, 0, zz], [0.3 * sg, 0.02, zz + 0.04], [0.28 * sg, 0.02, zz - 0.07], [0.9, 0.97, 1], [0.8, 0.95, 1], [0.8, 0.95, 1])));
      const libs = S.inst(lib, S.matD, 7); group.add(libs.mesh);
      const pap = { P: [], C: [] };
      [-1, 1].forEach((sg) => { S.tri(pap, [0, 0, 0], [0.22 * sg, 0.06, 0.12], [0.2 * sg, 0.02, -0.12], [1, 1, 1], [1, 1, 1], [1, 1, 1]); S.tri(pap, [0, 0, 0], [0.2 * sg, 0.02, -0.12], [0.1 * sg, 0, -0.2], [1, 1, 1], [1, 1, 1], [1, 1, 1]); });
      const paps = S.inst(pap, S.matD, 9); group.add(paps.mesh);
      const coulP = [K(0xffe05a), K(0xffffff), K(0xff8fb8), K(0x8ac8ff), K(0xffa05a), K(0xc8a0ff), K(0xfff08a), K(0xffffff), K(0xff7aa0)];
      coulP.forEach((c, i) => paps.col(i, c));
      const coulL = [K(0x40c8ff), K(0x4fe0b0), K(0xffffff), K(0xff7aa0), K(0x80b0ff), K(0x70e870), K(0xffd070)]; coulL.forEach((c, i) => libs.col(i, c));
      const ancL = [], ancP = [];
      for (let i = 0; i < 7; i += 1) { const s = mix(0.53, 0.75, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(6, 12)); ancL.push({ x: p[0], z: p[2], y: Math.max(p[1], nR) + rr(1.1, 2.2), a: rr(1.5, 3.2), b: rr(1, 2.2), k: 1 + Math.floor(R() * 2), ph: R() * PI2 }); }
      for (let i = 0; i < 9; i += 1) { const s = mix(0.5, 0.76, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(5.2, 11)); ancP.push({ x: p[0], z: p[2], y: p[1] + rr(0.8, 2.0), a: rr(2, 4), b: rr(2, 4), k: 1 + Math.floor(R() * 2), ph: R() * PI2 }); }
      // brume et gouttelettes au pied de la chute
      const gouttes = S.inst((() => { const d = { P: [], C: [] }; S.A(d, S.pr('sph', 0), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })(), new TH.MeshBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.75, fog: true, depthWrite: false, vertexColors: true }), 90);
      group.add(gouttes.mesh); gouttes.mesh.renderOrder = 5;
      const brume = S.inst((() => { const d = { P: [], C: [] }; S.A(d, S.pr('sph', 1), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })(), new TH.MeshBasicMaterial({ color: 0xeaf7ff, transparent: true, opacity: 0.1, fog: true, depthWrite: false, vertexColors: true }), 12);
      group.add(brume.mesh); brume.mesh.renderOrder = 5;
      const mousse = S.inst((() => { const d = { P: [], C: [] }; S.A(d, S.pr('ring', 20), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })(), new TH.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: true, depthWrite: false, vertexColors: true }), 5);
      group.add(mousse.mesh); mousse.mesh.renderOrder = 5;

      const fondE = [0.40, 0.86, 0.9], blancE = [1, 1, 1];
      const ph = (n, T) => PI2 * n * T / L;
      function maj(T) {
        uPh.value = PI2 * ((T / L) % 1);
        // cygnes
        nageurs.forEach((n, i) => { const p = posCyg(n, T), bob = 0.025 * Math.sin(ph(11, T) + i), niv = nivN(i); swans.set(i, p[0], niv + 0.02 + bob, p[1], 0, p[2], 0.04 * Math.sin(ph(7, T) + i * 2), 1.25, 1.25, 1.25); });
        swans.fin();
        // anneaux
        events.forEach((e, i) => {
          const u = (((T - e.t0) / L % 1 + 1) % 1) * L / e.dur;
          if (u < 0 || u >= 1) { anneaux.set(i, 0, -100, 0, 0, 0, 0, 0.001, 0.001, 0.001); return; }
          const r = e.r * (0.15 + 0.85 * Math.sqrt(u)); anneaux.set(i, e.x, e.niv + 0.06, e.z, 0, 0, 0, r, 1, r);
          const f = Math.pow(1 - u, 1.4); anneaux.col(i, [mix(fondE[0], 1, f), mix(fondE[1], 1, f), mix(fondE[2], 1, f)]);
        });
        anneaux.fin();
        // poissons
        poissons.forEach(([x, z, t], i) => {
          const u = ((((T - t) / L) % 1 + 1) % 1) * L / 1.1;
          if (u >= 1) { fish.set(i, 0, -100, 0, 0, 0, 0, 0.001, 0.001, 0.001); return; }
          const sg = i % 2 ? -1 : 1, x1 = x + sg * (u - 0.5) * 2.4, y = nR + 1.3 * 4 * u * (1 - u), vy = 1.3 * 4 * (1 - 2 * u), a = Math.atan2(vy, 1.2 * sg);
          fish.set(i, x1, y, z, 0, sg > 0 ? PI / 2 : -PI / 2, 0, 1.4, 1.4, 1.4); void a;
          fish.set(i, x1, y, z, -Math.atan2(vy, 2.4) * 1.0, sg > 0 ? PI / 2 : -PI / 2, 0, 1.4, 1.4, 1.4);
        });
        fish.fin();
        // libellules : huit lent + vibration d'ailes
        ancL.forEach((a, i) => {
          const p = ph(a.k, T) + a.ph, x = a.x + a.a * Math.sin(p), z = a.z + a.b * Math.sin(2 * p), y = a.y + 0.35 * Math.sin(ph(3, T) + a.ph) + 0.1 * Math.sin(ph(60, T) + i);
          const vx = a.a * Math.cos(p), vz = 2 * a.b * Math.cos(2 * p); libs.set(i, x, y, z, 0, Math.atan2(vx, vz), 0.35 * Math.sin(ph(190, T) + i), 1.6, 1, 1.6);
        });
        libs.fin();
        // papillons
        ancP.forEach((a, i) => {
          const p = ph(a.k, T) + a.ph, x = a.x + a.a * Math.sin(p), z = a.z + a.b * Math.sin(p * 2 + 1), y = a.y + 0.5 * Math.sin(ph(5, T) + a.ph);
          const vx = a.a * Math.cos(p), vz = 2 * a.b * Math.cos(p * 2 + 1), fl = 0.2 + 0.8 * Math.abs(Math.sin(ph(190, T) * 0.5 + i));
          paps.set(i, x, y, z, 0, Math.atan2(vx, vz), 0, 2.2 * fl + 0.4, 2.2, 2.2);
        });
        paps.fin();
        // gouttelettes de la chute
        for (let i = 0; i < 90; i += 1) {
          const per = L / (7 + (i % 4)), u = fr(T / per + hs(i * 3.7)), a = hs(i * 1.9) * PI2, rd = (0.4 + 3.2 * hs(i * 5.3)) * (0.3 + u);
          const y = nR + 0.2 + (2.2 + 3.6 * hs(i * 2.3)) * 4 * u * (1 - u), sz = (0.1 + 0.16 * hs(i * 7.7)) * (1 - 0.5 * u);
          gouttes.set(i, xP + Math.cos(a) * rd, y, zP + Math.sin(a) * rd * 0.8, 0, 0, 0, sz, sz, sz);
        }
        gouttes.fin();
        for (let i = 0; i < 12; i += 1) {
          const u = ph(2, T) + i * 1.3, x = xP + (i - 5.5) * 1.1 + Math.sin(u) * 0.8, y = nR + 1.2 + (i % 3) * 1.3 + 0.4 * Math.sin(ph(3, T) + i), sc = 1.5 + 0.3 * Math.sin(u * 1.0 + 0.5) + (i % 3) * 0.5;
          brume.set(i, x, y, zP + 1.5 + Math.cos(u) * 0.8, 0, 0, 0, sc * 1.2, sc * 0.8, sc);
          brume.col(i, [1, 1, 1]);
        }
        brume.fin();
        for (let i = 0; i < 5; i += 1) {
          const u = fr(ph(1, T) / PI2 * 3 + i / 5), r = 1.2 + u * 4.2; mousse.set(i, xP + 0.4 * Math.sin(i * 1.7), nR + 0.1, zP + 0.4, 0, 0, 0, r * 1.15, 1, r * 0.8);
          const f = 1 - u; mousse.col(i, [mix(fondE[0], 1, f), mix(fondE[1], 1, f), mix(fondE[2], 1, f)]);
        }
        mousse.fin();
      }
      group.add(swans.mesh);
      void blancE; void anim;
      const total2 = S.tris + swans.mesh.userData.tris + 90 * 20 + 7 * 80 + eauP.length / 9 + sheetP.length / 9;
      group.userData.triangles = Math.round(total2);
      maj(0);
      return { group, maj: (T) => maj(T) };
    },
  };

  // ==========================================================================================================
  //  JARDIN ROYAL ET ALLÉE SOLENNELLE
  // ==========================================================================================================
  const jardin = {
    creer(ctx) {
      const TH = ctx.THREE, H = ctx.hauteur, pc = ctx.chemin, L = ctx.L, R = ctx.rng(ctx.graine);
      const S = outils(ctx, 30), W = reperes(ctx), place = W.place, lat = W.lat, LEN = pc.longueur;
      const group = new TH.Group();
      const sa = Math.max(0.0, ctx.zone[0] - 0.03), sb = Math.min(0.99, ctx.zone[1]);
      const rr = (a, b) => a + (b - a) * R();
      const pick = (arr) => arr[Math.floor(R() * arr.length) % arr.length];
      const ph = (n, T) => PI2 * n * T / L;
      // sol exploitable : le noyau fait tomber les côtés de la colline, on ne pose rien dans le vide
      const ok = (x, z) => H(x, z) > W.yAxe(z) - 1.4;
      const C = {
        haie: [K(0x2f8f55), K(0x44a85d), K(0x5bb86a)], haieH: K(0xa6e27c), topi: [K(0x2c8350), K(0x3b9a5c), K(0x4aa862)],
        pierre: K(0xffe3c6), pierreO: K(0xf0c8a6), pierreR: K(0xffd2c4), or: K(0xf6c04e), orF: K(0xc78a2e), blanc: K(0xfff2e4), bois: K(0x6a4a44),
        roses: { rose: K(0xff6f9a), rouge: K(0xe8284e), blanc: [1.45, 1.3, 1.3], corail: K(0xff9a8a) }, feuille: [K(0x3d9a58), K(0x4fae62), K(0x2f8a50)],
        fleurs: [K(0xff6f9a), K(0xfff0a8), K(0xffffff), K(0xc59aff), K(0xff9a5a), K(0xff4f6f), K(0x8ac8ff)],
      };
      const ARCHES = [0.775, 0.815, 0.855, 0.895, 0.935];
      const THEMES = [['rose', 'blanc'], ['rouge', 'rose'], ['blanc', 'rose'], ['rouge', 'blanc'], ['rose', 'rouge']];
      const SOL = 0.952;                           // début de l'allée solennelle
      const FONT = [0.857, -14];                    // fontaine : s et décalage latéral
      const KIOSQUE = [0.905, -15];

      // ---------- haies taillées (sections arrondies, ouvertures, niches) ----------
      const ouvertures = [[0.789, 0.0075], [0.857, 0.011], [0.875, 0.0065], [0.905, 0.011], [0.925, 0.0065]];
      const niches = [[0.801, 0.011, -1], [0.832, 0.011, 1], [0.872, 0.011, 1], [0.884, 0.011, 1], [0.915, 0.011, 1], [0.943, 0.011, -1]];
      const haie = (sg) => {
        const ds = 1.25 / LEN; let run = [], idx = 0;
        const fin = (r) => {
          if (r.length < 2) return;
          const dirs = (n) => [[-sg * n[0], 0, -sg * n[1]], [-sg * n[0], 1, -sg * n[1]], [0, 1, 0], [sg * n[0], 1, sg * n[1]], [sg * n[0], 0, sg * n[1]]];
          for (let i = 0; i < r.length - 1; i += 1) {
            const a = r[i], b = r[i + 1], dr = dirs(a.n), d = S.cell(a.P[0][0], a.P[0][2]).pd;
            for (let e = 0; e < 5; e += 1) S.quad(d, a.P[e], b.P[e], b.P[e + 1], a.P[e + 1], a.C[e], b.C[e], b.C[e + 1], a.C[e + 1], dr[e]);
          }
          [[r[0], -1], [r[r.length - 1], 1]].forEach(([q, sgn]) => {
            const t = q.t, d = S.cell(q.P[0][0], q.P[0][2]).pd, dir = [t[0] * sgn, 0, t[1] * sgn];
            for (let e = 1; e < 5; e += 1) S.tri(d, q.P[0], q.P[e], q.P[e + 1], q.C[0], q.C[e], q.C[e + 1], dir);
          });
        };
        for (let s = sa; s <= sb + 1e-6; s += ds) {
          const solennel = s > SOL;
          if (ouvertures.some(([c, hw]) => Math.abs(s - c) < hw)) { fin(run); run = []; continue; }
          let push = 0; niches.forEach(([c, hw, side]) => { if (side === sg) push += 1.9 * (1 - lis(hw * 0.55, hw, Math.abs(s - c))); });
          const lc = (solennel ? 5.25 : 5.9) + push, ep = solennel ? 0.9 : 1.4, hg = solennel ? 0.8 : 1.75 + 0.07 * Math.sin(idx * 2.1);
          const pl0 = place(s, sg * (lc - ep / 2)), pl1 = place(s, sg * (lc + ep / 2)), pm = place(s, sg * lc), t = pm[3];
          const n = [-t[1], t[0]], yt = pm[1] + hg;
          const c0 = mc(pick(C.haie), pick(C.haie), 0.5), top = mc(c0, C.haieH, 0.3);
          const P = [[pl0[0], pl0[1] - 0.15, pl0[2]], [pl0[0] + sg * n[0] * 0.14, yt - 0.3, pl0[2] + sg * n[1] * 0.14], [pl0[0] + sg * n[0] * 0.32, yt, pl0[2] + sg * n[1] * 0.32],
            [pl1[0] - sg * n[0] * 0.32, yt, pl1[2] - sg * n[1] * 0.32], [pl1[0] - sg * n[0] * 0.14, yt - 0.3, pl1[2] - sg * n[1] * 0.14], [pl1[0], pl1[1] - 0.15, pl1[2]]];
          const Cc = [tn(c0, 0.65), c0, top, top, c0, tn(c0, 0.65)];
          if (ok(pm[0], pm[2])) run.push({ P, C: Cc, n, t }); else { fin(run); run = []; }
          if (!solennel && R() < 0.16 && ok(pm[0], pm[2])) { const q = pick([C.roses.rose, C.roses.blanc, C.roses.corail]), x = pm[0] + sg * n[0] * rr(-0.5, 0.5), z = pm[2] + sg * n[1] * rr(-0.5, 0.5); S.pl(S.pr('sph', 0), x, yt - 0.05, z, 0.17, 0.15, 0.17, 0, q); }
          idx += 1;
        }
        fin(run);
      };
      haie(-1); haie(1);
      // balustrade de pierre (allée solennelle) : remplace les haies, avec urnes fleuries
      const balust = (sg) => {
        for (let s = SOL; s <= sb + 1e-6; s += 1.0 / LEN) {
          const p = place(s, sg * 7.4), t = p[3], ang = Math.atan2(t[0], t[1]);
          if (!ok(p[0], p[2])) continue;
          S.pl(S.pr('box'), p[0], p[1] - 0.1, p[2], 0.45, 0.95, 1.05, ang, C.pierre, { c2: tn(C.pierre, 0.95), j: 0.03 });
          S.pl(S.pr('box'), p[0], p[1] + 0.82, p[2], 0.7, 0.14, 1.1, ang, C.blanc, { j: 0.02 });
        }
        for (let s = SOL + 0.004; s <= sb; s += 0.0145) {
          const p = place(s, sg * 7.4); if (!ok(p[0], p[2])) continue;
          S.pl(S.pr('box'), p[0], p[1] - 0.1, p[2], 0.8, 1.2, 0.8, 0, C.pierre, { c2: C.blanc, j: 0.03 });
          S.pl(S.pr('cyl', 8, 1.5), p[0], p[1] + 1.1, p[2], 0.42, 0.55, 0.42, 0, C.pierreR, { j: 0.03 });
          for (let k = 0; k < 6; k += 1) S.pl(S.pr('sph', 0), p[0] + rr(-0.25, 0.25), p[1] + 1.75 + rr(0, 0.2), p[2] + rr(-0.25, 0.25), 0.2, 0.2, 0.2, 0, pick(C.fleurs.slice(0, 3)));
          S.pl(S.pr('sph', 0), p[0], p[1] + 1.7, p[2], 0.34, 0.2, 0.34, 0, pick(C.feuille));
        }
      };
      balust(-1); balust(1);

      // ---------- arches de roses (≥ 4 m de haut et ≥ 7 m de large libres) ----------
      const arche = (s, th) => {
        const p0 = pc.point(s), t = pc.tangente(s), n = [-t[1], t[0]], yb = p0[1];
        const at = (l, y, al) => [p0[0] + n[0] * l + t[0] * (al || 0), yb + y, p0[2] + n[1] * l + t[1] * (al || 0)];
        const ang = Math.atan2(t[0], t[1]), blanc = C.blanc;
        [-1, 1].forEach((sg) => {
          const b = at(sg * 4.1, 0), g = H(b[0], b[2]);
          S.pl(S.pr('box'), b[0], g - 0.2, b[2], 0.55, 0.55, 0.55, ang, C.pierre, { c2: C.pierreO, j: 0.03 });
          [-0.55, 0.55].forEach((al) => { const q = at(sg * 4.1, 0, al); S.pl(S.pr('cyl', 8, 0.9), q[0], g + 0.25, q[2], 0.13, 4.0, 0.13, 0, blanc, { j: 0.02 }); S.pl(S.pr('sph', 0), q[0], g + 4.3, q[2], 0.17, 0.17, 0.17, 0, C.or, { j: 0 }); });
        });
        const tubeAt = (al) => { const pts = []; for (let i = 0; i <= 24; i += 1) { const a = PI * i / 24; pts.push(at(4.1 * Math.cos(a), 4.2 + 2.1 * Math.sin(a), al)); } return pts; };
        [-0.55, 0.55].forEach((al) => S.tube(null, tubeAt(al), 0.12, blanc, { n: 4, rot: PI / 4, dest: (q) => S.cell(q[0], q[2]).pl }));
        // entretoises longitudinales
        [0.12, 0.3, 0.5, 0.7, 0.88].forEach((u) => { const a = PI * u, l = 4.1 * Math.cos(a), y = 4.2 + 2.1 * Math.sin(a); S.tube(null, [at(l, y, -0.55), at(l, y, 0.55)], 0.06, blanc, { n: 4, dest: (q) => S.cell(q[0], q[2]).pl }); });
        // feuillage et roses
        for (let ri = 0; ri < 2; ri += 1) {
          const al = ri ? 0.55 : -0.55;
          for (let k = 0; k < 20; k += 1) {
            const a = PI * (k + 0.5) / 20, l = 4.1 * Math.cos(a), y = 4.2 + 2.1 * Math.sin(a), q = at(l + rr(-0.12, 0.12), y + rr(-0.1, 0.12), al + rr(-0.25, 0.25));
            const rd = rr(0.36, 0.5); S.pl(S.pr('sph', 0), q[0], q[1], q[2], rd, rd * 0.85, rd, R() * 3, pick(C.feuille), { c2: tn(pick(C.feuille), 1.2) });
            if (R() < 0.7) { const c = th[R() < 0.7 ? 0 : 1], o = at(l * 1.05 + rr(-0.2, 0.2), y + rr(0.1, 0.35), al + rr(-0.3, 0.3)); S.pl(S.pr('sph', 0), o[0], o[1], o[2], 0.22, 0.19, 0.22, 0, C.roses[c], { c2: tn(C.roses[c], 1.25) }); }
          }
        }
        for (let k = 0; k < 9; k += 1) [-1, 1].forEach((sg) => {
          const y = 0.6 + k * 0.45, q = at(sg * (4.1 + rr(-0.1, 0.25)), y, rr(-0.6, 0.6)), rd = rr(0.3, 0.42);
          S.pl(S.pr('sph', 0), q[0], q[1] + H(q[0], q[2]) - yb, q[2], rd, rd * 0.9, rd, R() * 3, pick(C.feuille));
          if (R() < 0.75) { const c = th[R() < 0.65 ? 0 : 1], o = at(sg * (4.1 - 0.22 + rr(-0.1, 0.1)), y + 0.05, rr(-0.6, 0.6)); S.pl(S.pr('sph', 0), o[0], o[1] + H(o[0], o[2]) - yb, o[2], 0.21, 0.19, 0.21, 0, C.roses[c]); }
        });
        // guirlandes qui pendent (restent au-dessus de 4,5 m)
        for (let k = 0; k < 8; k += 1) {
          const a = PI * (0.12 + 0.76 * R()), l = 4.1 * Math.cos(a), y = 4.2 + 2.1 * Math.sin(a), al = R() < 0.5 ? -0.55 : 0.55, len = Math.min(rr(0.6, 1.1), y - 4.55 + (Math.abs(l) > 3.5 ? 1.5 : 0));
          const q = at(l, y - 0.1, al); if (len < 0.2) continue;
          S.tube(null, [q, [q[0], q[1] - len * 0.5, q[2]], [q[0], q[1] - len, q[2]]], 0.035, K(0x3a9a58), { n: 3, dest: (z) => S.cell(z[0], z[2]).pd });
          const c = th[0]; S.pl(S.pr('sph', 0), q[0], q[1] - len, q[2], 0.18, 0.18, 0.18, 0, C.roses[c]);
        }
      };
      ARCHES.forEach((s, i) => arche(s, THEMES[i % THEMES.length].slice()));

      // ---------- lampadaires dorés (lanternes lumineuses + halos) ----------
      const halos = [];
      const lampadaire = (s, sg, haut) => {
        const p = place(s, sg * 4.4), t = p[3], ang = Math.atan2(t[0], t[1]), g = p[1], n = [-t[1], t[0]];
        if (!ok(p[0], p[2])) return;
        S.pl(S.pr('box'), p[0], g - 0.1, p[2], 0.5, 0.55, 0.5, ang, C.pierre, { c2: C.pierreO, j: 0.03 });
        S.pl(S.pr('cyl', 8, 0.7), p[0], g + 0.4, p[2], 0.2, 0.2, 0.2, 0, C.orF, { j: 0.02 });
        S.pl(S.pr('cyl', 8, 0.65), p[0], g + 0.55, p[2], 0.095, haut - 0.7, 0.095, 0, C.bois, { c2: tn(C.bois, 1.2), j: 0.02 });
        S.pl(S.pr('cyl', 8, 1), p[0], g + 1.4, p[2], 0.15, 0.09, 0.15, 0, C.or, { j: 0 });
        S.pl(S.pr('cyl', 8, 1), p[0], g + haut * 0.55, p[2], 0.14, 0.08, 0.14, 0, C.or, { j: 0 });
        const lant = (x, y, z, k) => {
          S.pl(S.pr('cyl', 6, 1), x, y - 0.05, z, 0.3 * k, 0.07, 0.3 * k, 0, C.orF, { j: 0 });
          S.ba(S.pr('cyl', 6, 0.9), x, y, z, 0.25 * k, 0.55 * k, 0.25 * k, 0, K(0xffcc66), { c2: K(0xfff0b8) });
          S.pl(S.pr('cyl', 6, 0.1), x, y + 0.55 * k, z, 0.36 * k, 0.3 * k, 0.36 * k, 0, C.or, { c2: K(0xffe08a), j: 0.02 });
          S.pl(S.pr('sph', 0), x, y + 0.88 * k, z, 0.06 * k, 0.06 * k, 0.06 * k, 0, C.or, { j: 0 });
          halos.push([x, y + 0.28 * k, z, k, Math.atan2(-t[0], -t[1])]);
        };
        lant(p[0], g + haut, p[2], haut > 4 ? 1.25 : 1);
        if (haut > 4) [-1, 1].forEach((d) => {
          const e = [p[0] + t[0] * d * 0.75, g + haut - 1.1, p[2] + t[1] * d * 0.75];
          S.tube(null, [[p[0], g + haut - 0.8, p[2]], [p[0] + t[0] * d * 0.35, g + haut - 0.62, p[2] + t[1] * d * 0.35], [e[0], e[1] + 0.2, e[2]]], 0.04, C.orF, { n: 3, dest: (z) => S.cell(z[0], z[2]).pd });
          lant(e[0], e[1] - 0.35, e[2], 0.8);
        });
        void n;
      };
      for (let i = 0; i < ARCHES.length; i += 1) [-1, 1].forEach((sg) => { lampadaire(ARCHES[i] + 0.03 + (sg > 0 ? 0.002 : 0), sg, 3.7); });
      [0.757, 0.77].forEach((s) => [-1, 1].forEach((sg) => lampadaire(s, sg, 3.7)));
      for (let k = 0; k < 4; k += 1) [-1, 1].forEach((sg) => lampadaire(SOL + 0.006 + k * 0.0125, sg, 5.4));

      // ---------- mâts, bannières (mobiles) et fanions ----------
      const mats = [];
      const MAT_S = []; ARCHES.forEach((s) => MAT_S.push(s + 0.0105)); MAT_S.unshift(0.7615);
      for (let k = 0; k < 4; k += 1) MAT_S.push(SOL + 0.0125 * k + 0.0125 * 0.5 + 0.006);
      const couleursB = [[K(0xd8284e), K(0xf6c04e)], [K(0x4a58c8), K(0xf6c04e)], [K(0xf6c04e), K(0xd8284e)], [K(0x8a4ac8), K(0xffe6a0)]];
      MAT_S.forEach((s, i) => [-1, 1].forEach((sg) => {
        const solen = s > SOL, hm = solen ? 7.2 : 6.0, p = place(s, sg * 4.75), t = p[3]; if (!ok(p[0], p[2])) return;
        S.pl(S.pr('cyl', 6, 0.6), p[0], p[1] - 0.1, p[2], 0.1, hm, 0.1, 0, C.bois, { c2: tn(C.bois, 1.2), j: 0.02 });
        S.pl(S.pr('sph', 1), p[0], p[1] + hm, p[2], 0.17, 0.17, 0.17, 0, C.or, { j: 0 });
        const cb = couleursB[(i + (sg > 0 ? 1 : 0)) % couleursB.length], bw = 0.95, bl = solen ? 4.2 : 3.2, yt = p[1] + hm - 0.45;
        S.tube(null, [[p[0] - sg * 0.0 - (-t[1]) * bw * 0.5 * 0, yt + 0.05, p[2]], [p[0], yt + 0.05, p[2]]], 0.01, C.or, { n: 3, dest: (z) => S.cell(z[0], z[2]).pd });
        mats.push({ x: p[0], y: yt, z: p[2], t, n: [-t[1], t[0]], bw, bl, cb, ph: i * 1.3 + (sg > 0 ? 0.9 : 0), solen });
      }));
      // fanions : guirlandes triangulaires entre mâts voisins du même côté
      [-1, 1].forEach((sg) => {
        const list = MAT_S.filter((s) => s < SOL).sort((a, b) => a - b);
        for (let i = 0; i < list.length - 1; i += 1) {
          const a = place(list[i], sg * 4.75), b = place(list[i + 1], sg * 4.75), N = 14;
          const pt = (u) => [mix(a[0], b[0], u), mix(a[1], b[1], u) + 5.7 - 1.0 * 4 * u * (1 - u) * 1.0 + 0, mix(a[2], b[2], u)];
          for (let k = 0; k < N; k += 1) {
            const u = (k + 0.5) / N, c = pt(u), c1 = pt(u - 0.3 / N), c2 = pt(u + 0.3 / N), col = [K(0xff6f9a), K(0xfff0a8), K(0x8ac8ff), K(0xf6c04e), K(0xffffff)][k % 5];
            S.tri(S.cell(c[0], c[2]).pd, c1, c2, [c[0], c[1] - 0.55, c[2]], col, col, tn(col, 0.85));
          }
          S.tube(null, Array.from({ length: 12 }, (_, k) => pt(k / 11)), 0.012, K(0xf6e0b0), { n: 3, dest: (z) => S.cell(z[0], z[2]).pd });
        }
      });

      // ---------- dallage le long du chemin ----------
      [-1, 1].forEach((sg) => {
        let k = 0;
        for (let s = sa; s < sb; s += 0.95 / LEN) {
          const A0 = place(s, sg * 4.05), A1 = place(s, sg * 5.05), B0 = place(s + 0.85 / LEN, sg * 4.05), B1 = place(s + 0.85 / LEN, sg * 5.05);
          if (!ok(A0[0], A0[2])) continue;
          const c = (k % 2) ? K(0xffe6cc) : K(0xf6d4b4), y = 0.05, d = S.cell(A0[0], A0[2]).pd;
          const V = (p) => [p[0], p[1] + y, p[2]];
          S.quad(d, V(A0), V(A1), V(B1), V(B0), c, c, tn(c, 0.96), tn(c, 0.96), [0, 1, 0]); k += 1;
        }
      });

      // ---------- parterres brodés (motifs dessinés sur le sol, avec petites fleurs en relief) ----------
      const drap = (cx, cz, ang, w, d, pas, cfn, fl) => {
        const ca = Math.cos(ang), sa2 = Math.sin(ang);
        const P = (u, v) => { const x = cx + u * ca - v * sa2, z = cz + u * sa2 + v * ca; return [x, H(x, z) + 0.1, z]; };
        for (let u = -w / 2; u < w / 2 - 1e-6; u += pas) for (let v = -d / 2; v < d / 2 - 1e-6; v += pas) {
          const c = cfn(u + pas / 2, v + pas / 2); if (!c) continue;
          const a = P(u, v), b = P(u + pas, v), cc = P(u + pas, v + pas), e = P(u, v + pas), dd = S.cell(a[0], a[2]).pd;
          S.quad(dd, a, b, cc, e, c.c, c.c, c.c, c.c, [0, 1, 0]);
          if (c.f && R() < fl) { const q = P(u + pas / 2, v + pas / 2); S.pl(S.pr('cyl', 3, 0.1), q[0], q[1], q[2], 0.05, 0.28, 0.05, 0, K(0x3a9a58), { j: 0 }); S.pl(S.pr('sph', 0), q[0], q[1] + 0.3, q[2], 0.13, 0.11, 0.13, 0, c.c, { c2: tn(c.c, 1.2) }); }
        }
      };
      const gravier = K(0xf6dcbc), herbe = K(0x4aa862);
      const motifs = {
        cercle: (r) => (u, v) => { const d = Math.hypot(u, v) / r; if (d > 1) return null; if (Math.abs(u) < 0.3 || Math.abs(v) < 0.3) return { c: gravier }; const k = Math.floor(d * 5); return [{ c: C.roses.rouge, f: 1 }, { c: C.roses.blanc, f: 1 }, { c: C.roses.rose, f: 1 }, { c: K(0xffd84a), f: 1 }, { c: K(0x3a9a58) }][Math.min(k, 4)]; },
        losange: (r) => (u, v) => { if (Math.abs(u) > r || Math.abs(v) > r) return null; const du = Math.abs(((u + r) % 2 + 2) % 2 - 1), dv = Math.abs(((v + r) % 2 + 2) % 2 - 1); const k = du + dv < 1 ? 0 : 1; if (Math.abs(u) > r - 0.5 || Math.abs(v) > r - 0.5) return { c: K(0x3a9a58) }; return k ? { c: pick2(C.roses.blanc, K(0xc59aff)), f: 1 } : { c: K(0xff9ab8), f: 1 }; },
        rayures: (r) => (u, v) => { if (Math.abs(u) > r || Math.abs(v) > r * 0.7) return null; if (Math.abs(u) > r - 0.4 || Math.abs(v) > r * 0.7 - 0.4) return { c: K(0x3a9a58) }; const k = Math.floor((u + r) / 1.0) % 3; return { c: [C.roses.rose, K(0xfff0a8), C.roses.rouge][k], f: 1 }; },
      };
      function pick2(a, b) { return R() < 0.5 ? a : b; }
      [[0.763, 11.5, 'cercle', 4.2, 0], [0.775, -12, 'losange', 4.2, 0], [0.835, 11.5, 'rayures', 4.2, 0], [0.925, 12.5, 'cercle', 4.2, 0], [0.945, -12.5, 'losange', 4.2, 0], [0.805, 12, 'rayures', 4.0, 0], [0.88, 12.5, 'cercle', 3.6, 0], [0.965, 11, 'cercle', 3.4, 0], [0.965, -11, 'cercle', 3.4, 0]].forEach(([s, l, k, r]) => {
        const p = place(s, l); if (!ok(p[0], p[2])) return;
        const t = p[3], ang = Math.atan2(t[0], -t[1]) * 0 + Math.atan2(t[0], t[1]) * 0; void ang;
        drap(p[0], p[2], Math.atan2(-t[0], t[1]) * 0, r * 2, r * 2, 0.5, motifs[k](r), 0.3);
        // bordure de buis autour
        for (let a = 0; a < 18; a += 1) { const q = a / 18 * PI2; if (k === 'cercle') { const x = p[0] + Math.cos(q) * (r + 0.1), z = p[2] + Math.sin(q) * (r + 0.1); S.pl(S.pr('sph', 0), x, H(x, z) + 0.2, z, 0.28, 0.24, 0.28, 0, pick(C.topi)); } }
      });

      // ---------- fontaine à trois vasques sur sa placette ----------
      const fp = place(FONT[0], FONT[1]), fx = fp[0], fz = fp[2], fy = H(fx, fz);
      const plaza = () => {
        const rings = 10, segs = 40, Rp = 7.6, P = (rd, a) => { const x = fx + Math.cos(a) * rd, z = fz + Math.sin(a) * rd; return [x, H(x, z) + 0.15, z]; };
        for (let i = 0; i < rings; i += 1) for (let j = 0; j < segs; j += 1) {
          const r0 = (i / rings) * Rp, r1 = ((i + 1) / rings) * Rp, a0 = (j / segs) * PI2, a1 = ((j + 1) / segs) * PI2;
          if (r1 < 3.5) continue;
          const chk = (i + j) % 2, ring = i >= rings - 1, c = ring ? K(0xe8b896) : (chk ? K(0xffe6cc) : K(0xf6d2b0));
          const a = P(r0, a0), b = P(r1, a0), cc = P(r1, a1), e = P(r0, a1);
          S.quad(S.cell(a[0], a[2]).pd, a, b, cc, e, c, c, tn(c, 0.97), tn(c, 0.97), [0, 1, 0]);
        }
        // allée de liaison vers le chemin
        const pm = place(FONT[0], 4.05), pe = place(FONT[0], FONT[1] - 7.4), pl0 = (l) => place(FONT[0], l);
        const sgF = FONT[1] < 0 ? -1 : 1;
        for (let l = 4.05; l < Math.abs(FONT[1]) - 7.3; l += 0.9) {
          const A0 = pl0(sgF * l), A1 = pl0(sgF * (l + 0.85)); [[-1.5, 1.5]].forEach(() => {
            const wv = (q, off) => { const t = q[3]; return [q[0] - t[1] * 0 + (-t[1]) * 0 + 0, q[1], q[2]]; };
            const t = A0[3], n = [-t[1], t[0]];
            const Q = (q, o) => [q[0] + n[0] * 0 + t[0] * o, q[1] + 0.12, q[2] + t[1] * o];
            const c = (Math.floor(l / 0.9) % 2) ? K(0xffe6cc) : K(0xf6d2b0);
            S.quad(S.cell(A0[0], A0[2]).pd, Q(A0, -1.5), Q(A0, 1.5), Q(A1, 1.5), Q(A1, -1.5), c, c, c, c, [0, 1, 0]);
          });
          void wv0; void pm; void pe;
        }
      };
      var wv0 = 0;
      plaza();
      const fontaine = () => {
        const pi = S.pr('cyl', 24, 1);
        const wall = (r, h, y, c) => S.pl(S.pr('cyl', 24, 1.0), fx, fy + y, fz, r, h, r, 0, c, { j: 0.03 });
        wall(3.5, 0.18, 0.0, K(0xf0c8a6));
        wall(3.3, 0.85, 0.0, C.pierre);
        S.pl(S.pr('cyl', 24, 1.06), fx, fy + 0.8, fz, 3.55, 0.16, 3.55, 0, C.blanc, { j: 0.02 });
        S.ba(S.pr('disc', 24), fx, fy + 0.66, fz, 3.15, 1, 3.15, 0, K(0x6cd0e8), { c2: K(0x6cd0e8), j: 0 });
        S.pl(S.pr('cyl', 12, 0.6), fx, fy + 0.2, fz, 0.7, 1.35, 0.7, 0, C.pierre, { c2: C.pierreR, j: 0.03 });
        S.pl(S.pr('cyl', 20, 0.5), fx, fy + 1.4, fz, 2.0, 0.5, 2.0, 0, C.pierre, { c2: C.pierreR, j: 0.03 });
        S.pl(S.pr('cyl', 20, 1.05), fx, fy + 1.85, fz, 1.98, 0.12, 1.98, 0, C.blanc, { j: 0.02 });
        S.ba(S.pr('disc', 20), fx, fy + 1.82, fz, 1.78, 1, 1.78, 0, K(0x7adcec), { j: 0 });
        S.pl(S.pr('cyl', 10, 0.55), fx, fy + 1.8, fz, 0.42, 1.0, 0.42, 0, C.pierre, { c2: C.pierreR, j: 0.03 });
        S.pl(S.pr('cyl', 16, 0.5), fx, fy + 2.7, fz, 1.05, 0.38, 1.05, 0, C.pierre, { c2: C.pierreR, j: 0.03 });
        S.pl(S.pr('cyl', 16, 1.05), fx, fy + 3.05, fz, 1.03, 0.1, 1.03, 0, C.blanc, { j: 0.02 });
        S.ba(S.pr('disc', 16), fx, fy + 3.02, fz, 0.9, 1, 0.9, 0, K(0x8ae6f4), { j: 0 });
        S.pl(S.pr('cyl', 8, 0.5), fx, fy + 2.95, fz, 0.2, 0.7, 0.2, 0, C.pierre, { j: 0.03 });
        S.pl(S.pr('sph', 1), fx, fy + 3.75, fz, 0.26, 0.26, 0.26, 0, C.or, { j: 0 });
        // petits dauphins/vasques : quatre boules ornementales autour du bassin
        for (let k = 0; k < 8; k += 1) { const a = k / 8 * PI2, x = fx + Math.cos(a) * 3.45, z = fz + Math.sin(a) * 3.45; S.pl(S.pr('sph', 1), x, fy + 1.05, z, 0.2, 0.2, 0.2, 0, C.or, { j: 0 }); }
        // massifs de roses autour de la placette
        for (let k = 0; k < 16; k += 1) { const a = k / 16 * PI2 + 0.1, rd = 8.4, x = fx + Math.cos(a) * rd, z = fz + Math.sin(a) * rd; if (!ok(x, z) || Math.abs(lat(x, z)) < 5.4) continue; const y = H(x, z); S.pl(S.pr('sph', 1), x, y + 0.45, z, 0.75, 0.55, 0.75, R() * 3, pick(C.feuille)); for (let b = 0; b < 5; b += 1) S.pl(S.pr('sph', 0), x + rr(-0.5, 0.5), y + 0.8, z + rr(-0.5, 0.5), 0.2, 0.18, 0.2, 0, pick([C.roses.rose, C.roses.rouge, C.roses.blanc])); }
        void pi;
      };
      fontaine();

      // ---------- kiosque à roses (gloriette) ----------
      {
        const kp = place(KIOSQUE[0], KIOSQUE[1]), kx = kp[0], kz = kp[2], ky = H(kx, kz);
        for (let i = 0; i < 9; i += 1) { const r = 5.2 - 0, rings = [5.0, 4.0, 3.2]; void r; void rings; }
        S.pl(S.pr('cyl', 8, 1), kx, ky - 0.1, kz, 4.3, 0.4, 4.3, PI / 8, C.pierreO, { j: 0.03 });
        S.pl(S.pr('cyl', 8, 1), kx, ky + 0.25, kz, 3.8, 0.18, 3.8, PI / 8, C.pierre, { j: 0.03 });
        for (let k = 0; k < 8; k += 1) {
          const a = k / 8 * PI2, x = kx + Math.cos(a) * 3.2, z = kz + Math.sin(a) * 3.2;
          S.pl(S.pr('cyl', 8, 0.9), x, ky + 0.4, z, 0.14, 3.3, 0.14, 0, C.blanc, { j: 0.02 }); S.pl(S.pr('sph', 0), x, ky + 3.8, z, 0.2, 0.2, 0.2, 0, C.or, { j: 0 });
          for (let b = 0; b < 4; b += 1) { const hh = 0.8 + b * 0.8; S.pl(S.pr('sph', 0), x + rr(-0.1, 0.1), ky + hh, z + rr(-0.1, 0.1), 0.3, 0.3, 0.3, 0, pick(C.feuille)); if (R() < 0.8) S.pl(S.pr('sph', 0), x + Math.cos(a) * 0.25, ky + hh + 0.1, z + Math.sin(a) * 0.25, 0.17, 0.15, 0.17, 0, pick([C.roses.rose, C.roses.rouge, C.roses.blanc])); }
          const a2 = (k + 1) / 8 * PI2, x2 = kx + Math.cos(a2) * 3.2, z2 = kz + Math.sin(a2) * 3.2;
          S.tube(null, [[x, ky + 3.7, z], [x2, ky + 3.7, z2]], 0.09, C.blanc, { n: 4, dest: (q) => S.cell(q[0], q[2]).pl });
        }
        S.pl(S.pr('cyl', 8, 0.0), kx, ky + 3.7, kz, 4.3, 2.0, 4.3, PI / 8, K(0xff9ab8), { c2: K(0xffc4d6), j: 0.04 });
        S.pl(S.pr('cyl', 8, 1.0), kx, ky + 3.65, kz, 4.35, 0.14, 4.35, PI / 8, C.or, { j: 0 });
        S.pl(S.pr('sph', 1), kx, ky + 5.8, kz, 0.28, 0.28, 0.28, 0, C.or, { j: 0 });
        S.pl(S.pr('cyl', 6, 0.0), kx, ky + 5.8, kz, 0.1, 0.6, 0.1, 0, C.or, { j: 0 });
        // banc intérieur
        S.pl(S.pr('box'), kx + 0.0, ky + 0.45, kz - 1.8, 1.8, 0.12, 0.5, 0, C.pierre); S.pl(S.pr('box'), kx - 0.7, ky + 0.25, kz - 1.8, 0.15, 0.25, 0.45, 0, C.pierreO); S.pl(S.pr('box'), kx + 0.7, ky + 0.25, kz - 1.8, 0.15, 0.25, 0.45, 0, C.pierreO);
        halos.push([kx, ky + 3.4, kz, 1.4, 0]);
        S.ba(S.pr('sph', 1), kx, ky + 3.4, kz, 0.2, 0.26, 0.2, 0, K(0xffd070), { c2: K(0xfff0b8) });
      }

      // ---------- topiaires, statues, bancs, arbres ----------
      const topi = (x, z, type) => {
        const y = H(x, z) - 0.05, c1 = pick(C.topi), c2 = tn(c1, 1.25);
        const pot = () => S.pl(S.pr('cyl', 8, 1.2), x, y, z, 0.42, 0.55, 0.42, 0, K(0xe8a47c), { c2: K(0xf6c4a0), j: 0.03 });
        pot();
        if (type === 0) { S.pl(S.pr('cyl', 5, 0.7), x, y + 0.5, z, 0.08, 0.6, 0.08, 0, C.bois); S.pl(S.pr('sph', 1), x, y + 1.6, z, 0.75, 0.75, 0.75, R() * 3, c1, { c2 }); }
        else if (type === 1) { S.pl(S.pr('sph', 1), x, y + 1.15, z, 0.62, 0.55, 0.62, 0, c1); S.pl(S.pr('sph', 1), x, y + 1.95, z, 0.46, 0.42, 0.46, 0, c1); S.pl(S.pr('sph', 1), x, y + 2.55, z, 0.3, 0.28, 0.3, 0, c2); }
        else if (type === 2) { [[0.95, 0.9, 0.55], [0.72, 0.8, 1.3], [0.5, 0.75, 1.95], [0.3, 0.7, 2.55]].forEach(([r, h, yy], i) => S.pl(S.pr('cyl', 8, 0.35), x, y + yy, z, r, h, r, i, c1, { c2 })); S.pl(S.pr('sph', 0), x, y + 3.3, z, 0.14, 0.14, 0.14, 0, C.or, { j: 0 }); }
        else if (type === 3) { S.pl(S.pr('cyl', 10, 0.1), x, y + 0.5, z, 0.8, 3.0, 0.8, 0, c1, { c2 }); const pts = []; for (let i = 0; i <= 24; i += 1) { const u = i / 24, a = u * PI2 * 2.6, r = 0.72 * (1 - u) + 0.1; pts.push([x + Math.cos(a) * r, y + 0.7 + 2.5 * u, z + Math.sin(a) * r]); } S.tube(null, pts, 0.15, K(0x7fd070), { n: 4, dest: (q) => S.cell(q[0], q[2]).pl }); }
        else if (type === 4) { S.pl(S.pr('sph', 1), x, y + 1.15, z, 0.62, 0.52, 0.8, 0, c1); S.pl(S.pr('sph', 1), x, y + 1.75, z + 0.65, 0.34, 0.34, 0.34, 0, c1); S.pl(S.pr('cyl', 4, 0.1), x, y + 1.72, z + 1.0, 0.07, 0.3, 0.07, 0, K(0xf6c04e), { rx: PI / 2, j: 0 }); S.pl(S.pr('cyl', 5, 0.1), x, y + 1.3, z - 0.75, 0.2, 0.6, 0.2, 0, c2, { rx: -2.0 }); }
        else { S.pl(S.pr('sph', 1), x, y + 1.1, z, 0.5, 0.45, 0.6, 0, c1); S.pl(S.pr('sph', 1), x, y + 1.65, z + 0.38, 0.3, 0.3, 0.32, 0, c1); S.pl(S.pr('sph', 1), x - 0.12, y + 2.2, z + 0.4, 0.1, 0.38, 0.1, 0, c2); S.pl(S.pr('sph', 1), x + 0.12, y + 2.2, z + 0.4, 0.1, 0.38, 0.1, 0, c2); S.pl(S.pr('sph', 0), x, y + 1.05, z - 0.55, 0.15, 0.15, 0.15, 0, K(0xffffff), { j: 0 }); }
      };
      const statue = (x, z, ry, type) => {
        const y = H(x, z) - 0.05;
        S.pl(S.pr('box'), x, y, z, 1.0, 0.45, 1.0, ry, C.pierreO, { j: 0.03 }); S.pl(S.pr('box'), x, y + 0.4, z, 0.8, 1.1, 0.8, ry, C.pierre, { c2: C.blanc, j: 0.03 }); S.pl(S.pr('box'), x, y + 1.45, z, 1.0, 0.14, 1.0, ry, C.blanc, { j: 0.02 });
        if (type === 0) {
          S.pl(S.pr('cyl', 8, 0.45), x, y + 1.55, z, 0.34, 1.25, 0.34, 0, C.pierre, { c2: C.blanc, j: 0.03 });
          S.pl(S.pr('sph', 1), x, y + 2.95, z, 0.19, 0.2, 0.19, 0, C.blanc, { j: 0.02 });
          const cs = Math.cos(ry), sn = Math.sin(ry);
          [-1, 1].forEach((sg) => { S.tri(S.cell(x, z).pd, [x + cs * 0.1 * sg, y + 2.5, z - sn * 0.1 * sg], [x + cs * 0.95 * sg - sn * -0.25, y + 3.55, z - sn * 0.95 * sg + cs * -0.25], [x + cs * 0.75 * sg, y + 2.1, z - sn * 0.75 * sg], C.blanc, C.pierre, C.pierre); });
        } else {
          S.pl(S.pr('cyl', 10, 1.5), x, y + 1.55, z, 0.38, 0.55, 0.38, 0, C.pierre, { c2: C.blanc, j: 0.03 }); S.pl(S.pr('cyl', 10, 0.6), x, y + 2.05, z, 0.5, 0.25, 0.5, 0, C.blanc, { j: 0.02 });
          for (let b = 0; b < 7; b += 1) S.pl(S.pr('sph', 0), x + rr(-0.3, 0.3), y + 2.4 + rr(0, 0.25), z + rr(-0.3, 0.3), 0.2, 0.18, 0.2, 0, pick(C.fleurs.slice(0, 5)));
          S.pl(S.pr('sph', 0), x, y + 2.35, z, 0.4, 0.2, 0.4, 0, pick(C.feuille));
        }
      };
      const banc = (x, z, ry) => {
        const y = H(x, z) - 0.05, c = Math.cos(ry), s2 = Math.sin(ry), at = (a, b) => [x + c * a + s2 * b, z - s2 * a + c * b];
        S.pl(S.pr('box'), x, y + 0.5, z, 1.9, 0.14, 0.55, ry, C.pierre, { j: 0.02 });
        [-0.8, 0.8].forEach((a) => { const q = at(a, 0); S.pl(S.pr('box'), q[0], y, q[1], 0.16, 0.52, 0.5, ry, C.pierreO, { j: 0.02 }); });
        const q = at(0, -0.25); S.pl(S.pr('box'), q[0], y + 0.55, q[1], 1.9, 0.5, 0.1, ry, C.pierre, { c2: C.blanc, j: 0.02 });
      };
      const cypres = (x, z, h) => { const y = H(x, z) - 0.2, k = h / 7, c = pick(C.topi); S.pl(S.pr('cyl', 7, 0.5), x, y, z, 1.1 * k, h * 0.5, 1.1 * k, 0, c); S.pl(S.pr('cyl', 7, 0.35), x, y + h * 0.3, z, 0.95 * k, h * 0.45, 0.95 * k, 1, c, { c2: tn(c, 1.2) }); S.pl(S.pr('cyl', 7, 0.0), x, y + h * 0.55, z, 0.7 * k, h * 0.45, 0.7 * k, 2, c, { c2: tn(c, 1.3) }); };
      const fleuri = (x, z, h) => {
        const y = H(x, z) - 0.1, k = h / 5, c1 = pick([K(0xff8fb8), K(0xffa88a), K(0xffb87a), K(0xff7fae)]);
        S.pl(S.pr('cyl', 6, 0.6), x, y, z, 0.28 * k, h * 0.55, 0.28 * k, 0, K(0x7a5a52));
        for (let b = 0; b < 5; b += 1) { const a = b * 1.3 + R(), d = rr(0.4, 1.4) * k; S.pl(S.pr('sph', 1), x + Math.cos(a) * d, y + h * rr(0.62, 0.9), z + Math.sin(a) * d, rr(1.1, 1.6) * k, rr(0.85, 1.2) * k, rr(1.1, 1.6) * k, R() * 3, mc(c1, K(0xffe4c8), R() * 0.4), { c2: K(0xffe0d0) }); }
      };
      // placement : topiaires en vis-à-vis de chaque ouverture et de chaque arche, statues et bancs dans les niches
      ouvertures.forEach(([c, hw]) => [-1, 1].forEach((sg) => { [-1, 1].forEach((e) => { const p = place(c + e * (hw + 0.004), sg * 7.0); if (ok(p[0], p[2]) && p[0] === p[0]) topi(p[0], p[2], Math.floor(R() * 6)); }); }));
      niches.forEach(([c, hw, sg], i) => {
        const pb = place(c, sg * 5.6), pt = pc.tangente(c); const ry = Math.atan2(-sg * -pt[1] * 0 + (-sg) * (-pt[1]) * 0 + (-sg) * (-pt[1]), (-sg) * pt[0]);
        void ry;
        const facing = Math.atan2(-sg * (-pt[1]), -sg * pt[0]);
        if (!ok(pb[0], pb[2])) return;
        if (i % 2 === 0) banc(pb[0], pb[2], facing); else statue(pb[0], pb[2], facing, i % 4 === 1 ? 0 : 1);
        const p2 = place(c, sg * 7.6); if (ok(p2[0], p2[2]) && i % 2 === 1) { const q = place(c, sg * 7.9); topi(q[0], q[2], 2); }
      });
      // topiaires derrière les haies, régulièrement
      for (let s = sa + 0.004; s < sb - 0.005; s += 0.0155) [-1, 1].forEach((sg) => {
        if (s > SOL) return; const p = place(s + rr(-0.003, 0.003), sg * rr(8.3, 9.4)); if (!ok(p[0], p[2])) return;
        if (Math.hypot(p[0] - fx, p[2] - fz) < 9 || Math.abs(lat(p[0], p[2])) < 7.2) return; topi(p[0], p[2], Math.floor(R() * 6));
      });
      // statues en fond de chaque côté de l'allée solennelle, et grands cônes
      [0.968, 0.982].forEach((s, i) => [-1, 1].forEach((sg) => { const p = place(s, sg * 9.5); if (ok(p[0], p[2])) { statue(p[0], p[2], Math.atan2(-sg * -p[3][1], -sg * p[3][0]), (i + (sg > 0 ? 1 : 0)) % 2); } }));
      for (let k = 0; k < 40; k += 1) { const s = mix(sa, sb, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(12, 27)); if (!ok(p[0], p[2]) || Math.hypot(p[0] - fx, p[2] - fz) < 9.5) continue; const kp2 = place(KIOSQUE[0], KIOSQUE[1]); if (Math.hypot(p[0] - kp2[0], p[2] - kp2[2]) < 6) continue; if (R() < 0.6) cypres(p[0], p[2], rr(6, 10)); else fleuri(p[0], p[2], rr(4.5, 6.5)); }
      // parterres de pelouse : bandes plus claires et fleurs sauvages dans l'herbe
      for (let k = 0; k < 70; k += 1) {
        const s = mix(sa, sb, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(7, 16)); if (!ok(p[0], p[2]) || Math.abs(lat(p[0], p[2])) < 7 || Math.hypot(p[0] - fx, p[2] - fz) < 8.6) continue;
        const c = pick(C.fleurs); for (let b = 0; b < 5; b += 1) { const x = p[0] + rr(-1, 1), z = p[2] + rr(-1, 1); const y = H(x, z); S.pl(S.pr('cyl', 3, 0.6), x, y, z, 0.03, 0.4, 0.03, 0, K(0x3a9a58), { j: 0 }); S.pl(S.pr('sph', 0), x, y + 0.42, z, 0.12, 0.1, 0.12, 0, R() < 0.7 ? c : pick(C.fleurs)); }
      }
      // pétales au sol
      for (let k = 0; k < 260; k += 1) {
        const s = mix(sa, sb, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(4.1, 10)); if (!ok(p[0], p[2])) continue;
        S.pd(S.pr('disc', 5), p[0], p[1] + 0.07, p[2], 0.13, 1, 0.09, R() * PI2, pick([K(0xff9ab8), K(0xffd0dc), K(0xff6f9a), K(0xfff0f0)]), { j: 0 });
      }

      // portique d'honneur et guirlandes suspendues au-dessus de l'allée solennelle (tout reste au-dessus de 4,6 m)
      {
        const sP = 0.9685, p0 = pc.point(sP), t = pc.tangente(sP), n = [-t[1], t[0]], at = (l, y, al) => [p0[0] + n[0] * l + t[0] * (al || 0), p0[1] + y, p0[2] + n[1] * l + t[1] * (al || 0)], ang = Math.atan2(t[0], t[1]);
        [-1, 1].forEach((sg) => {
          const b = at(sg * 4.35, 0), g = H(b[0], b[2]);
          S.pl(S.pr('box'), b[0], g - 0.2, b[2], 1.15, 0.7, 1.15, ang, C.pierreO, { j: 0.03 });
          S.pl(S.pr('box'), b[0], g + 0.45, b[2], 0.8, 6.6, 0.8, ang, C.pierre, { c2: C.blanc, j: 0.03 });
          S.pl(S.pr('box'), b[0], g + 7.0, b[2], 1.0, 0.18, 1.0, ang, C.blanc, { j: 0.02 });
          S.pl(S.pr('cyl', 6, 0.0), b[0], g + 7.2, b[2], 0.55, 1.1, 0.55, 0, C.or, { c2: K(0xffe08a), j: 0.02 });
          for (let k = 0; k < 6; k += 1) S.pl(S.pr('sph', 0), b[0] + n[0] * sg * -0.45, g + 0.8 + k * 1.0, b[2] + n[1] * sg * -0.45, 0.25, 0.25, 0.25, 0, k % 2 ? pick(C.feuille) : C.roses.rose);
        });
        const pts = []; for (let i = 0; i <= 28; i += 1) { const a = PI * i / 28; pts.push(at(4.35 * Math.cos(a), 7.0 + 1.9 * Math.sin(a))); }
        S.tube(null, pts, 0.3, C.pierre, { n: 4, rot: PI / 4, dest: (q) => S.cell(q[0], q[2]).pl });
        S.tube(null, pts.map((q) => [q[0], q[1] - 0.45, q[2]]), 0.1, C.or, { n: 4, dest: (q) => S.cell(q[0], q[2]).pl });
        S.pl(S.pr('sph', 1), pts[14][0], pts[14][1] + 0.55, pts[14][2], 0.42, 0.55, 0.42, 0, C.or, { c2: K(0xffe08a), j: 0 });
        for (let i = 2; i < 27; i += 1) if (i % 2) { const q = pts[i]; S.pl(S.pr('sph', 0), q[0], q[1] + 0.05, q[2], 0.3, 0.26, 0.3, 0, pick([C.roses.rose, C.roses.rouge, C.roses.blanc]), { c2: K(0xfff0e0) }); S.pl(S.pr('sph', 0), q[0] + t[0] * 0.2, q[1] + 0.2, q[2] + t[1] * 0.2, 0.28, 0.24, 0.28, 0, pick(C.feuille)); }
        // oriflammes sous l'arc, accrochées à 5,6 m
        [-2.6, 0, 2.6].forEach((l, k) => { const q = at(l, 6.2 + 0.3 * Math.cos(l * 0.4)); const c = [K(0xd8284e), K(0x4a58c8), K(0xd8284e)][k]; S.tri(S.cell(q[0], q[2]).pd, [q[0] - n[0] * 0.5, q[1], q[2] - n[1] * 0.5], [q[0] + n[0] * 0.5, q[1], q[2] + n[1] * 0.5], [q[0], q[1] - 0.95, q[2]], c, c, tn(c, 0.85)); });
        // guirlandes de fanions et de lanternes d'un lampadaire à l'autre
        for (let k = 0; k < 4; k += 1) {
          const sC = SOL + 0.006 + k * 0.0125, a = place(sC, -4.4), b = place(sC, 4.4), yh = 5.4 + (k === 3 ? 0 : 0.0), N = 16;
          const pt = (u) => [mix(a[0], b[0], u), mix(a[1], b[1], u) + yh - 0.65 * 4 * u * (1 - u), mix(a[2], b[2], u)];
          if (Math.abs(sC - sP) < 0.006) continue;
          for (let i = 0; i < N; i += 1) {
            const u = (i + 0.5) / N, c = pt(u), c1 = pt(u - 0.35 / N), c2 = pt(u + 0.35 / N), col = [K(0xff6f9a), K(0xfff0a8), K(0xf6c04e), K(0xffffff), K(0xc59aff)][i % 5];
            if (i % 4 === 2) S.ba(S.pr('sph', 0), c[0], c[1] - 0.25, c[2], 0.13, 0.17, 0.13, 0, K(0xffd070), { c2: K(0xfff0b8) });
            else S.tri(S.cell(c[0], c[2]).pd, c1, c2, [c[0], c[1] - 0.5, c[2]], col, col, tn(col, 0.85));
          }
          S.tube(null, Array.from({ length: 12 }, (_, i) => pt(i / 11)), 0.014, K(0xf6e0b0), { n: 3, dest: (z) => S.cell(z[0], z[2]).pd });
        }
      }
      // allée solennelle : pelouse rayée, massifs de roses, cônes taillés
      [-1, 1].forEach((sg) => {
        let k = 0;
        for (let s2 = SOL - 0.004; s2 < sb + 0.004; s2 += 2.2 / LEN) {
          const c = (k % 2) ? K(0x72c864) : K(0x5fb858);
          const a0 = place(s2, sg * 5.75), a1 = place(s2, sg * 15), b0 = place(s2 + 2.2 / LEN, sg * 5.75), b1 = place(s2 + 2.2 / LEN, sg * 15);
          if (ok(a1[0], a1[2])) { const V = (q) => [q[0], q[1] + 0.06, q[2]]; S.quad(S.cell(a0[0], a0[2]).pd, V(a0), V(a1), V(b1), V(b0), c, c, c, c, [0, 1, 0]); }
          k += 1;
        }
        for (let s2 = SOL + 0.006; s2 < sb; s2 += 0.0145) {
          const p = place(s2 + 0.007, sg * 9.5); if (!ok(p[0], p[2])) continue; topi(p[0], p[2], 2);
          const q = place(s2 + 0.007, sg * 12.5); if (ok(q[0], q[2])) topi(q[0], q[2], 1);
        }
        const rp = place(SOL + 0.025, sg * 8.5); if (ok(rp[0], rp[2])) drap(rp[0], rp[2], 0, 4.4, 9, 0.5, (u, v) => { if (Math.abs(u) > 2.2 || Math.abs(v) > 4.5) return null; if (Math.abs(u) > 1.8 || Math.abs(v) > 4.1) return { c: K(0x3a9a58) }; return { c: [C.roses.rose, C.roses.blanc, C.roses.rouge][Math.floor((v + 4.5) / 1.5) % 3], f: 1 }; }, 0.4);
      });

      S.construire(group);
      group.userData.etapes = S.etapes;

      // ---------- bannières mobiles : un seul maillage dont les sommets bougent ----------
      const NSEG = 7;
      const banP = new Float32Array(mats.length * NSEG * 18), banC = new Float32Array(mats.length * NSEG * 18);
      mats.forEach((m, i) => {
        for (let k = 0; k < NSEG; k += 1) {
          const u = k / NSEG, c = (k >= NSEG - 2) ? m.cb[1] : m.cb[0], f = 1 - 0.18 * u + (k === NSEG - 3 ? 0.15 : 0), tail = k === NSEG - 1;
          for (let v = 0; v < 6; v += 1) { const o = (i * NSEG + k) * 18 + v * 3; const cc = tail ? tn(m.cb[1], 0.95) : tn(c, f); banC[o] = cc[0]; banC[o + 1] = cc[1]; banC[o + 2] = cc[2]; }
        }
      });
      const geoB = new TH.BufferGeometry(); geoB.setAttribute('position', new TH.BufferAttribute(banP, 3).setUsage(TH.DynamicDrawUsage)); geoB.setAttribute('color', new TH.BufferAttribute(banC, 3));
      geoB.setAttribute('normal', new TH.BufferAttribute(new Float32Array(banP.length), 3).setUsage(TH.DynamicDrawUsage));
      const meshB = new TH.Mesh(geoB, S.matD); meshB.frustumCulled = false; group.add(meshB);
      const majBannieres = (T) => {
        const q = geoB.attributes.position.array;
        mats.forEach((m, i) => {
          for (let k = 0; k < NSEG; k += 1) {
            const rows = [k, k + 1].map((kk) => {
              const u = kk / NSEG, sw = Math.sin(ph(3, T) * 1 + m.ph + u * 3.4) * 0.35 * u + Math.sin(ph(7, T) + m.ph * 2 + u * 5) * 0.1 * u, hw = m.bw * 0.5 * (kk === NSEG ? 0.15 : (kk >= NSEG - 1 ? 0.55 : 1));
              const cx = m.x + m.t[0] * sw, cz = m.z + m.t[1] * sw, cy = m.y - m.bl * u + 0.05 * Math.sin(ph(5, T) + m.ph + u * 4);
              return [[cx - m.n[0] * hw, cy, cz - m.n[1] * hw], [cx + m.n[0] * hw, cy, cz + m.n[1] * hw]];
            });
            const a = rows[0][0], b = rows[0][1], c = rows[1][1], d = rows[1][0], o = (i * NSEG + k) * 18;
            [a, b, c, a, c, d].forEach((p, v) => { q[o + v * 3] = p[0]; q[o + v * 3 + 1] = p[1]; q[o + v * 3 + 2] = p[2]; });
          }
        });
        geoB.attributes.position.needsUpdate = true; geoB.computeVertexNormals();
      };

      // ---------- jets d'eau (gouttes balistiques périodiques) ----------
      const goutteGeo = (() => { const d = { P: [], C: [] }; S.A(d, S.pr('sph', 0), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })();
      const NJ = 8 * 14 + 22, gouttes = S.inst(goutteGeo, new TH.MeshBasicMaterial({ color: 0xcdf4ff, transparent: true, opacity: 0.85, fog: true, depthWrite: false, vertexColors: true }), NJ);
      group.add(gouttes.mesh); gouttes.mesh.renderOrder = 6;
      const anneaux = S.inst((() => { const d = { P: [], C: [] }; S.A(d, S.pr('ring', 24), 0, 0, 0, 1, 1, 1, 0, [1, 1, 1], { j: 0 }); return d; })(), new TH.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, fog: true, depthWrite: false, vertexColors: true }), 6);
      group.add(anneaux.mesh); anneaux.mesh.renderOrder = 6;

      // ---------- halos des lanternes (additifs), lucioles, pétales qui tombent ----------
      const texHalo = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(0.18, 'rgba(255,214,130,0.7)'); gr.addColorStop(0.5, 'rgba(255,176,96,0.2)'); gr.addColorStop(1, 'rgba(255,160,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new TH.CanvasTexture(c); })();
      const quads = (n, opac) => {
        const m = new TH.InstancedMesh(new TH.PlaneGeometry(1, 1), new TH.MeshBasicMaterial({ map: texHalo, transparent: true, opacity: opac, depthWrite: false, blending: TH.AdditiveBlending, fog: true }), n);
        m.frustumCulled = false; m.renderOrder = 7; const o = new TH.Object3D();
        return { mesh: m, set: (i, x, y, z, ry, sz) => { o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.set(sz, sz, sz); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }, fin: () => { m.instanceMatrix.needsUpdate = true; } };
      };
      const haloM = quads(halos.length, 0.9); group.add(haloM.mesh);
      const NL = 110;
      const luc = []; for (let i = 0; i < NL; i += 1) { const s = mix(sa, sb, R()), p = place(s, (R() < 0.5 ? -1 : 1) * rr(4.6, 17)); luc.push({ ry: Math.atan2(-p[3][0], -p[3][1]), x: p[0], z: p[2], y: p[1] + rr(0.5, 3.2), a: rr(0.6, 2.2), b: rr(0.6, 2.2), k: 1 + Math.floor(R() * 3), ph: R() * PI2, kk: 1 + Math.floor(R() * 4) }); }
      const lucM = S.inst(goutteGeo, new TH.MeshBasicMaterial({ color: 0xffe27a, fog: true, vertexColors: true }), NL); group.add(lucM.mesh);
      const lucH = quads(NL, 0.85); group.add(lucH.mesh);
      const petG = S.inst((() => { const d = { P: [], C: [] }; S.tri(d, [-0.5, 0, -0.3], [0.5, 0, -0.3], [0, 0, 0.45], [1, 1, 1], [1, 1, 1], [1, 0.85, 0.9]); S.tri(d, [-0.5, 0, -0.3], [0, 0, 0.45], [0.5, 0, -0.3], [1, 1, 1], [1, 0.85, 0.9], [1, 1, 1]); return d; })(), new TH.MeshBasicMaterial({ vertexColors: true, side: TH.DoubleSide, fog: true }), 150);
      group.add(petG.mesh);
      const pet = []; for (let i = 0; i < 150; i += 1) { const s = mix(sa, sb, R()), p = place(s, rr(-11, 11)); pet.push({ x: p[0], z: p[2], y0: p[1], H: rr(5, 9), k: 3 + (i % 4), ph: R(), sw: rr(0.6, 1.8), sp: R() * PI2, c: pick([K(0xff7fa8), K(0xffc0d4), K(0xfff0f0), K(0xff5f86), K(0xffd0b8)]) }); petG.col(i, pet[i].c); }
      for (let i = 0; i < NL; i += 1) lucM.col(i, [1, 1, 1]);
      for (let i = 0; i < NJ; i += 1) gouttes.col(i, [1, 1, 1]);
      for (let i = 0; i < 6; i += 1) anneaux.col(i, [1, 1, 1]);
      halos.forEach((h, i) => haloM.set(i, h[0], h[1], h[2], h[4], 2.6 * h[3]));
      haloM.fin();

      function maj(T) {
        majBannieres(T);
        // jets : un jet central (14 gouttes) + 8 arcs de la vasque haute vers la vasque moyenne + 22 gouttes de ruissellement
        let g = 0;
        for (let i = 0; i < 14; i += 1) { const per = L / 6, u = fr(T / per + i / 14), h = 3.3 + 0.2 * Math.sin(ph(2, T)), y = fy + 3.1 + h * 4 * u * (1 - u), sz = 0.12 * (1 - 0.3 * u); gouttes.set(g++, fx + 0.12 * Math.sin(i * 2.4), y, fz + 0.12 * Math.cos(i * 2.4), 0, 0, 0, sz, sz, sz); }
        for (let a = 0; a < 8; a += 1) for (let i = 0; i < 14; i += 1) {
          const per = L / 8, u = fr(T / per + i / 14 + a * 0.05), ang = a / 8 * PI2 + 0.2, rr0 = 0.95 + (1.8 - 0.95) * 0 + u * 1.15, y = fy + 3.0 + 0.9 * 4 * u * (1 - u) * 1.0 - (fy + 3.0 - (fy + 1.85)) * u * u * 1.0;
          gouttes.set(g++, fx + Math.cos(ang) * rr0, y, fz + Math.sin(ang) * rr0, 0, 0, 0, 0.09, 0.09, 0.09);
        }
        for (let i = 0; i < 22; i += 1) { const per = L / 5, u = fr(T / per + i / 22), a = i * 1.7, rd = 1.95 + u * 1.35, y = fy + 1.82 - 1.15 * u * u + 0.25 * 4 * u * (1 - u); gouttes.set(g++, fx + Math.cos(a) * rd, y, fz + Math.sin(a) * rd, 0, 0, 0, 0.07, 0.07, 0.07); }
        gouttes.fin();
        // rides sur les bassins
        for (let i = 0; i < 6; i += 1) { const lv = i % 3, u = fr(T / (L / 4) + i / 6), r0 = [0.9, 1.7, 3.1][lv], rd = r0 * (0.25 + 0.75 * u), y = fy + [3.04, 1.84, 0.68][lv] + 0.03; anneaux.set(i, fx, y, fz, 0, 0, 0, rd, 1, rd); const f = 1 - u; anneaux.col(i, [0.55 + 0.45 * f, 0.9 + 0.1 * f, 0.95 + 0.05 * f]); }
        anneaux.fin();
        // lanternes : vacillement léger
        halos.forEach((h, i) => { const f = 1 + 0.07 * Math.sin(ph(9, T) + i * 1.9) + 0.04 * Math.sin(ph(23, T) + i); haloM.set(i, h[0], h[1], h[2], h[4], 2.6 * h[3] * f); });
        haloM.fin();
        // lucioles
        luc.forEach((l, i) => {
          const p = ph(l.k, T) + l.ph, x = l.x + l.a * Math.sin(p), z = l.z + l.b * Math.sin(2 * p + 1), y = l.y + 0.5 * Math.sin(ph(l.kk, T) + l.ph * 2);
          const bl = 0.35 + 0.65 * Math.max(0, Math.sin(ph(2 + (i % 3), T) + l.ph * 3)), s1 = 0.075 * bl + 0.01, s2 = 0.42 * bl + 0.04;
          lucM.set(i, x, y, z, 0, 0, 0, s1, s1, s1); lucH.set(i, x, y, z, l.ry, s2 * 3);
        });
        lucM.fin(); lucH.fin();
        // pétales : chute lente, balancement, rotation
        pet.forEach((q, i) => {
          const u = fr(T / (L / q.k) + q.ph), y = q.y0 + q.H * (1 - u), a = PI2 * u * 2 + q.sp;
          petG.set(i, q.x + Math.sin(ph(q.k, T) * 1 + q.sp) * q.sw + u * 0.6, y, q.z + Math.cos(ph(q.k, T) + q.sp * 1.3) * q.sw * 0.7, Math.sin(a) * 0.8, a * 1.5, Math.cos(a) * 0.8, 0.1, 0.1, 0.1);
        });
        petG.fin();
      }
      group.userData.triangles = Math.round(S.tris + mats.length * NSEG * 2 + NJ * 20 + halos.length * 2 * 20 + NL * 40 + 150 * 2);
      maj(0);
      return { group, maj: (T) => maj(T) };
    },
  };
  return { lac, jardin };
});
