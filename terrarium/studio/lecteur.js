/*
 * Le lecteur V3, exécuté dans la page : il construit une seule timeline GSAP en pause à partir
 * de la feuille de route (studio/montage.js) et des scènes (studio/scenes/*.js).
 * Déterministe : ni minuterie, ni hasard, ni répétition infinie.
 */
(function (racine) {
  'use strict';
  const T = (racine.Terrarium = racine.Terrarium || {});

  function outils(tl, S) {
    const M = S.mouvement;
    const c = { tl, S, M, entree: 'entree' };
    // Toujours un fromTo sans rendu immédiat : l'état de départ est explicite.
    c.ft = (cible, de, a, t) => tl.fromTo(cible, de, Object.assign({ immediateRender: false }, a), t);
    // Découpe en lignes masquées (les lignes montent depuis un masque).
    c.lignes = (el) => (el ? new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ligne' }).lines : []);
    c.mots = (el) => (el ? new SplitText(el, { type: 'words,lines', mask: 'lines', linesClass: 'ligne' }).words : []);
    c.entrer = (els, t, decalage) => {
      if (!els || !els.length) return;
      gsap.set(els, { yPercent: 110 });
      c.ft(els, { yPercent: 110 }, { yPercent: 0, duration: M.dureeEntree, ease: 'entree', stagger: decalage == null ? M.decalageLignes : decalage }, t);
    };
    c.sortir = (els, t) => {
      if (!els || !els.length) return;
      c.ft(els, { yPercent: 0 }, { yPercent: -110, duration: M.dureeSortie, ease: M.sortie, stagger: M.decalageSortie }, t);
    };
    c.apparaitre = (els, t, opacite) => {
      if (!els || (els.length === 0)) return;
      gsap.set(els, { opacity: 0, y: 20 });
      c.ft(els, { opacity: 0, y: 20 }, { opacity: opacite == null ? 1 : opacite, y: 0, duration: M.dureeEntree * 0.8, ease: 'entree', stagger: 0.1 }, t);
    };
    c.disparaitre = (els, t) => {
      if (!els || (els.length === 0)) return;
      c.ft(els, { opacity: (i, e) => +getComputedStyle(e).opacity || 1 }, { opacity: 0, duration: M.dureeSortie * 0.7, ease: M.sortie }, t);
    };
    c.tracer = (els, t, duree, decalage) => {
      if (!els || (els.length === 0)) return;
      gsap.set(els, { drawSVG: '0%' });
      c.ft(els, { drawSVG: '0%' }, { drawSVG: '100%', duration: duree || M.dureeTrace, ease: M.trace, stagger: decalage == null ? M.decalageTraces : decalage }, t);
    };
    c.compteur = (el, valeur, t, decimales) => {
      const n = { v: 0 }; const d = decimales || 0;
      el.textContent = (0).toFixed(d);
      c.ft(n, { v: 0 }, { v: valeur, duration: M.dureeCompteur, ease: M.compteur, onUpdate: () => { el.textContent = n.v.toFixed(d).replace('.', ','); } }, t);
    };
    return c;
  }

  T.lecteur = {
    jouer(feuille, style) {
      CustomEase.create('entree', style.mouvement.entree);
      const tl = gsap.timeline({ paused: true });
      const c = outils(tl, style);
      feuille.scenes.forEach((s, i) => {
        const el = document.getElementById(`scene-${i}`);
        const scene = T.scenes[s.id];
        // Dérive lente de toute la scène.
        c.ft(el.querySelector('.derive'), { scale: 1 }, { scale: 1 + style.mouvement.derive, duration: s.d, ease: 'none' }, s.t0);
        const fin = s.t0 + s.d - style.mouvement.dureeSortie - 0.15;
        scene.jouer(c, el, s.p, s.t0, s.d, fin, Object.assign({ suivante: feuille.scenes[i + 1], precedente: feuille.scenes[i - 1] }, s.ctx || {}));
      });
      tl.set({}, {}, feuille.duree);
      tl.seek(0);
      return tl;
    },
  };
})(typeof self !== 'undefined' ? self : this);
