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
      // c.direct : le texte du tout premier plan est déjà en place à la première image (c'est elle qui sert de vignette).
      c.monter = (el, t) => { if (!el || c.direct) return; gsap.set(el, { opacity: 0, y: 30 }); c.ft(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, t); };
      // Un texte arrive mot par mot (chaque ligne est un masque), puis ses mots forts sont surlignés d'un trait.
      c.lignes = (el, t) => {
        if (!el) return;
        const sp = new SplitText(el, { type: 'words,lines', mask: 'lines', linesClass: 'ligne' });
        // Les mesures se font avant de déplacer les mots.
        const boite = el.getBoundingClientRect();
        // Un trait par ligne de mot fort (un <em> peut tenir sur deux lignes).
        const rangs = {};
        el.querySelectorAll('em').forEach((em) => {
          const morceaux = em.children.length ? [...em.children] : [em];
          morceaux.forEach((m) => { const r = m.getBoundingClientRect(); const k = Math.round(r.bottom); const g = (rangs[k] = rangs[k] || { x0: r.left, x1: r.right, y: r.bottom }); g.x0 = Math.min(g.x0, r.left); g.x1 = Math.max(g.x1, r.right); });
        });
        // Aucune rotation sur du texte : les mots montent droit depuis leur masque.
        if (!c.direct) gsap.set(sp.words, { yPercent: 115 });
        if (!c.direct) c.ft(sp.words, { yPercent: 115 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.045 }, t);
        const fin = t + 0.5 + 0.045 * sp.words.length;
        Object.values(rangs).forEach((g, k) => {
          const trait = document.createElement('i'); trait.className = 'trait';
          trait.style.left = `${Math.round(g.x0 - boite.left)}px`; trait.style.top = `${Math.round(g.y - boite.top - 10)}px`; trait.style.width = `${Math.round(g.x1 - g.x0)}px`;
          el.appendChild(trait);
          if (c.direct) return;
          gsap.set(trait, { scaleX: 0 });
          c.ft(trait, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, fin - 0.25 + 0.12 * k);
        });
      };
      const ENTREES = {
        cercle: ['circle(0% at 50% 42%)', 'circle(125% at 50% 42%)'],
        volet: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        rideau: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        biseau: ['polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)', 'polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)'],
      };
      const scenes3d = [];
      f.plans.forEach((pl, i) => {
        const el = document.getElementById(`plan-${i}`);
        // Transition : le plan arrive par-dessus le précédent, découpé par un masque qui s'ouvre.
        if (i) {
          const [de, a] = ENTREES[pl.transition];
          c.ft(el, { clipPath: de }, { clipPath: a, duration: 0.55, ease: 'power3.inOut' }, pl.t0);
        }
        const retard = i ? 0.22 : 0;
        // Petit coup de zoom à l'arrivée, puis une dérive lente du contenu et du décor.
        // Le tout premier plan s'ouvre sur un zoom avant plus marqué (l'accroche) ; "ouverture": "calme" le retire.
        if (i === 0 && f.ouverture !== 'calme') c.ft(el.querySelector('.contenu'), { scale: 1.07 }, { scale: 1, duration: 0.9, ease: 'expo.out' }, 0);
        else c.ft(el.querySelector('.contenu'), { scale: 1.06 }, { scale: 1, duration: 0.6, ease: 'power3.out' }, pl.t0 + retard);
        const decor = el.querySelector('.decor-svg'), photo = el.querySelector('.photo-img');
        if (decor) A.decors[pl.fond].jouer(c, decor, pl.t0, pl.dClip);
        // Le zoom lent part du sujet (« cadrage », en bas de la photo) : un cadrage de 1,22 à 1,32 remonte l'auteur
        // entre y 900 et 1350, au-dessus des sous-titres, et il ne s'en éloigne pas.
        if (photo) c.ft(photo, { scale: 1.22 }, { scale: 1.32, duration: pl.dClip, ease: 'none' }, pl.t0);
        el.querySelectorAll('.collage').forEach((img, k) => { gsap.set(img, { opacity: 0 }); c.ft(img, { opacity: 0, scale: 0.4, y: 80 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2.2)' }, pl.t0 + pl.p.collage[k].t); });
        // Décor 3D : dessiné à chaque image, à partir du temps écoulé dans le plan.
        const toile = el.querySelector('.decor-3d');
        if (toile) scenes3d.push({ t0: pl.t0, d: pl.dClip, scene: A.decors3d[pl.fond].creer(toile, pl.p, f.aspect3d) });
        const perso = el.querySelector('.perso-svg');
        if (perso) A.personnage.jouer(c, perso, pl.p.personnage, pl.t0 + retard, pl.d - retard);
        const da = el.querySelector('.deco .a'), db = el.querySelector('.deco .b');
        const sens = i % 2 ? 1 : -1;
        if (da) c.ft(da, { xPercent: -8 * sens, yPercent: -5 }, { xPercent: 8 * sens, yPercent: 6, duration: pl.dClip, ease: 'none' }, pl.t0);
        if (db) c.ft(db, { rotation: 0, scale: 0.9 }, { rotation: 40 * sens, scale: 1.15, duration: pl.dClip, ease: 'none' }, pl.t0);
        c.direct = i === 0 && f.ouverture !== 'calme';
        A.plans[pl.id].jouer(c, el, pl.p, pl.t0 + retard, pl.d - retard);
        c.direct = false;
        // La question de fin : une étiquette de papier posée dans le décor du dernier plan, à la place des sous-titres.
        const question = el.querySelector('.question');
        if (question) { gsap.set(question, { opacity: 0 }); c.ft(question, { opacity: 0, scale: 0.7, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, pl.t0 + pl.p.question.t); }
        const illu = el.querySelector('.illu');
        if (illu) {
          A.illus[pl.p.illu].jouer(c, illu, pl.p, pl.t0 + retard + 0.15, pl.d - retard - 0.15);
          c.ft(illu, { y: 14 }, { y: -14, duration: pl.dClip, ease: 'none' }, pl.t0);
        }
      });

      // Sous-titres : le groupe surgit ; le mot en cours est dans une pastille de la couleur de la rubrique, les mots à venir sont pâles.
      // L'aspect des mots vient du thème (studio/avis/themes.js).
      const MOT = f.mot, PALE = MOT.pale;
      f.groupes.forEach((g, i) => {
        const el = document.getElementById(`st-${i}`);
        const suivant = f.groupes[i + 1];
        const fin = suivant && suivant.t0 - g.t1 < 0.05 ? g.t1 - 0.045 : g.t1;
        gsap.set(el, { opacity: 0 });
        // Le premier sous-titre est là dès la première image (la vignette de la vidéo porte déjà les premiers mots).
        if (i === 0 && g.t0 < 0.6) gsap.set(el, { opacity: 1 });
        else c.ft(el, { opacity: 0, scale: 0.8, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(2.2)' }, Math.max(0, g.t0 - 0.06));
        [...el.firstElementChild.children].forEach((m, k) => {
          const mot = g.mots[k], t = Math.max(0, mot.t - 0.03);
          const tFin = Math.min(fin, g.mots[k + 1] ? g.mots[k + 1].t - 0.03 : fin);
          gsap.set(m, { opacity: PALE });
          tl.set(m, Object.assign({ opacity: 1 }, MOT.actif), t);
          c.ft(m, { scale: 1.22 }, { scale: 1, duration: 0.18, ease: 'power2.out' }, t);
          if (g.mots[k + 1]) tl.set(m, Object.assign({}, MOT.dit, mot.fort ? { color: MOT.fort } : {}), tFin);
        });
        tl.set(el, { opacity: 0 }, fin);
      });
      // L'orbe de voix : un niveau par 1/30 s, interpolé ; elle disparaît pendant les plans qui la refusent.
      const orbe = f.orbe && document.getElementById('orbe');
      const ctxOrbe = orbe && orbe.getContext('2d');
      const majOrbe = (t) => {
        const x = Math.min(f.orbe.niveaux.length - 1, Math.max(0, t * f.orbe.pas)), i = Math.floor(x), j = Math.min(i + 1, f.orbe.niveaux.length - 1);
        A.orbe.dessiner(ctxOrbe, (f.orbe.niveaux[i] + (f.orbe.niveaux[j] - f.orbe.niveaux[i]) * (x - i)) / 99, t, f.orbe.couleurs, A.orbe.tension(f.orbe.tensions, t));
        const pos = A.orbe.position(f.orbe.trajet, t);
        orbe.style.transform = 'translate(' + (pos.x - 450).toFixed(1) + 'px,' + (pos.y - 450).toFixed(1) + 'px) scale(' + pos.taille.toFixed(3) + ')';
        orbe.style.opacity = f.orbe.cache.some((p) => t >= p[0] - 0.15 && t <= p[1]) ? 0 : 1;
      };
      if (orbe) majOrbe(0);
      if (scenes3d.length || orbe) tl.eventCallback('onUpdate', () => { const t = tl.time(); if (orbe) majOrbe(t); scenes3d.forEach((x) => { if (t >= x.t0 - 0.05 && t <= x.t0 + x.d + 0.05) x.scene.maj(t - x.t0, x.d); }); });
      tl.set({}, {}, f.duree);
      tl.seek(0.001); tl.seek(0);
      return tl;
    },
  };
})(typeof self !== 'undefined' ? self : this);
