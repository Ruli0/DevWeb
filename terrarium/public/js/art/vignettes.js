/*
 * Les cinq scènes de nature : chacune joue un concept d'agent dans le vivarium,
 * avec une légende qui change au fil de l'action. Pensées pour être filmées.
 */
(function () {
  'use strict';
  const T = (window.Terrarium = window.Terrarium || {});
  const STOP = Symbol('stop');

  T.vignettes = function (scene, dire) {
    const svg = scene.svg;
    const q = (s) => svg.querySelector(s);
    const qa = (s) => svg.querySelectorAll(s);
    let jeton = 0;
    let enCours = null;

    const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
    const verifier = (j) => { if (j !== jeton) throw STOP; };
    async function etape(j, texte, ms) { dire(texte); await pause(ms ?? 2800); verifier(j); }
    async function att(j, tween) { await tween; verifier(j); }

    // Centre d'un élément, dans les coordonnées du dessin.
    function centre(el) {
      const r = el.getBoundingClientRect();
      return new DOMPoint(r.left + r.width / 2, r.top + r.height / 2).matrixTransform(svg.getScreenCTM().inverse());
    }
    function versLocal(el, pt) {
      return new DOMPoint(pt.x, pt.y).matrixTransform(el.getScreenCTM().inverse().multiply(svg.getScreenCTM()));
    }
    function teinter(nom, duree) {
      const [clair, fonce] = scene.PEAU[nom];
      gsap.to('.cam-peau, .cam-oeil', { fill: clair, duration: duree });
      gsap.to('.cam-trait', { stroke: clair, duration: duree });
      gsap.to('.cam-trait2, .cam-raie, .cam-crete', { stroke: fonce, duration: duree });
    }

    // Les trois filtres du ruisseau sont posés là où passe vraiment le courant.
    const ruisseau = q('#ruisseau');
    const longueur = ruisseau.getTotalLength();
    const FILTRES = [0.42, 0.66, 0.86];
    const pts = FILTRES.map((fr) => ruisseau.getPointAtLength(longueur * fr));
    q('#filtres').innerHTML = `
      <g><ellipse cx="${pts[0].x}" cy="${pts[0].y}" rx="17" ry="9" fill="#5fa04a"/><circle cx="${pts[0].x - 7}" cy="${pts[0].y - 3}" r="5" fill="#9ad25f"/><circle cx="${pts[0].x + 6}" cy="${pts[0].y - 2}" r="6" fill="#86c44e"/><circle cx="${pts[0].x}" cy="${pts[0].y + 3}" r="4" fill="#9ad25f"/></g>
      <g><ellipse cx="${pts[1].x}" cy="${pts[1].y}" rx="19" ry="8" fill="#d9bd82"/><ellipse cx="${pts[1].x - 3}" cy="${pts[1].y - 2}" rx="11" ry="4" fill="#ecd7a6"/></g>
      <g fill="#b9bdb4"><ellipse cx="${pts[2].x - 9}" cy="${pts[2].y + 1}" rx="7" ry="5"/><ellipse cx="${pts[2].x + 2}" cy="${pts[2].y - 3}" rx="6" ry="4.5" fill="#d5d8cf"/><ellipse cx="${pts[2].x + 10}" cy="${pts[2].y + 3}" rx="7" ry="5" fill="#9b9f97"/></g>`;
    const filtres = q('#filtres').children;
    const lueur = q('#cadre-lueur');

    const SCENES = {
      // --- La boîte : fenêtre de contexte ------------------------------------
      bocal: {
        async jouer(j) {
          gsap.to(lueur, { opacity: 0.9, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' });
          await etape(j, 'Ce vivarium est une boîte fermée. Pour un agent, c\'est la fenêtre de contexte.');
          await etape(j, 'Tout ce qu\'il sait doit tenir à l\'intérieur.', 2400);
          dire('Si on laisse tout pousser, ça finit par déborder.');
          gsap.to(qa('.pousse'), { scale: 1.55, svgOrigin: (i, el) => el.dataset.o, duration: 2.6, ease: 'power1.in' });
          await pause(2200); verifier(j);
          gsap.set(lueur, { stroke: '#ff6b57' });
          gsap.to(lueur, { opacity: 1, duration: 0.25, yoyo: true, repeat: 5 });
          gsap.fromTo('#couvercle', { y: 0 }, { y: -5, duration: 0.09, yoyo: true, repeat: 9 });
          await pause(1900); verifier(j);
          dire('Alors on taille. On garde l\'essentiel, et le reste part au compost.');
          gsap.to(qa('.pousse'), { scale: 1, svgOrigin: (i, el) => el.dataset.o, duration: 1.1, ease: 'back.out(1.6)' });
          const tas = q('#chutes-feuilles');
          for (let i = 0; i < 12; i += 1) {
            const x = 70 + Math.random() * 460;
            const y = 110 + Math.random() * 170;
            tas.insertAdjacentHTML('beforeend', scene.feuille(0, 0, 22 + Math.random() * 16, 8, 0, '#2f8a5a', '#6dbb6a'));
            const el = tas.lastElementChild;
            gsap.fromTo(el, { x, y, rotation: Math.random() * 360 }, {
              y: 596 + Math.random() * 40, x: x + (Math.random() - 0.5) * 80, rotation: '+=' + (Math.random() * 400 - 200),
              duration: 1.6 + Math.random(), ease: 'power1.in', delay: Math.random() * 0.4,
            });
            gsap.to(el, { opacity: 0, duration: 0.8, delay: 2.6 });
          }
          gsap.set(lueur, { stroke: '#b9f29a' });
          gsap.fromTo(lueur, { opacity: 0.9 }, { opacity: 0, duration: 2.4, delay: 0.6 });
          await pause(3400); verifier(j);
          await etape(j, 'Choisir ce qui entre dans la boîte, c\'est le context engineering.', 3200);
        },
        remettre() {
          gsap.killTweensOf([lueur, '#couvercle', ...qa('.pousse')]);
          gsap.set(qa('.pousse'), { scale: 1, svgOrigin: (i, el) => el.dataset.o });
          gsap.set(lueur, { opacity: 0, stroke: '#ffe08a' });
          gsap.set('#couvercle', { y: 0 });
          q('#chutes-feuilles').innerHTML = '';
        },
      },

      // --- Le caméléon : la boucle d'outils ---------------------------------
      cycle: {
        async jouer(j) {
          const cam = q('#cam');
          const mouche = q('#mouche');
          scene.balade.pause();
          scene.pas.pause();
          scene.mouche.retenir();
          await att(j, gsap.to(cam, { opacity: 0, duration: 0.3 }));
          gsap.set(cam, { motionPath: { ...scene.chemin, start: 0.3, end: 0.3 } });
          gsap.set('#cam-flip', { scaleX: 1, svgOrigin: '0 0' });
          gsap.to(cam, { opacity: 1, duration: 0.4 });
          await etape(j, 'Un agent travaille en boucle. Regarde le caméléon.', 2400);

          const tours = [
            { peau: 'turquoise', textes: ['Il repère une proie et vise : le modèle réfléchit.', 'Il lance sa langue : c\'est un appel d\'outil.', 'Il ramène sa prise : le résultat de l\'outil.', 'Sa peau change : le résultat rejoint son contexte.'] },
            { peau: 'orange', textes: ['Nouveau tour. Il observe à nouveau…', '…nouvel appel d\'outil…', '…nouveau résultat…', '…et son contexte s\'enrichit encore.'] },
          ];
          for (const [n, tour] of tours.entries()) {
            const rapide = n > 0;
            const tete = centre(q('#cam-tete'));
            const cible = { x: tete.x + 56 + n * 28, y: tete.y - 112 + n * 26 };
            gsap.set(mouche, { opacity: 1 });
            gsap.to(mouche, { x: cible.x, y: cible.y, duration: 1.1, ease: 'power2.out' });
            const local = versLocal(q('#cam-corps'), cible);
            const angle = (Math.atan2(local.y + 36, local.x - 46) * 180) / Math.PI;
            gsap.to('#cam-pupille', { rotation: angle, svgOrigin: '46 -36', duration: 0.6, ease: 'power2.inOut' });
            gsap.to(mouche, { x: '+=5', y: '-=4', duration: 0.12, yoyo: true, repeat: 30, delay: 1.1 });
            await etape(j, tour.textes[0], rapide ? 1900 : 2800);

            dire(tour.textes[1]);
            gsap.killTweensOf(mouche);
            gsap.set('#cam-langue', { opacity: 1 });
            const fin = versLocal(q('#cam-corps'), { x: gsap.getProperty(mouche, 'x'), y: gsap.getProperty(mouche, 'y') });
            gsap.to('#cam-tete', { x: 3, duration: 0.1, yoyo: true, repeat: 1 });
            await att(j, gsap.to('#cam-langue-fil', { attr: { x2: fin.x, y2: fin.y }, duration: 0.16, ease: 'power3.out', onUpdate: suivreLangue }));
            gsap.set(mouche, { opacity: 0 });
            gsap.fromTo('#cam-langue-bout', { attr: { r: 4.5 } }, { attr: { r: 7 }, duration: 0.15 });
            await pause(rapide ? 900 : 1700); verifier(j);

            dire(tour.textes[2]);
            await att(j, gsap.to('#cam-langue-fil', { attr: { x2: 64, y2: -28 }, duration: 0.3, ease: 'power2.in', onUpdate: suivreLangue }));
            gsap.set('#cam-langue', { opacity: 0 });
            gsap.set('#cam-langue-bout', { attr: { r: 4.5 } });
            gsap.fromTo('#cam-corps', { scaleY: 1 }, { scaleY: 1.07, svgOrigin: '0 0', duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut' });
            await pause(rapide ? 1100 : 2000); verifier(j);

            dire(tour.textes[3]);
            teinter(tour.peau, 1.4);
            gsap.to('#cam-pupille', { rotation: 0, svgOrigin: '46 -36', duration: 0.6 });
            await pause(rapide ? 1900 : 2800); verifier(j);
            gsap.set(mouche, { x: 540, y: 110 });
          }
          await etape(j, 'Rassasié, il s\'arrête. La boucle se termine quand il n\'a plus besoin d\'outil.', 3600);
        },
        remettre() {
          gsap.killTweensOf(['#cam', '#cam-pupille', '#cam-langue-fil', '#cam-langue-bout', '#cam-corps', '#cam-tete', '#mouche']);
          gsap.set('#cam-langue', { opacity: 0 });
          gsap.set('#cam-langue-fil', { attr: { x2: 64, y2: -28 } });
          gsap.set('#cam-langue-bout', { attr: { cx: 64, cy: -28, r: 4.5 } });
          gsap.set('#cam-corps', { scaleY: 1 });
          gsap.set('#cam', { opacity: 1 });
          teinter('vert', 1.2);
          scene.mouche.liberer();
          if (!T.reduce) scene.balade.restart();
        },
      },

      // --- Le ruisseau : le middleware --------------------------------------
      couches: {
        async jouer(j) {
          const goutte = q('#goutte-requete');
          const corps = goutte.querySelector('path');
          const trajet = (a, b, d, ease) => gsap.to(goutte, {
            motionPath: { path: '#ruisseau', start: a, end: b }, duration: d, ease: ease || 'sine.inOut',
          });
          const signaler = (i) => gsap.fromTo(filtres[i], { scale: 1 }, { scale: 1.5, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' });
          gsap.set(corps, { fill: '#8a6a3a' });
          gsap.set(goutte, { opacity: 1, scale: 1, motionPath: { path: '#ruisseau', start: 0, end: 0 } });
          gsap.from(goutte, { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' });
          await etape(j, 'Voici une requête : une goutte d\'eau trouble, en haut de la cascade.', 2600);
          dire('Elle n\'arrive jamais directement au bassin. Elle traverse des couches.');
          await att(j, trajet(0, 0.3, 1.1, 'power2.in'));
          await att(j, trajet(0.3, FILTRES[0], 1.2));
          signaler(0);
          await etape(j, 'La mousse garde une trace de son passage : c\'est le journal.');
          await att(j, trajet(FILTRES[0], FILTRES[1], 1.5));
          signaler(1);
          gsap.to(corps, { fill: '#bfeaf2', duration: 1.4 });
          await etape(j, 'Le sable retient les impuretés : les données sensibles sont masquées.');
          await att(j, trajet(FILTRES[1], FILTRES[2], 1.3));
          signaler(2);
          await etape(j, 'Les galets freinent le courant : c\'est la limite de débit.');
          await att(j, trajet(FILTRES[2], 1, 1.1));
          gsap.to(goutte, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.4 });
          gsap.fromTo(qa('.ride'), { scale: 0.4, opacity: 1, transformOrigin: '50% 50%' }, { scale: 5, opacity: 0, duration: 1.6, stagger: 0.25, overwrite: true });
          await etape(j, 'L\'eau arrive propre au bassin. Chaque requête traverse ces couches avant le modèle : c\'est le middleware.', 4200);
        },
        remettre() {
          gsap.killTweensOf(['#goutte-requete', '#goutte-requete path', ...filtres]);
          gsap.set('#goutte-requete', { opacity: 0, scale: 1 });
          gsap.set(filtres, { scale: 1 });
          if (!T.reduce) {
            gsap.fromTo(qa('.ride'), { scale: 0.4, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3.2, opacity: 0, duration: 2.6, ease: 'power1.out', stagger: { each: 1.2, repeat: -1 }, overwrite: true });
          }
        },
      },

      // --- La dionée et la grenouille : les hooks ---------------------------
      capteurs: {
        async jouer(j) {
          const bete = q('#scarabee');
          gsap.set(bete, { x: 478, y: 656, opacity: 0, rotation: 0 });
          gsap.to(bete, { opacity: 1, duration: 0.4 });
          gsap.to('#pousse-tendre', { rotation: 6, svgOrigin: '318 652', duration: 0.5, yoyo: true, repeat: 5, ease: 'sine.inOut' });
          await etape(j, 'Une jeune pousse vient de sortir. Elle est fragile.', 2400);
          dire('Un scarabée file droit dessus pour la grignoter.');
          gsap.to(bete, { rotation: 5, duration: 0.14, yoyo: true, repeat: 17, ease: 'sine.inOut' });
          await att(j, gsap.to(bete, { x: 404, y: 636, duration: 2.5, ease: 'none' }));
          gsap.to('#dionee-g, #dionee-d', { rotation: -2, svgOrigin: '0 0', duration: 0.1, ease: 'power4.in' });
          gsap.to(bete, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.1 });
          gsap.fromTo('#dionee', { x: -3 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.2)' });
          await etape(j, 'Clac. La dionée se referme avant qu\'il n\'arrive. L\'action est bloquée : c\'est un hook « avant ».', 3800);
          const coasser = gsap.timeline({ repeat: 2 })
            .to('#grenouille-gorge', { scale: 2.6, transformOrigin: '50% 20%', duration: 0.22, ease: 'power2.out' })
            .fromTo('#grenouille-ondes', { opacity: 0, scale: 0.7, svgOrigin: '0 -14' }, { opacity: 1, scale: 1.25, duration: 0.3 }, '<')
            .to('#grenouille-gorge', { scale: 1, duration: 0.3 })
            .to('#grenouille-ondes', { opacity: 0, duration: 0.3 }, '<');
          enCours.extra = coasser;
          await etape(j, 'La grenouille coasse pour prévenir tout le monde. Elle réagit après coup : c\'est un hook « après ».', 3800);
          await etape(j, 'Un hook ne demande pas l\'avis de l\'agent. Il se déclenche à coup sûr.', 3200);
        },
        remettre() {
          if (enCours && enCours.extra) enCours.extra.kill();
          gsap.killTweensOf(['#scarabee', '#dionee-g', '#dionee-d', '#dionee', '#pousse-tendre', '#grenouille-ondes']);
          gsap.set('#scarabee', { opacity: 0, scale: 1 });
          gsap.set('#grenouille-ondes', { opacity: 0 });
          gsap.set('#grenouille-gorge', { scale: 1 });
          gsap.set('#pousse-tendre', { rotation: 0 });
          gsap.to('#dionee-g, #dionee-d', { rotation: -30, svgOrigin: '0 0', duration: 0.8, ease: 'power2.out' });
        },
      },

      // --- Les fourmis : le système multi-agents ----------------------------
      ecosysteme: {
        async jouer(j) {
          const equipes = ['a', 'b', 'c'].map((k) => ({ el: q(`.e-${k}`), piste: `#piste-${k}` }));
          scene.fourmisAmb.pause();
          gsap.to(qa('.fourmi.amb'), { opacity: 0, duration: 0.4 });
          equipes.forEach((e) => {
            gsap.set(e.el.querySelector('.charge'), { opacity: 0 });
            gsap.set(e.el, { opacity: 1, motionPath: { path: e.piste, autoRotate: true, start: 0, end: 0 } });
          });
          gsap.fromTo('#fourmiliere', { scale: 1 }, { scale: 1.15, svgOrigin: '500 662', duration: 0.4, yoyo: true, repeat: 3 });
          await etape(j, 'Préparer l\'hiver, c\'est trop pour une seule fourmi.', 2400);
          dire('La fourmilière découpe le travail. Trois éclaireuses partent en même temps, chacune de son côté.');
          await Promise.all(equipes.map((e, i) => gsap.to(e.el, {
            motionPath: { path: e.piste, autoRotate: true, start: 0, end: 1 },
            duration: 3 + i * 0.4, ease: 'sine.inOut',
          })));
          verifier(j);
          equipes.forEach((e) => gsap.to(e.el, { rotation: '+=25', duration: 0.18, yoyo: true, repeat: 9, ease: 'sine.inOut' }));
          await etape(j, 'Chacune fouille son coin, sans encombrer les autres.', 2600);
          dire('Et chacune ne rapporte que l\'essentiel : un résumé de ce qu\'elle a trouvé.');
          equipes.forEach((e) => gsap.to(e.el.querySelector('.charge'), { opacity: 1, duration: 0.3 }));
          await Promise.all(equipes.map((e, i) => gsap.to(e.el, {
            motionPath: { path: e.piste, autoRotate: 180, start: 1, end: 0 },
            duration: 3 + i * 0.4, ease: 'sine.inOut',
          })));
          verifier(j);
          gsap.to(equipes.map((e) => e.el), { opacity: 0, duration: 0.3 });
          q('#butin').innerHTML = '<path d="M486 656 q8 -9 16 0 q-8 9 -16 0Z" fill="#9ad25f"/><circle cx="508" cy="658" r="5.5" fill="#7cc15b"/><circle cx="497" cy="664" r="5.5" fill="#8fdbe6"/>';
          gsap.from(q('#butin').children, { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.15, ease: 'back.out(2.5)' });
          gsap.fromTo('#fourmiliere', { scale: 1 }, { scale: 1.15, svgOrigin: '500 662', duration: 0.4, yoyo: true, repeat: 3 });
          await etape(j, 'La fourmilière assemble les trois trouvailles. C\'est un système multi-agents.', 3800);
        },
        remettre() {
          gsap.killTweensOf([...qa('.eclaireuse'), '#fourmiliere']);
          gsap.set(qa('.eclaireuse'), { opacity: 0 });
          gsap.set('#fourmiliere', { scale: 1 });
          q('#butin').innerHTML = '';
          gsap.to(qa('.fourmi.amb'), { opacity: 1, duration: 0.4 });
          scene.fourmisAmb.play();
        },
      },
    };

    function suivreLangue() {
      const fil = q('#cam-langue-fil');
      gsap.set('#cam-langue-bout', { attr: { cx: fil.getAttribute('x2'), cy: fil.getAttribute('y2') } });
    }

    function arreter() {
      jeton += 1;
      if (enCours) { SCENES[enCours.id].remettre(); enCours = null; }
    }

    // Joue une scène. Renvoie true si elle est allée au bout.
    async function jouer(id) {
      arreter();
      const j = jeton;
      enCours = { id };
      try {
        await SCENES[id].jouer(j);
      } catch (e) {
        if (e === STOP) return false;
        throw e;
      }
      SCENES[id].remettre();
      enCours = null;
      return true;
    }

    return { jouer, arreter, detruire() { jeton += 1; enCours = null; }, ids: Object.keys(SCENES) };
  };
})();
