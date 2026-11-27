/*
 * Le château de conte (Three.js r149) du fond « chemin vers le château » (voir production/SPEC-CHEMIN3D.md).
 * creer(ctx) → { group, setPorte(u), setLueur(u), maj(T) } ; ctx = { THREE, rng, L, graine }.
 * Repère local : origine = centre du seuil de la grande porte, sol du plateau y = 0, façade tournée vers +Z.
 * Tout est déterministe : aléa = ctx.rng, animations = fonctions pures de T (nombre entier de cycles sur L).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.chateau3d = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI;
  const borne = (x) => Math.min(1, Math.max(0, x));
  const lisse = (u) => { u = borne(u); return u * u * u * (u * (u * 6 - 15) + 10); };
  const R3 = Math.sqrt(3);

  // Palette (pastel saturé, pas de noir ni de blanc pur)
  const C = {
    pierre: 0xdcc6fa, pierre2: 0xe6d3ff, pierreO: 0xc9a8f5, creme: 0xf1e2e6, cremeO: 0xe4d0ea,
    or: 0xf7c04e, orO: 0xe9a93a, rose: 0xff7fbf, magenta: 0xd63a9a, violet: 0xa75be0, violetO: 0x7d46b8,
    bois: 0x6b3d5e, boisO: 0x55304e, fente: 0x7a52a8,
    herbe: [0x93dc8c, 0xa7e690, 0x80cf8e, 0xb2e898], dalle: [0xf1e2ee, 0xe2d0f4, 0xf3e6d8, 0xe9d8ee],
    vitre: [0xffd36b, 0xffc44d, 0xffe08f, 0xffcf5e],
  };

  // Points d'une ogive (arc brisé équilatéral) : de l'arrondi droit (hw, hs) au sommet puis à gauche (-hw, hs)
  function ptsOgive(hw, hs, n) {
    const r = 2 * hw, g = [], d = [];
    for (let k = 0; k <= n; k++) { const a = k / n * PI / 3; g.push([-hw + r * Math.cos(a), hs + r * Math.sin(a)]); }
    for (let k = 0; k <= n; k++) { const a = PI * 2 / 3 + k / n * PI / 3; d.push([hw + r * Math.cos(a), hs + r * Math.sin(a)]); }
    return g.concat(d.slice(1));
  }

  function creer(ctx) {
    const THREE = ctx.THREE;
    const L = ctx.L || 38.9;
    const rnd = ctx.rng((ctx.graine || 1) + 4242);
    const M4 = THREE.Matrix4, V3 = THREE.Vector3;
    const Y = new V3(0, 1, 0), UN = new V3(1, 1, 1);
    const groupe = new THREE.Group();
    groupe.name = 'chateau3d';

    // ---------- Accumulation de triangles par matériau ----------
    const seaux = {};
    const seau = (n) => seaux[n] || (seaux[n] = { p: [], c: [] });
    let base = new M4();
    const cacheGeo = {};
    const geo = (cle, f) => cacheGeo[cle] || (cacheGeo[cle] = f());
    const tmpM = new M4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpP = new V3(), tmpS = new V3(), tmpV = new V3();
    const col = new THREE.Color(), violet = new THREE.Color(0x8a5fc0);
    const hex = (c) => (c && c.isColor) ? c : new THREE.Color(c);
    const aoDefaut = { murs: true, interieur: false };

    function tri(nom, a, b, c, couleur, op) {
      const s = seau(nom);
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      if (cx * cx + cy * cy + cz * cz < 1e-10) return;
      col.copy(hex(couleur));
      const vr = (op && op.v !== undefined) ? op.v : 0.07;
      const f = 1 + (rnd() - 0.5) * 2 * vr;
      let r = col.r * f, g = col.g * f, bl = col.b * f;
      const ao = (op && op.ao !== undefined) ? op.ao : aoDefaut[nom];
      if (ao) {
        const my = (a[1] + b[1] + c[1]) / 3;
        const k = 0.7 + 0.3 * borne(my / 7);
        r = r * k + violet.r * (1 - k) * 0.4; g = g * k + violet.g * (1 - k) * 0.4; bl = bl * k + violet.b * (1 - k) * 0.4;
      }
      s.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      s.c.push(r, g, bl, r, g, bl, r, g, bl);
    }
    const quad = (nom, a, b, c, d, couleur, op) => { tri(nom, a, b, c, couleur, op); tri(nom, a, c, d, couleur, op); };

    // Ajoute une géométrie THREE transformée (position p, rotation r = [rx, ry, rz], échelle s)
    function ajouter(nom, g0, o, couleur, op) {
      op = op || {};
      const g = g0.index ? g0.toNonIndexed() : g0;
      const pos = g.attributes.position.array;
      const r = o.r || [0, 0, 0];
      tmpE.set(r[0], r[1], r[2], 'YXZ'); tmpQ.setFromEuler(tmpE);
      tmpP.set(o.p[0], o.p[1], o.p[2]);
      const s = o.s || [1, 1, 1]; tmpS.set(s[0], s[1], s[2]);
      tmpM.compose(tmpP, tmpQ, tmpS); tmpM.premultiply(base);
      const nt = pos.length / 9;
      for (let t = 0; t < nt; t++) {
        const w = [];
        let lx = 0, lz = 0;
        for (let k = 0; k < 3; k++) {
          const px = pos[t * 9 + k * 3], py = pos[t * 9 + k * 3 + 1], pz = pos[t * 9 + k * 3 + 2];
          lx += px / 3; lz += pz / 3;
          tmpV.set(px, py, pz).applyMatrix4(tmpM); w.push([tmpV.x, tmpV.y, tmpV.z]);
        }
        let c = couleur;
        if (op.alt) {
          let idx;
          if (op.seq) idx = t % op.alt.length;
          else { const ang = (Math.atan2(lx, lz) + 2 * PI) % (2 * PI); idx = Math.floor(ang / (2 * PI) * op.seg + 1e-6) % op.alt.length; }
          c = op.alt[idx];
        }
        tri(nom, w[0], w[1], w[2], c, op);
      }
    }
    // Groupe de transformation (empilable)
    function dans(x, y, z, ry, fn) {
      const sv = base;
      const m = new M4().compose(new V3(x, y, z), new THREE.Quaternion().setFromAxisAngle(Y, ry || 0), UN);
      base = sv.clone().multiply(m); fn(); base = sv;
    }

    // ---------- Primitives ----------
    const gBoite = () => geo('boite', () => new THREE.BoxGeometry(1, 1, 1));
    const boite = (n, x, y, z, w, h, d, c, op) => ajouter(n, gBoite(), { p: [x, y + h / 2, z], s: [w, h, d], r: op && op.r }, c, op);
    const cyl = (n, x, y, z, rb, rt, h, seg, c, op) => ajouter(n, geo('cy' + rb + '|' + rt + '|' + seg, () => new THREE.CylinderGeometry(rt, rb, 1, seg, 1, false)),
      { p: [x, y + h / 2, z], s: [1, h, 1] }, c, op);
    // le cylindre est créé à hauteur 1 puis étiré : on fixe donc les rayons dans la clé
    const cone = (n, x, y, z, r, h, seg, c, op) => ajouter(n, geo('co' + seg, () => new THREE.CylinderGeometry(0, 1, 1, seg, 1, true)),
      { p: [x, y + h / 2, z], s: [r, h, r] }, c, Object.assign({ seg }, op || {}));
    const boule = (n, x, y, z, r, c, op) => ajouter(n, geo('ico', () => new THREE.IcosahedronGeometry(1, 1)), { p: [x, y, z], s: [r, r, r] }, c, op);
    const ext = (n, shape, prof, o, c, op) => ajouter(n, new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: false, curveSegments: 4 }), o, c, op);
    const plat = (n, shape, o, c, op) => ajouter(n, new THREE.ShapeGeometry(shape), o, c, op);

    function formeOgive(hw, hs, n) {
      const sh = new THREE.Shape();
      sh.moveTo(-hw, 0); sh.lineTo(hw, 0);
      ptsOgive(hw, hs, n).forEach((p) => sh.lineTo(p[0], p[1]));
      sh.lineTo(-hw, 0);
      return sh;
    }
    function trouOgive(hw, hs, n) {
      const p = new THREE.Path();
      p.moveTo(-hw, 0); p.lineTo(hw, 0);
      ptsOgive(hw, hs, n).forEach((q) => p.lineTo(q[0], q[1]));
      p.lineTo(-hw, 0);
      return p;
    }
    // Ogive de largeur w et de hauteur totale h
    const hsDe = (w, h) => Math.max(0.2, h - R3 * w / 2);

    const etincelles = [];   // points scintillants
    const drapeaux = [];     // étoffes animées

    // ---------- Fenêtre en ogive (cadre doré, vitre émissive) ----------
    function fenetre(x, y, z, ry, w, h, opt) {
      opt = opt || {};
      const hw = w / 2, hs = hsDe(w, h);
      dans(x, y, z, ry, () => {
        const c = C.vitre[Math.floor(rnd() * C.vitre.length)];
        plat('vitres', formeOgive(hw, hs, 4), { p: [0, 0, 0.04] }, c, { v: 0.05 });
        const ring = formeOgive(hw + 0.24, hs, 4);
        ring.holes.push(trouOgive(hw, hs, 4));
        plat('or', ring, { p: [0, -0.2, 0.09] }, C.or, { v: 0.03 });
        boite('or', 0, 0, 0.1, 0.09, hs + R3 * hw * 0.6, 0.06, C.or, { v: 0.02 });
        boite('or', 0, hs * 0.45, 0.1, w, 0.09, 0.06, C.or, { v: 0.02 });
        boite('or', 0, -0.2, 0.18, w + 0.9, 0.22, 0.38, C.orO, { v: 0.03 });
        if (opt.clef) boule('or', 0, hs + R3 * (hw + 0.24) + 0.05, 0.14, 0.18, C.or);
      });
    }

    // ---------- Rosace / vitrail rond ----------
    function rosace(x, y, z, ry, r) {
      dans(x, y, z, ry, () => {
        ajouter('vitraux', new THREE.CircleGeometry(r, 12), { p: [0, 0, 0.05] }, 0xffffff,
          { seq: true, alt: [0xff8fc8, 0xffd45c, 0xb99cff, 0x8fe4ff, 0xffb06b, 0xff8fc8].slice(0, 6), v: 0.04 });
        const ring = new THREE.Shape(); ring.absarc(0, 0, r + 0.4, 0, 2 * PI, false);
        const trou = new THREE.Path(); trou.absarc(0, 0, r - 0.02, 0, 2 * PI, true); ring.holes.push(trou);
        plat('or', ring, { p: [0, 0, 0.1] }, C.or, { v: 0.02 });
        for (let k = 0; k < 4; k++) boite('or', 0, 0, 0.12, 0.12, 2 * r, 0.08, C.or, { r: [0, 0, k * PI / 4], v: 0 });
        boule('or', 0, 0, 0.15, r * 0.18, C.or);
      });
    }

    // ---------- Drapeaux (étoffes animées) ----------
    // type 'h' : fanion flottant vers +x local ; 'v' : bannière suspendue
    function drapeau(type, x, y, z, yaw, w, h, c1, c2) {
      drapeaux.push({ type, o: [x, y, z], yaw, w, h, c1: new THREE.Color(c1), c2: new THREE.Color(c2), k: 13 + Math.floor(rnd() * 9), ph: rnd() * 2 * PI });
    }

    // ---------- Toit conique ----------
    function toitCone(x, y, z, r, h, seg, cols, nerv) {
      cone('toits', x, y, z, r, h, seg, cols[0], { alt: cols, seg, v: 0.05 });
      const hyp = Math.sqrt(r * r + h * h), ang = -Math.atan2(r, h);
      if (nerv) {
        for (let i = 0; i < seg; i += 1) {
          const th = i / seg * 2 * PI;
          dans(x, y, z, th, () => ajouter('or', gBoite(), { p: [0, h / 2 + 0.05, r / 2 + 0.07], r: [ang, 0, 0], s: [0.2, hyp, 0.2] }, C.or, { v: 0.02 }));
        }
      }
      // bandes dorées sur la pente
      [0.0, 0.42].forEach((f) => {
        const f2 = f + 0.07;
        cyl('or', x, y + h * f, z, r * (1 - f) + 0.14, r * (1 - f2) + 0.14, h * 0.07, seg, C.or, { v: 0.02 });
      });
    }
    function pointe(x, y, z, hs, cr) {
      boule('or', x, y, z, 0.85, C.or, { v: 0.02 });
      cone('or', x, y + 0.5, z, 0.3, hs, 6, C.or, { v: 0.02 });
      boule('or', x, y + hs + 0.4, z, 0.35, C.or, { v: 0.02 });
      etincelles.push([x, y + 0.3, z, 3 + Math.floor(rnd() * 5), rnd() * 2 * PI]);
      if (cr) drapeau('h', x, y + hs - 0.3, z, cr.yaw, cr.w, cr.h, cr.c1, cr.c2);
    }

    // ---------- Fenêtres sur un fût cylindrique ----------
    function fenetresFut(cx, cz, r, seg, ys, w, h, filtre, depart) {
      const ap = r * Math.cos(PI / seg);
      ys.forEach((y, n) => {
        for (let i = 0; i < seg; i++) {
          const th = (i + 0.5) / seg * 2 * PI;
          if (!filtre(th, i, n)) continue;
          if (((i + n + (depart || 0)) % 2) !== 0) continue;
          fenetre(cx + ap * Math.sin(th), y, cz + ap * Math.cos(th), th, w, h);
        }
      });
    }

    // ---------- Tour ronde avec toit conique ----------
    function tour(x, z, r, h, hc, seg, cols, opt) {
      opt = opt || {};
      const mur = opt.mur || C.pierre;
      cyl('murs', x, 0, z, r + 0.5, r, 2.4, seg, C.pierreO);
      cyl('murs', x, 2.4, z, r, r, h - 2.4, seg, mur);
      cyl('or', x, h * 0.55, z, r + 0.14, r + 0.14, 0.45, seg, C.or, { v: 0.02 });
      cyl('murs', x, h - 1.4, z, r, r + 1.1, 1.4, seg, C.cremeO);
      cyl('or', x, h - 0.1, z, r + 1.25, r + 1.25, 0.5, seg, C.or, { v: 0.02 });
      toitCone(x, h, z, r + 1.15, hc, seg, cols, true);
      pointe(x, h + hc - 0.5, z, 3.6, opt.fanion || { yaw: 0.25, w: 3.6, h: 1.5, c1: 0xff5fa8, c2: 0xffd45c });
      if (opt.fen) fenetresFut(x, z, r, seg, opt.fen.ys, opt.fen.w, opt.fen.h, opt.fen.f || ((th) => Math.cos(th) > -0.3), 0);
    }

    // ---------- Créneaux le long d'un segment ----------
    function creneaux(x0, z0, x1, z1, y, ep, c) {
      const L0 = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L0 / 2.8));
      const dx = (x1 - x0) / L0, dz = (z1 - z0) / L0;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n * L0;
        const px = x0 + dx * t, pz = z0 + dz * t;
        const lg = L0 / n * 0.5;
        const horiz = Math.abs(dx) > 0.5;
        [-1, 1].forEach((s) => {
          const ox = horiz ? 0 : s * (ep / 2 - 0.35), oz = horiz ? s * (ep / 2 - 0.35) : 0;
          boite('murs', px + ox, y, pz + oz, horiz ? lg : 0.7, 1.3, horiz ? 0.7 : lg, c);
        });
      }
    }

    // =====================================================================
    // 1. SOL : pelouse pastel, parvis dallé, rampe d'accès
    // =====================================================================
    const XA = 42, ZAV = 30, ZAR = -92;
    {
      const cell = 6;
      for (let x = -XA; x < XA; x += cell) for (let z = ZAR; z < ZAV; z += cell) {
        const c = C.herbe[Math.floor(rnd() * 4)];
        quad('sol', [x, 0.06, z + cell], [x + cell, 0.06, z + cell], [x + cell, 0.06, z], [x, 0.06, z], c, { v: 0.05, ao: false });
      }
      // talus : le bord descend sous le plateau
      const g = 0x7fc98a;
      const t = -1.6, d = 5;
      quad('sol', [-XA, 0.06, ZAV], [XA, 0.06, ZAV], [XA + d, t, ZAV + d], [-XA - d, t, ZAV + d], g, { ao: false });
      quad('sol', [XA, 0.06, ZAR], [-XA, 0.06, ZAR], [-XA - d, t, ZAR - d], [XA + d, t, ZAR - d], g, { ao: false });
      quad('sol', [XA, 0.06, ZAV], [XA, 0.06, ZAR], [XA + d, t, ZAR - d], [XA + d, t, ZAV + d], g, { ao: false });
      quad('sol', [-XA, 0.06, ZAR], [-XA, 0.06, ZAV], [-XA - d, t, ZAV + d], [-XA - d, t, ZAR - d], g, { ao: false });
    }
    // rampe dallée : de z = +30 à la porte, un peu plus large au loin
    const demiRampe = (z) => 3.0 + Math.min(1, z / 30) * 2.4;
    for (let z = 0.2; z < ZAV; z += 1.7) {
      const hw = demiRampe(z), n = Math.max(3, Math.round(hw * 2 / 2.0)), tw = hw * 2 / n;
      for (let i = 0; i < n; i++) {
        const c = C.dalle[Math.floor(rnd() * 4)];
        boite('sol', -hw + (i + 0.5) * tw, 0.06, z + 0.85, tw - 0.08, 0.07, 1.62, c, { v: 0.05, ao: false });
      }
    }
    // perron devant la porte
    boite('murs', 0, 0.06, 1.8, 11.5, 0.2, 3.6, C.cremeO, { ao: false });
    boite('or', 0, 0.26, 3.0, 7.0, 0.05, 0.3, C.or);
    // murets et lanternes le long de la rampe
    function lanterne(x, y, z, rayon) {
      boite('or', x, y, z, 0.12, 0.7, 0.12, C.or);
      boule('vitres', x, y + 0.2, z, rayon || 0.34, 0xffd36b, { v: 0.02, ao: false });
      cone('or', x, y + 0.5, z, 0.42, 0.4, 4, C.or);
      etincelles.push([x, y + 0.25, z, 5, rnd() * 6]);
    }
    for (let z = 5; z < ZAV; z += 2.6) {
      [-1, 1].forEach((s) => {
        const xx = s * (demiRampe(z) + 0.5);
        boite('murs', xx, 0.06, z, 0.6, 0.55, 2.2, C.pierre2);
        boite('or', xx, 0.61, z, 0.72, 0.1, 2.34, C.or);
      });
    }
    for (let z = 6.5; z < ZAV; z += 7.8) [-1, 1].forEach((s) => {
      const xx = s * (demiRampe(z) + 0.5);
      boite('murs', xx, 0.06, z, 0.8, 1.1, 0.8, C.pierreO);
      lanterne(xx, 1.16, z);
    });
    // buissons et fleurs sur la pelouse devant
    const coul = [0xff8fc8, 0xffd45c, 0xc9a8ff, 0xff9d7a];
    for (let i = 0; i < 70; i++) {
      const s = rnd() < 0.5 ? -1 : 1;
      const x = s * (9 + rnd() * 30), z = 2 + rnd() * 26;
      if (Math.abs(x) < demiRampe(z) + 2.5) continue;
      if (Math.abs(x) < 24 && z < 15 && Math.abs(x) > 12) continue;   // escaliers
      if (rnd() < 0.3) boule('sol', x, 0.75, z, 0.9 + rnd() * 0.7, C.herbe[2], { v: 0.1, ao: false });
      else for (let k = 0; k < 3; k++) boule('sol', x + (rnd() - 0.5) * 1.2, 0.3, z + (rnd() - 0.5) * 1.2, 0.2, coul[Math.floor(rnd() * 4)], { v: 0.06, ao: false });
    }
    // arbustes sphériques de part et d'autre de l'enceinte
    [[-34, 12], [34, 12], [-38, 22], [38, 22], [-27, 24], [27, 24]].forEach((p, i) => {
      cyl('sol', p[0], 0.06, p[1], 0.25, 0.25, 2.2, 6, 0x9b6a8a, { ao: false });
      boule('sol', p[0], 3.4, p[1], 2.1 + (i % 2) * 0.4, i % 2 ? 0xffa0cf : 0x9fe090, { v: 0.1, ao: false });
    });

    // =====================================================================
    // 2. LE PORCHE : plaque de façade percée d'une ogive, passage voûté, plaque arrière
    // =====================================================================
    const LG = 11, HG = 20, PG = 14, HW = 2.8, HOG = 9, HSP = HOG - R3 * HW;
    {
      const plaque = () => {
        const sh = new THREE.Shape();
        sh.moveTo(-LG, 0); sh.lineTo(LG, 0); sh.lineTo(LG, HG); sh.lineTo(-LG, HG); sh.lineTo(-LG, 0);
        sh.holes.push(trouOgive(HW, HSP, 8));
        return sh;
      };
      ext('murs', plaque(), 3, { p: [0, 0, -3] }, C.creme, { v: 0.012, ao: false });          // façade
      ext('murs', plaque(), 3, { p: [0, 0, -PG] }, C.creme, { v: 0.012, ao: false });         // face de cour
      boite('murs', -(LG + HW) / 2, 0, -7, LG - HW, HG, 8, C.pierre);
      boite('murs', (LG + HW) / 2, 0, -7, LG - HW, HG, 8, C.pierre);
      boite('murs', 0, HOG, -7, 2 * HW, HG - HOG, 8, C.pierre);

      // encadrement doré et moulures
      const cadre = (hw, prof, c, hsx) => {
        const hs = hsx;
        const sh = formeOgive(hw, hs, 8); sh.holes.push(trouOgive(HW, HSP, 8));
        return sh;
      };
      ext('murs', cadre(4.6, 0.3, 0, HSP + 0.6), 0.32, { p: [0, 0, 0] }, C.pierreO);
      ext('or', cadre(3.7, 0.5, 0, HSP + 0.15), 0.55, { p: [0, 0, 0] }, C.or, { v: 0.02 });
      boule('vitraux', 0, HOG + 1.5, 0.62, 0.45, 0xff6fb5, { v: 0 });
      boule('or', 0, HOG + 1.5, 0.5, 0.65, C.or, { v: 0.02 });
      // piédroits (pilastres) et seuil
      [-1, 1].forEach((s) => {
        boite('or', s * 4.6, 0.05, 0.2, 0.9, 0.7, 0.9, C.orO);
        boite('murs', s * 10.4, 0, 0.3, 1.2, HG, 0.6, C.cremeO);
        boite('or', s * 10.4, 9.3, 0.62, 1.4, 0.7, 0.14, C.or);
        boite('or', s * 10.4, HG - 0.7, 0.62, 1.4, 0.7, 0.14, C.or);
      });
      // bandeaux dorés
      boite('or', 0, 9.9, 0.1, 2 * LG, 0.5, 0.3, C.or, { v: 0.02 });
      boite('or', 0, HG - 1.1, 0.12, 2 * LG + 0.4, 0.5, 0.45, C.or, { v: 0.02 });
      for (let i = -10; i <= 10; i += 1.6) boite('or', i, HG - 1.7, 0.15, 0.6, 0.6, 0.45, C.orO, { v: 0.03 });
      // fenêtres de la façade
      [-1, 1].forEach((s) => {
        fenetre(s * 8.1, 4.5, 0, 0, 1.5, 3.8);
        fenetre(s * 8.1, 12.2, 0, 0, 1.5, 3.8, { clef: true });
        boite('murs', s * 8.1, 5.8 + 0.02, 0.05, 0.1, 0.1, 0.1, C.pierre);
      });
      // balcon au-dessus de la porte
      boite('murs', 0, 11.6, 0.9, 7.4, 0.7, 2.6, C.cremeO);
      boite('or', 0, 12.3, 0.9, 7.8, 0.14, 2.9, C.or);
      for (let x = -3.4; x <= 3.41; x += 0.85) boite('or', x, 12.4, 2.1, 0.12, 0.95, 0.12, C.or);
      boite('or', 0, 13.35, 2.1, 7.2, 0.14, 0.2, C.or);
      [-1, 1].forEach((s) => { boite('or', s * 3.55, 12.4, 1.2, 0.12, 0.95, 1.8, C.or, { v: 0 }); boite('or', s * 3.55, 13.35, 1.2, 0.2, 0.14, 1.9, C.or); });
      fenetre(0, 12.4, 0, 0, 2.2, 5.6, { clef: true });
      // bannières sur la façade
      [-1, 1].forEach((s) => {
        boite('or', s * 5.9, 18.1, 0.35, 2.4, 0.18, 0.18, C.or);
        drapeau('v', s * 5.9, 18.0, 0.55, 0, 1.8, 7.0, s < 0 ? 0xff5fa8 : 0xd63a9a, 0xffd45c);
      });
      // lanternes de part et d'autre de la porte
      [-1, 1].forEach((s) => {
        boite('or', s * 5.3, 6.8, 0.4, 0.15, 0.15, 0.9, C.or);
        lanterne(s * 5.3, 6.1, 0.9, 0.38);
      });
      // rosace du pignon
      rosace(0, 24.2, 0.6, 0, 2.3);
    }
    // Toit à deux pentes (faîtage selon Z) : bandes alternées
    function toitPignon(x, y, z, lg, larg, h, cols, axe) {
      dans(x, y, z, axe === 'x' ? PI / 2 : 0, () => {
        const demi = larg / 2 + 0.9, pente = Math.hypot(demi, h), ang = Math.atan2(h, demi);
        const nb = Math.max(2, Math.round(lg / 1.6));
        for (let s = -1; s <= 1; s += 2) for (let i = 0; i < nb; i++) {
          const zc = -lg / 2 + (i + 0.5) * lg / nb;
          ajouter('toits', gBoite(), { p: [s * demi / 2, h / 2 + 0.1, zc], r: [0, 0, -s * ang], s: [pente + 0.6, 0.5, lg / nb - 0.02] }, cols[i % 2], { v: 0.04 });
        }
        // faîtage et rives dorées
        boite('or', 0, h - 0.1, 0, 0.7, 0.7, lg + 1.4, C.or, { v: 0.02 });
        for (let s = -1; s <= 1; s += 2) for (let e = -1; e <= 1; e += 2) {
          ajouter('or', gBoite(), { p: [s * demi / 2, h / 2 + 0.3, e * (lg / 2 + 0.1)], r: [0, 0, -s * ang], s: [pente + 0.9, 0.3, 0.35] }, C.or, { v: 0.02 });
        }
        // pignons crème
        [-1, 1].forEach((e) => {
          const t = new THREE.Shape(); t.moveTo(-larg / 2, 0); t.lineTo(larg / 2, 0); t.lineTo(0, h - 0.4 * 0); t.lineTo(-larg / 2, 0);
          ext('murs', t, 0.5, { p: [0, -0.05, e > 0 ? lg / 2 - 0.5 : -lg / 2] }, C.creme, { ao: false });
        });
        // pointes aux extrémités
        pointe(0, h + 0.3, lg / 2 + 0.5, 2.4, null);
      });
    }
    toitPignon(0, HG, -PG / 2 + 0.2, PG + 1.4, 2 * LG, 8.2, [C.rose, 0xf064ad], 'z');

    // ---------- Passage voûté ----------
    {
      const hw = 2.77, hs = (HOG - 0.03) - R3 * hw;
      const pts = [[hw, 0]].concat(ptsOgive(hw, hs, 8), [[-hw, 0]]);
      const prof = (k, e) => pts.map((p) => [p[0] * (1 - e), 4 + (p[1] - 4) * (1 - e * 0.5)]);
      const nS = 14, cw = new THREE.Color(C.pierre2), cb = new THREE.Color(C.pierreO), ch = new THREE.Color(0xf6dcd0);
      const nP = pts.length;
      for (let j = 0; j < nP - 1; j++) {
        const t = Math.abs(j - (nP - 2) / 2) / ((nP - 2) / 2); // 1 aux pieds, 0 au sommet
        const c = new THREE.Color().copy(ch).lerp(cb, Math.pow(t, 0.8)).lerp(cw, 0.12);
        for (let i = 0; i < nS; i++) {
          const z0 = -i, z1 = -(i + 1);
          quad('interieur', [pts[j][0], pts[j][1], z0], [pts[j + 1][0], pts[j + 1][1], z0], [pts[j + 1][0], pts[j + 1][1], z1], [pts[j][0], pts[j][1], z1], c, { v: 0.05 });
        }
      }
      // nervures dorées
      const pr = prof(0, 0.02);
      for (let zc = 0.9; zc < PG; zc += 3.2) {
        for (let j = 0; j < nP - 1; j++) {
          quad('interieur', [pr[j][0], pr[j][1], -zc + 0.25], [pr[j + 1][0], pr[j + 1][1], -zc + 0.25], [pr[j + 1][0], pr[j + 1][1], -zc - 0.25], [pr[j][0], pr[j][1], -zc - 0.25], C.or, { v: 0.02 });
        }
      }
      // sol du passage (dalles) et seuil
      for (let i = 0; i < 14; i++) for (let k = 0; k < 4; k++) {
        const c = ((i + k) % 2) ? C.dalle[0] : C.dalle[1];
        const x0 = -hw + k * hw / 2, x1 = x0 + hw / 2, z0 = -i, z1 = -(i + 1);
        quad('interieur', [x0, 0.12, z1], [x1, 0.12, z1], [x1, 0.12, z0], [x0, 0.12, z0], c, { v: 0.03 });
      }
      // appliques (flammes) le long du passage
      [-1, 1].forEach((s) => [3.4, 7.4, 11.4].forEach((z) => {
        boite('interieur', s * 2.7, 3.3, -z, 0.2, 0.6, 0.3, C.or, { v: 0 });
        boule('vitres', s * 2.55, 4.0, -z, 0.28, 0xffd36b, { v: 0.02, ao: false });
        etincelles.push([s * 2.4, 4.0, -z, 5, rnd() * 6]);
      }));
    }

    // =====================================================================
    // 3. LES VANTAUX
    // =====================================================================
    function vantail(sg) {
      const sv = seaux.vantail; delete seaux.vantail;
      const save = base; base = new M4();
      const nom = 'vantail';
      const pa = ptsOgive(HW, HSP, 8);             // de (hw,hs) vers (-hw,hs)
      const sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(sg * HW, 0);
      // côté intérieur (x' = HW) jusqu'au sommet, puis arc retour vers x'=0
      sh.lineTo(sg * HW, HOG);
      for (let i = pa.length - 1; i >= 0; i--) { const p = pa[i]; if (p[0] > 0.0001) continue; sh.lineTo(sg * (p[0] + HW), p[1]); }
      sh.lineTo(0, HSP);
      sh.lineTo(0, 0);
      ext(nom, sh, 0.5, { p: [0, 0, -0.5] }, C.bois, { v: 0.05, ao: false });
      const xArc = (y) => {      // distance à la charnière du bord supérieur à la hauteur y
        if (y <= HSP) return 0;
        const r = 2 * HW; return 2 * HW - Math.sqrt(Math.max(0, r * r - (y - HSP) * (y - HSP)));
      };
      // planches
      [0.7, 1.4, 2.1].forEach((x) => {
        const top = x >= xArc(HOG) ? HOG : HSP;
        let yt = HSP; for (let y = HSP; y <= HOG; y += 0.05) { if (xArc(y) < x) yt = y; else break; }
        boite(nom, sg * x, 0.2, 0.012, 0.07, yt - 0.3, 0.03, C.boisO, { v: 0, ao: false });
        boite(nom, sg * x, 0.2, -0.512, 0.07, yt - 0.3, 0.03, C.boisO, { v: 0, ao: false });
      });
      // ferrures dorées
      [1.1, 2.9, 4.6, 6.3, 7.7].forEach((y) => {
        const xa = xArc(y) + (y > HSP ? 0.22 : 0.06), xb = HW - 0.06, lg = xb - xa;
        if (lg < 0.3) return;
        [0.04, -0.54].forEach((z) => boite(nom, sg * (xa + xb) / 2, y - 0.14, z, lg, 0.28, 0.1, C.or, { v: 0.02, ao: false }));
        boite(nom, sg * (xa + 0.1), y - 0.2, 0.1, 0.4, 0.4, 0.1, C.or, { v: 0.02, ao: false });
        boite(nom, sg * (xb - 0.1), y - 0.2, 0.1, 0.4, 0.4, 0.1, C.or, { v: 0.02, ao: false });
      });
      boite(nom, sg * (HW - 0.12), 0.1, 0.04, 0.24, HOG - 1.1, 0.1, C.or, { v: 0.02, ao: false });
      boite(nom, sg * (HW - 0.12), 0.1, -0.54, 0.24, HOG - 1.1, 0.1, C.or, { v: 0.02, ao: false });
      // heurtoir : anneau doré
      boule(nom, sg * (HW - 0.55), 3.9, 0.22, 0.28, C.or, { v: 0.02, ao: false });
      boule(nom, sg * (HW - 0.55), 3.2, 0.2, 0.18, C.orO, { v: 0.02, ao: false });
      // bossettes
      for (let y = 0.7; y < 8.0; y += 1.7) boule(nom, sg * 0.45, y, 0.08, 0.14, C.or, { v: 0, ao: false });
      const s = seaux[nom]; delete seaux[nom]; if (sv) seaux.vantail = sv;
      base = save;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(s.p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(s.c, 3));
      g.computeVertexNormals();
      return g;
    }
    const matBois = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x2a1430), side: THREE.DoubleSide });
    const vL = new THREE.Mesh(vantail(1), matBois), vR = new THREE.Mesh(vantail(-1), matBois);
    vL.position.set(-HW, 0, -2.45); vR.position.set(HW, 0, -2.45);
    groupe.add(vL, vR);
    let porteU = 0;
    function setPorte(u) {
      porteU = borne(u);
      const a = lisse(porteU) * (100 * PI / 180);
      vL.rotation.y = a; vR.rotation.y = -a;
    }

    // =====================================================================
    // 4. ENCEINTE, TOURS, ESCALIERS
    // =====================================================================
    const W = 30, PROF = 78, HM = 13, EP = 4;
    const cremeMur = C.pierre;
    // courtines avant (de part et d'autre du porche)
    [-1, 1].forEach((s) => {
      const x0 = LG - 1, x1 = W;
      boite('murs', s * (x0 + x1) / 2, 0, -EP / 2, x1 - x0, HM, EP, cremeMur);
      boite('or', s * (x0 + x1) / 2, HM - 2.6, 0.08, x1 - x0, 0.45, 0.26, C.or, { v: 0.02 });
      boite('murs', s * (x0 + x1) / 2, HM, -EP / 2, x1 - x0, 0.4, EP + 0.5, C.cremeO);
      creneaux(s * x0, -EP / 2, s * x1, -EP / 2, HM + 0.4, EP, C.pierre2);
      // fenêtres, meurtrières et bannières
      [15.0, 25.6].forEach((x, i) => { fenetre(s * x, 5.3, 0, 0, 1.4, 3.6); boite('or', s * x, 9.6, 0.1, 0.09, 0.09, 0.09, C.or); });
      [20.3].forEach((x) => { fenetre(s * x, 8.4, 0, 0, 1.2, 3.2); });
      for (let x = 17; x < 29; x += 3.5) boite('murs', s * x, 9.9, 0.05, 0.25, 1.3, 0.15, C.violetO, { ao: false });
    });
    // courtines latérales et arrière (surtout visibles de la cour)
    [-1, 1].forEach((s) => {
      boite('murs', s * (W - EP / 2), 0, -(PROF) / 2 - 1, EP, HM, PROF - 4, cremeMur);
      boite('murs', s * (W - EP / 2), HM, -PROF / 2 - 1, EP + 0.5, 0.4, PROF - 4, C.cremeO);
      creneaux(s * (W - EP / 2), -EP, s * (W - EP / 2), -PROF + 2, HM + 0.4, EP, C.pierre2);
      boite('or', s * (W - EP - 0.1), HM - 2.6, -PROF / 2 - 1, 0.26, 0.45, PROF - 6, C.or, { v: 0.02 });
      for (let z = 10; z < PROF - 6; z += 8) { dans(s * (W - EP - 0.05), 0, -z, s * PI / 2, () => fenetre(0, 5.0, 0, 0, 1.4, 3.6)); }
    });
    boite('murs', 0, 0, -PROF + EP / 2, 2 * W, HM, EP, cremeMur);
    boite('murs', 0, HM, -PROF + EP / 2, 2 * W, 0.4, EP + 0.5, C.cremeO);
    creneaux(-W, -PROF + EP / 2, W, -PROF + EP / 2, HM + 0.4, EP, C.pierre2);
    boite('or', 0, HM - 2.6, -PROF + EP + 0.1, 2 * W - 6, 0.45, 0.26, C.or, { v: 0.02 });
    // face intérieure de la courtine avant
    [-1, 1].forEach((s) => { boite('or', s * 20, HM - 2.6, -EP - 0.08, 18, 0.45, 0.26, C.or, { v: 0.02 }); for (let x = 14; x < 28; x += 6) dans(s * x, 0, -EP - 0.02, PI, () => fenetre(0, 5, 0, 0, 1.4, 3.6)); });

    // Tours d'angle
    const rP = [C.rose, C.magenta], rV = [0xc874e8, C.violet];
    const fanA = { yaw: 0.3, w: 3.8, h: 1.6, c1: 0xff5fa8, c2: 0xffd45c }, fanB = { yaw: -0.2, w: 3.4, h: 1.5, c1: 0xb06bff, c2: 0xffd45c };
    const fenTour = (ys) => ({ ys, w: 1.0, h: 3.0 });
    tour(-W, -2, 5.0, 26, 13, 14, rP, { fen: fenTour([8, 14, 20]), fanion: fanA });
    tour(W, -2, 5.0, 24, 12, 14, rV, { fen: fenTour([8, 14, 19]), fanion: fanB });
    tour(-W, -PROF + 2, 5.0, 30, 14, 14, rV, { fen: { ys: [8, 15, 22], w: 1.0, h: 3.0, f: () => true }, fanion: fanB });
    tour(W, -PROF + 2, 5.0, 28, 14, 14, rP, { fen: { ys: [8, 15, 22], w: 1.0, h: 3.0, f: () => true }, fanion: fanA });
    // Tourelles du porche
    tour(-12.8, -2.2, 3.8, 29, 11, 12, rP, { mur: C.pierre2, fen: { ys: [7, 13, 19, 25], w: 0.95, h: 2.8, f: (th) => Math.cos(th) > -0.1 }, fanion: { yaw: 0.2, w: 3.6, h: 1.6, c1: 0xff5fa8, c2: 0xffd45c } });
    tour(12.8, -2.2, 3.8, 32, 12, 12, rP, { mur: C.pierre2, fen: { ys: [7, 13, 19, 25], w: 0.95, h: 2.8, f: (th) => Math.cos(th) > -0.1 }, fanion: { yaw: -0.1, w: 3.6, h: 1.6, c1: 0xd63a9a, c2: 0xffd45c } });
    // couronnes de lanternes (balcons de tourelles)
    [-12.8, 12.8].forEach((x) => { cyl('murs', x, 15.6, -2.2, 4.9, 4.9, 0.55, 12, C.cremeO); cyl('or', x, 16.15, -2.2, 5.05, 5.05, 0.2, 12, C.or, { v: 0.02 }); });

    // Escaliers monumentaux de chaque côté, jusqu'à une terrasse devant la courtine
    [-1, 1].forEach((s) => {
      const xc = s * 21, nb = 17, h = 0.5, pr = 0.62, zt = 4.6;
      boite('murs', xc, 0.06, zt / 2, 7.2, 8.5, zt, C.cremeO);               // palier
      boite('or', xc, 8.56, zt / 2, 7.6, 0.18, zt + 0.3, C.or, { v: 0.02 });
      for (let i = 0; i < nb; i++) boite('murs', xc, 0.06, zt + pr * (nb - i - 0.5), 6.4, h * (i + 1) - 0.0, pr - 0.0, i % 2 ? C.pierre2 : C.pierre);
      // joues d'escalier et rampes dorées
      const ang = Math.atan2(h * nb, pr * nb), lg = Math.hypot(h * nb, pr * nb);
      [-1, 1].forEach((t) => {
        boite('murs', xc + t * 3.4, 0.06, zt + pr * nb / 2, 0.55, 0.9, pr * nb, C.pierre2, { r: [0, 0, 0], v: 0 });
        ajouter('murs', gBoite(), { p: [xc + t * 3.4, 0.06 + h * nb / 2 + 0.5, zt + pr * nb / 2], r: [ang, 0, 0], s: [0.55, 0.9, lg] }, C.pierre2, { v: 0.02 });
        ajouter('or', gBoite(), { p: [xc + t * 3.4, 0.06 + h * nb / 2 + 1.05, zt + pr * nb / 2], r: [ang, 0, 0], s: [0.72, 0.13, lg + 0.1] }, C.or, { v: 0.02 });
        lanterne(xc + t * 3.4, 9.3, 0.3 + 0.2, 0.34);
        lanterne(xc + t * 3.4, 1.2, zt + pr * nb + 0.2, 0.34);
      });
      // balustrade du palier
      boite('or', xc, 8.74, zt + 0.1, 7.2, 0.14, 0.2, C.or);
      for (let x = -3.4; x <= 3.41; x += 0.9) boite('or', xc + x, 8.74, zt + 0.1, 0.12, 0.9, 0.12, C.or);
      // porte d'appui dans la courtine
      dans(xc, 8.56, 0.05, 0, () => {
        const sh = formeOgive(1.1, hsDe(2.2, 4.4), 6);
        plat('vitraux', sh, { p: [0, 0, 0.03] }, 0xffcf5e, { v: 0 });
        const r = formeOgive(1.45, hsDe(2.2, 4.4), 6); r.holes.push(trouOgive(1.1, hsDe(2.2, 4.4), 6));
        plat('or', r, { p: [0, 0, 0.1] }, C.or, { v: 0.02 });
      });
    });

    // =====================================================================
    // 5. COUR, PALAIS ET DONJON
    // =====================================================================
    // sol de la cour
    {
      const t = 3, y = 0.12;
      for (let x = -(W - EP); x < W - EP - 0.01; x += t) for (let z = -EP; z > -(PROF - EP) + 0.01; z -= t) {
        const xc = x + t / 2, zc = z - t / 2;
        if (Math.abs(xc) < LG + 0.2 && zc > -PG - 0.1) continue;
        const c = (Math.round((x + z) / t) % 2) ? C.dalle[0] : C.dalle[1];
        quad('interieur', [x, y, z - t], [x + t, y, z - t], [x + t, y, z], [x, y, z], c, { v: 0.03 });
      }
      // dalles de couleur dans l'axe : tapis rose
      for (let z = -PG; z > -41.9; z -= 3) quad('interieur', [-2.4, y + 0.02, z - 3], [2.4, y + 0.02, z - 3], [2.4, y + 0.02, z], [-2.4, y + 0.02, z], C.rose, { v: 0.04 });
      // jardinières : massifs de fleurs aux angles
      [[-21, -9], [21, -9], [-21, -64], [21, -64]].forEach(([x, z]) => {
        boite('murs', x, 0.12, z, 8, 0.8, 5, C.cremeO);
        for (let k = 0; k < 12; k++) boule('sol', x + (rnd() - 0.5) * 7, 1.1, z + (rnd() - 0.5) * 4, 0.45, coul[Math.floor(rnd() * 4)], { v: 0.08, ao: false });
      });
    }
    // fontaine
    {
      const fz = -34;
      cyl('murs', 0, 0.12, fz, 3.3, 3.3, 1.0, 12, C.pierre2);
      cyl('or', 0, 1.0, fz, 3.45, 3.45, 0.2, 12, C.or, { v: 0.02 });
      cyl('vitres', 0, 0.95, fz, 3.0, 3.0, 0.05, 12, 0x8fe4ff, { v: 0.04, ao: false });
      cyl('murs', 0, 1.0, fz, 0.7, 0.55, 2.4, 8, C.pierre);
      cyl('murs', 0, 3.2, fz, 0.4, 1.5, 0.7, 10, C.pierre2);
      cyl('or', 0, 3.9, fz, 1.5, 1.5, 0.15, 10, C.or, { v: 0.02 });
      cyl('murs', 0, 3.9, fz, 0.2, 0.2, 1.4, 6, C.pierre);
      boule('or', 0, 5.6, fz, 0.55, C.or, { v: 0.02 });
      etincelles.push([0, 5.7, fz, 4, 1.3]);
    }
    // arbres en boule des deux côtés de la cour
    [[-16, -22], [16, -22], [-22, -36], [22, -36]].forEach((p, i) => {
      cyl('sol', p[0], 0.12, p[1], 0.3, 0.22, 2.8, 6, 0x9b6a8a, { ao: false });
      boule('sol', p[0], 4.6, p[1], 2.4, i % 2 ? 0xffa0cf : 0xa3e48f, { v: 0.1, ao: false });
      boule('sol', p[0] + 0.3, 6.1, p[1] - 0.2, 1.4, i % 2 ? 0xffbddf : 0xc2f0a0, { v: 0.1, ao: false });
    });

    // palais (hall) : façade sur la cour
    {
      const HX = 15, HZ0 = -42, HZ1 = -58, HH = 16;
      boite('murs', 0, 0, (HZ0 + HZ1) / 2, 2 * HX, HH, HZ0 - HZ1, C.pierre2);
      boite('or', 0, 8.5, HZ0 + 0.05, 2 * HX + 0.3, 0.5, 0.35, C.or, { v: 0.02 });
      boite('or', 0, HH - 0.6, HZ0 + 0.05, 2 * HX + 0.5, 0.6, 0.5, C.or, { v: 0.02 });
      boite('murs', 0, 0, HZ0 + 0.3, 2 * HX + 0.4, 1.2, 0.5, C.pierreO);
      toitPignon(0, HH, (HZ0 + HZ1) / 2, 2 * HX + 2, 14, 7.6, [C.rose, 0xf064ad], 'x');
      // porte du palais
      const hz = HZ0 + 0.04;
      dans(0, 0.12, hz, 0, () => {
        const hs = hsDe(4.2, 8.4);
        plat('vitraux', formeOgive(2.1, hs, 6), { p: [0, 0, 0.04] }, 0xffcf5e, { v: 0.02 });
        const r = formeOgive(2.7, hs + 0.3, 6); r.holes.push(trouOgive(2.1, hs, 6));
        plat('or', r, { p: [0, 0, 0.12] }, C.or, { v: 0.02 });
        for (let k = 0; k < 6; k++) boite('murs', 0, 0, 0.5 + 0.5 * k, 6 + k * 0.3, 0.18 * (k + 1), 0.9, k % 2 ? C.pierre : C.pierre2);
      });
      [-1, 1].forEach((s) => {
        [4.5, 12.8].forEach((x) => { fenetre(s * x, 2.2, HZ0, 0, 1.6, 4.4, { clef: true }); fenetre(s * x, 9.5, HZ0, 0, 1.4, 3.8); });
        boite('or', s * 8.7, 1.4, HZ0 + 0.1, 0.3, 12.5, 0.3, C.orO, { v: 0.03 });
        lanterne(s * 3.5, 0.12, HZ0 + 1.1);
      });
      rosace(0, 11.8, HZ0, 0, 1.4);
      // bannières
      [-1, 1].forEach((s) => { boite('or', s * 8.7, 15.0, HZ0 + 0.3, 2.0, 0.16, 0.16, C.or); drapeau('v', s * 8.7, 14.95, HZ0 + 0.45, 0, 1.5, 5.2, s < 0 ? 0xd63a9a : 0xff5fa8, 0xffd45c); });
    }
    // donjon central
    {
      const dx = 0, dz = -63, r = 9.5, h = 28, seg = 16;
      cyl('murs', dx, 0, dz, r + 0.9, r, 3, seg, C.pierreO);
      cyl('murs', dx, 3, dz, r, r, h - 3, seg, C.pierre2);
      cyl('or', dx, 11, dz, r + 0.12, r + 0.12, 0.5, seg, C.or, { v: 0.02 });
      cyl('or', dx, 19.5, dz, r + 0.12, r + 0.12, 0.5, seg, C.or, { v: 0.02 });
      // balcon annulaire
      cyl('murs', dx, h - 5.6, dz, r + 1.5, r + 1.5, 0.7, seg, C.cremeO);
      cyl('or', dx, h - 4.9, dz, r + 1.6, r + 1.6, 0.14, seg, C.or, { v: 0.02 });
      for (let i = 0; i < seg * 2; i++) { const th = i / (seg * 2) * 2 * PI; boite('or', dx + (r + 1.35) * Math.sin(th), h - 4.76, dz + (r + 1.35) * Math.cos(th), 0.12, 0.9, 0.12, C.or, { v: 0 }); }
      cyl('or', dx, h - 3.9, dz, r + 1.42, r + 1.42, 0.14, seg, C.or, { v: 0.02 });
      cyl('murs', dx, h - 1.6, dz, r, r + 1.4, 1.6, seg, C.cremeO);
      cyl('or', dx, h - 0.15, dz, r + 1.55, r + 1.55, 0.55, seg, C.or, { v: 0.02 });
      toitCone(dx, h, dz, r + 1.45, 18, seg, [C.rose, C.magenta], true);
      pointe(dx, h + 17.6, dz, 5.0, { yaw: 0.15, w: 6.0, h: 2.4, c1: 0xff5fa8, c2: 0xffd45c });
      // lucarnes sur le cône : petites ogives émissives
      for (let k = 0; k < 4; k++) { const th = (k + 0.5) / 4 * PI * 2 + PI / 4; const f = 0.28, rr = (r + 1.45) * (1 - f);
        dans(dx + (rr - 0.1) * Math.sin(th), h + 18 * f, dz + (rr - 0.1) * Math.cos(th), th, () => {
          dans(0, 0, 0, 0, () => ajouter('or', gBoite(), { p: [0, 0.95, 0.0], s: [0.5, 2.6, 0.3], r: [-0.55, 0, 0] }, C.or, { v: 0.02 }));
          ajouter('vitres', new THREE.CircleGeometry(0.7, 8), { p: [0, 1.0, 0.7], r: [-0.55, 0, 0] }, 0xffd36b, { v: 0.02, ao: false });
        }); }
      fenetresFut(dx, dz, r, seg, [6, 14, 22.5], 1.5, 4.0, (th, i, n) => Math.cos(th) > -0.5 && !(n === 0 && Math.cos(th) > 0.4), 0);
      // grandes baies vitrées face à la cour
      fenetre(dx, 20.2, dz + r * Math.cos(PI / seg) + 0.05, 0, 0.1, 0.1);
      rosace(dx, 15.5, dz + r * Math.cos(PI / seg) - 0.0 + 0.0, 0, 1.7);
      // tourelles du donjon
      const TT = [[-11.5, -50, 3.0, 34, 10, rP], [11.5, -50, 3.0, 38, 11, rV], [-12.5, -73, 3.0, 32, 9, rV], [12.5, -73, 3.0, 36, 10, rP]];
      TT.forEach((t, i) => tour(t[0], t[1], t[2], t[3], t[4], 10, t[5], { mur: C.pierre, fen: { ys: [8, 15, 22, 28].filter((y) => y < t[3] - 3), w: 0.9, h: 2.6, f: (th) => Math.cos(th) > -0.2 }, fanion: { yaw: 0.2 * (i % 2 ? -1 : 1), w: 3.2, h: 1.4, c1: i % 2 ? 0xb06bff : 0xff5fa8, c2: 0xffd45c } }));
    }

    // fanions guirlandes sur la façade et la cour
    [-1, 1].forEach((s) => {
      drapeau('v', s * 14, HM - 0.3, 0.35, 0, 1.5, 4.8, s < 0 ? 0xd63a9a : 0xff5fa8, 0xffd45c);
      drapeau('v', s * 26.5, HM - 0.3, 0.35, 0, 1.5, 4.8, s < 0 ? 0xff5fa8 : 0xd63a9a, 0xffd45c);
    });

    // =====================================================================
    // 6. MAILLES FINALES
    // =====================================================================
    const mats = {
      sol: new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x10300e), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      murs: new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x3a2458) }),
      toits: new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x66153f), side: THREE.DoubleSide }),
      or: new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x3a2606), side: THREE.DoubleSide }),
      vitres: new THREE.MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      vitraux: new THREE.MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide }),
      interieur: new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x4a3070), side: THREE.DoubleSide }),
    };
    const emiBase = new THREE.Color(0x4a3070), emiOr = new THREE.Color(0xffcf6a);
    Object.keys(seaux).forEach((nom) => {
      const s = seaux[nom];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(s.p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(s.c, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, mats[nom]);
      m.name = nom;
      groupe.add(m);
    });

    // ---------- Étoffes (un seul mesh, sommets recalculés dans maj) ----------
    const NU = 7, NV = 4;
    const nvF = (NU + 1) * (NV + 1);
    const posF = new Float32Array(drapeaux.length * nvF * 3), colF = new Float32Array(drapeaux.length * nvF * 3);
    const idxF = [];
    drapeaux.forEach((f, k) => {
      const o = k * nvF;
      for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
        const a = o + i * (NV + 1) + j, b = a + 1, c = a + (NV + 1), d = c + 1;
        idxF.push(a, b, c, b, d, c);
      }
      for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) {
        const u = i / NU, cc = new THREE.Color().copy(f.c1).lerp(f.c2, f.type === 'h' ? u : Math.pow(u, 1.4));
        const n = (o + i * (NV + 1) + j) * 3; colF[n] = cc.r; colF[n + 1] = cc.g; colF[n + 2] = cc.b;
      }
    });
    const gF = new THREE.BufferGeometry();
    gF.setAttribute('position', new THREE.BufferAttribute(posF, 3));
    gF.setAttribute('color', new THREE.BufferAttribute(colF, 3));
    gF.setIndex(idxF);
    const meshF = new THREE.Mesh(gF, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, emissive: new THREE.Color(0x601838) }));
    meshF.frustumCulled = false;
    groupe.add(meshF);
    function majDrapeaux(T) {
      drapeaux.forEach((f, k) => {
        const om = 2 * PI * f.k / L, cy = Math.cos(f.yaw), sy = Math.sin(f.yaw);
        for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) {
          const u = i / NU, v = j / NV;
          let lx, ly, lz;
          if (f.type === 'h') {
            lx = u * f.w; ly = (v - 0.5) * f.h * (1 - 0.8 * u);
            lz = f.h * 0.35 * u * Math.sin(om * T - 5 * u + f.ph);
            ly += 0.1 * f.h * u * Math.sin(om * T * 1 - 4 * u + f.ph + 1);
          } else {
            lx = (v - 0.5) * f.w; ly = -u * f.h;
            if (i === NU) ly += f.h * 0.14 * (1 - Math.abs(2 * v - 1)) * 1.0;
            lz = f.w * 0.16 * u * Math.sin(om * T - 4 * u + f.ph) + 0.1;
            lx += 0.05 * f.w * u * Math.sin(om * T - 3 * u + f.ph + 2);
          }
          const n = (k * nvF + i * (NV + 1) + j) * 3;
          posF[n] = f.o[0] + lx * cy + lz * sy; posF[n + 1] = f.o[1] + ly; posF[n + 2] = f.o[2] - lx * sy + lz * cy;
        }
      });
      gF.attributes.position.needsUpdate = true;
      gF.computeVertexNormals();
    }

    // ---------- Étincelles dorées (points additifs) ----------
    function texDegrade(arrets) {
      if (typeof document === 'undefined') return null;
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const cx = cv.getContext('2d'), g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
      arrets.forEach((a) => g.addColorStop(a[0], a[1]));
      cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(cv);
    }
    const texPoint = texDegrade([[0, 'rgba(255,248,220,1)'], [0.25, 'rgba(255,214,110,0.8)'], [1, 'rgba(255,190,80,0)']]);
    const posP = new Float32Array(etincelles.length * 3), colP = new Float32Array(etincelles.length * 3);
    etincelles.forEach((e, i) => { posP.set([e[0], e[1], e[2]], i * 3); });
    const gP = new THREE.BufferGeometry();
    gP.setAttribute('position', new THREE.BufferAttribute(posP, 3));
    gP.setAttribute('color', new THREE.BufferAttribute(colP, 3));
    const pts = new THREE.Points(gP, new THREE.PointsMaterial({ size: 4.2, map: texPoint, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    pts.frustumCulled = false;
    groupe.add(pts);
    function majEtincelles(T) {
      etincelles.forEach((e, i) => {
        const a = 0.55 + 0.45 * Math.sin(2 * PI * e[3] * T / L + e[4]);
        colP[i * 3] = a; colP[i * 3 + 1] = a * 0.8; colP[i * 3 + 2] = a * 0.38;
      });
      gP.attributes.color.needsUpdate = true;
    }

    // =====================================================================
    // 7. LUEUR DE LA PORTE
    // =====================================================================
    const texLueur = texDegrade([[0, 'rgba(255,252,236,1)'], [0.3, 'rgba(255,230,150,0.9)'], [0.65, 'rgba(255,196,80,0.45)'], [1, 'rgba(255,170,40,0)']]);
    const mkGlow = (l, h, x, y, z, rot) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(l, h), new THREE.MeshBasicMaterial({ map: texLueur, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.visible = false; m.renderOrder = 5; groupe.add(m); return m;
    };
    const lueurs = [];
    // tranches dans le passage (section de l'ogive)
    for (let k = 0; k < 5; k++) lueurs.push({ m: mkGlow(6.4, 10.6, 0, 4.6, -2.6 - k * 2.6), k: 0.35 });
    lueurs.push({ m: mkGlow(9, 12, 0, 4.8, -14.2), k: 0.9 });                   // sortie du passage
    lueurs.push({ m: mkGlow(70, 40, 0, 14, -30), k: 1.0 });                      // la cour inondée
    lueurs.push({ m: mkGlow(22, 24, 0, 6, 0.9), k: 0.8 });                        // halo devant la porte
    lueurs.push({ m: mkGlow(16, 34, 0, 0.35, 15, [-PI / 2, 0, 0]), k: 0.55 });    // reflet sur la rampe
    let lueurU = 0;
    function setLueur(u) {
      lueurU = borne(u);
      const e = lisse(lueurU);
      lueurs.forEach((l) => { l.m.material.opacity = Math.min(1, e * l.k * 1.4); l.m.visible = e > 0.003; });
      mats.interieur.emissive.copy(emiBase).lerp(emiOr, e);
      mats.murs.emissive.setRGB(0.23 + 0.08 * e, 0.14 + 0.06 * e, 0.34);
    }

    function maj(T) { majDrapeaux(T); majEtincelles(T); }
    setPorte(0); setLueur(0); maj(0);

    return { group: groupe, setPorte, setLueur, maj };
  }

  return { creer };
});
