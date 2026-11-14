/*
 * Scène « cerveau » (V3) : un cerveau de profil au trait ; des zones s'allument, un signal circule, les zones sont nommées.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.scenes = racine.Terrarium.scenes || {})[api.id] = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const { CERVEAU } = (typeof module === 'object' && module.exports) ? require('../dessins/cerveau.js') : self.Terrarium.cerveau;
  const K = 1.1, SX = 50, SY = 700;
  const ZONES = {
    pfc: { nom: 'Cortex préfrontal', x: 194, y: -92, renvoi: 'M184 -78 L184 150' },
    amygdale: { nom: 'Amygdale', x: CERVEAU.amygdale.x - 8, y: 528, renvoi: `M${CERVEAU.amygdale.x} 520 L${CERVEAU.amygdale.x} ${CERVEAU.amygdale.y + 54}` },
    striatum: { nom: 'Striatum', x: 520, y: -92, renvoi: 'M512 -78 L512 40 L452 250' },
  };
  return {
    id: 'cerveau',
    description: 'Le mécanisme dans le cerveau : zones qui s’allument, signal, étiquettes.',
    params: { phrase: 'la phrase du haut, *mot* clé', zones: 'liste parmi pfc, amygdale, striatum (la première est la source du signal)', etiquettes: '{ zone: « rôle en 2 ou 3 mots » }', lien: 'true : un signal va de l’amygdale au cortex préfrontal', transition: '« forme » : le trait du chiffre précédent devient le cerveau' },
    min: 6.4,
    textes: (p) => [p.phrase, ...Object.values(p.etiquettes || {})],
    sons: (p) => [['souffle.wav', 0.3, 0.35], ['tic.wav', 1.6, 0.3], ['impact.wav', 2.4, 0.5], ['tic.wav', 2.9, 0.25]],
    dessin(p, S, u) {
      const a = S.couleurs.accent, t = S.couleurs.texte;
      const z = p.zones || [];
      const A = CERVEAU.amygdale;
      const ch = require_chiffre();
      const filet = `M${(ch.x1 - SX) / K} ${(ch.y - SY) / K} L${(ch.x2 - SX) / K} ${(ch.y - SY) / K}`;
      return `
      <p class="ph">${u.md(p.phrase)}</p>
      <svg class="dessin" width="1080" height="1920"><defs>
        <radialGradient id="halo"><stop offset="0" stop-color="${a}" stop-opacity=".32"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
        <radialGradient id="zone" cx="210" cy="230" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${a}" stop-opacity=".55"/><stop offset=".6" stop-color="${a}" stop-opacity=".22"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
        <clipPath id="dans"><path d="${CERVEAU.contour}"/></clipPath>
        <clipPath id="avant"><rect x="0" y="0" width="330" height="390"/></clipPath>
      </defs>
      <g transform="translate(${SX} ${SY}) scale(${K})" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${z.includes('pfc') ? `<g class="z-pfc" opacity="0"><ellipse cx="240" cy="230" rx="220" ry="190" fill="url(#halo)"/><path d="${CERVEAU.contour}" fill="url(#zone)"/><path d="${CERVEAU.contour}" stroke="${a}" stroke-width="2.8" clip-path="url(#avant)"/></g>` : ''}
        <path class="contour" d="${CERVEAU.contour}" data-filet="${filet}" stroke="${t}" stroke-opacity=".7" stroke-width="2.4"/>
        <g stroke="${t}">
          <path class="trace" d="${CERVEAU.cervelet}" stroke-opacity=".5" stroke-width="2"/>
          ${CERVEAU.cerveletPlis.map((d) => `<path class="trace" d="${d}" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}
          <path class="trace" d="${CERVEAU.tronc}" stroke-opacity=".45" stroke-width="2"/>
          <g clip-path="url(#dans)">${CERVEAU.sillons.map((d) => `<path class="trace" d="${d}" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}</g>
        </g>
        ${z.includes('striatum') ? `<path class="z-striatum" d="${CERVEAU.striatum}" fill="${a}" fill-opacity=".25" stroke="${a}" stroke-width="2" opacity="0"/>` : `<path d="${CERVEAU.striatum}" stroke="${t}" stroke-opacity=".3" stroke-width="1.4" stroke-dasharray="5 6" class="trace"/>`}
        ${z.includes('amygdale') ? `<g class="z-amygdale" transform="translate(${A.x} ${A.y})">
          <circle r="110" fill="url(#halo)" opacity=".7"/>
          <circle r="34" stroke="${a}" stroke-opacity=".5" stroke-width="1.6" class="onde"/>
          <circle r="52" stroke="${a}" stroke-opacity=".25" stroke-width="1.4" class="onde"/>
          <circle r="19" fill="${a}" class="point"/></g>` : ''}
        ${p.lien ? `<path class="lien" d="M338 398 C306 360 286 330 262 284" stroke="${a}" stroke-width="2.2" stroke-dasharray="2 10"/><circle class="signal" r="7" fill="${a}" cx="338" cy="398" opacity="0"/>` : ''}
        ${z.map((k) => `<path class="renvoi" d="${ZONES[k].renvoi}" stroke="${t}" stroke-opacity=".45" stroke-width="1.4"/>`).join('')}
      </g></svg>
      ${z.map((k) => `<div class="etiq" data-zone="${k}" style="left:${Math.round(SX + ZONES[k].x * K)}px;top:${Math.round(SY + ZONES[k].y * K)}px"><b>${ZONES[k].nom}</b>${p.etiquettes && p.etiquettes[k] ? `<span>${u.esc(p.etiquettes[k])}</span>` : ''}</div>`).join('')}
      <div class="src" style="top:1400px">schéma simplifié</div>`;
    },
    jouer(c, el, p, t0, d, fin, ctx) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const phrase = c.lignes(q('.ph'));
      const contour = q('.contour');
      if (p.transition === 'forme') {
        // Le trait d'accent de la scène précédente grandit et devient le contour.
        c.ft(contour, { morphSVG: contour.dataset.filet, stroke: c.S.couleurs.accent, strokeOpacity: 1 },
          { morphSVG: { shape: contour.getAttribute('d'), shapeIndex: 'auto' }, stroke: c.S.couleurs.texte, strokeOpacity: 0.7, duration: c.M.dureeMorph, ease: c.M.morph }, t0);
      } else c.tracer(contour, t0, 1.3);
      c.entrer(phrase, t0 + 0.2);
      c.tracer(qa('.trace'), t0 + 0.9);
      const z = p.zones || [];
      let t = t0 + 2.2;
      z.forEach((k) => {
        const g = q(`.z-${k}`);
        if (k === 'amygdale') {
          gsap.set(g, { scale: 0, transformOrigin: '50% 50%' });
          c.ft(g, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'entree', transformOrigin: '50% 50%' }, t);
          c.ft(g.querySelectorAll('.onde'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'entree', stagger: 0.15, transformOrigin: '50% 50%' }, t + 0.1);
          // Le point bat doucement jusqu’à la fin de la scène (nombre de battements fini).
          const n = Math.max(1, Math.floor((fin - t - 0.8) / 0.8));
          c.ft(g.querySelector('.point'), { scale: 1 }, { scale: 1.22, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1, transformOrigin: '50% 50%' }, t + 0.8);
        } else c.ft(g, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' }, t);
        const etiq = q(`.etiq[data-zone="${k}"]`);
        c.tracer(qa('.renvoi')[z.indexOf(k)], t + 0.3, 0.5);
        c.apparaitre(etiq, t + 0.4);
        if (k === 'amygdale' && p.lien) {
          c.tracer(q('.lien'), t + 0.6, 0.9);
          c.ft(q('.signal'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, t + 0.6);
          const lien = q('.lien'), sig = q('.signal'), o = { p: 0 };
          c.ft(o, { p: 0 }, { p: 1, duration: 0.9, ease: c.M.trace, onUpdate() { const L = lien.getTotalLength(), pt = lien.getPointAtLength(L * o.p); sig.setAttribute('cx', pt.x); sig.setAttribute('cy', pt.y); } }, t + 0.6);
        }
        t += 1.2;
      });
      c.apparaitre(q('.src'), t0 + 2.6, 0.6);
      c.sortir(phrase, fin);
      c.ft(q('.dessin'), { opacity: 1 }, { opacity: 0, duration: c.M.dureeSortie, ease: c.M.sortie }, fin);
      c.disparaitre(qa('.etiq, .src'), fin);
    },
  };
  function require_chiffre() {
    const ch = (typeof module === 'object' && module.exports) ? require('./chiffre.js') : self.Terrarium.scenes.chiffre;
    return ch.FILET;
  }
});
