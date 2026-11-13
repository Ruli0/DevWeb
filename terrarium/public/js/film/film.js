/*
 * Le moteur de film du vivarium.
 *
 * Un scénario (JSON, voir videos/scenarios/) décrit des plans : quand ils
 * commencent, où regarde la caméra, ce que font les habitants, la légende,
 * et parfois une carte qui révèle le vrai concept (code, étapes, barres).
 *
 * construire() en tire UNE timeline GSAP en pause, entièrement déterminée :
 * ni minuterie, ni hasard non reproductible, ni répétition infinie. On peut
 * donc la positionner à n'importe quel instant, ce qu'exige un rendu image
 * par image (HyperFrames, ou Remotion avec tl.seek(frame / fps)).
 *
 * Le site joue la même timeline en temps réel, sans l'ambiance (qui y vit déjà).
 */
(function () {
  'use strict';
  const T = (typeof window !== 'undefined' ? window : globalThis).Terrarium
    || ((typeof window !== 'undefined' ? window : globalThis).Terrarium = {});

  const LARGEUR = 600;
  const HAUTEUR = 744;
  const VERRE = { x0: 34, y0: 60, x1: 566, y1: 682 };
  const VUE_ENTIERE = `0 0 ${LARGEUR} ${HAUTEUR}`;
  const RAPPORT_9_16 = 1080 / 1920;
  const SOCLE = 726; // bas du socle du vivarium, dans le dessin

  // Points fixes du dessin, pour la caméra (coordonnées du SVG).
  const CIBLES = {
    ensemble: [300, 372],
    branche: [300, 360],
    cascade: [453, 392],
    sable: [424.7, 503.9],
    mousse: [341.1, 578.2],
    galets: [253.2, 610.4],
    bassin: [190, 626],
    pousse: [319, 636],
    dionee: [392, 618],
    grenouille: [166, 616],
    fourmiliere: [496, 640],
    sol: [380, 630],
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  // *mot* : mis en valeur (couleur d'accent) dans les légendes et les cartes.
  const marquer = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Découpe la légende d'un plan en morceaux minutés (voir shared/scenarios.js).
  const morceauxDe = (plan) => (T.scenarios && T.scenarios.morceaux
    ? T.scenarios.morceaux(plan)
    : (plan.legende ? [{ texte: [].concat(plan.legende).join(' '), debut: plan.debut, fin: plan.fin }] : []));

  // --- Cartes de révélation (HTML pur : utilisable en Node pour la vidéo) ----
  function carteHTML(carte, id) {
    let corps = '';
    if (carte.type === 'phrase') {
      // Le format TikTok : une seule phrase forte, lisible en un coup d'œil.
      return `<div class="carte-in carte-phrase">${carte.titre ? `<p class="carte-titre">${esc(carte.titre)}</p>` : ''}<p class="carte-item carte-texte">${marquer(carte.texte)}</p></div>`;
    }
    if (carte.type === 'code') {
      corps = `<pre class="carte-code">${carte.lignes.map((l, i) => `<span class="carte-item ligne${(carte.surligne || []).includes(i) ? ' surligne' : ''}">${esc(l) || ' '}</span>`).join('')}</pre>`;
    } else if (carte.type === 'etapes') {
      corps = `<ol class="carte-etapes">${carte.etapes.map((e, i) => `<li class="carte-item"><span class="carte-num">${i + 1}</span><span>${esc(e)}</span></li>`).join('')}</ol>${carte.boucle ? `<p class="carte-item carte-boucle">${esc(carte.boucle)}</p>` : ''}`;
    } else if (carte.type === 'barres') {
      const max = Math.max(...carte.barres.map((b) => b.max || b.valeur));
      corps = `<div class="carte-barres">${carte.barres.map((b) => `
        <div class="carte-item barre ${b.ton === 'alerte' ? 'alerte' : 'ok'}">
          <div class="barre-tete"><span>${esc(b.label)}</span><strong>${esc(b.texte || b.valeur)}</strong></div>
          <div class="barre-piste"><div class="barre-fill" data-ratio="${Math.min(1, b.valeur / max).toFixed(4)}"></div>${b.limite ? `<div class="barre-limite" style="left:${((b.limite / max) * 100).toFixed(2)}%"></div>` : ''}</div>
          ${b.note ? `<small>${esc(b.note)}</small>` : ''}
        </div>`).join('')}</div>`;
    }
    return `<div class="carte-in"><p class="carte-titre">${esc(carte.titre)}</p>${corps}</div>`;
  }

  // --- Construction de la timeline --------------------------------------------
  function construire(o) {
    const svg = o.svg;
    const sc = o.scenario;
    const racine = o.racine || svg.parentNode;
    const q = (s) => svg.querySelector(s);
    const qa = (s) => svg.querySelectorAll(s);
    const D = sc.duree;
    const tl = gsap.timeline({ paused: true });
    const art = T.art;
    const PEAU = art.PEAU;
    const R = art.graine(97);
    const entre = (a, b) => a + (b - a) * R();

    // fromTo sans rendu immédiat : l'état ne dépend que de la position de la timeline.
    const ft = (cible, de, vers, t) => tl.fromTo(cible, de, { ...vers, immediateRender: false }, t);
    // État de repos : appliqué tout de suite (image 0), et inscrit au début de la timeline.
    const repos = (cible, vars) => { gsap.set(cible, vars); tl.set(cible, vars, 0); };

    // Conversions entre le repère du dessin et celui d'un élément (caméra au repos).
    svg.setAttribute('viewBox', VUE_ENTIERE);
    const versDessin = (el, x, y) => new DOMPoint(x, y).matrixTransform(svg.getScreenCTM().inverse().multiply(el.getScreenCTM()));
    const versElement = (el, p) => new DOMPoint(p.x, p.y).matrixTransform(el.getScreenCTM().inverse().multiply(svg.getScreenCTM()));

    // Une boucle d'ambiance : une animation finie, rejouée de « phase » à « phase + D ».
    function boucle(fabrique, phase) {
      const sous = gsap.timeline({ paused: true });
      fabrique(sous);
      tl.add(sous.tweenFromTo(phase || 0, (phase || 0) + D, { ease: 'none', immediateRender: false }), 0);
    }
    const fois = (duree, phase) => Math.ceil((D + (phase || 0)) / duree) + 2;

    // --- Décor de départ --------------------------------------------------------
    const decor = sc.decor || {};
    const cam = q('#cam');
    const chemin = { path: '#branche-chemin', autoRotate: true };
    repos(svg, { attr: { viewBox: VUE_ENTIERE } });
    repos(qa('#cam-langue, #grenouille-ondes, #scarabee, #goutte-requete, .eclaireuse, #butin > *, #eclats > *, .feuille-chute'), { opacity: 0 });
    repos(qa('#dionee-g, #dionee-d'), { rotation: -30, svgOrigin: '0 0' });
    repos(q('#cadre-lueur'), { opacity: 0, attr: { stroke: '#ffe08a' } });
    repos(qa('.pousse'), { scale: 1, svgOrigin: (i, el) => el.dataset.o });
    repos(qa('.fourmi-corps'), { scaleX: 1 });

    const etat = { couleur: 'vert', pupille: 0, mouche: null, place: null };
    const teinter = (nom, t, duree) => {
      const [c1, f1] = PEAU[etat.couleur];
      const [c2, f2] = PEAU[nom];
      ft(qa('.cam-peau, .cam-oeil'), { fill: c1 }, { fill: c2, duration: duree }, t);
      ft(qa('.cam-trait'), { stroke: c1 }, { stroke: c2, duration: duree }, t);
      ft(qa('.cam-trait2, .cam-raie, .cam-crete'), { stroke: f1 }, { stroke: f2, duration: duree }, t);
      etat.couleur = nom;
    };
    repos(qa('.cam-peau, .cam-oeil'), { fill: PEAU.vert[0] });
    repos(qa('.cam-trait'), { stroke: PEAU.vert[0] });
    repos(qa('.cam-trait2, .cam-raie, .cam-crete'), { stroke: PEAU.vert[1] });
    repos(qa('.cam-ventre'), { fill: PEAU.ventre || '#cfe9a0' });
    repos(q('#cam-flip'), { scaleX: 1, svgOrigin: '0 0' });
    repos(q('#cam-pupille'), { rotation: 0, svgOrigin: '46 -36' });

    if (typeof decor.cameleon === 'number') {
      gsap.set(cam, { motionPath: { ...chemin, start: decor.cameleon, end: decor.cameleon } });
      repos(cam, { motionPath: { ...chemin, start: decor.cameleon, end: decor.cameleon } });
      etat.place = decor.cameleon;
    }
    if (decor.mouche === 'cachee') repos(q('#mouche'), { opacity: 0, x: 560, y: 100 });

    // Mousse et sa lanterne (calque d'écran, présent seulement dans les vidéos de nuit).
    const rq = (s) => racine.querySelector(s);
    const rqa = (s) => racine.querySelectorAll(s);
    const gardien = rq('#mousse');
    if (gardien) {
      const eteinte = decor.lanterne === 'eteinte';
      repos(rq('#noir'), { opacity: eteinte ? 1 : 0 });
      repos(rq('#lumiere'), { opacity: eteinte ? 0 : 1 });
      repos(rq('#lanterne-lueur'), { opacity: eteinte ? 0 : 1 });
      repos(rqa('#mousse-oeil > g'), { opacity: 0 });
      repos(rq('#oeil-neutre'), { opacity: 1 });
      etat.humeur = 'neutre';
    }
    // Le voile d'obscurité suit la caméra : le sujet reste éclairé.
    const voile = q('#nuit-trou');
    const trou = (v) => {
      const [x, y, w, h] = v.split(' ').map(Number);
      return { cx: x + w / 2, cy: y + 0.4 * h, r: 0.33 * w };
    };

    // --- Gestes du caméléon -----------------------------------------------------
    const oeil = () => versDessin(q('#cam-corps'), 46, -36);
    function pupilleVers(angle, t, duree) {
      ft(q('#cam-pupille'), { rotation: etat.pupille, svgOrigin: '46 -36' }, { rotation: angle, svgOrigin: '46 -36', duration: duree, ease: 'power2.inOut' }, t);
      etat.pupille = angle;
    }
    function pas(t, duree) {
      const n = Math.max(1, Math.floor(duree / 0.9));
      const p = gsap.timeline({ repeat: n - 1 });
      // Un pas dure 0,9 s : les pattes avant et arrière en opposition, le corps qui ondule.
      p.fromTo(q('#cam-patte-av'), { rotation: 0, svgOrigin: '24 -18' }, { rotation: 16, svgOrigin: '24 -18', duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1, immediateRender: false }, 0)
        .fromTo(q('#cam-patte-ar'), { rotation: 0, svgOrigin: '-18 -14' }, { rotation: -16, svgOrigin: '-18 -14', duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1, immediateRender: false }, 0)
        .fromTo(q('#cam-corps'), { y: 0 }, { y: -1.6, duration: 0.225, ease: 'sine.inOut', yoyo: true, repeat: 3, immediateRender: false }, 0);
      tl.add(p, t);
    }
    // La rotation suit toujours le sens de la branche (autoRotate 180 au retour) :
    // c'est le retournement (#cam-flip) qui le fait regarder dans l'autre sens.
    function marcher(de, a, t, duree) {
      tl.to(cam, { motionPath: { ...chemin, autoRotate: a < de ? 180 : true, start: de, end: a }, duration: duree, ease: 'sine.inOut', immediateRender: false }, t);
      pas(t, duree);
      etat.place = a;
    }
    function balayer(t, duree) {
      const d = duree || 2.4;
      pupilleVers(-120, t, d * 0.25);
      pupilleVers(60, t + d * 0.38, d * 0.3);
      pupilleVers(0, t + d * 0.78, d * 0.22);
    }
    let sens = 1;
    function tourner(t) {
      ft(q('#cam-flip'), { scaleX: sens, svgOrigin: '0 0' }, { scaleX: -sens, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, t);
      sens = -sens;
    }

    // --- Catalogue des actions ---------------------------------------------------
    // Chaque action reçoit le temps absolu « t » et ses paramètres.
    const A = {
      // La boîte en verre
      'cadre.lueur'(t, p) {
        tl.set(q('#cadre-lueur'), { attr: { stroke: p.couleur || '#ffe08a' } }, t);
        ft(q('#cadre-lueur'), { opacity: 0 }, { opacity: 0.9, duration: 0.7, yoyo: true, repeat: (p.fois || 2) * 2 - 1, ease: 'sine.inOut' }, t);
      },
      'plantes.grandir'(t, p) {
        ft(qa('.pousse'), { scale: 1, svgOrigin: (i, el) => el.dataset.o }, { scale: p.facteur || 1.55, svgOrigin: (i, el) => el.dataset.o, duration: p.duree || 2.6, ease: 'power1.in' }, t);
        etat.pousse = p.facteur || 1.55;
      },
      'cadre.alerte'(t) {
        tl.set(q('#cadre-lueur'), { attr: { stroke: '#ff6b57' } }, t);
        ft(q('#cadre-lueur'), { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 5 }, t);
        ft(q('#couvercle'), { y: 0 }, { y: -5, duration: 0.09, yoyo: true, repeat: 9 }, t);
      },
      'plantes.tailler'(t, p) {
        ft(qa('.pousse'), { scale: etat.pousse || 1.55, svgOrigin: (i, el) => el.dataset.o }, { scale: 1, svgOrigin: (i, el) => el.dataset.o, duration: p.duree || 1.1, ease: 'back.out(1.6)' }, t);
        qa('.feuille-chute').forEach((f) => {
          const d = f.dataset;
          const t0 = t + Number(d.retard);
          tl.set(f, { opacity: 1 }, t0);
          ft(f, { x: +d.x, y: +d.y, rotation: +d.a }, { x: +d.x + +d.dx, y: +d.yfin, rotation: +d.a + +d.da, duration: +d.d, ease: 'power1.in' }, t0);
          ft(f, { opacity: 1 }, { opacity: 0, duration: 0.8 }, t0 + 2.6);
        });
      },
      'cadre.apaiser'(t) {
        tl.set(q('#cadre-lueur'), { attr: { stroke: '#b9f29a' } }, t);
        ft(q('#cadre-lueur'), { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t);
        ft(q('#cadre-lueur'), { opacity: 0.9 }, { opacity: 0, duration: 2.4 }, t + 0.3);
      },

      // Le caméléon
      'cameleon.balayer'(t, p) { balayer(t, p.duree); },
      'cameleon.marcher'(t, p) { marcher(p.depuis, p.vers, t, p.duree); },
      'cameleon.tourner'(t) { tourner(t); },
      'mouche.venir'(t, p) {
        const o = oeil();
        const cible = { x: o.x + (p.dx ?? 56), y: o.y + (p.dy ?? -112) };
        const duree = p.duree || 1.1;
        tl.set(q('#mouche'), { opacity: 1 }, t);
        ft(q('#mouche'), { x: p.depuisX ?? 560, y: p.depuisY ?? 100 }, { x: cible.x, y: cible.y, duration: duree, ease: 'power2.out' }, t);
        const n = Math.max(1, Math.round((p.attente ?? 1.5) / 0.12));
        ft(q('#mouche'), { x: cible.x, y: cible.y }, { x: cible.x + 5, y: cible.y - 4, duration: 0.12, yoyo: true, repeat: n % 2 ? n : n + 1 }, t + duree);
        etat.mouche = cible;
      },
      'cameleon.viser'(t, p) {
        const local = versElement(q('#cam-corps'), etat.mouche);
        pupilleVers((Math.atan2(local.y + 36, local.x - 46) * 180) / Math.PI, t, p.duree || 0.6);
      },
      'cameleon.langue'(t, p) {
        const local = versElement(q('#cam-corps'), etat.mouche);
        etat.rate = Boolean(p.rate);
        tl.set(q('#cam-langue'), { opacity: 1 }, t);
        ft(q('#cam-langue-fil'), { attr: { x2: 64, y2: -28 } }, { attr: { x2: local.x, y2: local.y }, duration: 0.16, ease: 'power3.out' }, t);
        tl.set(q('#cam-langue-bout'), { attr: { r: 4.5 } }, t);
        ft(q('#cam-langue-bout'), { attr: { cx: 64, cy: -28 } }, { attr: { cx: local.x, cy: local.y }, duration: 0.16, ease: 'power3.out' }, t);
        ft(q('#cam-tete'), { x: 0 }, { x: 3, duration: 0.1, yoyo: true, repeat: 1 }, t);
        if (!p.rate) {
          tl.set(q('#mouche'), { opacity: 0 }, t + 0.16);
          ft(q('#cam-langue-bout'), { attr: { r: 4.5 } }, { attr: { r: 7 }, duration: 0.15 }, t + 0.16);
        }
        etat.langue = local;
      },
      'cameleon.ramener'(t) {
        const l = etat.langue;
        ft(q('#cam-langue-fil'), { attr: { x2: l.x, y2: l.y } }, { attr: { x2: 64, y2: -28 }, duration: 0.3, ease: 'power2.in' }, t);
        ft(q('#cam-langue-bout'), { attr: { cx: l.x, cy: l.y, r: etat.rate ? 4.5 : 7 } }, { attr: { cx: 64, cy: -28, r: 4.5 }, duration: 0.3, ease: 'power2.in' }, t);
        tl.set(q('#cam-langue'), { opacity: 0 }, t + 0.3);
        if (!etat.rate) tl.set(q('#mouche'), { x: 560, y: 100 }, t + 0.3);
      },
      'cameleon.avaler'(t) {
        ft(q('#cam-corps'), { scaleY: 1, svgOrigin: '0 0' }, { scaleY: 1.07, svgOrigin: '0 0', duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t);
      },
      'cameleon.teinte'(t, p) { teinter(p.couleur, t, p.duree || 1.4); },
      'cameleon.repos'(t) { pupilleVers(0, t, 0.6); },

      // La dionée et la grenouille
      'pousse.trembler'(t, p) {
        const n = Math.max(1, Math.round((p.duree || 3) / 0.5));
        ft(q('#pousse-tendre'), { rotation: 0, svgOrigin: '318 652' }, { rotation: 6, svgOrigin: '318 652', duration: 0.5, yoyo: true, repeat: n % 2 ? n : n + 1, ease: 'sine.inOut' }, t);
      },
      'scarabee.avancer'(t, p) {
        const d = p.duree || 2.5;
        tl.set(q('#scarabee'), { x: 478, y: 656, scale: 1, rotation: 0, transformOrigin: '50% 50%' }, t);
        ft(q('#scarabee'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, t);
        ft(q('#scarabee'), { x: 478, y: 656 }, { x: 404, y: 636, duration: d, ease: 'none' }, t + 0.4);
        const n = Math.round(d / 0.14);
        ft(q('#scarabee'), { rotation: 0 }, { rotation: 5, duration: 0.14, yoyo: true, repeat: n % 2 ? n : n + 1, ease: 'sine.inOut' }, t + 0.4);
      },
      'dionee.fermer'(t) {
        ft(qa('#dionee-g, #dionee-d'), { rotation: -30, svgOrigin: '0 0' }, { rotation: -2, svgOrigin: '0 0', duration: 0.1, ease: 'power4.in' }, t);
        ft(q('#scarabee'), { opacity: 1, scale: 1, transformOrigin: '50% 50%' }, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.1 }, t);
        ft(q('#dionee'), { x: 0 }, { x: -3, duration: 0.04 }, t + 0.06);
        ft(q('#dionee'), { x: -3 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.2)' }, t + 0.1);
      },
      'dionee.ouvrir'(t, p) {
        ft(qa('#dionee-g, #dionee-d'), { rotation: -2, svgOrigin: '0 0' }, { rotation: -30, svgOrigin: '0 0', duration: p.duree || 0.9, ease: 'power2.out' }, t);
      },
      'grenouille.coasser'(t, p) {
        for (let i = 0; i < (p.fois || 3); i += 1) {
          const ti = t + i * 0.85;
          ft(q('#grenouille-sac'), { scale: 1, svgOrigin: '0 -8.3' }, { scale: 2.4, svgOrigin: '0 -8.3', duration: 0.22, ease: 'power2.out' }, ti);
          ft(q('#grenouille-sac'), { scale: 2.4, svgOrigin: '0 -8.3' }, { scale: 1, svgOrigin: '0 -8.3', duration: 0.3 }, ti + 0.22);
          ft(q('#grenouille-ondes'), { opacity: 0, scale: 0.7, svgOrigin: '0 -14' }, { opacity: 1, scale: 1.25, svgOrigin: '0 -14', duration: 0.3 }, ti);
          ft(q('#grenouille-ondes'), { opacity: 1 }, { opacity: 0, duration: 0.3 }, ti + 0.3);
        }
      },

      // Le ruisseau
      'goutte.apparaitre'(t) {
        const g = q('#goutte-requete');
        tl.set(g, { motionPath: { path: '#ruisseau', start: 0, end: 0 } }, t);
        tl.set(g.querySelector('path'), { fill: '#8a6a3a' }, t);
        tl.set(g, { opacity: 1 }, t);
        ft(g, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, t);
        repos(g.querySelector('path'), { fill: '#8a6a3a' });
      },
      'goutte.couler'(t, p) {
        tl.to(q('#goutte-requete'), { motionPath: { path: '#ruisseau', start: p.depuis, end: p.vers }, duration: p.duree || 1.2, ease: p.ease || 'sine.inOut', immediateRender: false }, t);
      },
      'goutte.eclaircir'(t, p) {
        ft(q('#goutte-requete path'), { fill: '#8a6a3a' }, { fill: '#bfeaf2', duration: p.duree || 1.4 }, t);
      },
      'filtre.signaler'(t, p) {
        ft(q('#filtre-' + p.filtre), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.5, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t);
      },
      'goutte.bassin'(t) {
        ft(q('#goutte-requete'), { scale: 1, opacity: 1, transformOrigin: '50% 50%' }, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.4 }, t);
        qa('#eclats > *').forEach((e, i) => {
          ft(e, { scale: 0.4, opacity: 1, svgOrigin: '196 628' }, { scale: 5, opacity: 0, svgOrigin: '196 628', duration: 1.6 }, t + 0.25 * i);
        });
      },

      // Les fourmis
      'fourmiliere.agiter'(t) {
        ft(q('#fourmiliere'), { scale: 1, svgOrigin: '500 662' }, { scale: 1.15, svgOrigin: '500 662', duration: 0.4, yoyo: true, repeat: 3 }, t);
      },
      'fourmis.ecarter'(t) { ft(qa('.fourmi.amb'), { opacity: 1 }, { opacity: 0, duration: 0.4 }, t); },
      'fourmis.revenir'(t) { ft(qa('.fourmi.amb'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, t); },
      'eclaireuses.partir'(t, p) {
        ['a', 'b', 'c'].forEach((k, i) => {
          const el = q('.e-' + k);
          const piste = '#piste-' + k;
          tl.set(el, { opacity: 1, motionPath: { path: piste, autoRotate: true, start: 0, end: 0 } }, t);
          tl.set(el.querySelector('.charge'), { opacity: 0 }, t);
          tl.to(el, { motionPath: { path: piste, autoRotate: true, start: 0, end: 1 }, duration: (p.duree || 3) + i * 0.4, ease: 'sine.inOut', immediateRender: false }, t);
        });
      },
      'eclaireuses.fouiller'(t, p) {
        const n = Math.max(1, Math.round((p.duree || 2.4) / 0.2));
        ft(qa('.eclaireuse'), { scaleX: 1 }, { scaleX: 0.8, duration: 0.2, yoyo: true, repeat: n % 2 ? n : n + 1, ease: 'sine.inOut' }, t);
      },
      'eclaireuses.revenir'(t, p) {
        ['a', 'b', 'c'].forEach((k, i) => {
          const el = q('.e-' + k);
          const piste = '#piste-' + k;
          ft(el.querySelector('.charge'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
          ft(el.querySelector('.fourmi-corps'), { scaleX: 1 }, { scaleX: -1, duration: 0.25 }, t);
          tl.to(el, { motionPath: { path: piste, autoRotate: 180, start: 1, end: 0 }, duration: (p.duree || 3) + i * 0.4, ease: 'sine.inOut', immediateRender: false }, t);
        });
      },
      'butin.montrer'(t) {
        ft(qa('.eclaireuse'), { opacity: 1 }, { opacity: 0, duration: 0.3 }, t);
        ft(qa('#butin > *'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.15, ease: 'back.out(2.5)' }, t);
        A['fourmiliere.agiter'](t);
      },
      'butin.cacher'(t) { ft(qa('#butin > *'), { opacity: 1 }, { opacity: 0, duration: 0.5 }, t); },

      // Les gags de la mouche
      'mouche.esquiver'(t, p) {
        const de = etat.mouche;
        const vers = { x: de.x + (p.dx ?? 60), y: de.y + (p.dy ?? -50) };
        ft(q('#mouche'), { x: de.x, y: de.y }, { x: vers.x, y: vers.y, duration: p.duree || 0.18, ease: 'power3.out' }, t);
        etat.mouche = vers;
      },
      'mouche.narguer'(t, p) {
        // Deux petites boucles moqueuses au-dessus de sa place, puis retour.
        const c = etat.mouche;
        const r = p.rayon || 18;
        const n = 16;
        const d = (p.duree || 1.6) / n;
        let prec = { x: c.x, y: c.y };
        for (let k = 1; k <= n; k += 1) {
          const a = (k / n) * Math.PI * 4;
          const pt = k === n ? { x: c.x, y: c.y } : { x: c.x + r * Math.sin(a), y: c.y - r * (1 - Math.cos(a)) };
          ft(q('#mouche'), { x: prec.x, y: prec.y }, { x: pt.x, y: pt.y, duration: d, ease: 'none' }, t + (k - 1) * d);
          prec = pt;
        }
      },

      // Mousse, le gardien
      'gardien.lanterne'(t, p) {
        if (!gardien) return;
        const allumer = p.etat !== 'eteindre';
        const [avant, apres] = allumer ? [0, 1] : [1, 0];
        ft(rq('#lanterne-lueur'), { opacity: avant }, { opacity: apres, duration: 0.1 }, t);
        ft(rq('#lumiere'), { opacity: avant }, { opacity: apres, duration: allumer ? 0.15 : 0.3 }, t + (allumer ? 0.05 : 0));
        ft(rq('#noir'), { opacity: apres }, { opacity: avant, duration: allumer ? 0.12 : 0.3 }, t + (allumer ? 0.05 : 0));
        if (allumer) ft(rq('#lanterne-flamme'), { scale: 0.3, transformOrigin: '50% 100%' }, { scale: 1, transformOrigin: '50% 100%', duration: 0.25, ease: 'back.out(3)' }, t);
      },
      'gardien.expression'(t, p) {
        if (!gardien) return;
        const humeur = p.humeur || 'neutre';
        if (humeur === etat.humeur) return;
        tl.set(rq('#oeil-' + etat.humeur), { opacity: 0 }, t);
        tl.set(rq('#oeil-' + humeur), { opacity: 1 }, t);
        ft(rq('#mousse-corps'), { y: 0 }, { y: -14, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t);
        etat.humeur = humeur;
      },
    };

    // --- Ambiance (vidéo seulement : sur le site, le vivarium vit déjà) -----------
    if (o.ambiance) {
      qa('.sway').forEach((el) => {
        const amp = Number(el.dataset.amp) || 3;
        const d = entre(2.6, 5.4);
        const ph = entre(0, d * 2);
        boucle((s) => s.fromTo(el, { rotation: -amp, svgOrigin: el.dataset.o }, { rotation: amp, svgOrigin: el.dataset.o, duration: d, ease: 'sine.inOut', yoyo: true, repeat: fois(d, ph) }), ph);
      });
      qa('.chute-fil path').forEach((p, i) => boucle((s) => s.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -96, duration: 0.9, ease: 'none', repeat: fois(0.9, i * 0.2) }), i * 0.2));
      boucle((s) => s.fromTo(qa('.courant:not(.lent)'), { strokeDashoffset: 0 }, { strokeDashoffset: -72, duration: 1.6, ease: 'none', repeat: fois(1.6) }));
      boucle((s) => s.fromTo(qa('.courant.lent'), { strokeDashoffset: 0 }, { strokeDashoffset: -86, duration: 2.6, ease: 'none', repeat: fois(2.6) }));
      qa('.bulle').forEach((b, i) => boucle((s) => s.fromTo(b, { scale: 1, opacity: 1, transformOrigin: '50% 50%' }, { scale: 1.5, opacity: 0.4, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: fois(0.5, i * 0.13) }), i * 0.13));
      qa('.ride').forEach((r, i) => boucle((s) => s.fromTo(r, { scale: 0.4, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3.2, opacity: 0, transformOrigin: '50% 50%', duration: 2.6, ease: 'power1.out', repeat: fois(2.6, i * 1.2) }), i * 1.2));
      boucle((s) => s.fromTo(q('#rayons'), { opacity: 1 }, { opacity: 0.55, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: fois(4.5) }));
      qa('.luciole').forEach((l) => {
        boucle((s) => {
          let x = 0;
          let y = 0;
          for (let k = 0; k < Math.ceil(D / 4) + 2; k += 1) {
            const nx = entre(-34, 34);
            const ny = entre(-40, 40);
            s.fromTo(l, { x, y }, { x: nx, y: ny, duration: 5, ease: 'sine.inOut' });
            x = nx; y = ny;
          }
        });
        const d = entre(0.9, 2.2);
        const ph = entre(0, 3);
        boucle((s) => s.fromTo(l, { opacity: 0.15 }, { opacity: 0.95, duration: d, yoyo: true, repeat: fois(d, ph) }), ph);
      });
      qa('.papillon').forEach((p, i) => {
        boucle((s) => s.fromTo(p.querySelectorAll('.aile'), { scaleX: 1, svgOrigin: '0 0' }, { scaleX: 0.15, svgOrigin: '0 0', duration: 0.16, yoyo: true, repeat: fois(0.16), ease: 'sine.inOut' }));
        boucle((s) => {
          let pos = { x: i ? 150 : 380, y: i ? 200 : 250, rotation: 0 };
          let total = 0;
          while (total < D + 6) {
            const suivant = { x: entre(70, 530), y: entre(110, 430), rotation: entre(-25, 25) };
            const d = entre(3, 6);
            s.fromTo(p, { ...pos }, { ...suivant, duration: d, ease: 'sine.inOut' });
            pos = suivant;
            total += d;
          }
        });
      });
      boucle((s) => s.fromTo(q('#grenouille-gorge'), { scaleX: 1, scaleY: 1, transformOrigin: '50% 30%' }, { scaleX: 1.15, scaleY: 1.5, transformOrigin: '50% 30%', duration: 0.9, yoyo: true, repeat: fois(0.9), ease: 'sine.inOut' }));
      boucle((s) => s.fromTo(qa('.grenouille-yeux ellipse'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.09, yoyo: true, repeat: fois(3.6), repeatDelay: 3.4 }), 1.2);
      boucle((s) => s.fromTo(qa('#grenouille-in, .nenuphar'), { y: 0 }, { y: 1.5, duration: 2.2, yoyo: true, repeat: fois(2.2), ease: 'sine.inOut' }));
      boucle((s) => s.fromTo(q('#escargot-in'), { x: 0 }, { x: 34, duration: 40, ease: 'none', yoyo: true, repeat: fois(40) }));
      boucle((s) => s.fromTo(q('#escargot-in'), { scaleX: 1, transformOrigin: '0% 100%' }, { scaleX: 1.05, transformOrigin: '0% 100%', duration: 1.6, yoyo: true, repeat: fois(1.6), ease: 'sine.inOut' }));
      qa('.fourmi.amb').forEach((f, i) => boucle((s) => s.to(f, { motionPath: { path: '#piste', autoRotate: true }, duration: 20, ease: 'none', repeat: fois(20, i * 4) }), i * 4));
      boucle((s) => s.fromTo(qa('.aile-m'), { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 0.2, transformOrigin: '50% 100%', duration: 0.05, yoyo: true, repeat: fois(0.05) }));
      if (decor.mouche !== 'cachee') {
        boucle((s) => {
          let pos = { x: 430, y: 150 };
          let total = 0;
          while (total < D + 2) {
            const suivant = { x: entre(330, 530), y: entre(100, 190) };
            const d = entre(0.7, 1.6);
            s.fromTo(q('#mouche'), { ...pos }, { ...suivant, duration: d, ease: 'sine.inOut' });
            pos = suivant;
            total += d;
          }
        });
      }
      if (gardien) {
        boucle((s) => s.fromTo(rq('#mousse-corps'), { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 1.025, transformOrigin: '50% 100%', duration: 1.4, yoyo: true, repeat: fois(1.4), ease: 'sine.inOut' }));
        boucle((s) => s.fromTo(rq('#mousse-perche'), { rotation: -2, svgOrigin: '597.5 1395' }, { rotation: 2.5, svgOrigin: '597.5 1395', duration: 2.2, yoyo: true, repeat: fois(2.2), ease: 'sine.inOut' }));
        boucle((s) => s.fromTo(rq('#mousse-oeil'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: fois(3.2), repeatDelay: 3 }), 1.5);
        boucle((s) => s.fromTo(rq('#lanterne-flamme'), { scaleY: 0.92, transformOrigin: '50% 100%' }, { scaleY: 1.06, transformOrigin: '50% 100%', duration: 0.13, yoyo: true, repeat: fois(0.13), ease: 'sine.inOut' }));
      }
      if (rq('.curseur')) boucle((s) => s.fromTo(rqa('.curseur'), { opacity: 1 }, { opacity: 0, duration: 0.45, yoyo: true, repeat: fois(0.45), ease: 'steps(1)' }));
      // Sans rôle dans la scène, le caméléon se promène sur sa branche.
      if (decor.cameleon === undefined || decor.cameleon === 'promenade') {
        let t = 0;
        let place = 0.2;
        gsap.set(cam, { motionPath: { ...chemin, start: place, end: place } });
        repos(cam, { motionPath: { ...chemin, start: place, end: place } });
        while (t < D - 1) {
          const but = sens === 1 ? 0.62 : 0.18;
          const d = Math.min(14, D - t);
          const vers = place + (but - place) * (d / 14);
          marcher(place, vers, t, d);
          place = vers;
          t += d + 0.2;
          if (t + 3.4 > D) break;
          balayer(t, 2.4);
          tourner(t + 2.8);
          t += 3.6;
        }
      }
    }

    // --- Plans : caméra, actions, légendes, cartes ---------------------------------
    const cibleDe = (c) => {
      if (Array.isArray(c)) return c;
      if (c === 'cameleon') { const p = versDessin(q('#cam-corps'), 6, -28); return [p.x, p.y]; }
      if (c === 'cameleon-oeil') { const p = oeil(); return [p.x, p.y]; }
      if (!CIBLES[c]) throw new Error('Cible de caméra inconnue : ' + c);
      return CIBLES[c];
    };
    const borne = (v, min, max) => Math.min(Math.max(v, min), max);
    function vueDe(camera) {
      const zoom = Math.max(1, camera.zoom || 1);
      if (o.cadre === '9:16') {
        // Cadre vertical : la caméra filme toujours l'intérieur du verre, au rapport 9:16.
        const h = (VERRE.y1 - VERRE.y0) / zoom;
        const w = h * RAPPORT_9_16;
        const [cx, cy] = cibleDe(camera.cible || 'ensemble');
        // Le sujet est cadré aux 2/5 de la hauteur : le bas de l'écran reste aux légendes.
        const x = borne(cx - w / 2, VERRE.x0, VERRE.x1 - w);
        // Vers le bas, la caméra peut montrer le socle sombre (jusqu'à y = 726) :
        // il tombe sous la zone que l'interface TikTok recouvre.
        const y = borne(cy - h * 0.4, VERRE.y0, SOCLE - h);
        return `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
      }
      if (zoom <= 1) return VUE_ENTIERE;
      const [cx, cy] = cibleDe(camera.cible || 'ensemble');
      const w = LARGEUR / zoom;
      const h = HAUTEUR / zoom;
      const x = w <= VERRE.x1 - VERRE.x0 ? borne(cx - w / 2, VERRE.x0, VERRE.x1 - w) : (LARGEUR - w) / 2;
      const y = h <= VERRE.y1 - VERRE.y0 ? borne(cy - h / 2, VERRE.y0, VERRE.y1 - h) : (HAUTEUR - h) / 2;
      return `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
    }

    // Cadrage de départ : celui du premier plan (plein cadre en 9:16).
    let vue = o.cadre === '9:16' ? vueDe(sc.plans[0].camera || {}) : VUE_ENTIERE;
    repos(svg, { attr: { viewBox: vue } });
    if (voile) repos(voile, { attr: trou(vue) });

    // Hauteur (0 en haut, 1 en bas) où le sujet du plan tombe à l'écran.
    let sujet = sc.plans[0].camera || { cible: 'ensemble' };
    const hauteurSujet = (v) => {
      const [, cy] = cibleDe(sujet.cible || 'ensemble');
      const [, vy, , vh] = v.split(' ').map(Number);
      return (cy - vy) / vh;
    };

    sc.plans.forEach((plan, i) => {
      if (plan.camera) sujet = plan.camera;
      if (plan.camera && o.camera !== false) {
        const nouvelle = vueDe(plan.camera);
        if (nouvelle !== vue) {
          ft(svg, { attr: { viewBox: vue } }, { attr: { viewBox: nouvelle }, duration: plan.camera.duree ?? 0.9, ease: plan.camera.ease || 'power2.inOut' }, plan.debut);
          if (voile) ft(voile, { attr: trou(vue) }, { attr: trou(nouvelle), duration: plan.camera.duree ?? 0.9, ease: plan.camera.ease || 'power2.inOut' }, plan.debut);
          vue = nouvelle;
        }
      }
      (plan.actions || []).forEach((a) => {
        if (!A[a.type]) throw new Error('Action inconnue : ' + a.type);
        A[a.type](plan.debut + (a.a || 0), a);
      });
      // Site : la phrase complète du plan, d'un coup, sur la plaque de légende.
      if (typeof o.legende === 'function') {
        if (plan.legende) tl.call(o.legende, [[].concat(plan.legende).join(' ').replace(/\*/g, ''), i], plan.debut);
      }
      // Vidéo : chaque morceau remplace le précédent, sans blanc entre deux plans.
      if (typeof o.legende !== 'function') morceauxDe(plan).forEach((m, k) => {
        const terminal = racine.querySelector('#leg-' + i + '-' + k + ' .term-texte');
        if (terminal) {
          // Terminal de Mousse : 35 ms par lettre, jamais plus de la moitié du morceau.
          const lettres = terminal.querySelectorAll('.c');
          const pas = Math.min(0.035, ((m.fin - m.debut) * 0.5) / Math.max(1, lettres.length));
          lettres.forEach((c, j) => tl.set(c, { display: 'inline' }, m.debut + j * pas));
          return;
        }
        const el = racine.querySelector('#leg-' + i + '-' + k + ' .leg-texte');
        if (!el) return;
        // Sujet dans la moitié basse : la légende passe en haut pour ne pas le cacher.
        if (o.cadre === '9:16' && hauteurSujet(vue) > 0.5) el.classList.add('haut');
        ft(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'back.out(2.5)' }, m.debut);
      });
      if (plan.carte) {
        const carte = racine.querySelector('#carte-' + i);
        const dedans = carte.querySelector('.carte-in');
        if (o.cadre === '9:16' && hauteurSujet(vue) > 0.5) dedans.classList.add('bas');
        if (plan.carte.type === 'phrase') {
          repos(dedans, { opacity: 0 });
          ft(dedans, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' }, plan.debut);
          ft(dedans, { opacity: 1 }, { opacity: 0, duration: 0.2 }, plan.fin - 0.2);
          return;
        }
        repos(dedans, { opacity: 0 });
        ft(dedans, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, plan.debut);
        ft(carte.querySelectorAll('.carte-item'), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.35, stagger: plan.carte.rythme || 0.32, ease: 'power2.out' }, plan.debut + 0.45);
        carte.querySelectorAll('.barre-fill').forEach((b, k) => {
          ft(b, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: Number(b.dataset.ratio), transformOrigin: '0% 50%', duration: 1.2, ease: 'power2.out' }, plan.debut + 0.7 + k * (plan.carte.rythme || 0.32));
        });
        ft(dedans, { opacity: 1 }, { opacity: 0, duration: 0.35 }, plan.fin - 0.4);
      }
    });

    // La timeline couvre exactement la durée annoncée.
    tl.set({}, {}, D);
    return tl;
  }

  T.film = { construire, carteHTML, marquer, morceaux: morceauxDe, CIBLES };
})();
