/*
 * Le modèle du « cerveau vivant » : quelques milliers de neurones placés dans la silhouette du cerveau
 * (studio/dessins/cerveau.js), avec une graine fixe. Même graine, même réseau : calculé dans Node,
 * puis envoyé tel quel à la page (aucun hasard au rendu).
 * Repère : celui du cerveau (820 × 620). Chaque neurone : x, y, z (profondeur, de -1 à 1), zone, phase, taille.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.reseauModele = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const { CERVEAU } = (typeof module === 'object' && module.exports) ? require('../dessins/cerveau.js') : self.Terrarium.cerveau;

  function graine(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Un chemin « M x y C … Z » devient un polygone (chaque courbe découpée en n segments).
  function polygone(d, n = 16) {
    const nb = d.match(/-?\d+(\.\d+)?/g).map(Number);
    const pts = [[nb[0], nb[1]]];
    for (let i = 2; i + 5 < nb.length; i += 6) {
      const [x0, y0] = pts[pts.length - 1];
      const [x1, y1, x2, y2, x3, y3] = nb.slice(i, i + 6);
      for (let k = 1; k <= n; k += 1) {
        const t = k / n, u = 1 - t;
        pts.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
      }
    }
    return pts;
  }
  const dedans = (pts, x, y) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const distanceBord = (pts, x, y) => {
    let m = Infinity;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[j], [bx, by] = pts[i];
      const vx = bx - ax, vy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
      m = Math.min(m, Math.hypot(x - ax - t * vx, y - ay - t * vy));
    }
    return m;
  };

  // Les zones : centre, rayons (ellipse) et nombre de neurones « profonds » ajoutés en grappe.
  const ZONES = {
    pfc: { nom: 'cortex préfrontal', cx: 230, cy: 230, rx: 120, ry: 140, grappe: 0 },
    amygdale: { nom: 'amygdale', cx: CERVEAU.amygdale.x, cy: CERVEAU.amygdale.y, rx: 34, ry: 28, grappe: 160 },
    striatum: { nom: 'striatum', cx: 432, cy: 284, rx: 52, ry: 34, grappe: 170 },
    hippocampe: { nom: 'hippocampe', cx: 452, cy: 420, rx: 70, ry: 20, grappe: 140 },
    insula: { nom: 'insula', cx: 446, cy: 356, rx: 46, ry: 26, grappe: 110 },
  };
  const zoneDe = (x, y) => {
    for (const [k, z] of Object.entries(ZONES)) if (((x - z.cx) / z.rx) ** 2 + ((y - z.cy) / z.ry) ** 2 <= 1) return k;
    return 'cortex';
  };

  function generer({ n = 3200, g = 7 } = {}) {
    const h = graine(g);
    const contour = polygone(CERVEAU.contour);
    const cervelet = polygone(CERVEAU.cervelet);
    const neurones = [];
    const ajouter = (x, y, zoneForcee) => neurones.push({
      x: +x.toFixed(1), y: +y.toFixed(1), z: +(h() * 2 - 1).toFixed(3),
      zone: zoneForcee || zoneDe(x, y), phase: +(h() * 6.283).toFixed(3), vitesse: +(0.6 + h() * 1.4).toFixed(3), taille: +(0.6 + h() * h() * 1.6).toFixed(3),
    });
    // Cortex : plus dense près du bord (la matière grise).
    let essais = 0;
    while (neurones.length < n && essais < n * 40) {
      essais += 1;
      const x = 120 + h() * 610, y = 60 + h() * 470;
      const dansCervelet = dedans(cervelet, x, y);
      if (!dedans(contour, x, y) && !dansCervelet) continue;
      const db = distanceBord(dansCervelet ? cervelet : contour, x, y);
      if (h() > Math.exp(-db / 46) * 0.85 + 0.15) continue;
      ajouter(x, y, dansCervelet ? 'cervelet' : null);
    }
    // Structures profondes : des grappes serrées.
    for (const [k, z] of Object.entries(ZONES)) {
      for (let i = 0; i < z.grappe; i += 1) {
        const a = h() * 6.283, r = Math.sqrt(h());
        ajouter(z.cx + Math.cos(a) * r * z.rx, z.cy + Math.sin(a) * r * z.ry, k);
      }
    }
    // Liaisons : chaque neurone vers ses deux plus proches voisins (grille de recherche).
    const C = 24, grille = new Map();
    neurones.forEach((p, i) => { const k = `${Math.floor(p.x / C)},${Math.floor(p.y / C)}`; if (!grille.has(k)) grille.set(k, []); grille.get(k).push(i); });
    const vus = new Set(), liaisons = [];
    neurones.forEach((p, i) => {
      const gx = Math.floor(p.x / C), gy = Math.floor(p.y / C), cands = [];
      for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) (grille.get(`${gx + dx},${gy + dy}`) || []).forEach((j) => { if (j !== i) cands.push([Math.hypot(neurones[j].x - p.x, neurones[j].y - p.y), j]); });
      cands.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      cands.slice(0, 2).forEach(([d, j]) => { const k = i < j ? `${i}-${j}` : `${j}-${i}`; if (d < 40 && !vus.has(k)) { vus.add(k); liaisons.push([i, j]); } });
    });
    // Format compact pour la page : tableaux plats.
    return {
      n: neurones.length,
      x: neurones.map((p) => p.x), y: neurones.map((p) => p.y), z: neurones.map((p) => p.z),
      zone: neurones.map((p) => p.zone), phase: neurones.map((p) => p.phase), vitesse: neurones.map((p) => p.vitesse), taille: neurones.map((p) => p.taille),
      liaisons,
    };
  }

  return { generer, ZONES, graine, polygone };
});
