/*
 * L'orbe de la chaîne « avis » : une goutte de verre organique lumineuse, posée au-dessus des sous-titres, entourée d'un halo et de particules
 * qui gravitent autour d'elle (comme des petites planètes : plus elles sont près, plus elles vont vite). Elle bat au rythme de la voix.
 *   niveaux(mots, duree, pas)         repli : niveau de voix (0 à 99) déduit des mots affichés
 *   niveauxAudio(echantillons, taux, pas)  le niveau mesuré sur la voix montée (enveloppe, attaque 35 ms, descente 140 ms)
 *   dessiner(ctx, n, t, couleurs)     dessine l'orbe sur un canevas 900 × 900 pour le niveau n (0 à 1) à l'instant t ; la sphère est une goutte organique dont le contour ondule
 * Tout est une fonction de t et de n : ni minuterie, ni répétition infinie ; la « dispersion » des particules vient d'une fonction
 * de hachage de leur numéro, donc deux rendus sont identiques.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.orbe = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAILLE = 900, R = 118, PARTICULES = 150;
  const hash = (k, s) => { const x = Math.sin(k * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

  function lisser(brut, pas, attaque, descente) {
    const m = 1 - Math.exp(-1 / (attaque * pas)), d = 1 - Math.exp(-1 / (descente * pas));
    let v = 0;
    return brut.map((b) => { v += (b - v) * (b > v ? m : d); return Math.round(Math.min(1, Math.max(0, v)) * 99); });
  }

  // Repli sans audio : un mot = une bosse de niveau.
  function niveaux(mots, duree, pas = 30) {
    const n = Math.max(1, Math.ceil(duree * pas) + 1), brut = new Array(n).fill(0);
    (mots || []).forEach((m) => {
      const d = Math.max(0.05, m.f - m.t);
      for (let i = Math.max(0, Math.floor(m.t * pas)); i <= Math.min(n - 1, Math.ceil(m.f * pas)); i += 1) {
        const x = Math.min(1, Math.max(0, (i / pas - m.t) / d));
        brut[i] = Math.max(brut[i], 0.62 + 0.38 * Math.sqrt(Math.sin(Math.PI * x)));
      }
    });
    return lisser(brut, pas, 0.08, 0.25);
  }

  // Le vrai rythme de la voix : l'énergie (RMS) de chaque pas, en décibels, ramenée entre le bruit de fond et les passages forts.
  function niveauxAudio(ech, taux, pas = 60) {
    const bloc = Math.max(1, Math.round(taux / pas)), n = Math.ceil(ech.length / bloc), db = new Array(n);
    for (let i = 0; i < n; i += 1) {
      let s = 0, c = 0;
      for (let j = i * bloc; j < Math.min(ech.length, (i + 1) * bloc); j += 1) { s += ech[j] * ech[j]; c += 1; }
      db[i] = 20 * Math.log10(Math.sqrt(s / Math.max(1, c)) + 1e-6);
    }
    const tri = db.slice().sort((a, b) => a - b), haut = tri[Math.floor(tri.length * 0.95)] || -20, bas = Math.max(haut - 34, -70);
    return lisser(db.map((v) => Math.pow(Math.min(1, Math.max(0, (v - bas) / Math.max(6, haut - bas))), 1.4)), pas, 0.035, 0.14);
  }

  function particule(ctx, x, y, taille, alpha, couleur) {
    ctx.fillStyle = `rgba(${couleur},${(alpha * 0.22).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, taille * 3.2, 0, 6.2832); ctx.fill();
    ctx.fillStyle = `rgba(${couleur},${Math.min(1, alpha).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, taille, 0, 6.2832); ctx.fill();
  }

  // Le contour organique : une somme de quelques ondulations lentes (2 à 5 lobes) dont l'amplitude grandit avec la voix, comme une goutte vivante.
  const LOBES = [[2, 0.5, 0.0, 0.05], [3, -0.7, 1.7, 0.045], [4, 0.9, 3.1, 0.03], [5, -1.2, 4.4, 0.02]];
  function rayon(a, t, n, Rs) {
    let d = 0;
    for (const [k, w, ph, amp] of LOBES) d += amp * (0.55 + 1.15 * n) * Math.sin(k * a + w * t * (1 + 1.2 * n) + ph);
    return Rs * (1 + d);
  }
  function chemin(ctx, cx, cy, t, n, Rs, echelle = 1) {
    const N = 72, pts = [];
    for (let i = 0; i < N; i += 1) { const a = (i / N) * 6.2832, r = rayon(a, t, n, Rs) * echelle; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    ctx.beginPath();
    ctx.moveTo((pts[N - 1][0] + pts[0][0]) / 2, (pts[N - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < N; i += 1) { const p = pts[i], q = pts[(i + 1) % N]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    ctx.closePath();
  }

  function rvb(h) { const v = parseInt(h.slice(1), 16); return `${(v >> 16) & 255},${(v >> 8) & 255},${v & 255}`; }

  function dessiner(ctx, n, t, c) {
    const cx = TAILLE / 2, cy = TAILLE / 2, A = rvb(c.a), B = rvb(c.b), C = rvb(c.c), L = rvb(c.clair);
    const Rs = R * (1 + 0.09 * n + 0.02 * Math.sin(t * 1.5) * (1 - n));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, TAILLE, TAILLE);
    ctx.globalCompositeOperation = 'lighter';
    // Le halo : un grand voile doux et une couronne serrée autour de la sphère.
    let g = ctx.createRadialGradient(cx, cy, Rs * 0.5, cx, cy, Rs * (2.6 + 0.9 * n));
    g.addColorStop(0, `rgba(${A},${(0.42 + 0.22 * n).toFixed(3)})`); g.addColorStop(0.35, `rgba(${B},${(0.18 + 0.14 * n).toFixed(3)})`); g.addColorStop(1, `rgba(${B},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, TAILLE, TAILLE);
    g = ctx.createRadialGradient(cx, cy, Rs * 0.9, cx, cy, Rs * (1.55 + 0.35 * n));
    g.addColorStop(0, `rgba(${L},${(0.42 + 0.2 * n).toFixed(3)})`); g.addColorStop(0.3, `rgba(${A},${(0.28 + 0.18 * n).toFixed(3)})`); g.addColorStop(1, `rgba(${A},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, TAILLE, TAILLE);

    // Les particules en gravitation : derrière la sphère (z < 0), puis devant.
    const poser = (devant) => {
      for (let k = 0; k < PARTICULES; k += 1) {
        const h = (s) => hash(k, s);
        const orbite = Rs * (1.32 + 1.75 * Math.pow(h(1), 1.5)), vitesse = 0.9 * Math.pow(Rs / orbite, 1.5), phase = h(2) * 6.2832;
        const ecrase = 0.22 + 0.6 * h(3), tilt = (h(4) - 0.5) * 1.5, poussee = 1 + 0.3 * n * (0.4 + h(5));
        for (let j = 0; j < 4; j += 1) {
          const a = phase + vitesse * (t - j * 0.035), rr = orbite * poussee;
          const lx = rr * Math.cos(a), ly = rr * ecrase * Math.sin(a), z = Math.sin(a);
          if ((z > 0) !== devant) continue;
          const x = cx + lx * Math.cos(tilt) - ly * Math.sin(tilt), y = cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);
          const taille = (1.1 + 2.4 * h(6)) * (0.8 + 0.4 * z) * (1 + 0.7 * n) * (1 - j * 0.22);
          const alpha = (0.28 + 0.6 * h(7)) * (0.62 + 0.38 * z) * (0.5 + 0.5 * n) * (1 - j * 0.28) * (0.8 + 0.2 * Math.sin(t * 2.2 + k));
          particule(ctx, x, y, taille, alpha, h(8) > 0.55 ? L : (h(8) > 0.25 ? A : B));
        }
      }
    };
    poser(false);

    // La sphère : un corps en dégradé, des nappes de lumière qui y dérivent, un bord lumineux, un reflet.
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); chemin(ctx, cx, cy, t, n, Rs); ctx.clip();
    g = ctx.createRadialGradient(cx - Rs * 0.34, cy - Rs * 0.4, 0, cx, cy, Rs * 1.28);
    g.addColorStop(0, `rgb(${L})`); g.addColorStop(0.22, `rgb(${A})`); g.addColorStop(0.62, `rgb(${B})`); g.addColorStop(1, `rgb(${C})`);
    ctx.fillStyle = g; ctx.fillRect(cx - Rs * 1.5, cy - Rs * 1.5, Rs * 3, Rs * 3);
    ctx.globalCompositeOperation = 'lighter';
    const nappes = [[A, 0.0, 0.9], [L, 2.1, 1.3], [C, 4.2, 0.7]];
    nappes.forEach(([col, ph, w], i) => {
      const amp = Rs * (0.22 + 0.26 * n), x = cx + amp * Math.sin(t * 0.8 * w + ph), y = cy + amp * Math.cos(t * 0.6 * w + ph * 1.3), r = Rs * (0.55 + 0.2 * n);
      const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
      gg.addColorStop(0, `rgba(${col},${(0.26 + 0.12 * n).toFixed(3)})`); gg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gg; ctx.fillRect(cx - Rs * 1.5, cy - Rs * 1.5, Rs * 3, Rs * 3);
    });
    ctx.globalCompositeOperation = 'source-over';
    g = ctx.createRadialGradient(cx, cy, Rs * 0.62, cx, cy, Rs * 1.1);
    g.addColorStop(0, `rgba(${L},0)`); g.addColorStop(0.8, `rgba(${L},${(0.18 + 0.2 * n).toFixed(3)})`); g.addColorStop(1, `rgba(${L},${(0.6 + 0.2 * n).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(cx - Rs * 1.5, cy - Rs * 1.5, Rs * 3, Rs * 3);
    // Le reflet de verre en haut à gauche.
    ctx.save(); ctx.translate(cx - Rs * 0.38 + 6 * Math.sin(t * 0.5), cy - Rs * 0.46); ctx.rotate(-0.6); ctx.scale(1, 0.55);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, Rs * 0.42); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, Rs * 0.42, 0, 6.2832); ctx.fill(); ctx.restore();
    ctx.restore();

    ctx.globalCompositeOperation = 'lighter';
    poser(true);
    // Le bord lumineux suit la forme : un trait fin et un voile de lumière qui s'intensifie avec la voix.
    chemin(ctx, cx, cy, t, n, Rs); ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(${L},${(0.45 + 0.35 * n).toFixed(3)})`; ctx.stroke();
    chemin(ctx, cx, cy, t, n, Rs, 1.03); ctx.lineWidth = 9 + 10 * n; ctx.strokeStyle = `rgba(${A},${(0.12 + 0.18 * n).toFixed(3)})`; ctx.stroke();
    ctx.restore();
  }

  return { niveaux, niveauxAudio, dessiner, TAILLE };
});
