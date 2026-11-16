/*
 * Les décors en 3D (Three.js) de la chaîne « avis » : une vraie caméra qui se déplace dans une scène faite de formes simples.
 * Un décor 3D : description, accent, creer(canvas) → { maj(t, d) } où t est le temps écoulé dans le plan et d sa durée.
 * Tout se calcule à partir de t (pas de minuterie, pas de hasard : les positions viennent d'un générateur à graine fixe),
 * donc la même image sort toujours au même instant, quel que soit l'ordre du rendu.
 * Côté Node, seuls `description` et `accent` servent ; THREE n'existe que dans la page.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.decors3d = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Générateur pseudo-aléatoire à graine fixe : toujours la même suite.
  const suite = (graine) => { let a = graine >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };
  const doux = (u) => u * u * (3 - 2 * u);
  const entre = (a, b, u) => a + (b - a) * u;

  /*
   * La caméra : une suite de mouvements, chacun entre deux instants du plan.
   *   tour            tourne autour du centre de la scène
   *   plongee[:cible] part de très haut et descend vers la cible
   *   zoom:cible      s'approche de la cible en resserrant le champ
   *   survol          passe au ras du sol à travers la scène
   *   large           plan d'ensemble presque fixe
   * Chaque mouvement donne une pose { p: position, l: point visé, f: angle de champ } pour u de 0 à 1.
   * Au début d'un mouvement, la pose glisse depuis la fin du précédent (pas de saut).
   */
  const MOUVEMENTS = ['tour', 'plongee', 'zoom', 'survol', 'large'];
  const v3 = (a, b, u) => [entre(a[0], b[0], u), entre(a[1], b[1], u), entre(a[2], b[2], u)];
  function pose(mouvement, u, ctx, t) {
    const [nom, cibleNom] = mouvement.split(':');
    const C = ctx.centre, R = ctx.rayon, e = doux(u);
    const cible = ctx.cible(cibleNom || ctx.cibleParDefaut, t);
    if (nom === 'tour') { const a = 0.95 + e * 1.9; return { p: [C[0] + R * Math.cos(a), C[1] + R * 0.42, C[2] + R * Math.sin(a)], l: [C[0], C[1] + 1.2, C[2]], f: 44 }; }
    if (nom === 'plongee') return { p: v3([cible[0] + 3, C[1] + R * 1.5, cible[2] + 9], [cible[0] + 2, cible[1] + 5, cible[2] + 6.5], e), l: cible, f: entre(50, 40, e) };
    if (nom === 'zoom') {
      const large = [C[0] - R * 0.5, C[1] + R * 0.36, C[2] + R * 0.95];
      const d = [large[0] - cible[0], large[1] - cible[1], large[2] - cible[2]], n = Math.hypot(d[0], d[1], d[2]);
      const pres = [cible[0] + d[0] / n * ctx.approche, cible[1] + d[1] / n * ctx.approche + 0.5, cible[2] + d[2] / n * ctx.approche];
      return { p: v3(large, pres, e), l: v3([C[0], C[1] + 1.2, C[2]], cible, Math.min(1, e * 1.6)), f: entre(44, 30, e) };
    }
    if (nom === 'survol') { const p = v3([C[0] - R * 0.9, C[1] + 1.6, C[2] + R * 0.75], [C[0] + R * 0.5, C[1] + 2.6, C[2] + R * 0.1], e); return { p, l: [p[0] + 6, p[1] - 0.9, p[2] - 5], f: 52 }; }
    return { p: [C[0] - R * 0.25 + e * R * 0.2, C[1] + R * 0.34, C[2] + R * 1.05], l: [C[0], C[1] + 1.4, C[2]], f: 44 };
  }
  // camera : [{ m: 'zoom:paysan', t: début en secondes dans le plan }], triés par t.
  function piloter(camera, liste, ctx, t, d) {
    const suite = liste && liste.length ? liste : [{ m: 'large', t: 0 }];
    let i = 0; while (i + 1 < suite.length && t >= suite[i + 1].t) i += 1;
    const debut = suite[i].t, fin = i + 1 < suite.length ? suite[i + 1].t : d;
    let q = pose(suite[i].m, Math.min(1, Math.max(0, (t - debut) / Math.max(0.01, fin - debut))), ctx, t);
    const fondu = Math.min(0.8, (fin - debut) * 0.35);
    if (i > 0 && t - debut < fondu) {
      const avant = pose(suite[i - 1].m, 1, ctx, t), k = doux((t - debut) / fondu);
      q = { p: v3(avant.p, q.p, k), l: v3(avant.l, q.l, k), f: entre(avant.f, q.f, k) };
    }
    camera.position.set(q.p[0], q.p[1], q.p[2]); camera.lookAt(q.l[0], q.l[1], q.l[2]);
    if (camera.fov !== q.f) { camera.fov = q.f; camera.updateProjectionMatrix(); }
  }

  function rendu(canvas, fond) {
    const T = THREE;
    const r = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(canvas.width, canvas.height, false);
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(); scene.background = new T.Color(fond); scene.fog = new T.Fog(fond, 18, 46);
    const camera = new T.PerspectiveCamera(42, canvas.width / canvas.height, 0.1, 100);
    return { T, r, scene, camera };
  }
  const mat = (T, couleur) => new T.MeshLambertMaterial({ color: couleur, flatShading: true });
  // Un membre : un cylindre posé entre deux points.
  function membre(T, a, b, rayon, couleur) {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b), dir = vb.clone().sub(va);
    const m = new T.Mesh(new T.CylinderGeometry(rayon, rayon, dir.length(), 8), mat(T, couleur));
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    m.castShadow = true; return m;
  }

  return {
    // La rizière en volume : une colline en terrasses inondées, le paysan et son buffle qui en font le tour, une cabane, des palmiers, des aigrettes.
    riziere3d: {
      description: 'La rizière en 3D : colline en terrasses inondées, paysan et buffle, cabane au sommet, palmiers, aigrettes, montagnes dans la brume. La caméra tourne, plonge et zoome.',
      accent: '#ffe08a',
      mouvements: MOUVEMENTS,
      cibles: ['paysan', 'buffle', 'cabane', 'palmier', 'soleil', 'oiseaux'],
      creer(canvas, p) {
        const { T, r, scene, camera } = rendu(canvas, '#f3b98c');
        scene.fog = new T.Fog(0xf3b98c, 26, 95);
        // Le ciel : une grande sphère dégradée, du bleu nuit en haut à l'orange à l'horizon.
        const ciel = new T.SphereGeometry(120, 24, 12), cc = [];
        for (let i = 0; i < ciel.attributes.position.count; i += 1) { const y = ciel.attributes.position.getY(i) / 120; const c = new T.Color(0xffd9a0).lerp(new T.Color(0xe8775a), Math.min(1, Math.max(0, y * 2.2))).lerp(new T.Color(0x24406a), Math.min(1, Math.max(0, (y - 0.3) * 1.6))); cc.push(c.r, c.g, c.b); }
        ciel.setAttribute('color', new T.Float32BufferAttribute(cc, 3));
        scene.add(new T.Mesh(ciel, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })));
        const soleilPos = [-16, 9, -62];
        const astre = new T.Mesh(new T.SphereGeometry(6, 20, 12), new T.MeshBasicMaterial({ color: 0xfff3c4, fog: false })); astre.position.set(...soleilPos); scene.add(astre);
        scene.add(new T.HemisphereLight(0xffe2c0, 0x3a6a4a, 0.55));
        const lum = new T.DirectionalLight(0xffd9a8, 0.85); lum.position.set(-12, 14, -6); lum.castShadow = true;
        lum.shadow.mapSize.set(1024, 1024); Object.assign(lum.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 }); scene.add(lum);
        const h = suite(11);
        // Le sol : une plaine inondée.
        const plaine = new T.Mesh(new T.CylinderGeometry(70, 70, 0.2, 40), mat(T, 0x4fa8a4)); plaine.position.y = -0.1; plaine.receiveShadow = true; scene.add(plaine);
        // Une colline en terrasses : des disques empilés ; chaque niveau a sa digue verte et son eau.
        const verts = [0x4f9d50, 0x5fae4e, 0x6dbb62, 0x7cc46c, 0x58a84f, 0x69b65e, 0x4a964c, 0x73bf66];
        const touffes = [];
        const colline = (cx, cz, r0, niveaux, hauteur) => {
          for (let i = 0; i < niveaux; i += 1) {
            const rr = r0 * (1 - i / (niveaux + 0.6)), y = i * hauteur;
            const digue = new T.Mesh(new T.CylinderGeometry(rr, rr + 0.25, hauteur, 28), mat(T, verts[i % verts.length])); digue.position.set(cx, y + hauteur / 2, cz); digue.castShadow = true; digue.receiveShadow = true; scene.add(digue);
            const eau = new T.Mesh(new T.CylinderGeometry(rr - 0.22, rr - 0.22, 0.05, 28), new T.MeshLambertMaterial({ color: 0x5fb9b2, emissive: 0x0f2f33, flatShading: true })); eau.position.set(cx, y + hauteur + 0.01, cz); eau.receiveShadow = true; scene.add(eau);
            const rInt = r0 * (1 - (i + 1) / (niveaux + 0.6)) + 0.35, n = Math.round((rr * rr - rInt * rInt) * 6);
            for (let k = 0; k < n; k += 1) { const a = h() * Math.PI * 2, d = Math.sqrt(rInt * rInt + h() * ((rr - 0.4) * (rr - 0.4) - rInt * rInt)); touffes.push([cx + d * Math.cos(a), y + hauteur + 0.1, cz + d * Math.sin(a), 0.6 + h() * 0.6]); }
          }
        };
        const NIV = 8, HAUT = 0.62, R0 = 10;
        colline(0, 0, R0, NIV, HAUT); colline(-19, -9, 7, 5, 0.6); colline(18, -12, 8, 6, 0.6); colline(-6, -24, 9, 6, 0.7);
        // Les touffes de riz : un seul objet dessiné en série (rapide).
        const riz = new T.InstancedMesh(new T.ConeGeometry(0.05, 0.22, 4), mat(T, 0x2f8a3c), touffes.length), M = new T.Object3D();
        touffes.forEach(([x, y, z, e], i) => { M.position.set(x, y, z); M.scale.set(e, e, e); M.rotation.y = i; M.updateMatrix(); riz.setMatrixAt(i, M.matrix); });
        scene.add(riz);
        // La cabane au sommet.
        const sommet = NIV * HAUT;
        const cabane = new T.Group(); cabane.position.set(0, sommet, 0); scene.add(cabane);
        const murs = new T.Mesh(new T.BoxGeometry(1.5, 1, 1.2), mat(T, 0xb07a4a)); murs.position.y = 0.75; murs.castShadow = true;
        const toit = new T.Mesh(new T.ConeGeometry(1.5, 0.9, 4), mat(T, 0xe2c27a)); toit.position.y = 1.7; toit.rotation.y = Math.PI / 4; toit.castShadow = true;
        cabane.add(murs, toit); [[-0.6, -0.45], [0.6, -0.45], [-0.6, 0.45], [0.6, 0.45]].forEach(([x, z]) => cabane.add(membre(T, [x, 0, z], [x, 0.3, z], 0.06, 0x5a3d2b)));
        // Les palmiers.
        const palmier = (x, y, z, e) => {
          const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(e); scene.add(g);
          g.add(membre(T, [0, 0, 0], [0.25, 3.2, 0.1], 0.13, 0x5a3d2b));
          const palmes = new T.Group(); palmes.position.set(0.25, 3.2, 0.1); g.add(palmes);
          for (let k = 0; k < 7; k += 1) { const f = new T.Mesh(new T.ConeGeometry(0.28, 2.2, 4), mat(T, 0x2f8a45)); f.scale.z = 0.25; f.position.set(Math.cos(k * 0.9) * 0.95, -0.25, Math.sin(k * 0.9) * 0.95); f.rotation.set(Math.sin(k * 0.9) * 1.25, 0, -Math.cos(k * 0.9) * 1.25); f.castShadow = true; palmes.add(f); }
          return palmes;
        };
        const palmes = [palmier(8.6, HAUT, 5.4, 1), palmier(-9.2, HAUT, 3.8, 0.85), palmier(12.5, 0, 8, 1.15)];
        // Le paysan (chapeau conique) et son buffle, sur la deuxième terrasse.
        const Rp = R0 * (1 - 1 / (NIV + 0.6)) - 0.9, yp = 2 * HAUT + 0.03;
        const paysan = new T.Group(); scene.add(paysan);
        const corps = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.62, 8), mat(T, 0x2f5f9a)); corps.position.y = 0.72; corps.castShadow = true;
        const teteP = new T.Mesh(new T.IcosahedronGeometry(0.15, 1), mat(T, 0xe2b48c)); teteP.position.y = 1.16;
        const chapeau = new T.Mesh(new T.ConeGeometry(0.46, 0.26, 12), mat(T, 0xf1e2b0)); chapeau.position.y = 1.36; chapeau.castShadow = true;
        const jg = membre(T, [-0.09, 0.42, 0], [-0.09, 0, 0], 0.07, 0x22323f), jd = membre(T, [0.09, 0.42, 0], [0.09, 0, 0], 0.07, 0x22323f);
        paysan.add(corps, teteP, chapeau, jg, jd);
        const buffle = new T.Group(); scene.add(buffle);
        const tronc = new T.Mesh(new T.BoxGeometry(0.62, 0.6, 1.25), mat(T, 0x3b3f46)); tronc.position.y = 0.72; tronc.castShadow = true;
        const teteB = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.5), mat(T, 0x33373d)); teteB.position.set(0, 0.86, 0.82);
        buffle.add(tronc, teteB, membre(T, [-0.18, 1.04, 0.86], [-0.5, 1.3, 0.7], 0.045, 0xd9d2c4), membre(T, [0.18, 1.04, 0.86], [0.5, 1.3, 0.7], 0.045, 0xd9d2c4));
        const pattes = [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].map(([x, z]) => { const m = membre(T, [x, 0.45, z], [x, 0, z], 0.08, 0x33373d); buffle.add(m); return m; });
        // Les aigrettes : deux ailes blanches qui battent, en cercle au-dessus de la colline.
        const oiseaux = [0, 1, 2].map((k) => {
          const g = new T.Group(); scene.add(g);
          const ag = new T.Mesh(new T.BoxGeometry(0.75, 0.04, 0.26), new T.MeshBasicMaterial({ color: 0xffffff })); ag.geometry.translate(0.375, 0, 0);
          const ad = ag.clone(); ad.scale.x = -1; g.add(ag, ad); return { g, ag, ad, k };
        });
        // Les montagnes en pain de sucre (la brume vient du brouillard de la scène).
        for (let k = 0; k < 16; k += 1) { const m = new T.Mesh(new T.ConeGeometry(4 + h() * 5, 12 + h() * 14, 6), mat(T, k % 2 ? 0x4f7f78 : 0x6f8fa6)); m.position.set(-62 + k * 8.4 + h() * 4, 5, -38 - h() * 24); m.scale.x = 0.8 + h() * 0.5; scene.add(m); }
        const pos = { paysan: [0, 0, 0], buffle: [0, 0, 0], oiseaux: [0, 0, 0] };
        const ctx = { centre: [0, 2.2, 0], rayon: 19, approche: 7.5, cibleParDefaut: 'paysan',
          cible: (nom) => ({ paysan: pos.paysan, buffle: pos.buffle, oiseaux: pos.oiseaux, cabane: [0, sommet + 1.1, 0], palmier: [8.8, HAUT + 3, 5.4], soleil: [soleilPos[0] * 0.5, 6, -20] }[nom] || pos.paysan) };
        return {
          maj(t, d) {
            // Le paysan et son buffle avancent le long de la terrasse.
            const place = (g, a, cle, hy) => { g.position.set(Rp * Math.cos(a), yp, Rp * Math.sin(a)); g.rotation.y = -a; pos[cle] = [g.position.x, yp + hy, g.position.z]; };
            const a = 1.02 + t * 0.022;
            place(paysan, a, 'paysan', 0.9); place(buffle, a + 0.2, 'buffle', 0.7);
            jg.rotation.x = Math.sin(t * 5) * 0.35; jd.rotation.x = -Math.sin(t * 5) * 0.35;
            pattes.forEach((m, k) => { m.rotation.x = Math.sin(t * 5 + k * 1.6) * 0.3; });
            paysan.position.y = yp + Math.abs(Math.sin(t * 5)) * 0.03;
            oiseaux.forEach(({ g, ag, ad, k }) => { const b = 0.7 + t * 0.32 + k * 0.5; g.position.set(7.5 * Math.cos(b), 8.2 + k * 0.7 + Math.sin(t + k) * 0.4, 7.5 * Math.sin(b) - 2); g.rotation.y = -b; ag.rotation.z = Math.sin(t * 7 + k) * 0.6; ad.rotation.z = -Math.sin(t * 7 + k) * 0.6; });
            pos.oiseaux = [oiseaux[0].g.position.x, oiseaux[0].g.position.y, oiseaux[0].g.position.z];
            palmes.forEach((g, k) => { g.rotation.z = Math.sin(t * 1.3 + k) * 0.06; g.rotation.x = Math.sin(t * 1.1 + k * 2) * 0.05; });
            piloter(camera, p && p.camera, ctx, t, d);
            r.render(scene, camera);
          },
        };
      },
    },
    // Le mur d'escalade en volume : panneaux inclinés, prises, une voie orange, quelqu'un qui grimpe ; la caméra monte le long de la voie.
    mur3d: {
      description: 'Le mur d’escalade en 3D : panneaux, prises en volume, une voie orange, quelqu’un qui grimpe ; la caméra part du sol et monte en tournant autour de lui.',
      accent: '#ff8a3d',
      creer(canvas) {
        const { T, r, scene, camera } = rendu(canvas, '#1a2030');
        scene.add(new T.HemisphereLight(0xffffff, 0x2a3350, 0.85));
        const soleil = new T.DirectionalLight(0xfff0d8, 1.05); soleil.position.set(7, 16, 11); soleil.castShadow = true;
        soleil.shadow.mapSize.set(1024, 1024); Object.assign(soleil.shadow.camera, { left: -9, right: 9, top: 20, bottom: -4, near: 1, far: 50 });
        scene.add(soleil);
        // Le mur : trois panneaux à plat (un panneau incliné recouvrirait les prises posées dessus).
        [[-4.2, 0x343c50, 0], [0, 0x3c4660, 0], [4.2, 0x2f374a, 0]].forEach(([x, c, incl]) => {
          const p = new T.Mesh(new T.BoxGeometry(4.2, 34, 0.4), mat(T, c));
          p.position.set(x, 15, -0.2); p.rotation.x = incl; p.receiveShadow = true; scene.add(p);
        });
        for (let y = 2.4; y < 30; y += 2.4) { const l = new T.Mesh(new T.BoxGeometry(12.6, 0.05, 0.05), mat(T, 0x232a3a)); l.position.set(0, y, 0.02); scene.add(l); }
        [-2.1, 2.1].forEach((x) => { const l = new T.Mesh(new T.BoxGeometry(0.07, 34, 0.07), mat(T, 0x232a3a)); l.position.set(x, 15, 0.03); scene.add(l); });
        const sol = new T.Mesh(new T.BoxGeometry(14, 0.5, 7), mat(T, 0x2f6fd0)); sol.position.set(0, -0.25, 3); sol.receiveShadow = true; scene.add(sol);
        // Les prises : des cailloux à facettes, à des places tirées d'une suite fixe.
        const h = suite(7), couleurs = [0xf2c14e, 0x3fae7c, 0xe0564a, 0x5b8cff, 0xb08cff, 0xf5f0e6];
        const prise = (x, y, taille, couleur) => {
          const g = new T.Mesh(new T.DodecahedronGeometry(taille, 0), mat(T, couleur));
          g.position.set(x, y, 0.12); g.scale.set(1 + h() * 0.6, 0.7 + h() * 0.5, 0.55); g.rotation.set(h() * 3, h() * 3, h() * 3);
          g.castShadow = true; scene.add(g);
        };
        for (let i = 0; i < 190; i += 1) prise(-6 + h() * 12, 0.6 + h() * 27, 0.2 + h() * 0.24, couleurs[Math.floor(h() * couleurs.length)]);
        const voie = (y) => 0.2 + Math.sin(y * 0.85) * 1.15;
        for (let y = 0.8; y < 28; y += 0.85) prise(voie(y) + (h() - 0.5) * 0.5, y, 0.3, 0xff8a3d);
        // La personne qui grimpe, de dos : formes simples.
        const g = new T.Group(); scene.add(g);
        const peau = 0xf3c6a0, pantalon = 0x2e5a66;
        const torse = new T.Mesh(new T.BoxGeometry(0.62, 0.9, 0.34), mat(T, 0xff8a3d)); torse.position.set(0, 0.25, 0); torse.castShadow = true; g.add(torse);
        const bassin = new T.Mesh(new T.BoxGeometry(0.6, 0.34, 0.34), mat(T, pantalon)); bassin.position.set(0, -0.36, 0); bassin.castShadow = true; g.add(bassin);
        const tete = new T.Mesh(new T.IcosahedronGeometry(0.24, 1), mat(T, 0x3a2a22)); tete.position.set(0, 0.98, 0.02); tete.castShadow = true; g.add(tete);
        const sac = new T.Mesh(new T.CylinderGeometry(0.13, 0.11, 0.24, 8), mat(T, 0xe0564a)); sac.position.set(0.18, -0.42, 0.26); g.add(sac);
        g.add(membre(T, [0.3, 0.6, 0], [0.62, 0.95, -0.2], 0.085, peau), membre(T, [0.62, 0.95, -0.2], [0.7, 1.5, -0.42], 0.075, peau));
        const bras = new T.Group(); bras.position.set(-0.3, 0.6, 0); g.add(bras);
        bras.add(membre(T, [0, 0, 0], [-0.3, 0.45, -0.18], 0.085, peau), membre(T, [-0.3, 0.45, -0.18], [-0.36, 1.0, -0.42], 0.075, peau));
        g.add(membre(T, [-0.18, -0.5, 0], [-0.52, -0.95, -0.12], 0.11, pantalon), membre(T, [-0.52, -0.95, -0.12], [-0.42, -1.5, -0.36], 0.095, pantalon));
        g.add(membre(T, [0.18, -0.5, 0], [0.42, -1.15, -0.05], 0.11, pantalon), membre(T, [0.42, -1.15, -0.05], [0.36, -1.8, -0.36], 0.095, pantalon));
        g.add(membre(T, [0, -0.3, -0.3], [0.1, 30, -0.3], 0.03, 0xf5f0e6));
        return {
          maj(t, d) {
            const u = doux(Math.min(1, Math.max(0, t / d)));
            const y = entre(4.6, 7.4, u);
            g.position.set(voie(y) * 0.6, y + Math.sin(t * 2.6) * 0.05, 0.62);
            bras.rotation.z = Math.sin(t * 2.6) * 0.16;
            // La caméra part du sol, à droite, et monte en passant de l'autre côté.
            camera.position.set(entre(5.6, -3.4, u), entre(1.2, y + 0.4, u), entre(12.5, 10.5, u));
            camera.lookAt(0.1, entre(4.4, y + 0.3, u), 0);
            r.render(scene, camera);
          },
        };
      },
    },
  };
});
