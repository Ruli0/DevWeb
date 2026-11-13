/*
 * Le lecteur du studio (navigateur) : il transforme une feuille de route en une timeline GSAP.
 * Code fixe : il ne change pas d'un épisode à l'autre. Les épisodes sont des données.
 *
 * Règles du rendu déterministe : une seule timeline en pause, pas de minuterie, pas de hasard,
 * chaque animation part de l'état d'arrivée de la précédente, et les boucles d'ambiance
 * ont une période qui divise la durée (la vidéo boucle sans saut).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.studio = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Position d'un calque de profondeur f pour une vue { x, y, z } : le point (x, y) du décor
  // est montré en (540, CY), un peu sous le tiers haut (le texte occupe le haut), avec le zoom z. Les calques lointains
  // (f < 1) bougent et grossissent moins : c'est la parallaxe.
  const CY = 860;
  function placement(v, f) {
    const s = 1 + (v.z - 1) * f;
    const cx = 540 + (v.x - 540) * f;
    const cy = CY + (v.y - CY) * f;
    return `matrix(${s.toFixed(4)} 0 0 ${s.toFixed(4)} ${(540 - s * cx).toFixed(2)} ${(CY - s * cy).toFixed(2)})`;
  }

  function jouer(feuille, o) {
    const T = 60 / feuille.tempo;
    const D = feuille.duree;
    const racineDom = (o && o.racine) || document;
    const tl = gsap.timeline({ paused: true });
    const q = (s) => racineDom.querySelector(s);
    const qa = (s) => racineDom.querySelectorAll(s);
    const ft = (cible, de, vers, t) => tl.fromTo(cible, de, Object.assign({}, vers, { immediateRender: false }), t);
    const repos = (cible, vars) => { gsap.set(cible, vars); tl.set(cible, vars, 0); };
    // Une animation qui revient à son départ toutes les « periode » secondes, sur toute la vidéo.
    const cycle = (cible, de, vers, periode, ease) => {
      const n = Math.max(1, Math.round(D / periode));
      ft(cible, de, Object.assign({}, vers, { duration: D / n / 2, yoyo: true, repeat: 2 * n - 1, ease: ease || 'sine.inOut' }), 0);
    };
    const c = { tl, ft, repos, cycle, q, qa, T, D };
    const T_ = self.Terrarium;

    // --- La caméra. On anime un objet « vue » {x, y, z}, et chaque image recalcule la
    // transformation de chaque calque. (Animer x, y et scale des calques eux-mêmes ne marche pas :
    // GSAP prend l'origine dans leur boîte englobante, qui change quand les personnages bougent.)
    const calques = Array.from(qa('.calque')).map((el) => ({ el, f: Number(el.dataset.f) }));
    const vue = Object.assign({}, feuille.camera[0].de);
    const appliquer = () => calques.forEach((k) => k.el.setAttribute('transform', placement(vue, k.f)));
    appliquer();
    feuille.camera.forEach((k) => {
      if (!k.duree) return;
      ft(vue, Object.assign({}, k.de), Object.assign({}, k.vers, { duration: k.duree, ease: k.ease || 'power2.inOut', onUpdate: appliquer }), k.t);
    });

    // --- Le décor et les personnages : ambiance, état de départ, puis les gestes, dans l'ordre.
    const decor = T_.decors[feuille.decor];
    if (decor && decor.ambiance) decor.ambiance(c);
    Object.keys(feuille.depart).forEach((id) => {
      const rig = T_.rigs[id];
      rig.repos(c, feuille.depart[id]);
      rig.ambiance(c);
    });
    feuille.ordres.forEach((ordre) => {
      const rig = T_.rigs[ordre.qui];
      if (!rig || !rig.gestes[ordre.geste]) throw new Error('Geste inconnu : ' + ordre.qui + '.' + ordre.geste);
      rig.gestes[ordre.geste](c, ordre.t, ordre.p || {});
    });

    // --- Le texte de Mousse : toutes les lettres sont en place dès le début (rien ne se décale),
    // la lettre suivante sert de curseur.
    feuille.textes.forEach((m, k) => {
      const lettres = qa('#ligne-' + k + ' .c');
      const pas = Math.min(0.04, ((m.fin - m.debut) * 0.5) / Math.max(1, lettres.length));
      lettres.forEach((el, j) => {
        const classe = el.getAttribute('class');
        tl.set(el, { attr: { class: classe + ' cur' } }, m.debut + Math.max(0, j - 1) * pas + (j ? 0.001 : 0));
        if (j < lettres.length - 1) tl.set(el, { attr: { class: classe + ' vu' } }, m.debut + j * pas + 0.002);
      });
    });
    if (q('.c.fin')) cycle(qa('.c.fin'), { opacity: 1 }, { opacity: 0 }, T, 'steps(1)');

    // --- Les étiquettes : en coordonnées d'écran, calculées par le compilateur.
    const NS = 'http://www.w3.org/2000/svg';
    const couche = q('#etiquettes');
    (feuille.etiquettes || []).forEach((e) => {
      const g = document.createElementNS(NS, 'g');
      const l = e.texte.length * 31 + 64;
      const [ax, ay] = e.ancre; const [bx, by] = e.bulle;
      g.innerHTML = '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#b6ff5c" stroke-width="3" stroke-dasharray="7 8" opacity="0.85"/>'
        + '<circle cx="' + ax + '" cy="' + ay + '" r="10" fill="none" stroke="#b6ff5c" stroke-width="3"/>'
        + '<rect x="' + (bx - l / 2) + '" y="' + (by - 42) + '" width="' + l + '" height="84" rx="42" fill="#030a08" fill-opacity="0.9" stroke="#b6ff5c" stroke-width="3"/>'
        + '<text x="' + bx + '" y="' + by + '" text-anchor="middle" dominant-baseline="central" font-family="&quot;Baloo 2&quot;, sans-serif" font-weight="800" font-size="56" fill="#fbfff6" style="paint-order:stroke fill" stroke="#0a3a16" stroke-width="4" filter="url(#lueur)"></text>';
      g.querySelector('text').textContent = e.texte;
      couche.appendChild(g);
      repos(g, { opacity: 0 });
      ft(g, { opacity: 0, scale: 0.4, svgOrigin: ax + ' ' + ay }, { opacity: 1, scale: 1, svgOrigin: ax + ' ' + ay, duration: 0.28, ease: 'back.out(2.2)' }, e.t);
      ft(g, { opacity: 1 }, { opacity: 0, duration: 0.2 }, e.t + e.duree - 0.2);
    });
    return tl;
  }

  return { jouer, placement, CY };
});
