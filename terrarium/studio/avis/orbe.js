/*
 * L'orbe de la chaîne « avis » : une goutte de verre organique lumineuse, posée au-dessus des sous-titres, entourée d'un halo et de particules
 * qui gravitent autour d'elle (comme des petites planètes : plus elles sont près, plus elles vont vite). Elle bat au rythme de la voix.
 *   niveaux(mots, duree, pas)         repli : niveau de voix (0 à 99) déduit des mots affichés
 *   niveauxAudio(echantillons, taux, pas)  le niveau mesuré sur la voix montée (enveloppe lissée en deux passes)
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

  // Un filtre à une constante de temps pour la montée (attaque) et une autre pour la descente, en secondes.
  function filtre(brut, pas, attaque, descente) {
    const m = 1 - Math.exp(-1 / (attaque * pas)), d = 1 - Math.exp(-1 / (descente * pas));
    let v = 0;
    return brut.map((b) => { v += (b - v) * (b > v ? m : d); return v; });
  }
  const entiers = (a) => a.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 99));
  function lisser(brut, pas, attaque, descente) { return entiers(filtre(brut, pas, attaque, descente)); }

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
    const brut = db.map((v) => Math.pow(Math.min(1, Math.max(0, (v - bas) / Math.max(6, haut - bas))), 1.4));
    // Deux passes : la première suit le phrasé (montée 0,12 s, descente 0,45 s), la seconde arrondit les angles. L'orbe respire avec la voix, elle ne bat pas chaque syllabe.
    return entiers(filtre(filtre(brut, pas, 0.12, 0.45), pas, 0.12, 0.2));
  }

  function particule(ctx, x, y, taille, alpha, couleur) {
    ctx.fillStyle = `rgba(${couleur},${(alpha * 0.22).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, taille * 3.2, 0, 6.2832); ctx.fill();
    ctx.fillStyle = `rgba(${couleur},${Math.min(1, alpha).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, taille, 0, 6.2832); ctx.fill();
  }

  // Le contour organique : une somme de quelques ondulations lentes (2 à 5 lobes) dont l'amplitude grandit avec la voix, comme une goutte vivante.
  const LOBES = [[2, 0.34, 0.0, 0.05], [3, -0.45, 1.7, 0.042], [4, 0.55, 3.1, 0.026], [5, -0.7, 4.4, 0.016]];
  function rayon(a, t, n, Rs) {
    let d = 0;
    for (const [k, w, ph, amp] of LOBES) d += amp * (0.5 + 0.85 * n) * Math.sin(k * a + w * t + ph);
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

  // Où se pose l'orbe (centre en pixels de la vidéo, taille relative) : au milieu sous un titre, « garée » sur un côté quand le décor a un sujet
  // au centre. Jamais au-dessus de y 380 (interface de TikTok) ni dans la bande des sous-titres (à partir de y 1290).
  const SPOTS = {
    milieu: { x: 540, y: 960, taille: 1 }, gauche: { x: 270, y: 900, taille: 0.7 }, droite: { x: 810, y: 900, taille: 0.7 },
    'haut-gauche': { x: 250, y: 640, taille: 0.55 }, 'haut-droite': { x: 830, y: 640, taille: 0.55 },
    'bas-gauche': { x: 250, y: 1120, taille: 0.55 }, 'bas-droite': { x: 830, y: 1120, taille: 0.55 },
    jeu: { x: 150, y: 390, taille: 0.42 },
  };
  // Par fond de plan : le spot choisi d'office (voir la planche de chaque décor). Défaut : en haut à droite, petite.
  const PLACES_ORBE = { nuit: 'milieu', papier: 'milieu', accent: 'milieu', robot: 'haut-droite', defaut: 'haut-droite' };
  function emplacement(plan) {
    const o = plan.orbe;
    if (o && typeof o === 'object') return { x: o.x, y: o.y, taille: o.taille === undefined ? 0.7 : o.taille };
    const nom = typeof o === 'string' ? o : plan.grille ? 'jeu' : plan.geant ? 'bas-droite' : ((plan.question || plan.illu) ? 'haut-droite' : PLACES_ORBE[plan.fond] || PLACES_ORBE.defaut);
    return Object.assign({}, SPOTS[nom]);
  }
  // Le trajet : une position par plan, atteinte en glissant. plans : [{ t0, orbe?, fond, question? }].
  const GLISSE = 0.9;
  function trajet(plans) {
    return plans.filter((p) => p.orbe !== false).map((p) => Object.assign({ t: p.t0 }, emplacement(p)));
  }
  const doux = (u) => u * u * (3 - 2 * u);
  function position(tr, t) {
    if (!tr.length) return { x: 540, y: 960, taille: 1 };
    let k = 0; while (k + 1 < tr.length && t >= tr[k + 1].t) k += 1;
    const c = tr[k], p = k ? tr[k - 1] : c, u = k ? doux(Math.min(1, Math.max(0, (t - c.t) / GLISSE))) : 1;
    return { x: p.x + (c.x - p.x) * u, y: p.y + (c.y - p.y) * u, taille: p.taille + (c.taille - p.taille) * u };
  }

  // La tension d'un compte à rebours : dans les trois dernières secondes d'une tranche [début, fin], v monte de 0 à 1 et p bat chaque seconde.
  function tension(liste, t) {
    for (const [d, f] of liste || []) if (t >= d && t <= f) { const s = t - d; return { v: Math.min(1, s / (f - d)), p: Math.exp(-5 * (s - Math.floor(s))) }; }
    return { v: 0, p: 0 };
  }

  function rvb(h) { const v = parseInt(h.slice(1), 16); return `${(v >> 16) & 255},${(v >> 8) & 255},${v & 255}`; }

  function dessiner(ctx, n0, t, c, tn) {
    const T = tn || { v: 0, p: 0 }, n = Math.min(1, n0 + 0.2 * T.v + 0.15 * T.p);
    const cx = TAILLE / 2, cy = TAILLE / 2, A = rvb(c.a), B = rvb(c.b), C = rvb(c.c), L = rvb(c.clair);
    const Rs = R * (1 + 0.09 * n + 0.02 * Math.sin(t * 1.0) * (1 - n));
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
        const orbite = Rs * (1.32 + 1.75 * Math.pow(h(1), 1.5)), vitesse = 0.58 * Math.pow(Rs / orbite, 1.5), phase = h(2) * 6.2832;
        const ecrase = 0.22 + 0.6 * h(3), tilt = (h(4) - 0.5) * 1.5, poussee = 1 + 0.2 * n * (0.4 + h(5));
        for (let j = 0; j < 4; j += 1) {
          const a = phase + vitesse * (t - j * 0.035), rr = orbite * poussee;
          const lx = rr * Math.cos(a), ly = rr * ecrase * Math.sin(a), z = Math.sin(a);
          if ((z > 0) !== devant) continue;
          const x = cx + lx * Math.cos(tilt) - ly * Math.sin(tilt), y = cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);
          const taille = (1.1 + 2.4 * h(6)) * (0.8 + 0.4 * z) * (1 + 0.7 * n) * (1 - j * 0.22);
          const alpha = (0.28 + 0.6 * h(7)) * (0.62 + 0.38 * z) * (0.5 + 0.5 * n) * (1 - j * 0.28) * (0.8 + 0.2 * Math.sin(t * 1.2 + k));
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
      const amp = Rs * (0.22 + 0.26 * n), x = cx + amp * Math.sin(t * 0.45 * w + ph), y = cy + amp * Math.cos(t * 0.34 * w + ph * 1.3), r = Rs * (0.55 + 0.2 * n);
      const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
      gg.addColorStop(0, `rgba(${col},${(0.26 + 0.12 * n).toFixed(3)})`); gg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gg; ctx.fillRect(cx - Rs * 1.5, cy - Rs * 1.5, Rs * 3, Rs * 3);
    });
    ctx.globalCompositeOperation = 'source-over';
    g = ctx.createRadialGradient(cx, cy, Rs * 0.62, cx, cy, Rs * 1.1);
    g.addColorStop(0, `rgba(${L},0)`); g.addColorStop(0.8, `rgba(${L},${(0.18 + 0.2 * n).toFixed(3)})`); g.addColorStop(1, `rgba(${L},${(0.6 + 0.2 * n).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(cx - Rs * 1.5, cy - Rs * 1.5, Rs * 3, Rs * 3);
    // Le reflet de verre en haut à gauche.
    ctx.save(); ctx.translate(cx - Rs * 0.38 + 6 * Math.sin(t * 0.3), cy - Rs * 0.46); ctx.rotate(-0.6); ctx.scale(1, 0.55);
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

  return { niveaux, niveauxAudio, dessiner, tension, TAILLE, SPOTS, PLACES_ORBE, emplacement, trajet, position, GLISSE };
});
