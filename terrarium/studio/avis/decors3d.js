/*
 * Les décors en 3D (Three.js) de la chaîne « avis » : une vraie caméra qui se déplace dans une scène faite de formes simples.
 * Un décor 3D : description, accent, mouvements, cibles, ambiance (facultatif), creer(canvas, p) → { maj(t, d) }
 * où t est le temps écoulé dans le plan, d sa durée, et p les paramètres du plan ("camera", "accents").
 * Tout se calcule à partir de t (pas de minuterie, pas de hasard : les positions viennent d'un générateur à graine fixe),
 * donc la même image sort toujours au même instant, quel que soit l'ordre du rendu.
 * Deux aspects : « doux » (par défaut, celui que l'auteur préfère) et « decoupe » (aplats, contours, ombres nettes).
 * Côté Node, seules les descriptions servent ; THREE n'existe que dans la page.
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
  const borne = (x) => Math.min(1, Math.max(0, x));

  /*
   * La caméra : une suite de mouvements, chacun entre deux instants du plan.
   *   tour                  tourne autour du centre de la scène
   *   spirale               tourne en montant et en se rapprochant
   *   plongee[:cible]       part de très haut et descend vers la cible
   *   contre-plongee:cible  regarde la cible depuis le sol
   *   zoom:cible            s'approche de la cible en resserrant le champ
   *   recul[:cible]         part de la cible et s'éloigne jusqu'au plan d'ensemble (bon pour une fin)
   *   travelling:cible      accompagne la cible de côté
   *   survol                passe au ras du sol à travers la scène
   *   large                 plan d'ensemble presque fixe
   * Réglages d'un mouvement : vitesse « vif » (part vite, finit doucement) ou « lent » (régulier) ; force (0,5 à 2) : amplitude.
   * Chaque mouvement donne une pose { p: position, l: point visé, f: angle de champ } pour u de 0 à 1.
   * Au début d'un mouvement, la pose glisse depuis la fin du précédent (pas de saut).
   */
  const MOUVEMENTS = ['tour', 'spirale', 'plongee', 'contre-plongee', 'zoom', 'recul', 'travelling', 'survol', 'large'];
  const v3 = (a, b, u) => [entre(a[0], b[0], u), entre(a[1], b[1], u), entre(a[2], b[2], u)];
  const allure = (u, vitesse) => (vitesse === 'vif' ? 1 - (1 - u) ** 3 : vitesse === 'lent' ? u : doux(u));
  function pose(item, u, ctx) {
    const [nom, cibleNom] = String(item.m).split(':');
    const C = ctx.centre, R = ctx.rayon, e = allure(u, item.vitesse), F = item.force || 1;
    const cible = ctx.cible(cibleNom || ctx.cibleParDefaut);
    const [a0, ouverture] = ctx.tour;
    const large = [C[0] - R * 0.5, C[1] + R * 0.36, C[2] + R * 0.95];
    const pres = () => {
      const d = [large[0] - cible[0], large[1] - cible[1], large[2] - cible[2]], n = Math.hypot(d[0], d[1], d[2]), k = ctx.approche / F / n;
      return [cible[0] + d[0] * k, cible[1] + d[1] * k + 0.5, cible[2] + d[2] * k];
    };
    switch (nom) {
      case 'tour': { const a = a0 + e * ouverture * F; return { p: [C[0] + R * Math.cos(a), C[1] + R * 0.42, C[2] + R * Math.sin(a)], l: [C[0], C[1] + 1.2, C[2]], f: 44 }; }
      case 'spirale': { const a = a0 + e * ouverture * 1.25 * F, r = R * (1.05 - 0.4 * e); return { p: [C[0] + r * Math.cos(a), C[1] + R * (0.12 + 0.62 * e), C[2] + r * Math.sin(a)], l: [C[0], C[1] + 1.2 + e, C[2]], f: entre(48, 40, e) }; }
      case 'plongee': return { p: v3([cible[0] + 3, C[1] + R * 1.5 * F, cible[2] + 9], [cible[0] + 2, cible[1] + 5, cible[2] + 6.5], e), l: cible, f: entre(50, 40, e) };
      case 'contre-plongee': return { p: v3([cible[0] + 2.2, Math.max(0.5, cible[1] - 0.9), cible[2] + 4.8], [cible[0] - 1.6, Math.max(0.5, cible[1] - 0.9), cible[2] + 3.9 / F], e), l: [cible[0], cible[1] + 1.3, cible[2]], f: 52 };
      case 'zoom': return { p: v3(large, pres(), e), l: v3([C[0], C[1] + 1.2, C[2]], cible, Math.min(1, e * 1.6)), f: entre(44, Math.max(18, 44 - 14 * F), e) };
      case 'recul': return { p: v3(pres(), large, e), l: v3(cible, [C[0], C[1] + 1.2, C[2]], e), f: entre(30, 46, e) };
      case 'travelling': return { p: [cible[0] + entre(-3.6, 3.6, e) * F, cible[1] + 1.1, cible[2] + 7], l: [cible[0], cible[1] + 0.2, cible[2]], f: 36 };
      case 'survol': { const p = v3([C[0] - R * 0.9, C[1] + 1.6, C[2] + R * 0.75], [C[0] + R * 0.5, C[1] + 2.6, C[2] + R * 0.1], e); return { p, l: [p[0] + 6, p[1] - 0.9, p[2] - 5], f: 52 }; }
      default: return { p: [C[0] - R * 0.25 + e * R * 0.2, C[1] + R * 0.34, C[2] + R * 1.05], l: [C[0], C[1] + 1.4, C[2]], f: 44 };
    }
  }
  // liste : [{ m: 'zoom:paysan', t: début en secondes dans le plan, vitesse, force }], triés par t.
  // accents : les instants des mots forts ; la caméra y donne un petit coup de zoom.
  function piloter(camera, liste, ctx, t, d, accents) {
    const s = liste && liste.length ? liste : ctx.parDefaut;
    let i = 0; while (i + 1 < s.length && t >= s[i + 1].t) i += 1;
    const debut = s[i].t || 0, fin = i + 1 < s.length ? s[i + 1].t : d;
    let q = pose(s[i], borne((t - debut) / Math.max(0.01, fin - debut)), ctx);
    const fondu = Math.min(0.8, (fin - debut) * 0.35);
    if (i > 0 && t - debut < fondu) {
      const avant = pose(s[i - 1], 1, ctx), k = doux((t - debut) / fondu);
      q = { p: v3(avant.p, q.p, k), l: v3(avant.l, q.l, k), f: entre(avant.f, q.f, k) };
    }
    // Un léger flottement, pour que la caméra ne paraisse pas posée sur un rail.
    const p = [q.p[0] + Math.sin(t * 0.7) * 0.1, q.p[1] + Math.sin(t * 0.9 + 1) * 0.07, q.p[2] + Math.sin(t * 0.6 + 2) * 0.08];
    let coup = 0;
    (accents || []).forEach((ta) => { const x = t - ta; if (x > -0.15 && x < 0.7) coup += Math.exp(-(((x - 0.1) / 0.17) ** 2)); });
    const f = q.f * (1 - 0.05 * Math.min(1.2, coup));
    camera.position.set(p[0], p[1], p[2]); camera.lookAt(q.l[0], q.l[1], q.l[2]);
    if (Math.abs(camera.fov - f) > 1e-4) { camera.fov = f; camera.updateProjectionMatrix(); }
  }

  // Deux aspects, au choix de l'épisode ("aspect3d") : « doux » (par défaut : facettes éclairées en dégradé, ombres douces)
  // ou « decoupe » (aplats à trois tons, contours, ombres nettes).
  let ASPECT = 'doux';
  function rendu(canvas, fond, aspect) {
    ASPECT = aspect === 'decoupe' ? 'decoupe' : 'doux';
    const T = THREE;
    const r = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(canvas.width, canvas.height, false);
    r.shadowMap.enabled = true; r.shadowMap.type = ASPECT === 'decoupe' ? T.BasicShadowMap : T.PCFSoftShadowMap;
    const scene = new T.Scene(); scene.background = new T.Color(fond); scene.fog = new T.Fog(fond, 18, 46);
    const camera = new T.PerspectiveCamera(42, canvas.width / canvas.height, 0.1, 200);
    return { T, r, scene, camera, afficher: () => r.render(scene, camera) };
  }
  // Les aplats : une rampe à trois tons (ombre, demi-teinte, lumière) partagée par toutes les matières.
  let rampe = null;
  const tons = (T) => {
    if (!rampe) { rampe = new T.DataTexture(new Uint8Array([110, 110, 110, 255, 185, 185, 185, 255, 255, 255, 255, 255]), 3, 1, T.RGBAFormat); rampe.minFilter = T.NearestFilter; rampe.magFilter = T.NearestFilter; rampe.needsUpdate = true; }
    return rampe;
  };
  const mat = (T, couleur, plus) => (ASPECT === 'decoupe' ? new T.MeshToonMaterial(Object.assign({ color: couleur, gradientMap: tons(T) }, plus || {})) : new T.MeshLambertMaterial(Object.assign({ color: couleur }, plus || {})));
  // Une forme à facettes : chaque face a sa propre teinte.
  const forme = (T, geo, couleur, ombre) => { const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); const m = new T.Mesh(g, mat(T, couleur)); m.castShadow = ombre !== false; return m; };
  // Un contour fin et sombre sur les arêtes marquées.
  const contour = (T, m, couleur) => { if (ASPECT === 'decoupe') m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry, 30), new T.LineBasicMaterial({ color: couleur || 0x16222c }))); return m; };
  // Un membre : un cylindre posé entre deux points.
  function membre(T, a, b, rayon, couleur) {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b), dir = vb.clone().sub(va);
    const m = forme(T, new T.CylinderGeometry(rayon, rayon, dir.length(), 7), couleur);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    return m;
  }

  return {
    // La rizière en volume : une colline en terrasses inondées, le paysan et son buffle, une repiqueuse, des canards, une cabane, des palmiers, des aigrettes.
    riziere3d: {
      description: 'La rizière en 3D : colline en terrasses inondées, paysan à la palanche et son buffle, repiqueuse, canards, cabane au sommet, palmiers, aigrettes, montagnes dans la brume, lumière du lever du jour.',
      accent: '#ffe08a',
      ambiance: 'campagne.wav',
      sons: [{ f: 'pas-eau.wav', t: 0.2, v: 0.2, boucle: true }],
      mouvements: MOUVEMENTS,
      cibles: ['paysan', 'buffle', 'repiqueuse', 'canards', 'cabane', 'palmier', 'soleil', 'oiseaux'],
      creer(canvas, p, aspect) {
        const { T, r, scene, camera, afficher } = rendu(canvas, '#f3b98c', aspect);
        scene.fog = new T.Fog(0xf3b98c, 28, 100);
        // Le ciel : une grande sphère dégradée, du bleu nuit en haut à l'orange à l'horizon.
        const ciel = new T.SphereGeometry(150, 24, 12), cc = [];
        for (let i = 0; i < ciel.attributes.position.count; i += 1) { const y = ciel.attributes.position.getY(i) / 150; const c = new T.Color(0xffd9a0).lerp(new T.Color(0xe8775a), borne(y * 2.2)).lerp(new T.Color(0x24406a), borne((y - 0.3) * 1.6)); cc.push(c.r, c.g, c.b); }
        ciel.setAttribute('color', new T.Float32BufferAttribute(cc, 3));
        scene.add(new T.Mesh(ciel, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })));
        const soleilPos = [-16, 8, -62];
        const astre = new T.Mesh(new T.SphereGeometry(6, 20, 12), new T.MeshBasicMaterial({ color: 0xfff3c4, fog: false })); scene.add(astre);
        const ambiante = new T.HemisphereLight(0xffe2c0, 0x3a6a4a, 0.6); scene.add(ambiante);
        const lum = new T.DirectionalLight(0xffb37a, 0.9); lum.castShadow = true;
        lum.shadow.mapSize.set(2048, 2048); Object.assign(lum.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); scene.add(lum);
        const h = suite(11);
        // Le sol : une plaine inondée.
        const plaine = new T.Mesh(new T.CylinderGeometry(90, 90, 0.2, 40), mat(T, 0x3a9092)); plaine.position.y = -0.1; plaine.receiveShadow = true; scene.add(plaine);
        // Une colline en terrasses. Le bord de chaque niveau ondule (somme de sinus fixe) : les terrasses ne sont pas des cercles parfaits.
        const verts = [0x4f9d50, 0x5fae4e, 0x6dbb62, 0x7cc46c, 0x58a84f, 0x69b65e, 0x4a964c, 0x73bf66];
        const onde = (a, phase) => 1 + 0.055 * Math.sin(3 * a + phase) + 0.035 * Math.sin(5 * a + phase * 2.3) + 0.02 * Math.sin(8 * a + phase * 0.7);
        const contourTerrasse = (rr, phase) => { const s = new T.Shape(); for (let k = 0; k <= 56; k += 1) { const a = (k / 56) * Math.PI * 2, d = rr * onde(a, phase); if (k) s.lineTo(d * Math.cos(a), d * Math.sin(a)); else s.moveTo(d, 0); } return s; };
        const touffes = [], eclats = [];
        const colline = (cx, cz, r0, niveaux, hauteur, phase) => {
          for (let i = 0; i < niveaux; i += 1) {
            const rr = r0 * (1 - i / (niveaux + 0.6)), y = i * hauteur, ph = phase + i * 0.35;
            const digue = contour(T, forme(T, new T.ExtrudeGeometry(contourTerrasse(rr, ph), { depth: hauteur, bevelEnabled: false, curveSegments: 1 }), verts[i % verts.length]), 0x2a5a32);
            // Le flanc de la digue reçoit des normales rayonnantes : sans cela, chaque facette prend un ton différent et le talus se raye.
            const nn = digue.geometry.attributes.normal, pp = digue.geometry.attributes.position;
            for (let k = 0; k < nn.count; k += 1) if (Math.abs(nn.getZ(k)) < 0.5) { const x = pp.getX(k), yy = pp.getY(k), l = Math.hypot(x, yy) || 1; nn.setXYZ(k, x / l, yy / l, 0); }
            digue.rotation.x = -Math.PI / 2; digue.position.set(cx, y, cz); digue.receiveShadow = true; scene.add(digue);
            const eau = new T.Mesh(new T.ShapeGeometry(contourTerrasse(rr - 0.24, ph)), mat(T, 0x3f9d9b, { emissive: 0x0a2226 }));
            eau.rotation.x = -Math.PI / 2; eau.position.set(cx, y + hauteur + 0.012, cz); eau.receiveShadow = true; scene.add(eau);
            // Le riz, planté en rangs qui suivent la courbe de la terrasse. (Dans le repère du monde, l'angle est inversé par la rotation.)
            const rInt = r0 * (1 - (i + 1) / (niveaux + 0.6)) + 0.45;
            for (let rang = rr - 0.55; rang > rInt; rang -= 0.34) {
              const n = Math.floor((2 * Math.PI * rang) / 0.3);
              for (let k = 0; k < n; k += 1) { const a = (k / n) * Math.PI * 2 + rang, d = rang * onde(a, ph); touffes.push([cx + d * Math.cos(a), y + hauteur + 0.1, cz - d * Math.sin(a), 0.7 + h() * 0.5]); }
            }
            for (let k = 0; k < Math.round(rr * 1.6); k += 1) { const a = h() * Math.PI * 2, d = (rInt + h() * (rr - 0.6 - rInt)) * onde(a, ph); eclats.push([cx + d * Math.cos(a), y + hauteur + 0.03, cz - d * Math.sin(a), h() * 6.28, 0.3 + h() * 0.5]); }
          }
        };
        const NIV = 8, HAUT = 0.62, R0 = 10, PHASE = 0.6;
        colline(0, 0, R0, NIV, HAUT, PHASE); colline(-19, -9, 7, 5, 0.6, 2.1); colline(18, -12, 8, 6, 0.6, 4.0); colline(-6, -25, 9, 6, 0.7, 1.3);
        // Les touffes de riz : un seul objet dessiné en série ; elles ondulent dans le nuanceur, selon leur place.
        const temps = { value: 0 };
        const matRiz = mat(T, 0x2f8a3c);
        matRiz.onBeforeCompile = (sh) => {
          sh.uniforms.uTemps = temps;
          sh.vertexShader = `uniform float uTemps;\n${sh.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed.x += sin(uTemps * 2.1 + instanceMatrix[3][0] * 0.8 + instanceMatrix[3][2] * 0.6) * 0.3 * (position.y + 0.11);');
        };
        const riz = new T.InstancedMesh(new T.ConeGeometry(0.05, 0.22, 4), matRiz, touffes.length), M = new T.Object3D();
        touffes.forEach(([x, y, z, e], i) => { M.position.set(x, y, z); M.scale.set(e, e, e); M.rotation.set(0, i, 0); M.updateMatrix(); riz.setMatrixAt(i, M.matrix); });
        scene.add(riz);
        // Les éclats de lumière sur l'eau : ils s'allument et s'éteignent chacun à son rythme.
        const scintille = new T.InstancedMesh(new T.BoxGeometry(1, 0.01, 0.07), new T.MeshBasicMaterial({ color: 0xffffff, fog: false }), eclats.length); scene.add(scintille);
        // La cabane au sommet.
        const sommet = NIV * HAUT;
        const cabane = new T.Group(); cabane.position.set(0, sommet, 0); scene.add(cabane);
        const murs = contour(T, forme(T, new T.BoxGeometry(1.5, 1, 1.2), 0xb07a4a)); murs.position.y = 0.8;
        const toit = contour(T, forme(T, new T.ConeGeometry(1.55, 0.95, 4), 0xe9c66a)); toit.position.y = 1.78; toit.rotation.y = Math.PI / 4;
        const porte = forme(T, new T.BoxGeometry(0.4, 0.62, 0.05), 0x4a2f1f, false); porte.position.set(0.2, 0.62, 0.61);
        cabane.add(murs, toit, porte); [[-0.6, -0.45], [0.6, -0.45], [-0.6, 0.45], [0.6, 0.45]].forEach(([x, z]) => cabane.add(membre(T, [x, 0, z], [x, 0.3, z], 0.06, 0x5a3d2b)));
        // Les palmiers.
        const palmier = (x, y, z, e) => {
          const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(e); scene.add(g);
          g.add(membre(T, [0, 0, 0], [0.15, 1.7, 0.05], 0.14, 0x5a3d2b), membre(T, [0.15, 1.7, 0.05], [0.35, 3.3, 0.12], 0.12, 0x6a4a35));
          const palmes = new T.Group(); palmes.position.set(0.35, 3.3, 0.12); g.add(palmes);
          for (let k = 0; k < 8; k += 1) { const a = k * 0.785, f = contour(T, forme(T, new T.ConeGeometry(0.3, 2.3, 4), k % 2 ? 0x2f8a45 : 0x3fa052), 0x1f5a30); f.scale.z = 0.22; f.position.set(Math.cos(a) * 0.95, -0.28, Math.sin(a) * 0.95); f.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25); palmes.add(f); }
          return palmes;
        };
        const palmes = [palmier(8.9, HAUT, 5.6, 1), palmier(-9.4, HAUT, 3.9, 0.85), palmier(12.8, 0, 8.4, 1.15), palmier(-13.5, 0, 6.5, 1.05)];
        // Un personnage au chapeau conique. Renvoie ses parties mobiles.
        const personne = (habit) => {
          const g = new T.Group(); scene.add(g);
          const haut = new T.Group(); haut.position.y = 0.44; g.add(haut);
          const corps = contour(T, forme(T, new T.CylinderGeometry(0.16, 0.21, 0.6, 7), habit)); corps.position.y = 0.3;
          const tete = forme(T, new T.IcosahedronGeometry(0.15, 1), 0xe2b48c); tete.position.y = 0.74;
          const chapeau = contour(T, forme(T, new T.ConeGeometry(0.48, 0.27, 12), 0xf4e4ae), 0xa8924e); chapeau.position.y = 0.95;
          const bg = new T.Group(), bd = new T.Group(); bg.position.set(-0.19, 0.55, 0); bd.position.set(0.19, 0.55, 0);
          bg.add(membre(T, [0, 0, 0], [-0.05, -0.42, 0.04], 0.055, 0xe2b48c)); bd.add(membre(T, [0, 0, 0], [0.05, -0.42, 0.04], 0.055, 0xe2b48c));
          haut.add(corps, tete, chapeau, bg, bd);
          const jg = new T.Group(), jd = new T.Group(); jg.position.set(-0.09, 0.44, 0); jd.position.set(0.09, 0.44, 0);
          jg.add(membre(T, [0, 0, 0], [0, -0.44, 0], 0.07, 0x22323f)); jd.add(membre(T, [0, 0, 0], [0, -0.44, 0], 0.07, 0x22323f)); g.add(jg, jd);
          return { g, haut, bg, bd, jg, jd };
        };
        // Le paysan : il porte une palanche (une perche et deux paniers) et marche derrière son buffle, sur la deuxième terrasse.
        const paysan = personne(0x2f5f9a);
        const palanche = new T.Group(); palanche.position.y = 0.62; paysan.haut.add(palanche);
        palanche.add(membre(T, [-0.8, 0, 0], [0.8, 0, 0], 0.025, 0x8a6a45));
        [-0.78, 0.78].forEach((x) => { const panier = contour(T, forme(T, new T.CylinderGeometry(0.19, 0.13, 0.2, 8), 0xc9a25a)); panier.position.set(x, -0.42, 0); palanche.add(panier, membre(T, [x, 0, 0], [x, -0.34, 0], 0.012, 0x5a3d2b)); });
        const buffle = new T.Group(); scene.add(buffle);
        const tronc = contour(T, forme(T, new T.BoxGeometry(0.64, 0.6, 1.3), 0x3b3f46)); tronc.position.y = 0.74;
        const cou = new T.Group(); cou.position.set(0, 0.86, 0.6); buffle.add(cou);
        const teteB = contour(T, forme(T, new T.BoxGeometry(0.4, 0.4, 0.52), 0x33373d)); teteB.position.set(0, 0, 0.28);
        cou.add(teteB, membre(T, [-0.18, 0.18, 0.3], [-0.5, 0.42, 0.14], 0.045, 0xe6dfd0), membre(T, [0.18, 0.18, 0.3], [0.5, 0.42, 0.14], 0.045, 0xe6dfd0), membre(T, [-0.5, 0.42, 0.14], [-0.44, 0.62, 0.3], 0.035, 0xe6dfd0), membre(T, [0.5, 0.42, 0.14], [0.44, 0.62, 0.3], 0.035, 0xe6dfd0));
        const queue = new T.Group(); queue.position.set(0, 0.95, -0.65); queue.add(membre(T, [0, 0, 0], [0, -0.5, -0.12], 0.03, 0x33373d)); buffle.add(tronc, queue);
        const pattes = [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].map(([x, z]) => { const g = new T.Group(); g.position.set(x, 0.46, z); g.add(membre(T, [0, 0, 0], [0, -0.46, 0], 0.085, 0x33373d)); buffle.add(g); return g; });
        // La repiqueuse : penchée sur l'eau, elle plante le riz d'un geste répété. Elle ne se déplace pas.
        const repiqueuse = personne(0xc2496b);
        const niveau = (i, a) => ({ rayon: (R0 * (1 - i / (NIV + 0.6))) * onde(a, PHASE + i * 0.35), y: (i + 1) * HAUT + 0.03 });
        const aR = -2.05, nR = niveau(0, aR); repiqueuse.g.position.set((nR.rayon - 1.4) * Math.cos(aR), nR.y, -(nR.rayon - 1.4) * Math.sin(aR)); repiqueuse.g.rotation.y = 0.6;
        const posRepiqueuse = [repiqueuse.g.position.x, nR.y + 0.6, repiqueuse.g.position.z];
        // Les canards : ils nagent en file sur la plaine inondée, devant la colline.
        const canards = [0, 1, 2].map((k) => {
          const g = new T.Group(); scene.add(g);
          const c = contour(T, forme(T, new T.IcosahedronGeometry(0.2, 0), 0xf2ead8), 0x8a8270); c.scale.set(0.8, 0.6, 1.25); c.position.y = 0.1;
          const t2 = forme(T, new T.IcosahedronGeometry(0.11, 0), 0xf2ead8); t2.position.set(0, 0.3, 0.2);
          const bec = forme(T, new T.ConeGeometry(0.045, 0.14, 5), 0xf29a2e, false); bec.rotation.x = Math.PI / 2; bec.position.set(0, 0.29, 0.34);
          g.add(c, t2, bec); return { g, k };
        });
        // Les aigrettes : deux ailes blanches qui battent, en cercle au-dessus de la colline.
        const oiseaux = [0, 1, 2].map((k) => {
          const g = new T.Group(); scene.add(g);
          const ag = new T.Mesh(new T.BoxGeometry(0.75, 0.04, 0.26), new T.MeshBasicMaterial({ color: 0xffffff })); ag.geometry.translate(0.375, 0, 0);
          const ad = ag.clone(); ad.scale.x = -1; g.add(ag, ad); return { g, ag, ad, k };
        });
        // Les montagnes en pain de sucre.
        for (let k = 0; k < 18; k += 1) { const m = forme(T, new T.ConeGeometry(4 + h() * 5, 12 + h() * 16, 6), k % 2 ? 0x4f7f78 : 0x6f8fa6, false); m.position.set(-72 + k * 8.4 + h() * 4, 5.5, -40 - h() * 26); m.scale.x = 0.8 + h() * 0.5; scene.add(m); }
        // La brume : deux nappes dont la transparence est un dégradé (dense au milieu, nulle aux bords).
        const voile = new Uint8Array(4 * 32); for (let i = 0; i < 32; i += 1) { const a = Math.sin((i / 31) * Math.PI) ** 2; voile.set([255, 255, 255, Math.round(255 * a)], i * 4); }
        const texBrume = new T.DataTexture(voile, 1, 32, T.RGBAFormat); texBrume.magFilter = T.LinearFilter; texBrume.minFilter = T.LinearFilter; texBrume.needsUpdate = true;
        const brumes = [[-32, 3.2, 0.5], [-47, 6, 0.4]].map(([z, y, o]) => { const b = new T.Mesh(new T.PlaneGeometry(260, 11), new T.MeshBasicMaterial({ map: texBrume, transparent: true, opacity: o, fog: false, depthWrite: false })); b.position.set(0, y, z); scene.add(b); return b; });

        const Rp = (a) => niveau(1, a).rayon - 1.0, yp = 2 * HAUT + 0.03;
        const pos = { paysan: [0, 0, 0], buffle: [0, 0, 0], oiseaux: [0, 0, 0], canards: [0, 0, 0] };
        const ctx = { centre: [0, 2.2, 0], rayon: 19, approche: 7.5, tour: [0.95, 1.9], cibleParDefaut: 'paysan', parDefaut: [{ m: 'spirale', t: 0 }],
          cible: (nom) => ({ paysan: pos.paysan, buffle: pos.buffle, oiseaux: pos.oiseaux, canards: pos.canards, repiqueuse: posRepiqueuse, cabane: [0, sommet + 1.1, 0], palmier: [9.2, HAUT + 3, 5.7], soleil: [soleilPos[0] * 0.5, 6, -20] }[nom] || pos.paysan) };
        const E = new T.Object3D();
        return {
          maj(t, d) {
            const u = borne(t / d);
            temps.value = t;
            // Le jour se lève : le soleil monte, la lumière passe de l'orange au doré.
            astre.position.set(soleilPos[0], soleilPos[1] + u * 4, soleilPos[2]);
            lum.position.set(-13, 9 + u * 6, -7); lum.color.setRGB(1, entre(0.7, 0.87, u), entre(0.48, 0.68, u)); // L'aspect doux a besoin de plus de lumière que les aplats, sinon les talus sont trop sombres.
            const plus = ASPECT === 'decoupe' ? 0 : 0.22;
            lum.intensity = entre(0.85, 1, u) + plus;
            ambiante.intensity = entre(0.55, 0.68, u) + plus;
            // Le paysan et son buffle avancent le long de la terrasse (angle inversé : même repère que les digues).
            const place = (g, a, cle, hy) => { const R = Rp(a); g.position.set(R * Math.cos(a), yp, -R * Math.sin(a)); g.rotation.y = a; pos[cle] = [g.position.x, yp + hy, g.position.z]; };
            const a = -1.06 - t * 0.02, pas = Math.sin(t * 5);
            place(paysan.g, a, 'paysan', 0.9); place(buffle, a - 0.19, 'buffle', 0.7);
            paysan.jg.rotation.x = pas * 0.45; paysan.jd.rotation.x = -pas * 0.45; paysan.bg.rotation.x = -pas * 0.2; paysan.bd.rotation.x = pas * 0.2;
            paysan.g.position.y = yp + Math.abs(pas) * 0.03; paysan.haut.rotation.z = pas * 0.03; palanche.rotation.z = Math.sin(t * 5 + 0.6) * 0.07;
            pattes.forEach((m, k) => { m.rotation.x = Math.sin(t * 4.4 + (k % 2 ? 0 : Math.PI) + (k > 1 ? 0.5 : 0)) * 0.34; });
            cou.rotation.x = 0.12 + Math.sin(t * 4.4) * 0.07; queue.rotation.z = Math.sin(t * 3.1) * 0.5;
            // La repiqueuse se penche, plante, se relève à demi.
            const geste = 0.5 + 0.5 * Math.sin(t * 2.4);
            repiqueuse.haut.rotation.x = 0.75 + geste * 0.45; repiqueuse.bg.rotation.x = -0.5 - geste * 0.5; repiqueuse.bd.rotation.x = -0.3 - (1 - geste) * 0.5;
            canards.forEach(({ g, k }) => { const b = 1.45 - t * 0.03 - k * 0.07; g.position.set(13.2 * Math.cos(b), 0.02 + Math.sin(t * 3 + k) * 0.015, 13.2 * Math.sin(b)); g.rotation.y = -b + Math.PI; g.rotation.z = Math.sin(t * 3 + k * 2) * 0.06; });
            pos.canards = [canards[1].g.position.x, 0.3, canards[1].g.position.z];
            oiseaux.forEach(({ g, ag, ad, k }) => { const b = 0.7 + t * 0.32 + k * 0.5; g.position.set(7.5 * Math.cos(b), 8.2 + k * 0.7 + Math.sin(t + k) * 0.4, 7.5 * Math.sin(b) - 2); g.rotation.y = -b; ag.rotation.z = Math.sin(t * 7 + k) * 0.6; ad.rotation.z = -Math.sin(t * 7 + k) * 0.6; });
            pos.oiseaux = [oiseaux[0].g.position.x, oiseaux[0].g.position.y, oiseaux[0].g.position.z];
            palmes.forEach((g, k) => { g.rotation.z = Math.sin(t * 1.3 + k) * 0.07; g.rotation.x = Math.sin(t * 1.1 + k * 2) * 0.06; });
            brumes.forEach((b, k) => { b.position.x = (k ? -1 : 1) * (t * 0.9 - 8); });
            eclats.forEach(([x, y, z, phase, taille], i) => { const s = Math.max(0, Math.sin(t * 1.7 + phase)) ** 3; E.position.set(x, y, z); E.scale.set(taille * s + 0.0001, 1, 1); E.updateMatrix(); scintille.setMatrixAt(i, E.matrix); });
            scintille.instanceMatrix.needsUpdate = true;
            piloter(camera, p && p.camera, ctx, t, d, p && p.accents);
            afficher();
          },
        };
      },
    },
    // Le mur d'escalade en volume : panneaux, prises, une voie orange, quelqu'un qui grimpe.
    mur3d: {
      sons: [{ f: 'craie.wav', t: 0.4, v: 0.45 }],
      description: 'Le mur d’escalade en 3D : panneaux, prises en volume, une voie orange, quelqu’un qui grimpe. Sans consigne, la caméra monte en spirale autour de lui.',
      accent: '#ff8a3d',
      mouvements: MOUVEMENTS,
      cibles: ['grimpeur', 'prise', 'sommet', 'sol'],
      creer(canvas, p, aspect) {
        const { T, r, scene, camera, afficher } = rendu(canvas, '#1a2030', aspect);
        scene.add(new T.HemisphereLight(0xffffff, 0x2a3350, 0.85));
        const soleil = new T.DirectionalLight(0xfff0d8, 1.05); soleil.position.set(7, 16, 11); soleil.castShadow = true;
        soleil.shadow.mapSize.set(2048, 2048); Object.assign(soleil.shadow.camera, { left: -9, right: 9, top: 20, bottom: -4, near: 1, far: 50 });
        scene.add(soleil);
        // Le mur : trois panneaux à plat (un panneau incliné recouvrirait les prises posées dessus).
        [[-4.2, 0x343c50], [0, 0x3c4660], [4.2, 0x2f374a]].forEach(([x, c]) => { const pan = forme(T, new T.BoxGeometry(4.2, 34, 0.4), c, false); pan.position.set(x, 15, -0.2); pan.receiveShadow = true; scene.add(pan); });
        for (let y = 2.4; y < 30; y += 2.4) { const l = forme(T, new T.BoxGeometry(12.6, 0.05, 0.05), 0x232a3a, false); l.position.set(0, y, 0.02); scene.add(l); }
        [-2.1, 2.1].forEach((x) => { const l = forme(T, new T.BoxGeometry(0.07, 34, 0.07), 0x232a3a, false); l.position.set(x, 15, 0.03); scene.add(l); });
        const sol = forme(T, new T.BoxGeometry(14, 0.5, 7), 0x2f6fd0, false); sol.position.set(0, -0.25, 3); sol.receiveShadow = true; scene.add(sol);
        // Les prises : des cailloux à facettes, à des places tirées d'une suite fixe.
        const h = suite(7), couleurs = [0xf2c14e, 0x3fae7c, 0xe0564a, 0x5b8cff, 0xb08cff, 0xf5f0e6];
        const prise = (x, y, taille, couleur, cerne) => {
          const g = forme(T, new T.DodecahedronGeometry(taille, 0), couleur); if (cerne) contour(T, g, 0x7a3a12);
          g.position.set(x, y, 0.12); g.scale.set(1 + h() * 0.6, 0.7 + h() * 0.5, 0.55); g.rotation.set(h() * 3, h() * 3, h() * 3); scene.add(g);
        };
        for (let i = 0; i < 190; i += 1) prise(-6 + h() * 12, 0.6 + h() * 27, 0.2 + h() * 0.24, couleurs[Math.floor(h() * couleurs.length)]);
        const voie = (y) => 0.2 + Math.sin(y * 0.85) * 1.15;
        for (let y = 0.8; y < 28; y += 0.85) prise(voie(y) + (h() - 0.5) * 0.5, y, 0.3, 0xff8a3d, true);
        // La personne qui grimpe, de dos : formes simples.
        const g = new T.Group(); scene.add(g);
        const peau = 0xf3c6a0, pantalon = 0x2e5a66;
        const torse = contour(T, forme(T, new T.BoxGeometry(0.62, 0.9, 0.34), 0xff8a3d)); torse.position.set(0, 0.25, 0); g.add(torse);
        const bassin = contour(T, forme(T, new T.BoxGeometry(0.6, 0.34, 0.34), pantalon)); bassin.position.set(0, -0.36, 0); g.add(bassin);
        const tete = forme(T, new T.IcosahedronGeometry(0.24, 1), 0x3a2a22); tete.position.set(0, 0.98, 0.02); g.add(tete);
        const sac = forme(T, new T.CylinderGeometry(0.13, 0.11, 0.24, 8), 0xe0564a); sac.position.set(0.18, -0.42, 0.26); g.add(sac);
        g.add(membre(T, [0.3, 0.6, 0], [0.62, 0.95, -0.2], 0.085, peau), membre(T, [0.62, 0.95, -0.2], [0.7, 1.5, -0.42], 0.075, peau));
        const bras = new T.Group(); bras.position.set(-0.3, 0.6, 0); g.add(bras);
        bras.add(membre(T, [0, 0, 0], [-0.3, 0.45, -0.18], 0.085, peau), membre(T, [-0.3, 0.45, -0.18], [-0.36, 1.0, -0.42], 0.075, peau));
        g.add(membre(T, [-0.18, -0.5, 0], [-0.52, -0.95, -0.12], 0.11, pantalon), membre(T, [-0.52, -0.95, -0.12], [-0.42, -1.5, -0.36], 0.095, pantalon));
        g.add(membre(T, [0.18, -0.5, 0], [0.42, -1.15, -0.05], 0.11, pantalon), membre(T, [0.42, -1.15, -0.05], [0.36, -1.8, -0.36], 0.095, pantalon));
        g.add(membre(T, [0, -0.3, -0.3], [0.1, 30, -0.3], 0.03, 0xf5f0e6));
        // La caméra reste devant le mur : le tour est un arc, pas un cercle complet.
        const ctx = { centre: [0, 5, 0], rayon: 11.5, approche: 4.2, tour: [0.85, 1.15], cibleParDefaut: 'grimpeur', parDefaut: [{ m: 'spirale', t: 0 }], cible: () => [0, 5, 0] };
        return {
          maj(t, d) {
            const y = entre(4.6, 7.4, doux(borne(t / d)));
            g.position.set(voie(y) * 0.6, y + Math.sin(t * 2.6) * 0.05, 0.62);
            bras.rotation.z = Math.sin(t * 2.6) * 0.16;
            ctx.centre = [0, y - 1.2, 0];
            ctx.cible = (nom) => ({ grimpeur: [g.position.x, y + 0.2, 0.6], prise: [voie(y + 1.9), y + 1.9, 0.2], sommet: [0, 26, 0.3], sol: [0, 0.4, 3] }[nom] || [g.position.x, y + 0.2, 0.6]);
            piloter(camera, p && p.camera, ctx, t, d, p && p.accents);
            afficher();
          },
        };
      },
    },
  };
});
