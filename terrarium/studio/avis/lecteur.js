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
      const ENTREES = {
        cercle: ['circle(0% at 50% 42%)', 'circle(125% at 50% 42%)'],
        volet: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        rideau: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        biseau: ['polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)', 'polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)'],
      };
      f.plans.forEach((pl, i) => {
        const el = document.getElementById(`plan-${i}`);
        // Transition : le plan arrive par-dessus le précédent, découpé par un masque qui s'ouvre.
        if (i) {
          const [de, a] = ENTREES[pl.transition];
          c.ft(el, { clipPath: de }, { clipPath: a, duration: 0.55, ease: 'power3.inOut' }, pl.t0);
        }
        const retard = i ? 0.22 : 0;
        // Petit coup de zoom à l'arrivée, puis une dérive lente du contenu et du décor.
        c.ft(el.querySelector('.contenu'), { scale: 1.06 }, { scale: 1, duration: 0.6, ease: 'power3.out' }, pl.t0 + retard);
        const da = el.querySelector('.deco .a'), db = el.querySelector('.deco .b');
        const sens = i % 2 ? 1 : -1;
        if (da) c.ft(da, { xPercent: -8 * sens, yPercent: -5 }, { xPercent: 8 * sens, yPercent: 6, duration: pl.dClip, ease: 'none' }, pl.t0);
        if (db) c.ft(db, { rotation: 0, scale: 0.9 }, { rotation: 40 * sens, scale: 1.15, duration: pl.dClip, ease: 'none' }, pl.t0);
        A.plans[pl.id].jouer(c, el, pl.p, pl.t0 + retard, pl.d - retard);
        const illu = el.querySelector('.illu');
        if (illu) {
          A.illus[pl.p.illu].jouer(c, illu, pl.p, pl.t0 + retard + 0.15, pl.d - retard - 0.15);
          c.ft(illu, { y: 14 }, { y: -14, duration: pl.dClip, ease: 'none' }, pl.t0);
        }
      });

      // Sous-titres : le groupe apparaît d'un coup, chaque mot s'allume quand il est dit.
      f.groupes.forEach((g, i) => {
        const el = document.getElementById(`st-${i}`);
        gsap.set(el, { opacity: 0 });
        c.ft(el, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, Math.max(0, g.t0 - 0.04));
        [...el.firstElementChild.children].forEach((m, k) => {
          gsap.set(m, { opacity: 0.38 });
          c.ft(m, { opacity: 0.38, y: 8 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, Math.max(0, g.mots[k].t - 0.03));
        });
        tl.set(el, { opacity: 0 }, f.groupes[i + 1] && f.groupes[i + 1].t0 - g.t1 < 0.05 ? g.t1 - 0.045 : g.t1);
      });
      c.ft('#prog', { scaleX: 0 }, { scaleX: 1, duration: f.duree, ease: 'none' }, 0);
      tl.set({}, {}, f.duree);
      tl.seek(0.001); tl.seek(0);
      return tl;
    },
  };
})(typeof self !== 'undefined' ? self : this);
