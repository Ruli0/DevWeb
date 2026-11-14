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

  // Le cerveau vivant (format « test ») : un état animé par la timeline, dessiné à chaque image.
  const CAMERAS = {
    large: { cx: 425, cy: 215, zoom: 1.15, rot: 0.04 },
    amygdale: { cx: 370, cy: 360, zoom: 2.0, rot: 0.14 },
    pfc: { cx: 330, cy: 250, zoom: 1.55, rot: 0.08 },
    striatum: { cx: 430, cy: 300, zoom: 1.9, rot: 0.1 },
    hippocampe: { cx: 450, cy: 400, zoom: 1.9, rot: 0.1 },
    insula: { cx: 440, cy: 350, zoom: 1.9, rot: 0.1 },
  };
  const REPOS = { amygdale: 0.1, insula: 0.08, cortex: 0.12, pfc: 0.1, striatum: 0.1, hippocampe: 0.1, cervelet: 0.05 };

  function cerveau(c, feuille, style) {
    const tl = c.tl;
    const etat = { cam: Object.assign({}, CAMERAS.large), act: Object.assign({}, REPOS), decharges: 0, pulse: 0, voile: 0,
      couleurs: { base: '#5f7d99', froid: '#8fc4ea', chaud: '#ff7a4d', ambre: '#e8a23c' } };
    // Miroir des dernières valeurs posées : chaque tween part explicitement de l'état précédent.
    const miroir = JSON.parse(JSON.stringify(etat));
    const vers = (cible, m, valeurs, t, d, ease) => {
      const de = {}; Object.keys(valeurs).forEach((k) => { de[k] = m[k]; m[k] = valeurs[k]; });
      c.ft(cible, de, Object.assign({ duration: d, ease: ease || 'power2.inOut' }, valeurs), t);
    };
    c.camera = (nom, t, d, ease) => vers(etat.cam, miroir.cam, Object.assign({}, CAMERAS[nom] || CAMERAS.large), t, d == null ? 0.9 : d, ease || 'expo.out');
    c.zones = (valeurs, t, d) => vers(etat.act, miroir.act, valeurs, t, d == null ? 0.6 : d, 'power2.out');
    c.calme = (t, d) => c.zones(Object.assign({}, REPOS), t, d == null ? 1 : d);
    c.decharges = (v, t, d) => vers(etat, miroir, { decharges: v }, t, d == null ? 0.4 : d, 'none');
    c.voile = (v, t, d) => vers(etat, miroir, { voile: v }, t, d == null ? 0.4 : d, 'power2.out');
    const monde = document.getElementById('monde');
    c.coup = (t, f) => c.ft(monde, { scale: f || 1.06 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, t);
    const flash = document.getElementById('flash');
    c.flash = (t) => c.ft(flash, { opacity: 0.35 }, { opacity: 0, duration: 0.5, ease: 'power2.out' }, t);
    // Les étiquettes qui suivent une zone du cerveau.
    const suivis = [];
    c.suivre = (el, zone, dx, dy) => suivis.push({ el, zone, dx, dy });
    // Le cerveau bat sur chaque temps ; la barre de progression avance.
    const B = 60 / style.mouvement.bpm;
    for (let k = 0; k * B < feuille.duree; k += 1) c.ft(etat, { pulse: 0.2 }, { pulse: 0, duration: B * 0.9, ease: 'power2.out' }, k * B);
    c.ft('#prog', { scaleX: 0 }, { scaleX: 1, duration: feuille.duree, ease: 'none' }, 0);
    const ctx = document.getElementById('cerveau').getContext('2d');
    const voileEl = document.getElementById('voile');
    const D = T.reseauDessin, M = feuille.reseau, Z = feuille.zones;
    const vu = { cam: etat.cam, decharges: 0, couleurs: etat.couleurs, act: {} };
    tl.eventCallback('onUpdate', () => {
      Object.assign(vu.act, etat.act); vu.act.cortex = Math.min(1, etat.act.cortex + etat.pulse); vu.decharges = etat.decharges;
      D.dessiner(ctx, M, vu, tl.time(), 'constellation');
      voileEl.style.opacity = etat.voile;
      suivis.forEach((s) => { const p = D.ecranDe(s.zone, etat, Z); s.el.style.left = `${Math.round(p.x + s.dx)}px`; s.el.style.top = `${Math.round(p.y + s.dy)}px`; });
    });
    c.B = B;
    return etat;
  }

  T.lecteur = {
    jouer(feuille, style) {
      CustomEase.create('entree', style.mouvement.entree);
      const tl = gsap.timeline({ paused: true });
      const c = outils(tl, style);
      if (feuille.reseau) cerveau(c, feuille, style);
      feuille.scenes.forEach((s, i) => {
        const el = document.getElementById(`scene-${i}`);
        const scene = T.scenes[s.id];
        // Dérive lente de toute la scène (sauf dans le format « test », où le cerveau bouge déjà).
        if (!feuille.reseau) c.ft(el.querySelector('.derive'), { scale: 1 }, { scale: 1 + style.mouvement.derive, duration: s.d, ease: 'none' }, s.t0);
        // Format « test » : une scène peut fixer l'état du cerveau, et un insert assombrit le fond.
        if (feuille.reseau) {
          const cv = s.p.cerveau;
          if (cv && cv.camera) c.camera(cv.camera, s.t0);
          if (cv && cv.zones) c.zones(cv.zones, s.t0);
          if (cv && cv.decharges != null) c.decharges(cv.decharges, s.t0);
          c.voile(scene.assombrir ? 0.7 : 0, s.t0, 0.4);
        }
        const fin = s.t0 + s.d - style.mouvement.dureeSortie - 0.15;
        scene.jouer(c, el, s.p, s.t0, s.d, fin, Object.assign({ suivante: feuille.scenes[i + 1], precedente: feuille.scenes[i - 1] }, s.ctx || {}));
      });
      tl.set({}, {}, feuille.duree);
      tl.seek(0.001); tl.seek(0);
      return tl;
    },
  };
})(typeof self !== 'undefined' ? self : this);
