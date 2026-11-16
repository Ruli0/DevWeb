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
