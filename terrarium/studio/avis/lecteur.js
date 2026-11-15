/*
 * Le lecteur « avis », exécuté dans la page : une seule timeline GSAP en pause, construite depuis la feuille de route.
 * Déterministe : ni minuterie, ni hasard, ni répétition infinie.
 */
(function (racine) {
  'use strict';
  const A = (racine.Avis = racine.Avis || {});
  A.lecteur = {
    jouer(f) {
      const tl = gsap.timeline({ paused: true });
      const c = { tl };
      c.ft = (cible, de, a, t) => tl.fromTo(cible, de, Object.assign({ immediateRender: false }, a), t);
      c.monter = (el, t) => { if (!el) return; gsap.set(el, { opacity: 0, y: 30 }); c.ft(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, t); };
      c.lignes = (el, t) => {
        if (!el) return;
        const l = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ligne' }).lines;
        gsap.set(l, { yPercent: 110 });
        c.ft(l, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08 }, t);
      };
      // Sortie d'un plan : il glisse vers le haut juste avant le suivant.
      c.sortie = (el, tFin) => c.ft(el.querySelector('.cadre'), { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: 0.25, ease: 'power2.in' }, tFin - 0.27);

      f.plans.forEach((pl, i) => A.plans[pl.id].jouer(c, document.getElementById(`plan-${i}`), pl.p, pl.t0, pl.d));

      // Sous-titres : le groupe apparaît d'un coup, chaque mot s'allume quand il est dit.
      f.groupes.forEach((g, i) => {
        const el = document.getElementById(`st-${i}`);
        gsap.set(el, { opacity: 0 });
        c.ft(el, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, Math.max(0, g.t0 - 0.04));
        [...el.children].forEach((m, k) => {
          gsap.set(m, { opacity: 0.38 });
          c.ft(m, { opacity: 0.38, y: 8 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, Math.max(0, g.mots[k].t - 0.03));
        });
        tl.set(el, { opacity: 0 }, f.groupes[i + 1] && f.groupes[i + 1].t0 - g.t1 < 0.05 ? g.t1 - 0.045 : g.t1);
      });
      c.ft('#prog', { scaleX: 0 }, { scaleX: 1, duration: f.duree, ease: 'none' }, 0);
      c.ft('#halo', { xPercent: -6, yPercent: -3 }, { xPercent: 6, yPercent: 4, duration: f.duree, ease: 'sine.inOut' }, 0);
      tl.set({}, {}, f.duree);
      tl.seek(0.001); tl.seek(0);
      return tl;
    },
  };
})(typeof self !== 'undefined' ? self : this);
