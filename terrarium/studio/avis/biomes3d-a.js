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
  function outils(ctx, eclat) {
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
      const ec = eclat || 1, c0 = o.c0 || o.c || [0.6, 0.6, 0.6], c1 = o.c1 || o.c || c0, jit = o.jit || 0, seed = o.seed || 0, vari = o.vari == null ? 0.1 : o.vari, gam = o.gam || 1;
      const out = { p: new Float32Array(n * 3), c: new Float32Array(n * 3), m: new Float32Array(n) }, v = new THREE.Vector3();
      for (let i = 0; i < n; i += 1) {
        const ox = pos.getX(i), oy = pos.getY(i), oz = pos.getZ(i);
        let jx = 0, jy = 0, jz = 0;
        if (jit) { const a = Math.round(ox * 500), b = Math.round(oy * 500), c = Math.round(oz * 500); jx = (hach(a, b, c, seed * 7 + 1) - 0.5) * 2 * jit; jy = (hach(a, b, c, seed * 7 + 2) - 0.5) * 2 * jit; jz = (hach(a, b, c, seed * 7 + 3) - 0.5) * 2 * jit; }
        v.set(ox * sc[0] + jx, oy * sc[1] + jy, oz * sc[2] + jz).applyMatrix4(M);
        out.p[i * 3] = v.x + P[0]; out.p[i * 3 + 1] = v.y + P[1]; out.p[i * 3 + 2] = v.z + P[2];
        const u = Math.pow(Math.min(1, Math.max(0, (oy - y0) / ((y1 - y0) || 1))), gam), col = melange(c0, c1, u);
        const k = ec * (1 + (hach(Math.floor(i / 3), seed, 77, 3) - 0.5) * 2 * vari);
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
      if (Array.isArray(m)) this.m.push(m[0], m[1], m[2]); else { const mm = m == null ? 1 : m; this.m.push(mm, mm, mm); }
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
    // normales lissées (sommets confondus partagent la même normale) : collines rondes
    function lisser(geo) {
      const P = geo.attributes.position, N = geo.attributes.normal, acc = new Map(), key = (i) => Math.round(P.getX(i) * 50) + ',' + Math.round(P.getY(i) * 50) + ',' + Math.round(P.getZ(i) * 50);
      for (let i = 0; i < P.count; i += 1) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); acc.set(k, a); }
      for (let i = 0; i < P.count; i += 1) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
      return geo;
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
      const P = [], C = [], dy = decal == null ? 0.12 : decal, lim = DMIN - 0.25;
      const dch = (x, z) => { let d = 1e9; for (let i = 0; i <= NE; i += 2) { const dx = E[i][0] - x, dz = E[i][1] - z, q = dx * dx + dz * dz; if (q < d) d = q; } return Math.sqrt(d); };
      liste.forEach((t) => {
        const seg = 12, rot = t.rot || 0, ca = Math.cos(rot), sa = Math.sin(rot), rx = t.rx || t.r, rz = t.rz || t.r, ph = t.ph || 0;
        const hmax = (x, z) => Math.max(ctx.hauteur(x, z), ctx.hauteur(x + 1.5, z), ctx.hauteur(x - 1.5, z), ctx.hauteur(x, z + 1.5), ctx.hauteur(x, z - 1.5));
        const pt = (u, k) => { const ang = (k / seg) * TAU + ph, lx = Math.cos(ang) * rx * u, lz = Math.sin(ang) * rz * u, x = t.x + lx * ca - lz * sa, z = t.z + lx * sa + lz * ca; return { p: [x, hmax(x, z) + dy, z], a: t.a * (u < 0.1 ? 1.15 : u < 0.4 ? 1 : u < 0.7 ? 0.8 : 0), d: 0 }; };
        const rings = [0.34, 0.67, 1], cen = { p: [t.x, hmax(t.x, t.z) + dy, t.z], a: t.a * 1.15 };
        const grid = rings.map((u) => { const r = []; for (let k = 0; k <= seg; k += 1) r.push(pt(u, k % seg)); return r; });
        grid.forEach((r) => r.forEach((v) => { v.d = dch(v.p[0], v.p[2]); }));
        cen.d = dch(cen.p[0], cen.p[2]);
        grid[2].forEach((v) => { v.a = 0; });
        const emit = (A, B, Cc) => {
          const cx = (A.p[0] + B.p[0] + Cc.p[0]) / 3, cz = (A.p[2] + B.p[2] + Cc.p[2]) / 3;
          if (A.d < lim || B.d < lim || Cc.d < lim || dch(cx, cz) < lim) return;
          [A, B, Cc].forEach((v) => { const k = Math.min(1, Math.max(0, (v.d - lim) / 1.8)); P.push(v.p[0], v.p[1], v.p[2]); C.push(t.c[0], t.c[1], t.c[2], v.a * k * k * (3 - 2 * k)); });
        };
        for (let k = 0; k < seg; k += 1) {
          emit(cen, grid[0][k + 1], grid[0][k]);
          for (let r = 0; r < 2; r += 1) { const a = grid[r][k], b = grid[r][k + 1], c = grid[r + 1][k], d = grid[r + 1][k + 1]; emit(a, b, d); emit(a, d, c); }
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 4)); g.computeVertexNormals();
      for (let i = 0; i < g.attributes.normal.count; i += 1) g.attributes.normal.setXYZ(i, 0, 1, 0);
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide, emissive: new THREE.Color(0.05, 0.06, 0.05) }));
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
    return { lisser, hex, melange, fois, hach, cone, cyl, ico, octa, boite, dome, prim, segment, Tri, deplacer, fusion, materiau, matLam, matLueur, matAdd, instancier, distChemin, lateral, libre, occuper, semer, taches, texRonde, materielPoints, aleaSuite, DMIN };
  }

  // ======================================================================================================================
  // FORÊT ENCHANTÉE
  // ======================================================================================================================
  const foret = {
    creer(ctx) {
      const THREE = ctx.THREE, O = outils(ctx, 1.34), g = new THREE.Group(), H = O.hex, mel = O.melange, prim = O.prim;
      const Z0 = ctx.zone[0], Z1 = ctx.zone[1], sa = Math.max(0, Z0 - 0.03), sb = Math.min(1, Z1 + 0.03);
      const R = (k) => O.aleaSuite(k);
      const ajoute = (m) => { if (m) g.add(m); return m; };
      const add = (liste, geo, mat) => ajoute(O.instancier(geo, mat, liste));
      const lam = O.matLam(), lamDouble = O.matLam({ side: THREE.DoubleSide }), lueur = O.matLueur({ side: THREE.DoubleSide }), additif = O.matAdd();
      const bois = (c) => ({ c0: mel(H(0x4a3a40), c || H(0x6b5648), 0.0), c1: c || H(0x7a6454), teinte: 0 });
      // teintes d'arbres : surtout le vert-bleu normal, quelques arbres dorés ou violets pour l'enchantement
      const teintes = [[1, 1, 1], [1.05, 1.1, 0.95], [0.92, 1.05, 1.12], [1.15, 1.12, 0.8], [1.25, 1.1, 0.75], [0.9, 1.12, 1.05], [1.1, 1.18, 0.85]];
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
        O.occuper(q[0], q[1], 15);
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
          const teal = i % 3 === 0 ? [H(0x2a8a80), H(0x7ae0c0)] : i % 3 === 1 ? [H(0xe090c8), H(0xffd4ee)] : [H(0x4a9a68), H(0x9ae890)];
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
        const placer = (liste) => liste.map((p) => O.deplacer(p, q[0], yb, q[1], yaw, 1.6));
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
            const m1 = W(cote * 4.6, 5.2, 0.3), m2 = W(cote * 3.0, 9.6, 0), m3 = W(cote * 0.9, 12.0, -0.3);
            O.occuper(base[0], base[2], 3);
            B.push(O.segment(base, m1, 0.55, 0.42, 7, Object.assign({ seed: ia * 7 + ic }, ecorce)));
            [m1, m2].forEach((j, jj) => B.push(prim(O.ico(0.5 - jj * 0.08, 0), Object.assign({ p: j, seed: 5 }, ecorce))));
            B.push(O.segment(m1, m2, 0.42, 0.34, 7, Object.assign({ seed: ia * 7 + ic + 3 }, ecorce)));
            B.push(O.segment(m2, m3, 0.34, 0.26, 6, Object.assign({ seed: ia * 7 + ic + 5 }, ecorce)));
            B.push(prim(O.cone(1.5, 1.2, 7), Object.assign({ p: [base[0], yb - 0.2, base[2]], seed: 9 }, ecorce)));
          });
          for (let k = 0; k < 12; k += 1) {
            const lat = (k / 11 - 0.5) * 10.5, al = ((k * 37) % 7 - 3.5) * 0.9, up = 11.8 + Math.cos(lat * 0.22) * 1.0 + ((k * 13) % 5) * 0.35, r = 2.0 + ((k * 11) % 5) * 0.3;
            const pal = (k + ia) % 3 === 0 ? [H(0x1f6a60), H(0x62c8a0)] : (k + ia) % 3 === 1 ? [H(0x2f6c58), H(0x78cc82)] : [H(0xb070d0), H(0xf4b4f0)];
            const w = W(lat, up, al); B.push(prim(O.ico(r, 1), { p: w, s: [1.1, 0.8, 1.1], c0: pal[0], c1: pal[1], jit: 0.35, seed: 60 + k + ia * 20, gam: 0.8, teinte: 0 }));
          }
          for (let k = 0; k < 8; k += 1) { // guirlande de petites lanternes
            const lat = (k / 7 - 0.5) * 8, up = 10.2 + Math.cos(lat * 0.3) * 0.9, w = W(lat, up, ((k % 3) - 1) * 1.1), col = [H(0xffe488), H(0x7ff0ff), H(0xff9ad8)][(k + ia) % 3];
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
        const P = [prim(O.cyl(0.42, 0.14, 11, 6, true), Object.assign({ seed: 1, jit: 0.04 }, bois(H(0x7a5f58))))];
        for (let k = 0; k < 6; k += 1) P.push(prim(O.cone(2.7 * (1 - k * 0.15), 3.3 - k * 0.1, 7, k > 0), { p: [0, 2.0 + k * 1.75, 0], r: [0, k * 0.8, 0], c0: H(0x1d6064), c1: H(0x64cba0), jit: 0.28, seed: 10 + k, vari: 0.12 }));
        return O.fusion(P);
      };
      // pin trapu aux grands étages
      const geoPinB = () => {
        const P = [prim(O.cyl(0.5, 0.2, 6, 6), Object.assign({ seed: 2 }, bois(H(0x6e5560))))];
        [[3.8, 3.4, 1.4], [2.9, 3.0, 3.4], [2.1, 2.7, 5.2], [1.2, 2.2, 6.8]].forEach((c, k) => P.push(prim(O.cone(c[0], c[1], 8, k > 0), { p: [0, c[2], 0], r: [0, k * 0.5, 0], c0: H(0x226a68), c1: H(0x74d6aa), jit: 0.34, seed: 30 + k })));
        return O.fusion(P);
      };
      // sapin simple (peu coûteux, pour épaissir)
      const geoSapin = () => {
        const P = [prim(O.cyl(0.3, 0.1, 5, 5, true), Object.assign({ seed: 8 }, bois(H(0x7a5f58))))];
        [[2.0, 2.6, 1.2], [1.55, 2.4, 2.7], [1.1, 2.2, 4.1], [0.6, 1.6, 5.5]].forEach((c, k) => P.push(prim(O.cone(c[0], c[1], 6, k > 0), { p: [0, c[2], 0], r: [0, k, 0], c0: H(0x206a68), c1: H(0x6cd0a0), jit: 0.22, seed: 80 + k })));
        return O.fusion(P);
      };
      // chêne large
      const geoChene = (mauve) => {
        const P = [prim(O.cyl(0.8, 0.4, 3.6, 7), Object.assign({ seed: 3, jit: 0.06 }, bois(H(0x7d6258))))];
        P.push(prim(O.cone(1.3, 1.1, 7), Object.assign({ seed: 4 }, bois(H(0x6a5258)))));
        P.push(O.segment([0, 3, 0], [-1.7, 5.6, 0.4], 0.32, 0.18, 5, Object.assign({ seed: 5 }, bois())));
        P.push(O.segment([0, 3.2, 0], [1.8, 5.2, -0.6], 0.3, 0.17, 5, Object.assign({ seed: 6 }, bois())));
        [[0, 6.2, 0, 2.9], [-2.3, 5.2, 0.6, 2.3], [2.4, 5.3, -0.7, 2.4], [0.2, 4.7, -2.0, 2.0], [0.2, 8.0, 0.2, 1.8]].forEach((b, k) =>
          P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1.1, 0.85, 1.1], c0: H(mauve ? 0xa868c8 : 0x2a7a62), c1: H(mauve ? 0xf6b8f0 : 0x84d68a), jit: 0.42, seed: 50 + k, gam: 0.85, vari: 0.12 })));
        return O.fusion(P);
      };
      // bouleau
      const geoBouleau = () => {
        const P = [prim(O.cyl(0.2, 0.1, 7.5, 5), { c0: H(0xcfc9d4), c1: H(0xe8e4ea), teinte: 0, seed: 4 })];
        for (let k = 0; k < 5; k += 1) P.push(prim(O.cyl(0.215, 0.215, 0.1, 5), { p: [0, 0.8 + k * 1.3, 0], c: H(0x59505e), teinte: 0, vari: 0.05 }));
        [[0, 7.2, 0, 1.5], [0.7, 6.1, 0.4, 1.2], [-0.7, 6.6, -0.3, 1.25]].forEach((b, k) =>
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
        { geo: geoChene(true), n: 9, r: 3.0, dmin: 6, dmax: 40, gam: 1.4, k: 17, h: [0.9, 1.5], w: [1.0, 1.4], neutre: true },
        { geo: geoChene(), n: 30, r: 3.0, dmin: 5.4, dmax: 46, gam: 1.8, k: 13, h: [0.8, 1.5], w: [0.85, 1.4] },
        { geo: geoParasol(), n: 14, r: 3.2, dmin: 6.5, dmax: 46, gam: 1.0, k: 15, h: [0.8, 1.3], w: [0.8, 1.2] },
        { geo: geoPinB(), n: 50, r: 2.8, dmin: 4.8, dmax: 42, gam: 2.0, k: 12, h: [0.8, 1.4], w: [0.8, 1.25] },
        { geo: geoPinA(), n: 70, r: 2.2, dmin: 4.6, dmax: 44, gam: 2.0, k: 11, h: [0.7, 1.15], w: [0.75, 1.05] },
        { geo: geoBouleau(), n: 28, r: 1.6, dmin: 4.5, dmax: 40, gam: 1.8, k: 14, h: [0.8, 1.4], w: [0.8, 1.2] },
        { geo: geoSapin(), n: 105, r: 1.5, dmin: 4.5, dmax: 46, gam: 2.2, k: 16, h: [0.8, 1.9], w: [0.75, 1.3] },
      ];
      arbres.forEach((t) => {
        const R1 = R(t.k), l = O.semer(R1, t.n, { sa, sb, dmin: t.dmin, dmax: t.dmax, gam: t.gam, r: t.r, exclure: exTr }).map((q) => {
          const hh = t.h[0] + (t.h[1] - t.h[0]) * q.a, ww = t.w[0] + (t.w[1] - t.w[0]) * q.b;
          return { p: [q.x, q.y - 0.25, q.z], ry: q.c * TAU, s: [ww * hh * 0.7 + ww * 0.3, hh, ww * hh * 0.7 + ww * 0.3], c: t.neutre ? [1, 1, 1] : teinte(R1()) };
        });
        add(l, t.geo, lam);
      });
      // la grande forêt basse qui ferme l'horizon (cônes bleutés)
      {
        const R1 = R(20), l = [], P = [prim(O.cone(2.4, 9, 5, true), { c0: H(0x214c64), c1: H(0x58a0a0), jit: 0.3, seed: 5, teinte: 0 })];
        for (let i = 0; i < 640; i += 1) {
          const s = sa + (sb + 0.04 - sa) * R1(), cote = R1() < 0.5 ? -1 : 1, off = 22 + 80 * Math.pow(R1(), 1.1), q = O.lateral(s, cote * off), hh = 0.8 + 0.9 * R1(), ww = 0.8 + 0.7 * R1();
          l.push({ p: [q[0], ctx.hauteur(q[0], q[1]) - 0.5, q[1]], ry: R1() * TAU, s: [ww * hh * 0.9, hh * 1.25, ww * hh * 0.9], c: [0.85 + 0.2 * R1(), 0.95 + 0.15 * R1(), 1.0 + 0.15 * R1()] });
        }
        add(l, O.fusion(P), lam);
      }

      // ---- sous-bois ----
      // buissons
      {
        const P = [prim(O.ico(1.0, 0), { p: [0, 0.5, 0], s: [1.2, 0.8, 1.1], c0: H(0x1c5a4a), c1: H(0x58b070), jit: 0.18, seed: 3, gam: 0.8 }), prim(O.ico(0.75, 0), { p: [0.8, 0.45, 0.3], s: [1, 0.8, 1], c0: H(0x246a50), c1: H(0x70c27c), jit: 0.15, seed: 4, gam: 0.8 })];
        const R1 = R(30), l = O.semer(R1, 200, { sa, sb, dmin: 4.4, dmax: 38, gam: 1.5, r: 0.9, exclure: (x, z) => dansClairiere(x, z, -1.5) }).map((q) => ({ p: [q.x, q.y - 0.1, q.z], ry: q.a * TAU, s: 0.8 + q.b * 1.4, c: teinte(q.c) }));
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
        for (let k = 0; k < 4; k += 1) { const phi = 0.25 + (k % 3) * 0.3, th = k * 2.4; lum.push(prim(O.octa(0.24), { p: [Math.sin(phi) * Math.cos(th) * 1.75 * 0.97, 1.35 + Math.cos(phi) * 0.98, Math.sin(phi) * Math.sin(th) * 1.75 * 0.97], s: [1, 0.55, 1], c: H(0xfff6c8), teinte: 0, vari: 0.03 })); }
        const gCorps = O.fusion(corps), gLum = O.fusion(lum);
        const couleurs = [[1.0, 0.55, 0.78], [0.45, 0.9, 1.0], [0.72, 0.52, 1.0], [0.85, 0.75, 1.0]];
        const R1 = R(40), grands = [], pts = [];
        // quelques grands champignons au bord du chemin et surtout dans les clairières
        const pose = (q, k, ech) => { const c = couleurs[k % couleurs.length]; grands.push({ p: [q.x, q.y - 0.05, q.z], ry: q.a * TAU, s: ech, c, c2: [c[0] * 0.7 + 0.3, c[1] * 0.7 + 0.3, c[2] * 0.7 + 0.3] }); };
        O.semer(R1, 24, { sa, sb, dmin: 4.8, dmax: 15, gam: 1.0, r: 1.2 }).forEach((q, i) => pose(q, i, 0.9 + q.b * 0.9));
        clairs.forEach((c, ic) => { for (let k = 0; k < 6; k += 1) { const a = k * 1.1 + ic, d = 1.6 + (k % 3) * 1.8 + (k > 3 ? 1.5 : 0), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (O.distChemin(x, z, c.s) < O.DMIN + 0.3) continue; pose({ x, z, y: ctx.hauteur(x, z), a: (k * 0.37) % 1 }, ic + k, 0.5 + ((k * 7) % 5) * 0.28); } });
        const petits = [];
        O.semer(R1, 50, { sa, sb, dmin: 4.4, dmax: 18, gam: 1.2 }).forEach((q, i) => { const c = couleurs[i % couleurs.length]; petits.push({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 0.14 + q.b * 0.22, c, c2: [c[0] * 0.7 + 0.3, c[1] * 0.7 + 0.3, c[2] * 0.7 + 0.3] }); });
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
        clairs.forEach((c, ic) => { for (let k = 0; k < 22; k += 1) { const a = R1() * TAU, d = Math.sqrt(R1()) * (c.r + 1.5), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (O.distChemin(x, z, c.s) < O.DMIN + 0.2) continue; l.push({ p: [x, ctx.hauteur(x, z) - 0.02, z], ry: R1() * TAU, s: 1.2 + R1() * 1.2, c: cols[(ic + k) % 4] }); } });
        O.semer(R1, 90, { sa, sb, dmin: 4.4, dmax: 14, gam: 1.0 }).forEach((q, i) => l.push({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 1.2 + q.b * 1.2, c: cols[i % 4] }));
        add(l, gF, lueur);
        const gd = g.userData.pools; add(l.map((f) => ({ p: [f.p[0], f.p[1] + 0.2, f.p[2]], s: f.s * 0.9, c: [f.c[0] * 0.55, f.c[1] * 0.55, f.c[2] * 0.55] })), gd, additif);
      }

      // ---- brume basse bleutée (nappes additives, loin de l'axe du chemin) ----
      {
        const R1 = R(90), l = [];
        O.semer(R1, 26, { sa, sb, dmin: 9, dmax: 40, gam: 1.0 }).forEach((q) => l.push({ p: [q.x, q.y + 0.8, q.z], s: [6 + q.a * 8, 1, 6 + q.b * 8], c: [0.1, 0.15, 0.22] }));
        add(l, g.userData.pools, additif);
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
      const NL = 260, lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3), ld = [];
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
      const lucioles = new THREE.Points(gl, O.materielPoints(0.7, O.texRonde(), true)); lucioles.frustumCulled = false; g.add(lucioles);
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
        const vis = sCam > Z0 - 0.5 && sCam < Z1 + 0.045; g.visible = vis; if (!vis) return;
        const t = T / ctx.L;
        animerLucioles(t);
        matFaisceau.opacity = 0.8 + 0.2 * Math.sin(TAU * (2 * t));
      }
      maj(0, (Z0 + Z1) / 2);
      return { group: g, maj };
    },
  };

  // ======================================================================================================================
  // PRAIRIE FLEURIE
  // ======================================================================================================================
  const prairie = {
    creer(ctx) {
      const THREE = ctx.THREE, O = outils(ctx, 1.16), g = new THREE.Group(), H = O.hex, mel = O.melange, prim = O.prim;
      const Z0 = ctx.zone[0], Z1 = ctx.zone[1], sa = Math.max(0, Z0 - 0.03), sb = Math.min(1, Z1 + 0.03);
      const R = (k) => O.aleaSuite(k + 500);
      const ajoute = (m) => { if (m) g.add(m); return m; };
      const add = (liste, geo, mat) => ajoute(O.instancier(geo, mat, liste));
      const lam = O.matLam({ emissive: new THREE.Color(0.1, 0.075, 0.085) }), lamDouble = O.matLam({ side: THREE.DoubleSide, emissive: new THREE.Color(0.1, 0.075, 0.085) }), lueur = O.matLueur({ side: THREE.DoubleSide });
      const lerp = (a, b, u) => a + (b - a) * u;
      const doux = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
      const bois = (c0, c1) => ({ c0: c0 || H(0x8a5e58), c1: c1 || H(0xb08470), teinte: 0 });
      const FL = [[1.0, 0.46, 0.7], [1.0, 0.88, 0.28], [1.0, 1.0, 1.0], [0.72, 0.52, 1.0], [1.0, 0.6, 0.25], [1.0, 0.68, 0.82]];   // rose, jaune, blanc, violet, orange, rose clair
      // bruit de valeur lisse
      const vn = (x, z, sd) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), h = (p, q) => O.hach(p, q, sd, 5); return lerp(lerp(h(i, j), h(i + 1, j), a), lerp(h(i, j + 1), h(i + 1, j + 1), a), b); };
      const posAu = (s, cote, off) => { const q = O.lateral(s, cote * off); return { x: q[0], z: q[1], y: ctx.hauteur(q[0], q[1]), t: q[3], s }; };
      // où sont les grands éléments : (s, côté, décalage)
      const L_MOULIN = posAu(0.515, -1, 38), L_FERME = posAu(0.455, -1, 22), L_BALANC = posAu(0.33, 1, 11.5);
      const exclu = [[L_MOULIN, 15], [L_FERME, 15], [L_BALANC, 5.2]];
      exclu.forEach((e) => O.occuper(e[0].x, e[0].z, e[1]));
      const horsGrand = (x, z, m) => exclu.some((e) => Math.hypot(e[0].x - x, e[0].z - z) < e[1] + (m || 0));

      // ---- collines et buttes (dômes à couleurs de sommets en patchwork pastel) ----
      {
        const T = new O.Tri(), R1 = R(1);
        const couleurSol = (x, z) => {
          const n1 = vn(x * 0.05, z * 0.05, 1), n2 = vn(x * 0.11 + 7, z * 0.11, 2), n3 = vn(x * 0.19, z * 0.19 + 3, 3);
          let c = mel(mel(H(0x62c85a), H(0xa6e476), n1), H(0x4cb86a), doux(0.55, 0.9, n2) * 0.6);
          const fl = FL[Math.floor(vn(x * 0.04, z * 0.04, 4) * FL.length * 0.999)], pm = doux(0.6, 0.72, n3);
          return mel(c, [fl[0] * 0.95, fl[1] * 0.95, fl[2] * 0.95], pm * 0.55);
        };
        const colline = (cx, cz, r, h, fleuri) => {
          let base = 1e9; for (let k = 0; k < 8; k += 1) { const a = (k / 8) * TAU; base = Math.min(base, ctx.hauteur(cx + Math.cos(a) * r, cz + Math.sin(a) * r)); }
          base = Math.min(base, ctx.hauteur(cx, cz)) - 0.5;
          const nr = r > 20 ? 10 : 6, ns = r > 20 ? 28 : 16, V = (u, k) => { const a = (k / ns) * TAU, x = cx + Math.cos(a) * r * u * (1 + 0.1 * Math.sin(k * 2.3)), z = cz + Math.sin(a) * r * u * (1 + 0.1 * Math.sin(k * 1.7 + 1)); const f = Math.cos(u * Math.PI / 2); return [x, base + 0.6 + h * f * f, z, couleurSol(x, z)]; };
          for (let i = 0; i < nr; i += 1) for (let k = 0; k < ns; k += 1) {
            const a = V(i / nr, k), b = V(i / nr, k + 1), c = V((i + 1) / nr, k), d = V((i + 1) / nr, k + 1);
            if (i === 0) T.tri(a, d, c, a[3], d[3], c[3]); else { T.tri(a, d, c, a[3], d[3], c[3]); T.tri(a, b, d, a[3], b[3], d[3]); }
          }
          void fleuri; return base + 0.6 + h;
        };
        L_MOULIN.top = colline(L_MOULIN.x, L_MOULIN.z, 15, 7.5, 1); L_FERME.top = colline(L_FERME.x, L_FERME.z, 15, 4.6, 1);
        // petites bosses fleuries près du chemin
        O.semer(R1, 7, { sa, sb, dmin: 12, dmax: 26, gam: 1.0, r: 9, exclure: (x, z) => horsGrand(x, z, 6) }).forEach((q) => colline(q.x, q.z, 8 + q.a * 5, 1.8 + q.b * 1.8, 1));
        // collines lointaines
        for (let i = 0; i < 14; i += 1) { const s = sa + (sb + 0.06 - sa) * R1(), cote = R1() < 0.5 ? -1 : 1, off = 46 + 70 * R1(), q = O.lateral(s, cote * off); colline(q[0], q[1], 26 + R1() * 24, 12 + R1() * 14, 1); }
        ajoute(new THREE.Mesh(O.lisser(O.fusion([T.piece()])), lam));
      }

      // ---- cerisiers en fleurs ----
      const geoCerisier = (v) => {
        const P = [prim(O.cyl(0.5, 0.26, 3.2, 6), Object.assign({ seed: 1, jit: 0.05 }, bois(H(0x7a5058), H(0xa87a74))))];
        P.push(prim(O.cone(0.9, 0.7, 6), Object.assign({ seed: 2 }, bois(H(0x7a5058)))));
        P.push(O.segment([0, 2.6, 0], [-1.5, 4.4, 0.3], 0.2, 0.12, 5, Object.assign({ seed: 3 }, bois())));
        P.push(O.segment([0, 2.8, 0], [1.6, 4.2, -0.4], 0.2, 0.12, 5, Object.assign({ seed: 4 }, bois())));
        const bl = v ? [[0, 5.0, 0, 2.2], [-2.7, 4.5, 0.5, 1.9], [2.8, 4.3, -0.6, 2.0], [0.3, 4.1, 2.4, 1.7], [-0.2, 6.3, -0.3, 1.5], [1.0, 4.1, -2.4, 1.6]] : [[0, 5.4, 0, 2.5], [-1.7, 4.4, 0.8, 1.9], [1.9, 4.6, -0.5, 2.0], [0.2, 4.2, -1.9, 1.7], [0, 6.9, 0.2, 1.6]];
        bl.forEach((b, k) => P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1.1, 0.85, 1.1], c0: H(v ? 0xff5c8c : 0xff6896), c1: H(0xffd0d4), jit: 0.38, seed: 20 + k, gam: 0.9, vari: 0.1 })));
        return O.fusion(P);
      };
      const geoRond = () => {
        const P = [prim(O.cyl(0.55, 0.3, 3.4, 6), Object.assign({ seed: 5 }, bois(H(0x7d5a52), H(0xa8806a))))];
        [[0, 5.1, 0, 2.7], [-1.9, 4.2, 0.6, 1.9], [2.0, 4.2, -0.4, 2.0], [0.2, 7.0, 0.1, 1.7]].forEach((b, k) => P.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1.05, 0.9, 1.05], c0: H(0x3fa84a), c1: H(0xa8e060), jit: 0.34, seed: 40 + k, gam: 0.85 })));
        return O.fusion(P);
      };
      const rosiers = [[1, 1, 1], [1.05, 0.95, 1.05], [0.95, 1.0, 1.1], [1.08, 1.05, 0.95]];
      const grove = [[0.283, 11, 4], [0.295, -12, 4], [0.315, 13, 5], [0.335, -14, 5], [0.35, 12, 4], [0.37, -9, 4], [0.395, 12, 4], [0.415, -10, 5], [0.435, 14, 5], [0.46, 12, 4], [0.485, -12, 5], [0.505, 14, 5], [0.525, -11, 4], [0.545, 12, 4]];
      {
        const R1 = R(10), A = [], B = [];
        grove.forEach((gv, k) => {
          const c = posAu(gv[0], gv[1] < 0 ? -1 : 1, Math.abs(gv[1]));
          let ok = 0; for (let i = 0; i < gv[2] * 8 && ok < gv[2] + 1; i += 1) { const a = R1() * TAU, d = 1 + R1() * 7.5, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (O.distChemin(x, z, gv[0]) < O.DMIN + 1.6 || horsGrand(x, z, 3) || !O.libre(x, z, 2.4)) continue; O.occuper(x, z, 2.4); ok += 1; const e = { p: [x, ctx.hauteur(x, z) - 0.2, z], ry: R1() * TAU, s: 0.8 + R1() * 0.7, c: rosiers[Math.floor(R1() * 4)] }; (R1() < 0.5 ? A : B).push(e); }
        });
        // allée de cerisiers sur la fin de la prairie (de chaque côté, en quinconce)
        for (let s0 = 0.44; s0 < sb; s0 += 0.02) [-1, 1].forEach((co, ic) => {
          const p = posAu(s0 + (ic ? 0.01 : 0), co, 8 + R1() * 5), x = p.x, z = p.z; if (O.distChemin(x, z, s0) < O.DMIN + 2.2 || horsGrand(x, z, 3) || !O.libre(x, z, 2.4)) return;
          O.occuper(x, z, 2.4); (R1() < 0.5 ? A : B).push({ p: [x, ctx.hauteur(x, z) - 0.2, z], ry: R1() * TAU, s: 0.95 + R1() * 0.5, c: rosiers[Math.floor(R1() * 4)] });
        });
        const lamCer = O.matLam({ emissive: new THREE.Color(0.24, 0.1, 0.15) }); add(A, geoCerisier(0), lamCer); add(B, geoCerisier(1), lamCer);
        g.userData.cerisiers = A.concat(B);
      }
      {
        const R1 = R(12), l = [];
        O.semer(R1, 26, { sa, sb, dmin: 6.5, dmax: 50, gam: 1.5, r: 3.0, exclure: (x, z) => horsGrand(x, z, 3) }).forEach((q) => l.push({ p: [q.x, q.y - 0.2, q.z], ry: q.a * TAU, s: 0.8 + q.b * 0.7, c: [0.95 + q.c * 0.12, 1, 0.9 + q.a * 0.15] }));
        add(l, geoRond(), lam);
      }

      // ---- fleurs : trois silhouettes, champs de couleur ----
      {
        const vert = H(0x3fa84a), vertP = H(0x7ad060);
        const marguerite = new O.Tri(), clochette = new O.Tri(), epi = new O.Tri(), h = 0.42;
        const tige = (T, hh, w) => { T.quad([-w, 0, 0], [w, 0, 0], [w * 0.6, hh, 0], [-w * 0.6, hh, 0], vert, vert, vertP, vertP, 0); };
        tige(marguerite, h, 0.025);
        for (let k = 0; k < 6; k += 1) {   // six pétales arrondis (5 sommets) autour d'un cœur jaune
          const a0 = (k / 6) * TAU, pv = (r, da, dy) => [Math.cos(a0 + da) * r, h + dy, Math.sin(a0 + da) * r], c0 = H(0xffc828), blanc = [1, 1, 1];
          const B = pv(0.06, 0, 0.03), S1 = pv(0.19, -0.36, 0.05), T1 = pv(0.32, -0.15, 0.08), T2 = pv(0.32, 0.15, 0.08), S2 = pv(0.19, 0.36, 0.05);
          marguerite.tri(B, S1, T1, c0, blanc, blanc, [0, 1, 1]); marguerite.tri(B, T1, T2, c0, blanc, blanc, [0, 1, 1]); marguerite.tri(B, T2, S2, c0, blanc, blanc, [0, 1, 1]);
        }
        tige(clochette, h, 0.022);
        for (let k = 0; k < 5; k += 1) { const a0 = (k / 5) * TAU, a1 = ((k + 1) / 5) * TAU; clochette.tri([0, h - 0.12, 0], [Math.cos(a0) * 0.15, h + 0.1, Math.sin(a0) * 0.15], [Math.cos(a1) * 0.15, h + 0.1, Math.sin(a1) * 0.15], [1, 1, 1], [1, 1, 1], [1, 1, 1], [0.7, 1, 1]); }
        clochette.tri([0, h + 0.07, 0], [0.15, h + 0.1, 0], [-0.07, h + 0.1, 0.13], H(0xfff0a0), H(0xfff0a0), H(0xfff0a0), 0);
        tige(epi, 0.6, 0.02);
        for (let k = 0; k < 4; k += 1) { const a0 = (k / 4) * TAU, a1 = ((k + 1) / 4) * TAU; epi.tri([0, 0.86, 0], [Math.cos(a0) * 0.1, 0.4, Math.sin(a0) * 0.1], [Math.cos(a1) * 0.1, 0.4, Math.sin(a1) * 0.1], [1, 1, 1], [0.8, 0.8, 0.9], [0.8, 0.8, 0.9], [1, 1, 1]); }
        const G = [O.fusion([marguerite.piece()]), O.fusion([clochette.piece()]), O.fusion([epi.piece()])];
        const R1 = R(20), listes = [[], [], []], tachesL = [];
        const face = (x, z, s) => { const c = posAu(Math.max(0, s - 0.01), 0, 0); return Math.atan2(c.x - x, c.z - z); };
        const type = [1, 0, 0, 2, 1, 2];
        const champs = O.semer(R1, 28, { sa, sb, dmin: 4.6, dmax: 22, gam: 1.9, r: 0, exclure: (x, z) => horsGrand(x, z, 2) });
        champs.concat(O.semer(R1, 9, { sa: 0.44, sb, dmin: 4.6, dmax: 20, gam: 1.7, r: 0, exclure: (x, z) => horsGrand(x, z, 2) })).forEach((q, ic) => {
          const ci = (ic * 2 + Math.floor(q.a * 2)) % FL.length, col = FL[ci], rad = 5 + q.b * 5, n = Math.round(rad * rad * 1.25);
          tachesL.push({ x: q.x, z: q.z, r: rad * 1.3, c: mel(col, H(0x6ac860), 0.12), a: 1.0, ph: q.c * 3 });
          for (let k = 0; k < n; k += 1) {
            const a = R1() * TAU, d = Math.sqrt(R1()) * rad, x = q.x + Math.cos(a) * d, z = q.z + Math.sin(a) * d;
            if (O.distChemin(x, z, q.s) < O.DMIN + 0.2 || horsGrand(x, z, 1.5)) continue;
            const ti = R1() < 0.2 ? (type[ci] + 1) % 3 : type[ci], v = 0.88 + R1() * 0.2;
            listes[ti].push({ p: [x, ctx.hauteur(x, z) - 0.02, z], ry: face(x, z, q.s) + (R1() - 0.5) * 0.9, rx: 0.55 + R1() * 0.5, s: 2.6 + R1() * 1.2, c: [col[0] * v, col[1] * v, col[2] * v] });
          }
        });
        // fleurs isolées (blanc et jaune) un peu partout, pour casser l'uniformité
        O.semer(R1, 380, { sa, sb, dmin: 4.4, dmax: 34, gam: 1.3, exclure: (x, z) => horsGrand(x, z, 1) }).forEach((q, i) => { const col = i % 3 === 0 ? FL[1] : i % 3 === 1 ? FL[2] : FL[5]; listes[i % 2].push({ p: [q.x, q.y - 0.02, q.z], ry: face(q.x, q.z, q.s) + (q.a - 0.5), rx: 0.55 + q.c * 0.5, s: 2.0 + q.b * 1.0, c: col }); });
        add(listes[0], G[0], lamDouble); add(listes[1], G[1], lamDouble); add(listes[2], G[2], lamDouble);
        // ses tapis de couleur sous les fleurs + taches d'herbe
        const R2 = R(21);
        O.semer(R2, 40, { sa, sb, dmin: 4.2, dmax: 44, gam: 1.0 }).forEach((q) => { const cc = [H(0xbce87a), H(0x58c068), H(0xd8ec8a), H(0x7ad48a)][Math.floor(q.c * 4)]; tachesL.push({ x: q.x, z: q.z, r: 3 + q.a * 5, rx: 3 + q.a * 5, rz: 2 + q.b * 4, rot: q.b * 3, c: cc, a: 0.7, ph: q.a }); });
        ajoute(O.taches(tachesL));
      }

      // ---- herbes, buissons fleuris, pierres du chemin ----
      {
        const T = new O.Tri(), r = ctx.rng(7171 + ctx.graine);
        for (let k = 0; k < 6; k += 1) { const th = (k / 6) * TAU + r() * 0.8, d = 0.1 + 0.15 * r(), hh = 0.4 + 0.45 * r(), x = Math.cos(th) * d, z = Math.sin(th) * d, w = 0.07; T.tri([x - w, 0, z], [x + w, 0, z], [x * 2.4, hh, z * 2.4], H(0x4cb04c), H(0x4cb04c), H(0xc0ec7c)); }
        const R1 = R(30), l = O.semer(R1, 520, { sa, sb, dmin: 4.3, dmax: 30, gam: 1.3 }).map((q) => ({ p: [q.x, q.y - 0.02, q.z], ry: q.a * TAU, s: 0.8 + q.b * 1.2, c: [0.9 + 0.2 * q.c, 1, 0.9 + 0.1 * q.a] }));
        add(l, O.fusion([T.piece()]), lamDouble);
        // buisson fleuri : boule verte parsemée de fleurs
        const P = [prim(O.ico(1.0, 1), { p: [0, 0.65, 0], s: [1.25, 0.85, 1.1], c0: H(0x3fa04a), c1: H(0x92dc62), jit: 0.14, seed: 6, gam: 0.8 })];
        for (let k = 0; k < 9; k += 1) { const th = k * 2.4, ph = 0.25 + (k % 4) * 0.28; P.push(prim(O.octa(0.17), { p: [Math.sin(ph) * Math.cos(th) * 1.25, 0.65 + Math.cos(ph) * 0.88, Math.sin(ph) * Math.sin(th) * 1.1], s: [1, 0.6, 1], c: [1, 1, 1], vari: 0.04 })); }
        const R2 = R(31), l2 = O.semer(R2, 70, { sa, sb, dmin: 4.5, dmax: 36, gam: 1.4, r: 1.0, exclure: (x, z) => horsGrand(x, z, 1) }).map((q) => ({ p: [q.x, q.y - 0.1, q.z], ry: q.a * TAU, s: 0.7 + q.b * 1.1, c: FL[Math.floor(q.c * FL.length)] }));
        add(l2, O.fusion(P), lam);
        // pierres du chemin : petits groupes de galets plats juste au bord
        const S = [prim(O.ico(0.5, 0), { s: [1.4, 0.55, 1], c0: H(0xb0a4c8), c1: H(0xe0d8ec), jit: 0.1, seed: 2 }), prim(O.ico(0.32, 0), { p: [0.8, 0, 0.3], s: [1.3, 0.55, 1], c0: H(0xa8a0c0), c1: H(0xd8d0e8), jit: 0.08, seed: 3 })];
        const R3 = R(32), l3 = [];
        for (let k = 0; k < 44; k += 1) { const s = sa + (sb - sa) * R3(), cote = R3() < 0.5 ? -1 : 1, q = posAu(s, cote, O.DMIN + 0.3 + R3() * 2.5); if (O.distChemin(q.x, q.z, s) < O.DMIN + 0.05) continue; l3.push({ p: [q.x, q.y - 0.05, q.z], ry: R3() * TAU, s: 0.7 + R3() * 1.0 }); }
        add(l3, O.fusion(S), lam);
      }

      // ---- clôture blanche et haie le long du chemin (par tronçons) ----
      {
        const F = [prim(O.boite(0.13, 1.05, 0.13), { p: [0.1, 0, 0], c0: H(0xe6d6c8), c1: H(0xfff8f0), teinte: 0, vari: 0.04, seed: 1 }), prim(O.boite(0.13, 1.05, 0.13), { p: [2.3, 0, 0], c0: H(0xe6d6c8), c1: H(0xfff8f0), teinte: 0, vari: 0.04, seed: 2 }),
          prim(O.boite(2.4, 0.1, 0.06), { p: [0, 0.78, 0], c: H(0xfff6ec), teinte: 0, vari: 0.04, seed: 3 }), prim(O.boite(2.4, 0.1, 0.06), { p: [0, 0.38, 0], c: H(0xfff6ec), teinte: 0, vari: 0.04, seed: 4 })];
        const Hh = [prim(O.ico(1, 1), { p: [0, 0.55, 0], s: [1.3, 0.62, 0.55], c0: H(0x2f9448), c1: H(0x8ad860), jit: 0.1, seed: 5, gam: 0.8 })];
        for (let k = 0; k < 6; k += 1) Hh.push(prim(O.octa(0.13), { p: [-1.1 + k * 0.45, 0.55 + 0.28 + (k % 2) * 0.12, 0.38 - (k % 3) * 0.05], s: [1, 0.6, 1], c: [1, 1, 1], vari: 0.03 }));
        const fences = [], hedges = [], coul = [[1, 0.5, 0.75], [1, 1, 1], [1, 0.9, 0.35], [0.8, 0.6, 1]];
        const troncons = [[0.283, 0.335, -1, 'c'], [0.283, 0.325, 1, 'h'], [0.345, 0.395, 1, 'c'], [0.36, 0.41, -1, 'h'], [0.41, 0.47, 1, 'h'], [0.43, 0.49, -1, 'c'], [0.49, 0.55, 1, 'c'], [0.5, 0.55, -1, 'h']];
        const pas = 2.4 / ctx.chemin.longueur;
        troncons.forEach((tr) => {
          const off = tr[3] === 'c' ? O.DMIN + 0.5 : O.DMIN + 0.7;
          for (let s = tr[0]; s < Math.min(tr[1], sb); s += pas) {
            const a = posAu(s, tr[2], off), b = posAu(s + pas, tr[2], off), dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), dy = b.y - a.y;
            if (O.distChemin(a.x, a.z, s) < O.DMIN || O.distChemin(b.x, b.z, s) < O.DMIN) continue;
            const e = { p: [a.x, a.y - 0.08, a.z], ry: Math.atan2(-dz, dx), rz: Math.atan2(dy, L), s: [L / 2.4, 1, 1] };
            if (tr[3] === 'c') fences.push(e); else hedges.push({ p: [(a.x + b.x) / 2, (a.y + b.y) / 2 - 0.1, (a.z + b.z) / 2], ry: Math.atan2(-dz, dx), s: [L / 2.3 * 1.0, 1 + 0.15 * Math.sin(s * 400), 1], c: coul[Math.floor(((s * 977) % 1) * 4)] });
          }
        });
        add(fences, O.fusion(F), lam); add(hedges, O.fusion(Hh), lam);
      }

      // ---- meules de foin ----
      {
        const P = [prim(O.cyl(1.25, 1.2, 1.1, 8), { c0: H(0xe0b050), c1: H(0xf2cc66), teinte: 0, jit: 0.04, seed: 1 }), prim(O.cone(1.3, 1.5, 8), { p: [0, 1.0, 0], c0: H(0xe8bc58), c1: H(0xffe08a), teinte: 0, jit: 0.07, seed: 2 }), prim(O.cyl(1.28, 1.28, 0.08, 8), { p: [0, 0.5, 0], c: H(0xb08838), teinte: 0, seed: 3 })];
        const R1 = R(40), l = O.semer(R1, 12, { sa, sb, dmin: 6, dmax: 32, gam: 1.2, r: 2.0, exclure: (x, z) => horsGrand(x, z, 1) }).map((q) => ({ p: [q.x, q.y - 0.1, q.z], ry: q.a * TAU, s: 0.8 + q.b * 0.5 }));
        add(l, O.fusion(P), lam);
      }

      // ---- panneau de bois fléché ----
      {
        const q = posAu(0.298, 1, O.DMIN + 0.4), B = [], Lu = [];
        const t = q.t, yaw = Math.atan2(t[0], t[1]);
        B.push(prim(O.cyl(0.11, 0.09, 2.1, 6), Object.assign({ seed: 1 }, bois(H(0x9a6a48), H(0xc08a60)))));
        const planche = (y, dir, c0, c1, seed) => {
          const T = new O.Tri(), x0 = -0.8, x1 = 0.8, w = 0.2, pt = dir * 1.0;
          const A = [dir > 0 ? x0 : x1, y - w, 0.12], Bq = [dir > 0 ? x1 - 0.15 : x0 + 0.15, y - w, 0.12], C = [dir > 0 ? x1 + 0.25 : x0 - 0.25, y, 0.12], D = [dir > 0 ? x1 - 0.15 : x0 + 0.15, y + w, 0.12], E = [dir > 0 ? x0 : x1, y + w, 0.12];
          T.quad(A, Bq, D, E, c0, c0, c1, c1, 0); T.tri(Bq, C, D, c0, c1, c1, 0); void pt; void seed;
          return T.piece();
        };
        B.push(planche(1.85, 1, H(0xd0985a), H(0xf0c080), 1)); B.push(planche(1.45, -1, H(0xc88a5a), H(0xe8b078), 2)); B.push(planche(1.05, 1, H(0xd8a060), H(0xf4c88a), 3));
        [[0.9, 1.85, H(0xff7aa8)], [-0.9, 1.45, H(0x7ad0ff)], [0.9, 1.05, H(0xffe06a)]].forEach((f) => Lu.push(prim(O.octa(0.09), { p: [f[0] * 0.4, f[1], 0.16], s: [1, 1, 0.5], c: f[2], teinte: 0 })));
        const place = (l) => l.map((p) => O.deplacer(p, q.x, q.y - 0.05, q.z, yaw + 0.25));
        ajoute(new THREE.Mesh(O.fusion(place(B)), lamDouble)); ajoute(new THREE.Mesh(O.fusion(place(Lu)), lueur));
      }

      // ---- le moulin à vent et sa butte ----
      const hub = new THREE.Group(), moulinGroupe = new THREE.Group();
      {
        const q = L_MOULIN, yb = q.top - 0.25, pc = ctx.chemin.point(0.4), yaw = Math.atan2(pc[0] - q.x, pc[2] - q.z);
        const B = [], Lu = [];
        B.push(prim(O.cyl(3.4, 3.2, 1.0, 8), { c0: H(0xa89cc0), c1: H(0xc8bcdc), teinte: 0, jit: 0.04, seed: 1 }));
        B.push(prim(O.cyl(3.05, 1.95, 7.4, 8), { p: [0, 0.9, 0], c0: H(0xfff0e0), c1: H(0xf8dcd4), teinte: 0, jit: 0.03, seed: 2, vari: 0.05 }));
        B.push(prim(O.cyl(2.2, 2.2, 0.3, 8), { p: [0, 8.2, 0], c: H(0xa87a68), teinte: 0 }));
        B.push(prim(O.cone(2.7, 3.4, 8), { p: [0, 8.4, 0], c0: H(0xe05a86), c1: H(0xff98b0), teinte: 0, jit: 0.04, seed: 3 }));
        B.push(prim(O.ico(0.3, 0), { p: [0, 12.0, 0], c: H(0xffd88a), teinte: 0 }));
        B.push(prim(O.boite(1.2, 2.1, 0.5), { p: [0, 0.9, 2.95], c: H(0x3a9ac8), teinte: 0, vari: 0.04 }));
        B.push(prim(O.boite(1.5, 0.22, 0.7), { p: [0, 0.75, 3.0], c: H(0xe8d8d0), teinte: 0 }));
        B.push(O.segment([0, 7.6, 1.2], [0, 7.6, 3.2], 0.22, 0.18, 6, { c: H(0x9a6a48), teinte: 0 }));
        [[0, 4.6], [0.9, 6.5], [-0.9, 6.5]].forEach((w, i) => { const r = 3.05 - 1.1 * ((w[1] - 0.9) / 7.4) - 0.1, a = w[0], bx = Math.sin(a) * r, bz = Math.cos(a) * r; Lu.push(prim(O.boite(0.7, 0.9, 0.2), { p: [bx, w[1] - 0.45, bz], r: [0, a, 0], c: H(0xffe08a), teinte: 0, vari: 0.02 })); B.push(prim(O.boite(0.95, 0.2, 0.3), { p: [bx * 1.03, w[1] - 0.6, bz * 1.03], r: [0, a, 0], c: H(0xffb0c8), teinte: 0 })); void i; });
        const place = (l) => l.map((p) => O.deplacer(p, q.x, yb, q.z, yaw));
        ajoute(new THREE.Mesh(O.fusion(place(B)), lam)); ajoute(new THREE.Mesh(O.fusion(place(Lu)), lueur));
        // les pales : un cadre en bois, une voile claire à croisillons
        const V = [], T = new O.Tri(), rz = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
        const toile = H(0xfffaf0), bord = H(0xe0b4a0);
        for (let k = 0; k < 4; k += 1) {
          const a = k * Math.PI / 2;
          V.push(prim(O.boite(0.24, 7.0, 0.2), { p: [0, 0, 0], r: [0, 0, a], c0: H(0x9a6a48), c1: H(0xb88a60), teinte: 0, vari: 0.04, seed: k }));
          const P = (x, y, z) => rz([x, y, z], a);
          T.quad(P(0.2, 1.1, 0.12), P(1.7, 1.3, 0.12), P(1.55, 6.7, 0.12), P(0.2, 6.7, 0.12), toile, toile, toile, toile, 0);
          for (let j = 0; j < 4; j += 1) { const y = 1.7 + j * 1.55; T.quad(P(0.2, y, 0.14), P(1.6, y + 0.05, 0.14), P(1.6, y + 0.17, 0.14), P(0.2, y + 0.12, 0.14), bord, bord, bord, bord, 0); }
          T.quad(P(1.62, 1.3, 0.14), P(1.74, 1.3, 0.14), P(1.6, 6.7, 0.14), P(1.48, 6.7, 0.14), bord, bord, bord, bord, 0);
          V.push(prim(O.ico(0.45, 0), { p: [0, 0, 0.1], c: H(0x9a6a48), teinte: 0 }));
        }
        V.push(T.piece());
        const m = new THREE.Mesh(O.fusion(V), lamDouble);
        hub.add(m); hub.position.set(0, 7.6, 3.3); moulinGroupe.add(hub); moulinGroupe.position.set(q.x, yb, q.z); moulinGroupe.rotation.y = yaw;
        // (la position du hub est locale à moulinGroupe)
        moulinGroupe.updateMatrixWorld(true); g.add(moulinGroupe);
      }

      // ---- la ferme / chaumière sur sa butte ----
      {
        const q = L_FERME, yb = q.top - 0.25, pc = ctx.chemin.point(0.43), yaw = Math.atan2(pc[0] - q.x, pc[2] - q.z);
        const B = [], Lu = [];
        const toit = (cx, cy, cz, w, d, hh, sur, c0, c1) => {
          const T = new O.Tri(), x0 = cx - w / 2 - sur, x1 = cx + w / 2 + sur, zf = cz + d / 2 + sur, zb = cz - d / 2 - sur, ya = cy, yr = cy + hh;
          T.quad([x0, ya, zf], [x1, ya, zf], [x1, yr, cz], [x0, yr, cz], c0, c0, c1, c1, 0);
          T.quad([x1, ya, zb], [x0, ya, zb], [x0, yr, cz], [x1, yr, cz], c0, c0, c1, c1, 0);
          T.tri([x0, ya, zb], [x0, ya, zf], [x0, yr, cz], c0, c0, c1, 0); T.tri([x1, ya, zf], [x1, ya, zb], [x1, yr, cz], c0, c0, c1, 0);
          return T.piece();
        };
        B.push(prim(O.boite(6.4, 3.0, 4.6), { p: [0, 0, 0], c0: H(0xf4dcc4), c1: H(0xfff0e0), teinte: 0, vari: 0.04, seed: 1 }));
        B.push(prim(O.boite(6.5, 0.3, 4.7), { p: [0, 0, 0], c: H(0x9a8aa8), teinte: 0 }));
        B.push(toit(0, 3.0, 0, 6.4, 4.6, 2.5, 0.55, H(0xd09a38), H(0xffe07a)));
        B.push(prim(O.boite(0.8, 2.6, 0.8), { p: [1.8, 3.2, -0.9], c0: H(0xc8a0a0), c1: H(0xe8c8c0), teinte: 0, seed: 5 }));
        B.push(prim(O.boite(1.1, 2.0, 0.3), { p: [-1.2, 0.1, 2.35], c: H(0xe0628a), teinte: 0, vari: 0.04 }));
        B.push(prim(O.boite(1.7, 0.18, 0.5), { p: [2.0, 0.85, 2.45], c: H(0x9a6a48), teinte: 0 }));
        for (let k = 0; k < 6; k += 1) B.push(prim(O.octa(0.18), { p: [1.3 + k * 0.28, 1.15, 2.5], s: [1, 0.8, 1], c: FL[k % FL.length], teinte: 0 }));
        [[2.0, 1.5, 2.32], [-2.1, 1.6, 2.32]].forEach((w) => { Lu.push(prim(O.boite(1.0, 0.95, 0.2), { p: [w[0], w[1], w[2]], c: H(0xffe49a), teinte: 0, vari: 0.02 })); B.push(prim(O.boite(0.34, 1.0, 0.3), { p: [w[0] - 0.7, w[1], w[2] + 0.02], c: H(0x6ac0e8), teinte: 0 })); B.push(prim(O.boite(0.34, 1.0, 0.3), { p: [w[0] + 0.7, w[1], w[2] + 0.02], c: H(0x6ac0e8), teinte: 0 })); });
        // la petite grange
        B.push(prim(O.boite(3.6, 2.4, 3.0), { p: [6.2, 0, -1.2], c0: H(0xf08090), c1: H(0xffb0b8), teinte: 0, seed: 7 }));
        B.push(toit(6.2, 2.4, -1.2, 3.6, 3.0, 1.5, 0.35, H(0xc04870), H(0xe88aa0)));
        B.push(prim(O.boite(1.3, 1.7, 0.25), { p: [6.2, 0, 0.35], c: H(0xfff0e0), teinte: 0 }));
        // arbre et lueur de la cheminée : petite fumée en boules
        for (let k = 0; k < 3; k += 1) B.push(prim(O.ico(0.45 + k * 0.2, 0), { p: [1.8 + k * 0.35, 6.2 + k * 1.0, -0.9], c: H(0xf0f0f8), teinte: 0, vari: 0.03 }));
        const place = (l) => l.map((p) => O.deplacer(p, q.x, yb, q.z, yaw));
        ajoute(new THREE.Mesh(O.fusion(place(B)), lamDouble)); ajoute(new THREE.Mesh(O.fusion(place(Lu)), lueur));
      }

      // ---- la balançoire sous un grand arbre ----
      const balancoire = new THREE.Group();
      {
        const q = L_BALANC, B = [], pc = ctx.chemin.point(0.33), yaw = Math.atan2(pc[0] - q.x, pc[2] - q.z), yb = q.y - 0.2;
        B.push(prim(O.cyl(0.75, 0.4, 3.8, 7), Object.assign({ seed: 1 }, bois(H(0x7d5a52), H(0xa8806a)))));
        B.push(prim(O.cone(1.2, 0.9, 7), Object.assign({ seed: 2 }, bois(H(0x7d5a52)))));
        B.push(O.segment([0, 3.0, 0], [3.0, 4.4, 0], 0.3, 0.2, 6, Object.assign({ seed: 3 }, bois())));
        [[0, 6.3, 0, 3.2], [-2.4, 5.2, 0.6, 2.4], [2.6, 5.2, -0.8, 2.4], [0.4, 5.0, 2.6, 2.1], [0.2, 5.4, -2.6, 2.1], [3.3, 5.9, 0.6, 1.6], [0, 8.2, 0, 1.8]].forEach((b, k) =>
          B.push(prim(O.ico(b[3], 1), { p: [b[0], b[1], b[2]], s: [1.1, 0.85, 1.1], c0: H(0x3fa84a), c1: H(0xb0e868), jit: 0.34, seed: 60 + k, gam: 0.85 })));
        ajoute(new THREE.Mesh(O.fusion(B.map((p) => O.deplacer(p, q.x, yb, q.z, yaw))), lam));
        // la balançoire : cordes + planche + coussin rose (pivot au point d'attache)
        const S = [O.segment([0, 0, -0.35], [0, -2.5, -0.35], 0.03, 0.03, 4, { c: H(0xe8d0b0), teinte: 0 }), O.segment([0, 0, 0.35], [0, -2.5, 0.35], 0.03, 0.03, 4, { c: H(0xe8d0b0), teinte: 0 }),
          prim(O.boite(0.34, 0.07, 0.95), { p: [0, -2.58, 0], c: H(0xe05a86), teinte: 0, vari: 0.04 }), prim(O.boite(0.26, 0.05, 0.8), { p: [0, -2.5, 0], c: H(0xffc4d8), teinte: 0, vari: 0.04 })];
        const m = new THREE.Mesh(O.fusion(S), lam);
        balancoire.add(m); balancoire.position.set(0, 4.15, 0);   // à l'extrémité de la branche
        const racineB = new THREE.Group(); racineB.position.set(q.x, yb, q.z); racineB.rotation.y = yaw;
        // la branche part vers +x dans le repère local : point d'attache à x = 2,6
        balancoire.position.set(2.6, 4.2, 0); racineB.add(balancoire); g.add(racineB);
      }

      // ---- pétales, pollen, papillons ----
      const NP = 240, petales = (() => {
        const T = new O.Tri(); T.quad([-0.09, 0, -0.06], [0.09, 0, -0.06], [0.11, 0, 0.08], [-0.11, 0, 0.08], [1, 0.9, 0.95], [1, 0.85, 0.92], [1, 0.8, 0.9], [1, 0.9, 0.95], 1);
        const R1 = R(50), l = [], D = [];
        const cer = g.userData.cerisiers || [];
        for (let i = 0; i < NP; i += 1) {
          let x, z;
          if (i % 3 !== 2 && cer.length) { const c = cer[Math.floor(R1() * cer.length)]; x = c.p[0] + (R1() - 0.5) * 9; z = c.p[2] + (R1() - 0.5) * 9; }
          else { const s = sa + (sb - sa) * R1(), q = posAu(s, R1() < 0.5 ? -1 : 1, 4.6 + R1() * 16); x = q.x; z = q.z; }
          const col = i % 4 === 0 ? [1, 1, 1] : [1, 0.75 + R1() * 0.2, 0.9];
          D.push({ x, z, y: ctx.hauteur(x, z), f: 3 + Math.floor(R1() * 3), ph: R1(), dr: 1.0 + R1() * 2.0, ph2: R1(), sp: [1 + Math.floor(R1() * 3), 1 + Math.floor(R1() * 3)], hh: 6 + R1() * 2 });
          l.push({ p: [x, 3, z], s: 1.3, c: col });
        }
        const im = O.instancier(O.fusion([T.piece()]), lamDouble, l); im.frustumCulled = false; g.add(im); im.userData.d = D; return im;
      })();
      const NO = 220, po = new Float32Array(NO * 3), pcol = new Float32Array(NO * 3), pd = [];
      {
        const R1 = R(51);
        for (let i = 0; i < NO; i += 1) { const s = sa + (sb - sa) * R1(), q = posAu(s, R1() < 0.5 ? -1 : 1, 4.4 + 22 * Math.pow(R1(), 1.2)); pd.push({ b: [q.x, q.y + 0.6 + R1() * 4.2, q.z], a: [0.8 + R1() * 1.5, 0.3 + R1() * 0.5, 0.8 + R1() * 1.5], f: [1 + Math.floor(R1() * 3), 1 + Math.floor(R1() * 3), 1 + Math.floor(R1() * 3)], ph: [R1(), R1(), R1(), R1()], fb: 3 + Math.floor(R1() * 6) }); }
      }
      const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.BufferAttribute(po, 3)); gp.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
      const pollen = new THREE.Points(gp, O.materielPoints(0.28, O.texRonde(), true)); pollen.frustumCulled = false; g.add(pollen);

      const NB = 30, bd = [];
      let ailes, corps;
      {
        const T = new O.Tri(), clair = [1, 1, 1], tache = [0.3, 0.18, 0.35];
        T.tri([0, 0, 0.05], [0.34, 0, 0.26], [0.4, 0, -0.02], clair, [1, 1, 1], [0.75, 0.75, 0.75], 1);
        T.tri([0, 0, 0.05], [0.4, 0, -0.02], [0, 0, -0.04], clair, [0.75, 0.75, 0.75], clair, 1);
        T.tri([0, 0, -0.04], [0.38, 0, -0.04], [0.24, 0, -0.3], clair, [0.85, 0.85, 0.85], [0.8, 0.8, 0.8], 1);
        T.tri([0.3, 0, 0.2], [0.4, 0, 0.0], [0.36, 0, 0.12], tache, tache, tache, 0);
        const R1 = R(52), cols = [[1, 0.62, 0.2], [1, 0.9, 0.3], [1, 0.55, 0.78], [0.5, 0.85, 1], [1, 1, 1], [0.75, 0.6, 1]];
        const L = [], Bq = [];
        for (let i = 0; i < NB; i += 1) {
          const s = sa + (sb - sa) * R1(), q = posAu(s, R1() < 0.5 ? -1 : 1, 4.8 + 14 * R1());
          bd.push({ cx: q.x, cz: q.z, gy: q.y, rx: 1.5 + R1() * 3.5, rz: 1.5 + R1() * 3.5, h: 0.9 + R1() * 1.6, a: [1 + Math.floor(R1() * 3), 1 + Math.floor(R1() * 3)], ph: [R1(), R1(), R1()], fl: 0, nf: 0, col: cols[i % cols.length] });
          L.push({ p: [q.x, q.y + 1.2, q.z], c: cols[i % cols.length], s: 1.5 }); L.push({ p: [q.x, q.y + 1.2, q.z], c: cols[i % cols.length], s: [-1.5, 1.5, 1.5] });
          Bq.push({ p: [q.x, q.y + 1.2, q.z], c: [0.3, 0.2, 0.3] });
        }
        ailes = O.instancier(O.fusion([T.piece()]), lamDouble, L); ailes.frustumCulled = false; g.add(ailes);
        corps = O.instancier(O.fusion([prim(O.octa(0.05), { s: [1, 1, 4.5], c: [1, 1, 1], teinte: 0, vari: 0.02 })]), lam, Bq); corps.frustumCulled = false; g.add(corps);
      }
      const dum = new THREE.Object3D(); dum.rotation.order = 'YXZ';
      const NFLAP = Math.round(5 * ctx.L);

      function maj(T, sCam) {
        const vis = sCam > Z0 - 0.5 && sCam < Z1 + 0.07; g.visible = vis; if (!vis) return;
        const t = T / ctx.L;
        // moulin : tourne d'un nombre entier de tours par L
        hub.rotation.z = -TAU * 3 * t;
        // balançoire : va-et-vient
        balancoire.rotation.x = 0.42 * Math.sin(TAU * 8 * t);
        // pétales
        const PD = petales.userData.d;
        for (let i = 0; i < NP; i += 1) {
          const d = PD[i], f = ((d.f * t + d.ph) % 1 + 1) % 1, fade = doux(0, 0.08, f) * doux(1, 0.92, f);
          dum.position.set(d.x + d.dr * Math.sin(TAU * (t + d.ph2)) + 1.5 * (f - 0.5), d.y + d.hh * (1 - f) + 0.2, d.z + d.dr * 0.8 * Math.cos(TAU * (t + d.ph2)));
          dum.rotation.set(TAU * d.sp[0] * (t * 3 + d.ph), TAU * d.sp[1] * (t * 2 + d.ph2), TAU * (t * 4 + d.ph));
          const k = 1.3 * fade + 0.0001; dum.scale.set(k, k, k); dum.updateMatrix(); petales.setMatrixAt(i, dum.matrix);
        }
        petales.instanceMatrix.needsUpdate = true;
        // pollen
        for (let i = 0; i < NO; i += 1) {
          const d = pd[i];
          po[i * 3] = d.b[0] + d.a[0] * Math.sin(TAU * (d.f[0] * t + d.ph[0])); po[i * 3 + 1] = d.b[1] + d.a[1] * Math.sin(TAU * (d.f[1] * t + d.ph[1])); po[i * 3 + 2] = d.b[2] + d.a[2] * Math.sin(TAU * (d.f[2] * t + d.ph[2]));
          const k = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(TAU * (d.fb * t + d.ph[3]))); pcol[i * 3] = 0.9 * k; pcol[i * 3 + 1] = 0.75 * k; pcol[i * 3 + 2] = 0.3 * k;
        }
        gp.attributes.position.needsUpdate = true; gp.attributes.color.needsUpdate = true;
        // papillons
        for (let i = 0; i < NB; i += 1) {
          const b = bd[i], u1 = TAU * (b.a[0] * t + b.ph[0]), u2 = TAU * (b.a[1] * t + b.ph[1]);
          const x = b.cx + b.rx * Math.sin(u1), z = b.cz + b.rz * Math.sin(u2), y = b.gy + b.h + 0.35 * Math.sin(TAU * (7 * t + b.ph[2]));
          const vx = b.rx * Math.cos(u1) * b.a[0], vz = b.rz * Math.cos(u2) * b.a[1], ry = Math.atan2(vx, vz) + Math.PI * 0, fl = 0.2 + 0.75 * Math.sin(TAU * (NFLAP * t + b.ph[2]));
          dum.position.set(x, y, z);
          dum.rotation.set(0, ry, fl); dum.scale.set(1.5, 1.5, 1.5); dum.updateMatrix(); ailes.setMatrixAt(2 * i, dum.matrix);
          dum.rotation.set(0, ry, -fl); dum.scale.set(-1.5, 1.5, 1.5); dum.updateMatrix(); ailes.setMatrixAt(2 * i + 1, dum.matrix);
          dum.rotation.set(0, ry, 0); dum.scale.set(1, 1, 1); dum.updateMatrix(); corps.setMatrixAt(i, dum.matrix);
        }
        ailes.instanceMatrix.needsUpdate = true; corps.instanceMatrix.needsUpdate = true;
      }
      maj(0, (Z0 + Z1) / 2);
      return { group: g, maj };
    },
  };

  return { foret, prairie };
});
