/*
 * « Le chemin vers le château » : les deux premiers biomes en 3D (Three.js r149) — la forêt enchantée (s 0 → 0,28) et la prairie fleurie
 * (s 0,28 → 0,52). Spec : production/SPEC-CHEMIN3D.md. Chaque biome : creer(ctx) → { group, maj(T, sCam) }.
 * Tout vient de ctx.rng (graine fixe) ; les mouvements (lucioles, papillons, pétales, moulin, balançoire, faisceaux) sont des fonctions
 * pures de T, périodiques sur ctx.L (nombre entier de cycles par L). Un InstancedMesh par type d'objet, géométries composites fusionnées.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.biomes3d = Object.assign(racine.Avis.biomes3d || {}, api); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAU = Math.PI * 2;

  // ======================================================================================================================
  // Boîte à outils (commune aux deux biomes) : pièces colorées, fusion, instances, placement le long du chemin
  // ======================================================================================================================
  function outils(ctx) {
    const THREE = ctx.THREE;
    const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
    const melange = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    const fois = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    // hachage entier → [0, 1[ (les sommets partagés bougent ensemble)
    const hach = (a, b, c, d) => {
      let h = (Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1) ^ Math.imul(d | 0, 0x85ebca6b)) >>> 0;
      h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; h ^= h >>> 15;
      return (h >>> 0) / 4294967296;
    };
    // ---- formes de base (la base est posée en y = 0 quand c'est utile) ----
    const cone = (r, h, seg, ouvert) => { const g = new THREE.ConeGeometry(r, h, seg || 7, 1, !!ouvert); g.translate(0, h / 2, 0); return g; };
    const cyl = (rb, rt, h, seg, ouvert) => { const g = new THREE.CylinderGeometry(rt, rb, h, seg || 6, 1, !!ouvert); g.translate(0, h / 2, 0); return g; };
    const ico = (r, det) => new THREE.IcosahedronGeometry(r == null ? 1 : r, det == null ? 1 : det);
    const octa = (r) => new THREE.OctahedronGeometry(r, 0);
    const boite = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; };
    const dome = (seg, anneaux) => new THREE.SphereGeometry(1, seg || 9, anneaux || 4, 0, TAU, 0, Math.PI / 2);
    // ---- une pièce = triangles non indexés { p: positions, c: couleurs, m: masque de teinte } ----
    function prim(geo, o) {
      o = o || {};
      const g = geo.index ? geo.toNonIndexed() : geo, pos = g.attributes.position, n = pos.count;
      const sc = typeof o.s === 'number' ? [o.s, o.s, o.s] : (o.s || [1, 1, 1]);
      const P = o.p || [0, 0, 0], r = o.r || [0, 0, 0];
      const M = new THREE.Matrix4();
      if (o.q) M.makeRotationFromQuaternion(o.q); else M.makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2], 'YXZ'));
      let y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < n; i += 1) { const y = pos.getY(i); if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const c0 = o.c0 || o.c || [0.6, 0.6, 0.6], c1 = o.c1 || o.c || c0, jit = o.jit || 0, seed = o.seed || 0, vari = o.vari == null ? 0.1 : o.vari, gam = o.gam || 1;
      const out = { p: new Float32Array(n * 3), c: new Float32Array(n * 3), m: new Float32Array(n) }, v = new THREE.Vector3();
      for (let i = 0; i < n; i += 1) {
        const ox = pos.getX(i), oy = pos.getY(i), oz = pos.getZ(i);
        let jx = 0, jy = 0, jz = 0;
        if (jit) { const a = Math.round(ox * 500), b = Math.round(oy * 500), c = Math.round(oz * 500); jx = (hach(a, b, c, seed * 7 + 1) - 0.5) * 2 * jit; jy = (hach(a, b, c, seed * 7 + 2) - 0.5) * 2 * jit; jz = (hach(a, b, c, seed * 7 + 3) - 0.5) * 2 * jit; }
        v.set(ox * sc[0] + jx, oy * sc[1] + jy, oz * sc[2] + jz).applyMatrix4(M);
        out.p[i * 3] = v.x + P[0]; out.p[i * 3 + 1] = v.y + P[1]; out.p[i * 3 + 2] = v.z + P[2];
        const u = Math.pow(Math.min(1, Math.max(0, (oy - y0) / ((y1 - y0) || 1))), gam), col = melange(c0, c1, u);
        const k = 1 + (hach(Math.floor(i / 3), seed, 77, 3) - 0.5) * 2 * vari;
        out.c[i * 3] = col[0] * k; out.c[i * 3 + 1] = col[1] * k; out.c[i * 3 + 2] = col[2] * k;
        out.m[i] = o.teinte === 0 ? 0 : 1;
      }
      return out;
    }
    // un cylindre entre deux points
    function segment(A, B, rb, rt, seg, o) {
      const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]) || 1;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(d[0] / L, d[1] / L, d[2] / L));
      return prim(cyl(rb, rt, L, seg), Object.assign({ p: A, q }, o));
    }
    // un constructeur de triangles à la main (fougères, herbes, ailes, plans lumineux…)
    function Tri() { this.p = []; this.c = []; this.m = []; }
    Tri.prototype.tri = function (a, b, c, ca, cb, cc, m) {
      [a, b, c].forEach((q) => this.p.push(q[0], q[1], q[2]));
      [ca, cb || ca, cc || ca].forEach((q) => this.c.push(q[0], q[1], q[2]));
      const mm = m == null ? 1 : m; this.m.push(mm, mm, mm);
    };
    Tri.prototype.quad = function (a, b, c, d, ca, cb, cc, cd, m) { this.tri(a, b, c, ca, cb, cc, m); this.tri(a, c, d, ca, cc, cd, m); };
    Tri.prototype.piece = function () { return { p: Float32Array.from(this.p), c: Float32Array.from(this.c), m: Float32Array.from(this.m) }; };
    // déplace / tourne (autour de y) / agrandit une pièce
    function deplacer(pc, x, y, z, yaw, k) {
      const n = pc.m.length, out = { p: new Float32Array(n * 3), c: pc.c, m: pc.m }, cs = Math.cos(yaw || 0), sn = Math.sin(yaw || 0), kk = k || 1;
      for (let i = 0; i < n; i += 1) { const a = pc.p[i * 3] * kk, b = pc.p[i * 3 + 1] * kk, c = pc.p[i * 3 + 2] * kk; out.p[i * 3] = a * cs + c * sn + x; out.p[i * 3 + 1] = b + y; out.p[i * 3 + 2] = -a * sn + c * cs + z; }
      return out;
    }
    function fusion(liste) {
      let n = 0; liste.forEach((q) => { n += q.m.length; });
      const P = new Float32Array(n * 3), C = new Float32Array(n * 3), M = new Float32Array(n); let o = 0;
      liste.forEach((q) => { P.set(q.p, o * 3); C.set(q.c, o * 3); M.set(q.m, o); o += q.m.length; });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('masque', new THREE.BufferAttribute(M, 1));
      g.computeVertexNormals(); g.computeBoundingSphere();
      return g;
    }
    // ---- matériaux : couleurs de sommets × teinte d'instance (là où le masque vaut 1) ----
    function materiau(type, o) {
      o = o || {};
      const m = type === 'basic' ? new THREE.MeshBasicMaterial(Object.assign({ vertexColors: true }, o.opts || {})) : new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true }, o.opts || {}));
      m.onBeforeCompile = (sh) => {
        sh.vertexShader = 'attribute float masque;\n' + sh.vertexShader.replace('#include <color_vertex>', THREE.ShaderChunk.color_vertex.replace('vColor.xyz *= instanceColor.xyz;', 'vColor.xyz *= mix( vec3( 1.0 ), instanceColor.xyz, masque );'));
        if (o.additif) sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', THREE.ShaderChunk.fog_fragment.replace('mix( gl_FragColor.rgb, fogColor, fogFactor )', 'gl_FragColor.rgb * ( 1.0 - fogFactor )'));
      };
      m.customProgramCacheKey = () => 'biomes-a-' + (o.additif ? 'add' : 'std');
      return m;
    }
    const matLam = (opts) => materiau('lambert', { opts });
    const matLueur = (opts) => materiau('basic', { opts });
    const matAdd = (opts) => materiau('basic', { additif: true, opts: Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }, opts || {}) });
    // ---- un InstancedMesh depuis une liste { p, ry, rx, rz, s, c } ----
    function instancier(geo, mat, liste) {
      const N = liste.length; if (!N) return null;
      const im = new THREE.InstancedMesh(geo, mat, N), d = new THREE.Object3D(), col = new THREE.Color();
      d.rotation.order = 'YXZ';
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9, ext = 0;
      geo.computeBoundingSphere(); const rg = geo.boundingSphere.radius + geo.boundingSphere.center.length();
      for (let i = 0; i < N; i += 1) {
        const it = liste[i], s = it.s == null ? 1 : it.s, sc = typeof s === 'number' ? [s, s, s] : s;
        d.position.set(it.p[0], it.p[1], it.p[2]); d.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); d.scale.set(sc[0], sc[1], sc[2]); d.updateMatrix();
        im.setMatrixAt(i, d.matrix);
        const c = it.c || [1, 1, 1]; im.setColorAt(i, col.setRGB(c[0], c[1], c[2]));
        x0 = Math.min(x0, it.p[0]); x1 = Math.max(x1, it.p[0]); y0 = Math.min(y0, it.p[1]); y1 = Math.max(y1, it.p[1]); z0 = Math.min(z0, it.p[2]); z1 = Math.max(z1, it.p[2]);
        ext = Math.max(ext, rg * Math.max(sc[0], sc[1], sc[2]));
      }
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), Math.hypot(x1 - x0, y1 - y0, z1 - z0) / 2 + ext + 1);
      return im;
    }
    // ---- le chemin : échantillons, distance, positions latérales ----
    const NE = 800, E = [];
    for (let i = 0; i <= NE; i += 1) { const s = i / NE, p = ctx.chemin.point(s); E.push([p[0], p[2]]); }
    const DMIN = ctx.chemin.largeur / 2 + 1.5;
    function distChemin(x, z, s) {
      const i0 = Math.max(0, Math.round(s * NE) - 120), i1 = Math.min(NE, Math.round(s * NE) + 120); let m = 1e9;
      for (let i = i0; i <= i1; i += 1) { const dx = E[i][0] - x, dz = E[i][1] - z, d = dx * dx + dz * dz; if (d < m) m = d; }
      return Math.sqrt(m) - 0.25;
    }
    function lateral(s, off) {
      s = Math.min(1, Math.max(0, s));
      const p = ctx.chemin.point(s), t = ctx.chemin.tangente(s);
      return [p[0] - t[1] * off, p[2] + t[0] * off, p[1], t];
    }
    // grille d'occupation (pour éviter que les gros objets se chevauchent)
    const grille = new Map(), K = 6;
    const libre = (x, z, r) => {
      const ix = Math.floor(x / K), iz = Math.floor(z / K);
      for (let a = -2; a <= 2; a += 1) for (let b = -2; b <= 2; b += 1) {
        const l = grille.get((ix + a) + ',' + (iz + b)); if (!l) continue;
        for (let i = 0; i < l.length; i += 1) { const q = l[i]; if (Math.hypot(q[0] - x, q[1] - z) < q[2] + r) return false; }
      }
      return true;
    };
    const occuper = (x, z, r) => { const k = Math.floor(x / K) + ',' + Math.floor(z / K); if (!grille.has(k)) grille.set(k, []); grille.get(k).push([x, z, r]); };
    // semis : n positions naturelles de part et d'autre (plus denses près du chemin)
    function semer(R, n, o) {
      const dmin = Math.max(o.dmin || 0, DMIN + 0.2), dmax = o.dmax || 60, sa = o.sa, sb = o.sb, out = [];
      let essais = 0;
      while (out.length < n && essais < n * 60) {
        essais += 1;
        const s = sa + (sb - sa) * R(), cote = o.cote || (R() < 0.5 ? -1 : 1), off = dmin + (dmax - dmin) * Math.pow(R(), o.gam || 1.5);
        const q = lateral(s, cote * off);
        if (distChemin(q[0], q[1], s) < dmin) continue;
        if (o.exclure && o.exclure(q[0], q[1], s)) continue;
        if (o.r && !libre(q[0], q[1], o.r)) continue;
        if (o.r) occuper(q[0], q[1], o.r);
        out.push({ x: q[0], z: q[1], y: ctx.hauteur(q[0], q[1]), s, off, cote, a: R(), b: R(), c: R() });
      }
      return out;
    }
    // taches de couleur posées sur le terrain (fondu sur les bords) : géométrie fusionnée, couleurs RGBA
    function taches(liste, decal) {
      const P = [], C = [], dy = decal == null ? 0.14 : decal;
      liste.forEach((t) => {
        const seg = 9, rot = t.rot || 0, ca = Math.cos(rot), sa = Math.sin(rot), rx = t.rx || t.r, rz = t.rz || t.r;
        const pt = (u, ang) => { const lx = Math.cos(ang) * rx * u, lz = Math.sin(ang) * rz * u, x = t.x + lx * ca - lz * sa, z = t.z + lx * sa + lz * ca; return [x, ctx.hauteur(x, z) + dy, z]; };
        const cen = [t.x, ctx.hauteur(t.x, t.z) + dy, t.z];
        const anneaux = [[0.5, t.a], [1, 0]];
        const v = (p, a) => { P.push(p[0], p[1], p[2]); C.push(t.c[0], t.c[1], t.c[2], a); };
        for (let k = 0; k < seg; k += 1) {
          const a0 = (k / seg) * TAU + (t.ph || 0), a1 = ((k + 1) / seg) * TAU + (t.ph || 0);
          const i0 = pt(0.5, a0), i1 = pt(0.5, a1), o0 = pt(1, a0), o1 = pt(1, a1);
          v(cen, t.a * 1.15); v(i1, anneaux[0][1]); v(i0, anneaux[0][1]);
          v(i0, anneaux[0][1]); v(i1, anneaux[0][1]); v(o1, 0);
          v(i0, anneaux[0][1]); v(o1, 0); v(o0, 0);
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 4)); g.computeVertexNormals();
      for (let i = 0; i < g.attributes.normal.count; i += 1) g.attributes.normal.setXYZ(i, 0, 1, 0);
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide }));
      m.renderOrder = 1; return m;
    }
    // texture ronde douce (lucioles, pollen) : dessinée par programme, toujours identique
    function texRonde() {
      if (typeof document === 'undefined') return null;
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    }
    function materielPoints(taille, tex, additif) {
      const m = new THREE.PointsMaterial({ size: taille, map: tex || null, vertexColors: true, transparent: true, depthWrite: false, blending: additif ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true });
      if (additif) m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', THREE.ShaderChunk.fog_fragment.replace('mix( gl_FragColor.rgb, fogColor, fogFactor )', 'gl_FragColor.rgb * ( 1.0 - fogFactor )')); };
      m.customProgramCacheKey = () => 'biomes-a-pts-' + (additif ? 'add' : 'std');
      return m;
    }
    const aleaSuite = (k) => ctx.rng((ctx.graine * 7919 + k * 104729) >>> 0);
    return { hex, melange, fois, hach, cone, cyl, ico, octa, boite, dome, prim, segment, Tri, deplacer, fusion, materiau, matLam, matLueur, matAdd, instancier, distChemin, lateral, libre, occuper, semer, taches, texRonde, materielPoints, aleaSuite, DMIN };
  }

  // ======================================================================================================================
  // FORÊT ENCHANTÉE
  // ======================================================================================================================
  const foret = {
    creer(ctx) {
      const THREE = ctx.THREE, O = outils(ctx), g = new THREE.Group(), H = O.hex, mel = O.melange, prim = O.prim;
      const Z0 = ctx.zone[0], Z1 = ctx.zone[1], sa = Math.max(0, Z0 - 0.03), sb = Math.min(1, Z1 + 0.03);
      const R = (k) => O.aleaSuite(k);
      const ajoute = (m) => { if (m) g.add(m); return m; };
      const add = (liste, geo, mat) => ajoute(O.instancier(geo, mat, liste));
      const lam = O.matLam(), lamDouble = O.matLam({ side: THREE.DoubleSide }), lueur = O.matLueur({ side: THREE.DoubleSide }), additif = O.matAdd();
      const bois = (c) => ({ c0: mel(H(0x4a3a40), c || H(0x6b5648), 0.0), c1: c || H(0x7a6454), teinte: 0 });
      // teintes d'arbres : surtout le vert-bleu normal, quelques arbres dorés ou violets pour l'enchantement
      const teintes = [[1, 1, 1], [1, 1, 1], [1.05, 1.08, 0.96], [0.9, 1.0, 1.14], [1.16, 0.92, 1.2], [1.22, 1.12, 0.78], [0.92, 1.08, 1.1]];
      const teinte = (u) => teintes[Math.min(teintes.length - 1, Math.floor(u * teintes.length))];

      // ---- clairières : (s, décalage latéral, rayon) ----
      const clairs = [[0.015, 11, 6], [0.06, -15, 7], [0.125, 14, 8], [0.17, -14, 7], [0.235, 15, 8], [0.275, -13, 7], [0.305, 12, 6]].map((c) => {
        const q = O.lateral(c[0], c[1]); return { x: q[0], z: q[1], y: ctx.hauteur(q[0], q[1]), r: c[2], s: c[0] };
      });
      const dansClairiere = (x, z, marge) => clairs.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + (marge || 0));
      clairs.forEach((c) => O.occuper(c.x, c.z, c.r * 0.7));

      // ---- l'arbre immense (mémorable) ----
      {
        const s = 0.105, cote = -1, off = 17;
        const q = O.lateral(s, cote * off), yb = ctx.hauteur(q[0], q[1]) - 0.4, pc = ctx.chemin.point(s);
        const yaw = Math.atan2(pc[0] - q[0], pc[2] - q[1]);
        O.occuper(q[0], q[1], 9);
        const B = [], Lu = [];
        const ecorce = { c0: H(0x4d3b4a), c1: H(0x8a6a5c), teinte: 0, jit: 0.12, vari: 0.14 };
        B.push(prim(O.cyl(3.4, 1.7, 15, 9), Object.assign({ seed: 1 }, ecorce)));
        B.push(prim(O.cyl(1.7, 1.3, 8, 8), Object.assign({ p: [0, 14.5, 0], seed: 2 }, ecorce)));
        for (let k = 0; k < 7; k += 1) { // contreforts
          const a = (k / 7) * TAU + 0.3, dx = Math.cos(a), dz = Math.sin(a);
          B.push(O.segment([dx * 1.8, 2.8, dz * 1.8], [dx * 5.6, -0.2, dz * 5.6], 0.8, 0.25, 5, Object.assign({ seed: 3 + k }, ecorce)));
        }
        for (let k = 0; k < 6; k += 1) { // grosses branches
          const a = (k / 6) * TAU + 0.8, dx = Math.cos(a), dz = Math.sin(a), h0 = 13 + (k % 3) * 2.2;
          B.push(O.segment([dx * 0.8, h0, dz * 0.8], [dx * 8.5, h0 + 4.5, dz * 8.5], 0.85, 0.3, 6, Object.assign({ seed: 20 + k }, ecorce)));
        }
        const feuilles = [[0, 24, 0, 8.5], [6, 19.5, 2, 6.8], [-6.5, 20, -1, 7], [1, 18.5, -6.5, 6.5], [-1.5, 19, 6.5, 6.2], [5.5, 25, -4.5, 5.2], [-4.5, 25.5, 4, 5.4], [9.5, 17.5, -3, 4.6], [-9, 17, 3.5, 4.6], [0, 30, 0, 4.5]];
        feuilles.forEach((f, i) => {
          const teal = i % 3 === 0 ? [H(0x1d6a62), H(0x56c0a0)] : i % 3 === 1 ? [H(0x2d6a58), H(0x6cc27c)] : [H(0x3b5f96), H(0x8aa8e8)];
          B.push(prim(O.ico(f[3], 2), { p: [f[0], f[1], f[2]], s: [1, 0.78, 1], c0: teal[0], c1: teal[1], jit: 0.7, seed: 40 + i, gam: 0.8, vari: 0.12, teinte: 0 }));
        });
        for (let k = 0; k < 16; k += 1) { // lianes
          const a = (k / 16) * TAU + 0.2, rr = 5 + (k % 4) * 1.6, T = new O.Tri(), x = Math.cos(a) * rr, z = Math.sin(a) * rr, hh = 4 + (k % 5) * 1.2, y0 = 17 + (k % 3);
          T.tri([x, y0, z], [x + 0.18, y0, z], [x + 0.05, y0 - hh, z + 0.1], H(0x2c7a5a), H(0x2c7a5a), H(0x9ae0a0));
          B.push(T.piece());
        }
        // porte, fenêtres rondes et lanternes : lumineuses
        const porte = new O.Tri();
        const poly = (cx, cy, rx, ry, n, z, ca, cb, bas) => { for (let k = 0; k < n; k += 1) { const a0 = (k / n) * TAU, a1 = ((k + 1) / n) * TAU; porte.tri([cx, cy, z], [cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry, z], [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry, z], ca, cb, cb, 0); } };
        const zf = 3.35;
        poly(0, 1.7, 1.3, 1.9, 12, zf, H(0xffe39a), H(0xffa24a));
        for (let k = 0; k < 3; k += 1) poly(Math.cos(k * 2.1 + 0.6) * 2.2, 5.5 + k * 3.2, 0.55, 0.55, 8, Math.sqrt(Math.max(0, 3.1 * 3.1 - (Math.cos(k * 2.1 + 0.6) * 2.2) ** 2)) - 0.05, H(0xfff0b0), H(0xffc060));
        Lu.push(porte.piece());
        B.push(prim(O.boite(3.4, 0.35, 0.5), { p: [0, 0.0, zf - 0.55], c: H(0x6b5a58), teinte: 0 })); // seuil
        for (let k = 0; k < 9; k += 1) { // lanternes suspendues
          const a = (k / 9) * TAU + 0.5, rr = 6.6 + (k % 3) * 1.6, x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = 11 + (k % 4) * 1.4;
          const col = [H(0x7ff0ff), H(0xff9ad8), H(0xffe488)][k % 3];
          Lu.push(prim(O.ico(0.45, 0), { p: [x, y, z], c: col, vari: 0.04, teinte: 0 }));
          B.push(O.segment([x, y + 0.4, z], [x, y + 3.5, z], 0.03, 0.03, 3, { c: H(0x3a5a4a), teinte: 0 }));
        }
        for (let k = 0; k < 7; k += 1) { // champignons-étagères lumineux sur le tronc
          const a = 0.6 + k * 0.5, y = 3 + k * 1.5, rr = 3.1 - k * 0.1; const col = [H(0xff8ad2), H(0x7ff0ff), H(0xb9a0ff)][k % 3];
          Lu.push(prim(O.cone(0.9, 0.45, 8), { p: [Math.cos(a) * rr, y, Math.sin(a) * rr], s: [1, -1, 1], c0: col, c1: mel(col, [1, 1, 1], 0.4), r: [0, 0, 0], teinte: 0 }));
        }
        const placer = (liste) => liste.map((p) => O.deplacer(p, q[0], yb, q[1], yaw));
        ajoute(new THREE.Mesh(O.fusion(placer(B)), lam)); ajoute(new THREE.Mesh(O.fusion(placer(Lu)), lueur));
        g.children.slice(-2).forEach((m) => { m.geometry.computeBoundingSphere(); });
      }

      // ---- arches d'arbres au-dessus du chemin ----
      {
        const B = [], Lu = [];
        [0.045, 0.1425, 0.205, 0.255].forEach((s, ia) => {
          const p = ctx.chemin.point(s), t = ctx.chemin.tangente(s), n = [-t[1], t[0]], yaw = Math.atan2(t[0], t[1]);
          const W = (lat, up, al) => [p[0] + n[0] * lat + t[0] * al, p[1] + up, p[2] + n[1] * lat + t[1] * al];
          const ecorce = { c0: H(0x4d3b4a), c1: H(0x86675a), teinte: 0, jit: 0.1 };
          [-1, 1].forEach((cote, ic) => {
            const base = W(cote * 5.4, 0, 0), yb = ctx.hauteur(base[0], base[2]) - 0.3; base[1] = yb;
            const m1 = W(cote * 4.7, 4.6, 0.4), m2 = W(cote * 2.9, 8.4, 0), m3 = W(cote * 0.8, 10.2, -0.3);
            O.occuper(base[0], base[2], 3);
            B.push(O.segment(base, m1, 0.62, 0.5, 7, Object.assign({ seed: ia * 7 + ic }, ecorce)));
            B.push(O.segment(m1, m2, 0.5, 0.4, 7, Object.assign({ seed: ia * 7 + ic + 3 }, ecorce)));
            B.push(O.segment(m2, m3, 0.4, 0.3, 6, Object.assign({ seed: ia * 7 + ic + 5 }, ecorce)));
            B.push(prim(O.cone(1.5, 1.2, 7), Object.assign({ p: [base[0], yb - 0.2, base[2]], seed: 9 }, ecorce)));
          });
          for (let k = 0; k < 12; k += 1) {
            const lat = (k / 11 - 0.5) * 10.5, al = ((k * 37) % 7 - 3.5) * 0.9, up = 9.6 + Math.cos(lat * 0.22) * 1.0 + ((k * 13) % 5) * 0.35, r = 2.0 + ((k * 11) % 5) * 0.3;
            const pal = (k + ia) % 3 === 0 ? [H(0x1f6a60), H(0x62c8a0)] : (k + ia) % 3 === 1 ? [H(0x2f6c58), H(0x78cc82)] : [H(0x4a6aa8), H(0x9ab4f0)];
            const w = W(lat, up, al); B.push(prim(O.ico(r, 1), { p: w, s: [1.1, 0.8, 1.1], c0: pal[0], c1: pal[1], jit: 0.35, seed: 60 + k + ia * 20, gam: 0.8, teinte: 0 }));
          }
          for (let k = 0; k < 8; k += 1) { // guirlande de petites lanternes
            const lat = (k / 7 - 0.5) * 8, up = 8.2 + Math.cos(lat * 0.3) * 0.9, w = W(lat, up, ((k % 3) - 1) * 1.1), col = [H(0xffe488), H(0x7ff0ff), H(0xff9ad8)][(k + ia) % 3];
            Lu.push(prim(O.ico(0.22, 0), { p: w, c: col, vari: 0.03, teinte: 0 }));
            B.push(O.segment([w[0], w[1] + 0.2, w[2]], [w[0], w[1] + 1.3, w[2]], 0.02, 0.02, 3, { c: H(0x3a5a4a), teinte: 0 }));
          }
          void yaw;
        });
        ajoute(new THREE.Mesh(O.fusion(B), lam)); ajoute(new THREE.Mesh(O.fusion(Lu), lueur));
      }

      // ---- les arbres ----
      const exTr = (x, z) => dansClairiere(x, z, 1.5);
      // pin élancé
      const geoPinA = () => {
        const P = [prim(O.cyl(0.42, 0.14, 11, 6), Object.assign({ seed: 1, jit: 0.04 }, bois(H(0x7a5f58))))];
        for (let k = 0; k < 6; k += 1) P.push(prim(O.cone(2.7 * (1 - k * 0.15), 3.3 - k * 0.1, 7), { p: [0, 2.0 + k * 1.75, 0], r: [0, k * 0.8, 0], c0: H(0x174f56), c1: H(0x4fb08a), jit: 0.28, seed: 10 + k, vari: 0.12 }));
        return O.fusion(P);
      };
      // pin trapu aux grands étages
      const geoPinB = () => {
        const P = [prim(O.cyl(0.5, 0.2, 6, 6), Object.assign({ seed: 2 }, bois(H(0x6e5560))))];
        [[3.8, 3.4, 1.4], [2.9, 3.0, 3.4], [2.1, 2.7, 5.2], [1.2, 2.2, 6.8]].forEach((c, k) => P.push(prim(O.cone(c[0], c[1], 8), { p: [0, c[2], 0], r: [0, k * 0.5, 0], c0: H(0x1b5a5c), c1: H(0x5ec498), jit: 0.34, seed: 30 + k })));
        return O.fusion(P);
      };
      // chêne large
      const geoChene = () => {
        const P = [prim(O.cyl(0.8, 0.4, 3.6, 7), Object.assign({ seed: 3, jit: 0.06 }, bois(H(0x7d6258))))];
        P.push(prim(O.cone(1.3, 1.1, 7), Object.assign({ seed: 4 }, bois(H(0x6a5258)))));
        P.push(O.segment([0, 3, 0], [-1.7, 5.6, 0.4], 0.32, 0.18, 5, Object.assign({ seed: 5 }, bois())));
        P.push(O.segment([0, 3.2, 0], [1.8, 5.2, -0.6], 0.3, 0.17, 5, Object.assign({ seed: 6 }, bois())));
        [[0, 6.2, 0, 2.9], [-2.2, 5.4, 0.6, 2.2], [2.3, 5.3, -0.7, 2.3], [0.4, 4.7, 2.0, 1.9], [-0.5, 4.8, -2.0, 2.0], [0.2, 8.0, 0.2, 1.8]].forEach((b, k) =>
          P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1.1, 0.85, 1.1], c0: H(0x1d6256), c1: H(0x6fc07a), jit: 0.42, seed: 50 + k, gam: 0.85, vari: 0.12 })));
        return O.fusion(P);
      };
      // bouleau
      const geoBouleau = () => {
        const P = [prim(O.cyl(0.2, 0.1, 7.5, 5), { c0: H(0xcfc9d4), c1: H(0xe8e4ea), teinte: 0, seed: 4 })];
        for (let k = 0; k < 5; k += 1) P.push(prim(O.cyl(0.215, 0.215, 0.1, 5), { p: [0, 0.8 + k * 1.3, 0], c: H(0x59505e), teinte: 0, vari: 0.05 }));
        [[0, 7.2, 0, 1.5], [0.7, 6.1, 0.4, 1.2], [-0.7, 6.4, -0.3, 1.25], [0.1, 8.4, 0.1, 1.0]].forEach((b, k) =>
          P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1, 1.15, 1], c0: H(0x3f8a58), c1: H(0xa8dc7a), jit: 0.3, seed: 70 + k, gam: 0.85 })));
        return O.fusion(P);
      };
      // pin parasol : tronc nu, ombrelle plate
      const geoParasol = () => {
        const P = [prim(O.cyl(0.45, 0.22, 10, 6), Object.assign({ seed: 6 }, bois(H(0x805a52))))];
        P.push(O.segment([0, 8, 0], [1.6, 10.5, 0.4], 0.25, 0.15, 5, Object.assign({ seed: 7 }, bois())));
        [[0, 11, 0, 3.8], [2.6, 11.8, 0.6, 2.6], [-2.5, 10.4, -0.5, 2.5]].forEach((b, k) =>
          P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1, 0.38, 1], c0: H(0x1e5a58), c1: H(0x66c490), jit: 0.38, seed: 90 + k, gam: 0.7 })));
        return O.fusion(P);
      };
      const arbres = [
        { geo: geoPinA(), n: 62, r: 2.2, dmin: 4.6, dmax: 44, gam: 1.15, k: 11, h: [0.7, 1.15], w: [0.75, 1.05] },
        { geo: geoPinB(), n: 44, r: 2.8, dmin: 4.8, dmax: 42, gam: 1.2, k: 12, h: [0.8, 1.4], w: [0.8, 1.25] },
        { geo: geoChene(), n: 40, r: 3.0, dmin: 5.4, dmax: 46, gam: 1.2, k: 13, h: [0.8, 1.5], w: [0.85, 1.4] },
        { geo: geoBouleau(), n: 36, r: 1.6, dmin: 4.5, dmax: 40, gam: 1.1, k: 14, h: [0.8, 1.4], w: [0.8, 1.2] },
        { geo: geoParasol(), n: 14, r: 3.2, dmin: 6.5, dmax: 46, gam: 1.0, k: 15, h: [0.8, 1.3], w: [0.8, 1.2] },
      ];
      arbres.forEach((t) => {
        const R1 = R(t.k), l = O.semer(R1, t.n, { sa, sb, dmin: t.dmin, dmax: t.dmax, gam: t.gam, r: t.r, exclure: exTr }).map((q) => {
          const hh = t.h[0] + (t.h[1] - t.h[0]) * q.a, ww = t.w[0] + (t.w[1] - t.w[0]) * q.b;
          return { p: [q.x, q.y - 0.25, q.z], ry: q.c * TAU, s: [ww * hh * 0.7 + ww * 0.3, hh, ww * hh * 0.7 + ww * 0.3], c: teinte(R1()) };
        });
        add(l, t.geo, lam);
      });
      // la grande forêt basse qui ferme l'horizon (cônes bleutés)
      {
        const R1 = R(20), l = [], P = [prim(O.cone(2.4, 9, 6, true), { c0: H(0x214c64), c1: H(0x58a0a0), jit: 0.3, seed: 5, teinte: 0 })];
        for (let i = 0; i < 520; i += 1) {
          const s = sa + (sb + 0.04 - sa) * R1(), cote = R1() < 0.5 ? -1 : 1, off = 48 + 70 * Math.pow(R1(), 1.3), q = O.lateral(s, cote * off), hh = 0.8 + 0.9 * R1(), ww = 0.8 + 0.7 * R1();
          l.push({ p: [q[0], ctx.hauteur(q[0], q[1]) - 0.5, q[1]], ry: R1() * TAU, s: [ww * hh * 0.9, hh * 1.25, ww * hh * 0.9], c: [0.85 + 0.2 * R1(), 0.95 + 0.15 * R1(), 1.0 + 0.15 * R1()] });
        }
        add(l, O.fusion(P), lam);
      }

      // ---- sous-bois ----
      // buissons
      {
        const P = [prim(O.ico(1.0, 0), { p: [0, 0.5, 0], s: [1.2, 0.8, 1.1], c0: H(0x1c5a4a), c1: H(0x58b070), jit: 0.18, seed: 3, gam: 0.8 }), prim(O.ico(0.75, 0), { p: [0.8, 0.45, 0.3], s: [1, 0.8, 1], c0: H(0x246a50), c1: H(0x70c27c), jit: 0.15, seed: 4, gam: 0.8 })];
        const R1 = R(30), l = O.semer(R1, 150, { sa, sb, dmin: 4.4, dmax: 38, gam: 1.5, r: 0.9, exclure: (x, z) => dansClairiere(x, z, -1.5) }).map((q) => ({ p: [q.x, q.y - 0.1, q.z], ry: q.a * TAU, s: 0.8 + q.b * 1.4, c: teinte(q.c) }));
        add(l, O.fusion(P), lam);
      }
      // fougères
      {
        const T = new O.Tri(), r = ctx.rng(4242 + ctx.graine);
        for (let k = 0; k < 7; k += 1) {
          const th = (k / 7) * TAU + r() * 0.5, len = 1.1 + 0.5 * r(), lift = 0.7 + 0.35 * r(), dx = Math.cos(th), dz = Math.sin(th), px = -dz, pz = dx;
          const pts = [0, 0.33, 0.66, 1].map((t, j) => ({ d: len * t, y: lift * (t * 1.7 - t * t * 1.7) + 0.02, w: [0.05, 0.22, 0.19, 0][j], c: mel(H(0x1d5a46), H(0x78cc7a), t) }));
          for (let j = 0; j < 3; j += 1) {
            const a = pts[j], b = pts[j + 1], L = (p, s) => [dx * p.d + px * p.w * s, p.y, dz * p.d + pz * p.w * s];
            if (b.w === 0) T.tri(L(a, 1), L(a, -1), L(b, 1), a.c, a.c, b.c); else T.quad(L(a, 1), L(a, -1), L(b, -1), L(b, 1), a.c, a.c, b.c, b.c);
          }
        }
        const R1 = R(31), l = O.semer(R1, 150, { sa, sb, dmin: 4.3, dmax: 28, gam: 1.4, exclure: (x, z) => false }).map((q) => ({ p: [q.x, q.y - 0.03, q.z], ry: q.a * TAU, s: 0.8 + q.b * 1.3, c: teinte(q.c) }));
        add(l, O.fusion([T.piece()]), lamDouble);
      }
      // touffes d'herbe haute
      {
        const T = new O.Tri(), r = ctx.rng(9191 + ctx.graine);
        for (let k = 0; k < 6; k += 1) { const th = (k / 6) * TAU + r() * 0.8, d = 0.1 + 0.15 * r(), h = 0.5 + 0.5 * r(), x = Math.cos(th) * d, z = Math.sin(th) * d, w = 0.07; T.tri([x - w, 0, z], [x + w, 0, z], [x * 2.2, h, z * 2.2], H(0x1c5848), H(0x1c5848), H(0x9ad87a)); }
        const R1 = R(32), l = O.semer(R1, 520, { sa, sb, dmin: 4.3, dmax: 26, gam: 1.3 }).map((q) => ({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 0.7 + q.b * 1.2, c: teinte(q.c) }));
        add(l, O.fusion([T.piece()]), lamDouble);
      }
      // rochers moussus
      {
        const P = [prim(O.ico(1, 1), { p: [0, 0.4, 0], s: [1.3, 0.85, 1.05], c0: H(0x5a6580), c1: H(0x58c070), jit: 0.28, seed: 8, gam: 0.55, vari: 0.14 }), prim(O.ico(0.5, 0), { p: [1.2, 0.2, 0.5], s: [1, 0.7, 1], c0: H(0x5a6580), c1: H(0x5cc070), jit: 0.12, seed: 9, gam: 0.6 })];
        const R1 = R(33), l = O.semer(R1, 50, { sa, sb, dmin: 4.4, dmax: 40, gam: 1.4, r: 1.2, exclure: exTr }).map((q) => ({ p: [q.x, q.y - 0.15, q.z], ry: q.a * TAU, s: 0.7 + q.b * 1.8, c: [0.95 + 0.1 * q.c, 1, 1.05] }));
        add(l, O.fusion(P), lam);
      }
      // souches et troncs tombés
      {
        const P = [prim(O.cyl(0.8, 0.62, 0.8, 7), { c0: H(0x5a4450), c1: H(0x86665a), teinte: 0, jit: 0.05, seed: 2 }), prim(O.cyl(0.58, 0.58, 0.06, 7), { p: [0, 0.78, 0], c: H(0xe0c096), teinte: 0 }), prim(O.ico(0.5, 0), { p: [0.2, 0.8, -0.1], s: [1.3, 0.4, 1.1], c0: H(0x2c7a52), c1: H(0x68c070), seed: 3, jit: 0.08 }), prim(O.cone(0.7, 0.6, 6), { p: [0, -0.1, 0], c: H(0x5a4450), teinte: 0 })];
        const R1 = R(34), l = O.semer(R1, 20, { sa, sb, dmin: 4.6, dmax: 30, gam: 1.3, r: 1.1 }).map((q) => ({ p: [q.x, q.y - 0.1, q.z], ry: q.a * TAU, s: 0.8 + q.b * 0.8 }));
        add(l, O.fusion(P), lam);
        const T = [prim(O.cyl(0.42, 0.34, 5.6, 7), { p: [-2.8, 0.45, 0], r: [0, 0, Math.PI / 2], c0: H(0x5a4450), c1: H(0x86665a), teinte: 0, jit: 0.05, seed: 3 }), prim(O.ico(0.5, 0), { p: [-1.2, 0.85, 0], s: [4, 0.35, 0.9], c0: H(0x2c7a52), c1: H(0x68c070), seed: 6, jit: 0.1 }), prim(O.ico(0.32, 0), { p: [-3.4, 0.8, 0.1], s: [2, 0.4, 0.9], c0: H(0x2c7a52), c1: H(0x68c070), seed: 7, jit: 0.1 })];
        const l2 = O.semer(R(35), 9, { sa, sb, dmin: 5.0, dmax: 30, gam: 1.2, r: 3.0 }).map((q) => ({ p: [q.x, q.y - 0.15, q.z], ry: q.a * TAU, s: 0.8 + q.b * 0.5 }));
        add(l2, O.fusion(T), lam);
      }

      // ---- champignons géants et petits champignons lumineux ----
      {
        const corps = [prim(O.cyl(0.36, 0.24, 1.6, 6), { c0: H(0xf2e6e0), c1: H(0xdccbe0), teinte: 0, jit: 0.03, seed: 3 }), prim(O.dome(9, 3), { p: [0, 1.35, 0], s: [1.75, 1.0, 1.75], c0: H(0xd8d8e8), c1: H(0xffffff), jit: 0.06, seed: 4 })];
        const lum = [prim(O.cone(1.62, 0.5, 9), { p: [0, 1.5, 0], s: [1, -1, 1], c0: H(0xffffff), c1: H(0xc0d0ff), seed: 5, vari: 0.04 })];
        for (let k = 0; k < 7; k += 1) { const phi = 0.2 + (k % 3) * 0.32, th = k * 2.4; lum.push(prim(O.ico(0.2, 0), { p: [Math.sin(phi) * Math.cos(th) * 1.75 * 0.97, 1.35 + Math.cos(phi) * 0.98, Math.sin(phi) * Math.sin(th) * 1.75 * 0.97], s: [1, 0.55, 1], c: H(0xfff6c8), teinte: 0, vari: 0.03 })); }
        const gCorps = O.fusion(corps), gLum = O.fusion(lum);
        const couleurs = [[1.0, 0.55, 0.78], [0.45, 0.9, 1.0], [0.72, 0.52, 1.0], [1.0, 0.7, 0.55]];
        const R1 = R(40), grands = [], pts = [];
        // quelques grands champignons au bord du chemin et surtout dans les clairières
        const pose = (q, k, ech) => { const c = couleurs[k % couleurs.length]; grands.push({ p: [q.x, q.y - 0.05, q.z], ry: q.a * TAU, s: ech, c, c2: [c[0] * 0.7 + 0.3, c[1] * 0.7 + 0.3, c[2] * 0.7 + 0.3] }); };
        O.semer(R1, 14, { sa, sb, dmin: 4.8, dmax: 16, gam: 1.0, r: 1.2 }).forEach((q, i) => pose(q, i, 0.8 + q.b * 0.9));
        clairs.forEach((c, ic) => { for (let k = 0; k < 6; k += 1) { const a = k * 1.1 + ic, d = 1.6 + (k % 3) * 1.8 + (k > 3 ? 1.5 : 0), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (O.distChemin(x, z, c.s) < O.DMIN + 0.3) continue; pose({ x, z, y: ctx.hauteur(x, z), a: (k * 0.37) % 1 }, ic + k, 0.5 + ((k * 7) % 5) * 0.28); } });
        const petits = [];
        O.semer(R1, 70, { sa, sb, dmin: 4.4, dmax: 18, gam: 1.2 }).forEach((q, i) => { const c = couleurs[i % couleurs.length]; petits.push({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 0.14 + q.b * 0.22, c, c2: [c[0] * 0.7 + 0.3, c[1] * 0.7 + 0.3, c[2] * 0.7 + 0.3] }); });
        const tous = grands.concat(petits);
        add(tous, gCorps, lamDouble);
        add(tous.map((t) => Object.assign({}, t, { c: t.c2 })), gLum, lueur);
        // mares de lumière au sol
        const disc = new O.Tri(); for (let k = 0; k < 10; k += 1) { const a0 = (k / 10) * TAU, a1 = ((k + 1) / 10) * TAU; disc.tri([0, 0, 0], [Math.cos(a0), 0, Math.sin(a0)], [Math.cos(a1), 0, Math.sin(a1)], [0.5, 0.5, 0.5], [0, 0, 0], [0, 0, 0]); }
        const gDisc = O.fusion([disc.piece()]);
        add(grands.map((t) => ({ p: [t.p[0], t.p[1] + 0.25, t.p[2]], s: t.s * 4.2, c: t.c })), gDisc, additif);
        g.userData.pools = gDisc;
      }

      // ---- petites fleurs lumineuses ----
      {
        const P = [prim(O.cyl(0.02, 0.014, 0.4, 3, true), { c: H(0x58d0a0), teinte: 0, vari: 0.04 }), prim(O.octa(0.11), { p: [0, 0.43, 0], s: [1, 1.4, 1], c: [1, 1, 1], vari: 0.05 }), prim(O.octa(0.07), { p: [0.1, 0.3, 0.02], s: [1, 1.4, 1], c: [1, 1, 1], vari: 0.05 })];
        const gF = O.fusion(P), R1 = R(50), cols = [[0.4, 0.95, 1], [1, 0.55, 0.85], [1, 0.9, 0.45], [0.72, 0.6, 1]], l = [];
        clairs.forEach((c, ic) => { for (let k = 0; k < 22; k += 1) { const a = R1() * TAU, d = Math.sqrt(R1()) * (c.r + 1.5), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (O.distChemin(x, z, c.s) < O.DMIN + 0.2) continue; l.push({ p: [x, ctx.hauteur(x, z) - 0.02, z], ry: R1() * TAU, s: 0.8 + R1() * 1.0, c: cols[(ic + k) % 4] }); } });
        O.semer(R1, 90, { sa, sb, dmin: 4.4, dmax: 14, gam: 1.0 }).forEach((q, i) => l.push({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 0.8 + q.b * 1.0, c: cols[i % 4] }));
        add(l, gF, lueur);
        const gd = g.userData.pools; add(l.map((f) => ({ p: [f.p[0], f.p[1] + 0.2, f.p[2]], s: f.s * 0.9, c: [f.c[0] * 0.55, f.c[1] * 0.55, f.c[2] * 0.55] })), gd, additif);
      }

      // ---- taches de sol : mousse, lumière, tapis de fleurs bleues ----
      {
        const R1 = R(60), l = [], cols = [[H(0x2c8a60), 0.8], [H(0x1c5a4e), 0.7], [H(0x4aa070), 0.75], [H(0x6aa8d8), 0.6], [H(0x9a7ac8), 0.55], [H(0xa8c860), 0.55]];
        O.semer(R1, 54, { sa, sb, dmin: 4.2, dmax: 40, gam: 1.0 }).forEach((q, i) => { const c = cols[Math.floor(q.c * cols.length)]; l.push({ x: q.x, z: q.z, r: 2 + q.a * 4.5, rx: 2 + q.a * 4.5, rz: 1.5 + q.b * 3.5, rot: q.b * 3, c: c[0], a: c[1], ph: q.c }); });
        clairs.forEach((c, ic) => { l.push({ x: c.x, z: c.z, r: c.r * 1.2, c: ic % 2 ? H(0xcfe27a) : H(0x9ad88a), a: 0.7, ph: ic }); });
        ajoute(O.taches(l));
      }

      // ---- faisceaux de lumière (plans croisés, additifs) ----
      const matFaisceau = O.matAdd({ opacity: 1 });
      {
        const T = new O.Tri(), col = (k) => [k, k * 0.93, k * 0.66], haut = 1;
        const cols = [-0.5, -0.17, 0.17, 0.5], al = [0, 1, 1, 0], rows = [[0, 0.15], [0.45, 0.8], [1, 0.0]];
        for (let pl = 0; pl < 2; pl += 1) for (let r = 0; r < 2; r += 1) for (let c = 0; c < 3; c += 1) {
          const f = (rr, cc) => { const w = 0.55 - rows[rr][0] * 0.2 - 0.02 * 0; const x = cols[cc] * 2 * w * 2; return [pl ? 0 : x, rows[rr][0] * haut, pl ? x : 0]; };
          const cv = (rr, cc) => col(0.34 * rows[rr][1] * al[cc]);
          T.quad(f(r, c), f(r, c + 1), f(r + 1, c + 1), f(r + 1, c), cv(r, c), cv(r, c + 1), cv(r + 1, c + 1), cv(r + 1, c), 0);
        }
        const R1 = R(70), l = [], pos = clairs.map((c) => [c.x, c.z]);
        // dans chaque clairière, plus quelques-uns entre les arbres près du chemin
        clairs.forEach((c, ic) => { for (let k = 0; k < 2; k += 1) { const a = R1() * TAU, d = R1() * c.r * 0.7; l.push({ p: [c.x + Math.cos(a) * d, ctx.hauteur(c.x + Math.cos(a) * d, c.z + Math.sin(a) * d) - 0.2, c.z + Math.sin(a) * d], rz: -0.3 + R1() * 0.08, ry: (R1() - 0.5) * 0.8, s: [3.6 + R1() * 2.4, 17 + R1() * 7, 3.6 + R1() * 2.4], c: [1, 1, 1] }); } });
        O.semer(R1, 12, { sa, sb, dmin: 6, dmax: 22, gam: 1.0 }).forEach((q) => l.push({ p: [q.x, q.y - 0.2, q.z], rz: -0.3 + q.a * 0.08, ry: (q.b - 0.5) * 0.8, s: [3.0 + q.c * 2.4, 16 + q.a * 8, 3.0 + q.c * 2.4], c: [1, 1, 1] }));
        void pos;
        const m = add(l, O.fusion([T.piece()]), matFaisceau); g.userData.faisceaux = m;
      }

      // ---- lucioles et spores ----
      const NL = 190, lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3), ld = [];
      {
        const R1 = R(80);
        for (let i = 0; i < NL; i += 1) {
          const s = sa + (sb - sa) * R1(), cote = R1() < 0.5 ? -1 : 1, off = DMINL() + 22 * Math.pow(R1(), 1.3), q = O.lateral(s, cote * off), y = ctx.hauteur(q[0], q[1]) + 0.7 + 3.4 * Math.pow(R1(), 1.6);
          const col = i % 7 === 0 ? [0.55, 0.95, 1] : i % 11 === 0 ? [1, 0.6, 0.95] : [1, 0.92, 0.45];
          ld.push({ b: [q[0], y, q[1]], a: [0.8 + R1() * 1.4, 0.4 + R1() * 0.7, 0.8 + R1() * 1.4], f: [1 + Math.floor(R1() * 3), 1 + Math.floor(R1() * 4), 1 + Math.floor(R1() * 3)], ph: [R1(), R1(), R1(), R1()], fb: 4 + Math.floor(R1() * 9), col });
        }
        function DMINL() { return O.DMIN + 0.3; }
      }
      const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.BufferAttribute(lp, 3)); gl.setAttribute('color', new THREE.BufferAttribute(lc, 3));
      const lucioles = new THREE.Points(gl, O.materielPoints(0.5, O.texRonde(), true)); lucioles.frustumCulled = false; g.add(lucioles);
      const animerLucioles = (t) => {
        for (let i = 0; i < NL; i += 1) {
          const d = ld[i];
          lp[i * 3] = d.b[0] + d.a[0] * Math.sin(TAU * (d.f[0] * t + d.ph[0])); lp[i * 3 + 1] = d.b[1] + d.a[1] * Math.sin(TAU * (d.f[1] * t + d.ph[1])); lp[i * 3 + 2] = d.b[2] + d.a[2] * Math.sin(TAU * (d.f[2] * t + d.ph[2]));
          const k = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(TAU * (d.fb * t + d.ph[3])), 1.5);
          lc[i * 3] = d.col[0] * k; lc[i * 3 + 1] = d.col[1] * k; lc[i * 3 + 2] = d.col[2] * k;
        }
        gl.attributes.position.needsUpdate = true; gl.attributes.color.needsUpdate = true;
      };

      function maj(T, sCam) {
        const vis = sCam > Z0 - 0.5 && sCam < Z1 + 0.07; g.visible = vis; if (!vis) return;
        const t = T / ctx.L;
        animerLucioles(t);
        matFaisceau.opacity = 0.8 + 0.2 * Math.sin(TAU * (2 * t));
      }
      maj(0, (Z0 + Z1) / 2);
      return { group: g, maj };
    },
  };

  return { foret };
});
