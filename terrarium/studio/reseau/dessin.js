/*
 * Le dessin du « cerveau vivant », exécuté dans la page : dessiner(ctx, modele, etat, t, rendu).
 * Fonction pure de (modele, etat, t) : même instant, même image. Aucun hasard ici.
 * etat = { cam: { cx, cy, zoom, rot }, act: { zone: 0..1 }, decharges: 0..1, couleurs: { base, froid, chaud, ambre } }
 * rendu : 'constellation' | 'bioluminescent' | 'donnees'.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.reseauDessin = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, ECHELLE = 1.22;
  // Couleur de chaque zone quand elle s'active.
  const TEINTE = { amygdale: 'chaud', insula: 'chaud', striatum: 'ambre', pfc: 'froid', hippocampe: 'froid', cortex: 'froid', cervelet: 'froid' };

  const rvb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const melange = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const css = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

  const sprites = {};
  function sprite(couleur, r) {
    const cle = couleur.join(',') + r;
    if (sprites[cle]) return sprites[cle];
    const c = document.createElement('canvas'); c.width = c.height = r * 2;
    const g = c.getContext('2d'), d = g.createRadialGradient(r, r, 0, r, r, r);
    d.addColorStop(0, css(couleur, 1)); d.addColorStop(0.25, css(couleur, 0.5)); d.addColorStop(1, css(couleur, 0));
    g.fillStyle = d; g.fillRect(0, 0, r * 2, r * 2);
    return (sprites[cle] = c);
  }

  function projeter(m, etat) {
    const { cx, cy, zoom, rot } = etat.cam;
    const cs = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    const X = new Float32Array(m.n), Y = new Float32Array(m.n);
    for (let i = 0; i < m.n; i += 1) {
      // Rotation légère autour de l’axe vertical, puis parallaxe : les neurones proches bougent plus.
      const dx = m.x[i] - 420, dz = m.z[i] * 110;
      const xr = 420 + dx * cs + dz * sn;
      const p = zoom * ECHELLE * (1 + m.z[i] * 0.05 * zoom);
      X[i] = W / 2 + (xr - cx) * p;
      Y[i] = H / 2 + (m.y[i] - cy) * p;
    }
    return { X, Y };
  }

  function dessiner(ctx, m, etat, t, rendu) {
    const coul = { base: rvb(etat.couleurs.base), froid: rvb(etat.couleurs.froid), chaud: rvb(etat.couleurs.chaud), ambre: rvb(etat.couleurs.ambre) };
    const act = etat.act;
    ctx.clearRect(0, 0, W, H);
    const { X, Y } = projeter(m, etat);
    const a = (i) => act[m.zone[i]] || 0;
    const couleurDe = (i) => melange(coul.base, coul[TEINTE[m.zone[i]]], Math.min(1, a(i) * 1.1));
    const vie = (i) => 0.78 + 0.22 * Math.sin(t * m.vitesse[i] * 2.2 + m.phase[i]);

    // Liaisons : d’abord le réseau au repos, en un seul tracé ; puis les liaisons actives, par teinte.
    ctx.lineWidth = rendu === 'donnees' ? 0.8 : rendu === 'bioluminescent' ? 0.9 : 0.6;
    ctx.strokeStyle = css(coul.base, rendu === 'donnees' ? 0.22 : 0.16);
    ctx.beginPath();
    for (const [i, j] of m.liaisons) {
      if (Math.min(a(i), a(j)) > 0.25) continue;
      ctx.moveTo(X[i], Y[i]);
      if (rendu === 'donnees') ctx.lineTo(X[j], Y[i]);
      ctx.lineTo(X[j], Y[j]);
    }
    ctx.stroke();
    for (const teinte of ['froid', 'chaud', 'ambre']) {
      ctx.beginPath();
      let k = 0;
      for (const [i, j] of m.liaisons) {
        const v = Math.min(a(i), a(j));
        if (v <= 0.25 || TEINTE[m.zone[i]] !== teinte) continue;
        ctx.moveTo(X[i], Y[i]); if (rendu === 'donnees') ctx.lineTo(X[j], Y[i]); ctx.lineTo(X[j], Y[j]); k += 1;
      }
      if (!k) continue;
      ctx.strokeStyle = css(coul[teinte], rendu === 'bioluminescent' ? 0.55 : 0.45);
      ctx.lineWidth = rendu === 'bioluminescent' ? 1.4 : 1;
      ctx.stroke();
    }

    // Neurones.
    if (rendu === 'bioluminescent') ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < m.n; i += 1) {
      const v = a(i), b = (0.22 + 0.78 * v) * vie(i);
      const c = couleurDe(i), r = m.taille[i] * (1 + m.z[i] * 0.25) * (1 + v * 0.6) * etat.cam.zoom;
      if (rendu === 'bioluminescent') {
        const s = sprite(c, 24), d = r * (5 + v * 2.5);
        ctx.globalAlpha = Math.min(1, b * (0.85 - 0.45 * v));
        ctx.drawImage(s, X[i] - d / 2, Y[i] - d / 2, d, d);
      } else if (rendu === 'donnees') {
        ctx.fillStyle = css(c, Math.min(1, b));
        const d = 1.6 + r * 1.8; ctx.fillRect(X[i] - d / 2, Y[i] - d / 2, d, d);
      } else {
        ctx.fillStyle = css(c, Math.min(1, b));
        ctx.beginPath(); ctx.arc(X[i], Y[i], 0.9 + r * 1.1, 0, 6.283); ctx.fill();
        if (v > 0.5) { ctx.fillStyle = css(c, 0.12 * v); ctx.beginPath(); ctx.arc(X[i], Y[i], 6 + r * 4, 0, 6.283); ctx.fill(); }
      }
    }
    ctx.globalAlpha = 1;

    // Décharges : des impulsions qui courent sur les liaisons des zones actives.
    if (etat.decharges > 0) {
      ctx.globalCompositeOperation = 'lighter';
      m.liaisons.forEach(([i, j], k) => {
        const v = Math.max(a(i), a(j)) * etat.decharges;
        if (v < 0.3 || k % 4) return;
        const p = (t * (0.7 + (k % 7) * 0.12) + k * 0.618) % 1;
        const x = X[i] + (X[j] - X[i]) * p, y = Y[i] + (Y[j] - Y[i]) * p;
        const c = coul[TEINTE[m.zone[i]]];
        const s = sprite(melange(c, [255, 255, 255], 0.3), 16), d = 8 + 6 * v * etat.cam.zoom;
        ctx.globalAlpha = Math.min(1, v * Math.sin(Math.PI * p));
        ctx.drawImage(s, x - d / 2, y - d / 2, d, d);
      });
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
    return { X, Y };
  }

  // Position à l’écran du centre d’une zone (pour poser une étiquette).
  function ecranDe(zone, etat, ZONES) {
    const z = ZONES[zone], p = etat.cam.zoom * ECHELLE;
    return { x: W / 2 + (z.cx - etat.cam.cx) * p, y: H / 2 + (z.cy - etat.cam.cy) * p };
  }

  return { dessiner, ecranDe, W, H };
});
