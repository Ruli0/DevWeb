/*
 * Les illustrations animées de la chaîne « avis » : des dessins au trait (940 × 400) placés entre le plan et les sous-titres.
 * Couleurs par variables CSS : --fg (trait), --ac (accent), --bg (fond du plan). Chaque illustration : svg(p), jouer(c, el, p, t0, d).
 * Les mouvements qui se répètent ont un nombre fini de répétitions, calculé sur la durée du plan.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.illus = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const qa = (el, s) => [...el.querySelectorAll(s)];
  const T = 'fill="none" stroke="var(--fg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"';
  const A = 'fill="none" stroke="var(--ac)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"';
  const fois = (d, periode) => Math.max(1, Math.floor(d / periode));
  // Outils communs : tracer des traits, faire surgir des formes, balancer.
  const tracer = (c, els, t, duree, decalage) => { if (!els.length) return; gsap.set(els, { drawSVG: '0%' }); c.ft(els, { drawSVG: '0%' }, { drawSVG: '100%', duration: duree || 0.5, ease: 'power2.out', stagger: decalage == null ? 0.08 : decalage }, t); };
  const surgir = (c, els, t, decalage) => { if (!els.length) return; gsap.set(els, { scale: 0, transformOrigin: '50% 50%' }); c.ft(els, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: decalage == null ? 0.08 : decalage, transformOrigin: '50% 50%' }, t); };

  // --- Escalade : mains et pieds vus de profil, le mur à droite. ---
  const PEAU = '#f3c6a0';
  const membre = (d, w) => `<path d="${d}" fill="none" stroke="${PEAU}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const MUR = '<rect x="640" y="-60" width="360" height="520" fill="var(--fg)" opacity=".14"/><path d="M640 -60 V460" stroke="var(--fg)" stroke-width="6" opacity=".5"/>' + [[720, 40], [860, 150], [740, 300], [880, 380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="var(--fg)" opacity=".3"/>`).join('');
  // Un chausson : talon à l'origine, pointe en (240, 0), semelle sur y = 0.
  const CHAUSSON = '<path d="M8 0 C-14 0 -18 -44 4 -68 C28 -94 80 -88 120 -66 L232 -28 C256 -18 262 0 240 0 Z" fill="#f2c14e"/><path d="M20 -62 C60 -40 110 -36 150 -56" fill="none" stroke="#1b1b1f" stroke-width="7" opacity=".55"/><path d="M-2 0 H244" stroke="#1b1b1f" stroke-width="16" stroke-linecap="round"/><path d="M-2 -2 H244" stroke="#e0564a" stroke-width="5" stroke-linecap="round"/>';
  const pastille = (cls, x, y, bon) => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="40" fill="${bon ? '#3fae7c' : '#e0564a'}"/><path d="${bon ? `M${x - 18} ${y + 2} L${x - 5} ${y + 16} L${x + 20} ${y - 14}` : `M${x - 15} ${y - 15} L${x + 15} ${y + 15} M${x + 15} ${y - 15} L${x - 15} ${y + 15}`}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const fleche = (cls, d) => `<path class="${cls}" d="${d}" fill="none" stroke="var(--ac)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
  const battre = (c, els, t, d, v) => c.ft(els, { x: 0, y: 0 }, Object.assign({ duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.9) - 1 }, v), t);

  return {
    // Réglette : doigts arqués (à éviter), puis doigts tendus.
    reglette: {
      svg: () => `${MUR}<rect x="566" y="200" width="84" height="34" rx="10" fill="var(--ac)"/>
        ${membre('M210 440 L410 300', 66)}${membre('M410 300 L498 244', 58)}
        <g class="arque">${membre('M498 244 L548 150 L600 190', 36)}${pastille('pa', 430, 110, false)}</g>
        <g class="tendu">${membre('M498 244 L560 196 L612 188', 36)}${pastille('pt', 430, 110, true)}</g>`,
      jouer(c, el, p, t0, d) {
        const m = p.moment; const tb = t0 + (m && m.t != null ? Math.max(1, m.t - 0.2) : d * 0.5);
        gsap.set(qa(el, '.tendu'), { opacity: 0 });
        surgir(c, qa(el, '.pa'), t0 + 0.5);
        c.ft(qa(el, '.arque'), { opacity: 1 }, { opacity: 0, duration: 0.25 }, tb);
        c.ft(qa(el, '.tendu'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, tb);
        surgir(c, qa(el, '.pt'), tb + 0.1);
      },
    },
    // Pince : le pouce d'un côté, les doigts de l'autre, vus de face.
    pince: {
      svg: () => `<rect x="150" y="-60" width="640" height="520" rx="30" fill="var(--fg)" opacity=".1"/>
        <path d="M372 440 L372 330 C372 290 588 290 588 330 L588 440 Z" fill="${PEAU}"/>
        <rect x="425" y="40" width="100" height="270" rx="46" fill="var(--ac)"/>
        ${membre('M400 330 C372 270 380 210 414 170', 44)}
        ${[90, 140, 190, 240].map((y) => membre(`M600 ${y + 46} C612 ${y + 20} 580 ${y} 536 ${y + 4}`, 36)).join('')}
        ${fleche('fg1', 'M200 200 H330 M290 160 L332 200 L290 240')}${fleche('fd1', 'M740 200 H640 M680 160 L638 200 L680 240')}`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.fg1, .fd1'), t0 + 0.4);
        battre(c, qa(el, '.fg1'), t0 + 0.9, d, { x: 26 }); battre(c, qa(el, '.fd1'), t0 + 0.9, d, { x: -26 });
      },
    },
    // Aplat : la main posée à plat sur une prise ronde, le corps bas.
    aplat: {
      svg: () => `${MUR}<path d="M642 50 C480 50 450 350 642 350 Z" fill="var(--ac)"/>
        ${membre('M400 460 L470 270', 66)}${membre('M470 270 C482 150 540 86 618 74', 50)}
        ${fleche('bas', 'M250 120 V330 M206 288 L250 334 L294 288')}
        <path class="frot" d="M520 60 l-22 -22 M560 40 l-16 -26 M604 30 l-8 -30" fill="none" stroke="var(--fg)" stroke-width="8" stroke-linecap="round"/>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.bas'), t0 + 0.5, 0.5, 0); battre(c, qa(el, '.bas'), t0 + 1.1, d, { y: 24 });
        c.ft(qa(el, '.frot'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.6) - 1 }, t0 + 0.8);
      },
    },
    // Carre : le bord du chausson posé sur une petite prise.
    carre: {
      svg: () => `${MUR}<rect x="586" y="262" width="64" height="30" rx="9" fill="var(--ac)"/>
        ${membre('M392 196 L330 -40', 64)}<g transform="translate(352 262)">${CHAUSSON}</g>
        <circle class="point" cx="586" cy="250" r="34" fill="none" stroke="var(--ac)" stroke-width="10"/>`,
      jouer(c, el, p, t0, d) {
        const o = qa(el, '.point'); gsap.set(o, { scale: 0, transformOrigin: '50% 50%' });
        c.ft(o, { scale: 0.6, opacity: 1 }, { scale: 1.7, opacity: 0, duration: 0.8, ease: 'power2.out', repeat: fois(d, 0.8) - 1, transformOrigin: '50% 50%' }, t0 + 0.6);
      },
    },
    // Adhérence : pas de prise, la semelle à plat sur le mur incliné, le talon bas.
    adherence: {
      svg: () => `<path d="M520 460 L874 -40 H1000 V460 Z" fill="var(--fg)" opacity=".14"/><path d="M520 460 L874 -40" stroke="var(--fg)" stroke-width="6" opacity=".5"/>
        ${membre('M534 290 L400 30', 64)}<g transform="translate(566 372) rotate(-54.7)">${CHAUSSON}</g>
        ${fleche('pousse', 'M450 150 L548 220 M500 228 L550 221 L540 172')}
        ${fleche('talon', 'M420 330 V420 M388 390 L420 424 L452 390')}`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.pousse'), t0 + 0.5, 0.4, 0); battre(c, qa(el, '.pousse'), t0 + 1.0, d, { x: 20, y: 14 });
        const m = p.moment; gsap.set(qa(el, '.talon'), { drawSVG: '0%' });
        const tt = t0 + (m && m.t != null ? Math.max(1, m.t - 0.2) : d * 0.6);
        c.ft(qa(el, '.talon'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' }, tt);
      },
    },
    // Crochet talon : le talon posé sur la prise, la jambe tire vers soi.
    talon: {
      svg: () => `${MUR}<rect x="556" y="210" width="94" height="36" rx="10" fill="var(--ac)"/>
        ${membre('M532 150 L360 260 L290 460', 64)}<g transform="translate(588 208) rotate(-75)">${CHAUSSON}</g>
        ${fleche('tire', 'M520 330 C470 370 420 380 370 372 M408 338 L368 372 L410 400')}`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.tire'), t0 + 0.6, 0.5, 0); battre(c, qa(el, '.tire'), t0 + 1.2, d, { x: -22, y: 8 });
      },
    },
    question: {
      svg: () => `<circle class="s o1" cx="170" cy="140" r="56" ${T}/><rect class="s o2" x="700" y="190" width="110" height="110" rx="18" ${T}/>
        <path class="t" d="M395 140 C395 40 545 40 545 140 C545 205 470 205 470 275" ${A} stroke-width="30"/><circle class="s" cx="470" cy="345" r="20" fill="var(--ac)"/>
        <path class="t r" d="M300 60 L330 90 M640 60 L610 90 M290 300 L330 280" ${T}/>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.t'), t0, 0.6); surgir(c, qa(el, '.s'), t0 + 0.2);
        c.ft(qa(el, '.o1'), { y: 0 }, { y: -30, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: fois(d, 1.2) }, t0 + 0.7);
        c.ft(qa(el, '.o2'), { rotation: 0 }, { rotation: 90, duration: d, ease: 'none', transformOrigin: '50% 50%' }, t0 + 0.7);
      },
    },
    code: {
      svg: () => `<rect class="t" x="210" y="20" width="520" height="350" rx="28" ${T}/><path class="t" d="M210 90 L730 90" ${T}/>
        <circle class="s" cx="255" cy="55" r="11" fill="var(--ac)"/><circle class="s" cx="292" cy="55" r="11" fill="var(--fg)"/><circle class="s" cx="329" cy="55" r="11" fill="var(--fg)" opacity=".4"/>
        ${[[250, 130, 210, 'ac'], [290, 176, 320, 'fg'], [290, 222, 250, 'fg'], [330, 268, 170, 'ac'], [250, 314, 280, 'fg']].map(([x, y, w, k]) => `<rect class="l" x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="var(--${k})"/>`).join('')}
        <rect class="cur" x="545" y="308" width="14" height="32" fill="var(--ac)"/>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.t'), t0, 0.5); surgir(c, qa(el, '.s'), t0 + 0.2);
        const l = qa(el, '.l'); gsap.set(l, { scaleX: 0, transformOrigin: '0% 50%' });
        c.ft(l, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out', stagger: 0.28, transformOrigin: '0% 50%' }, t0 + 0.4);
        gsap.set(qa(el, '.cur'), { opacity: 0 });
        c.ft(qa(el, '.cur'), { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'steps(1)', yoyo: true, repeat: fois(d, 0.3) }, t0 + 1.9);
      },
    },
    chat: {
      svg: () => `<g class="b1"><rect x="440" y="10" width="420" height="120" rx="44" fill="var(--ac)"/><rect x="490" y="48" width="230" height="16" rx="8" fill="var(--bg)"/><rect x="490" y="80" width="150" height="16" rx="8" fill="var(--bg)"/></g>
        <g class="b2"><rect x="80" y="180" width="500" height="170" rx="50" ${T}/><circle class="p" cx="250" cy="265" r="17" fill="var(--fg)"/><circle class="p" cx="330" cy="265" r="17" fill="var(--fg)"/><circle class="p" cx="410" cy="265" r="17" fill="var(--fg)"/></g>
        <path class="x" d="M640 200 L770 330 M770 200 L640 330" ${A} stroke-width="20"/>`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.b1'), t0); surgir(c, qa(el, '.b2'), t0 + 0.45);
        c.ft(qa(el, '.p'), { y: 0 }, { y: -22, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.9) - 1, stagger: 0.12 }, t0 + 0.9);
        const m = p.moment || p.rayer; const tx = t0 + (m && m.t != null ? Math.max(0.8, m.t - 0.25) : d * 0.6);
        tracer(c, qa(el, '.x'), tx, 0.3, 0.12);
        c.ft(qa(el, '.b2'), { opacity: 1 }, { opacity: 0.4, duration: 0.3 }, tx + 0.15);
      },
    },
    balance: {
      svg: () => `<path class="t" d="M300 385 L640 385" ${T}/><path class="t" d="M430 380 L470 300 L510 380 Z" ${T}/>
        <g class="fleau"><path d="M130 300 L810 300" ${T} stroke-width="12"/>
          <g class="g"><rect x="150" y="170" width="170" height="124" rx="18" ${T}/><text x="235" y="252" text-anchor="middle" font-family="JetBrains Mono" font-size="62" fill="var(--fg)">&lt;/&gt;</text></g>
          <g class="dr"><rect x="630" y="160" width="170" height="110" rx="40" fill="var(--ac)"/><path d="M680 268 L672 296 L710 268 Z" fill="var(--ac)"/><rect x="662" y="196" width="106" height="14" rx="7" fill="var(--bg)"/><rect x="662" y="224" width="66" height="14" rx="7" fill="var(--bg)"/></g></g>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.t'), t0, 0.4);
        const f = qa(el, '.fleau'), o = { svgOrigin: '470 300' };
        const m = p.moment || p.droite; const tb = t0 + (m && m.t != null ? Math.max(0.9, m.t - 0.25) : d * 0.45);
        c.ft(f, Object.assign({ opacity: 0, rotation: 0 }, o), Object.assign({ opacity: 1, rotation: -9, duration: 0.7, ease: 'back.out(2)' }, o), t0 + 0.15);
        c.ft(f, Object.assign({ rotation: -9 }, o), Object.assign({ rotation: 9, duration: 1.1, ease: 'elastic.out(1, 0.5)' }, o), tb);
        c.ft(qa(el, '.dr'), { scale: 1 }, { scale: 1.18, duration: 0.5, ease: 'back.out(3)', transformOrigin: '50% 100%' }, tb);
        c.ft(qa(el, '.g'), { opacity: 1 }, { opacity: 0.45, duration: 0.5 }, tb);
      },
    },
    presentation: {
      svg: () => `<rect class="t" x="240" y="15" width="520" height="300" rx="22" ${T}/><path class="t" d="M330 318 L295 392 M670 318 L705 392" ${T}/>
        ${[[300, 70], [385, 115], [470, 160], [555, 215]].map(([x, h], i) => `<rect class="b" x="${x}" y="${280 - h}" width="56" height="${h}" rx="8" fill="var(--${i === 3 ? 'ac' : 'fg'})"/>`).join('')}
        <path class="f" d="M300 190 L420 150 L510 100 L690 50 M640 44 L692 50 L668 96" ${A}/>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.t'), t0, 0.5);
        const b = qa(el, '.b'); gsap.set(b, { scaleY: 0, transformOrigin: '50% 100%' });
        c.ft(b, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.12, transformOrigin: '50% 100%' }, t0 + 0.35);
        tracer(c, qa(el, '.f'), t0 + 1.0, 0.7, 0);
        c.ft(b, { scaleY: 1 }, { scaleY: 0.86, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 1.6) - 1, stagger: 0.15, transformOrigin: '50% 100%' }, t0 + 1.8);
      },
    },
    sortie: {
      svg: () => `<path class="t" d="M420 110 L420 90 L130 90 L130 310 L420 310 L420 290" ${T}/><text class="s" x="275" y="232" text-anchor="middle" font-family="JetBrains Mono" font-size="84" fill="var(--fg)">&lt;/&gt;</text>
        <circle class="bille" cx="275" cy="200" r="26" fill="var(--ac)"/>
        <path class="f" d="M470 200 L810 200 M756 150 L812 200 L756 250" ${A} stroke-width="16"/>`,
      jouer(c, el, p, t0, d) {
        tracer(c, qa(el, '.t'), t0, 0.5); surgir(c, qa(el, '.s'), t0 + 0.2);
        tracer(c, qa(el, '.f'), t0 + 0.5, 0.5, 0.1);
        const b = qa(el, '.bille'); gsap.set(b, { opacity: 0 });
        c.ft(b, { opacity: 1, x: 0 }, { x: 580, duration: 1.0, ease: 'power3.inOut', repeat: fois(d - 1, 1.5) - 1, repeatDelay: 0.5 }, t0 + 0.9);
      },
    },
    theatre: {
      svg: () => `<path class="lum" d="M470 40 L330 362 L610 362 Z" fill="var(--fg)" opacity=".16"/>
        <g class="acteur"><circle cx="470" cy="215" r="30" fill="var(--fg)"/><path d="M470 250 L470 315 M470 315 L440 362 M470 315 L500 362" ${T}/><path class="bg" d="M470 270 L415 235" ${T}/><path class="bd" d="M470 270 L525 235" ${T}/></g>
        <rect class="rg" x="120" y="44" width="350" height="318" fill="var(--ac)"/><rect class="rd" x="470" y="44" width="350" height="318" fill="var(--ac)"/>
        <rect x="100" y="14" width="740" height="36" rx="10" fill="var(--fg)"/><path d="M90 364 L850 364" ${T}/>`,
      jouer(c, el, p, t0, d) {
        gsap.set(qa(el, '.lum, .acteur'), { opacity: 0 });
        c.ft(qa(el, '.rg'), { scaleX: 1 }, { scaleX: 0.2, duration: 0.9, ease: 'power3.inOut', transformOrigin: '0% 50%' }, t0 + 0.25);
        c.ft(qa(el, '.rd'), { scaleX: 1 }, { scaleX: 0.2, duration: 0.9, ease: 'power3.inOut', transformOrigin: '100% 50%' }, t0 + 0.25);
        c.ft(qa(el, '.lum'), { opacity: 0 }, { opacity: 0.16, duration: 0.3 }, t0 + 0.9);
        c.ft(qa(el, '.acteur'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, t0 + 0.95);
        const n = 2 * fois(d, 1.0) - 1;
        c.ft(qa(el, '.bg'), { rotation: 0 }, { rotation: 35, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: n, svgOrigin: '470 270' }, t0 + 1.4);
        c.ft(qa(el, '.bd'), { rotation: 0 }, { rotation: -35, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: n, svgOrigin: '470 270' }, t0 + 1.4);
      },
    },
    micro: {
      svg: () => `<rect class="s" x="425" y="30" width="90" height="170" rx="45" fill="var(--ac)"/><path class="t" d="M390 160 C390 270 550 270 550 160 M470 245 L470 320 M410 320 L530 320" ${T}/>
        <path class="o" d="M600 90 C640 135 640 195 600 240" ${T}/><path class="o" d="M340 90 C300 135 300 195 340 240" ${T}/>
        <path class="o" d="M660 50 C725 120 725 210 660 280" ${T}/><path class="o" d="M280 50 C215 120 215 210 280 280" ${T}/>
        ${[70, 115, 160, 780, 825, 870].map((x, i) => `<rect class="e" x="${x}" y="${150 - 20 * (i % 3)}" width="22" height="${120 + 40 * (i % 3)}" rx="11" fill="var(--fg)" opacity=".5"/>`).join('')}`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.s'), t0); tracer(c, qa(el, '.t'), t0 + 0.15, 0.5);
        const o = qa(el, '.o'); gsap.set(o, { opacity: 0 });
        c.ft(o, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.9) - 1, stagger: { each: 0.12, from: 'start' } }, t0 + 0.5);
        const e = qa(el, '.e'); gsap.set(e, { scaleY: 0.2, transformOrigin: '50% 50%' });
        c.ft(e, { scaleY: 0.2 }, { scaleY: 1, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.7) - 1, stagger: 0.09, transformOrigin: '50% 50%' }, t0 + 0.4);
      },
    },
    duo: {
      svg: () => `<g class="robot"><rect x="150" y="120" width="210" height="190" rx="26" ${T}/><path d="M255 120 L255 78" ${T}/><circle cx="255" cy="62" r="15" fill="var(--fg)"/><rect x="198" y="178" width="36" height="36" rx="6" fill="var(--fg)"/><rect x="276" y="178" width="36" height="36" rx="6" fill="var(--fg)"/><path d="M205 262 L305 262" ${T}/></g>
        <path class="ne" d="M425 180 L515 180 M425 240 L515 240 M500 140 L440 280" ${A}/>
        <g class="humain"><circle cx="690" cy="215" r="105" fill="var(--ac)"/><circle cx="652" cy="190" r="13" fill="var(--bg)"/><circle cx="728" cy="190" r="13" fill="var(--bg)"/><path d="M640 245 C665 285 715 285 740 245" fill="none" stroke="var(--bg)" stroke-width="11" stroke-linecap="round"/></g>
        <path class="eclat" d="M690 85 L690 45 M790 115 L820 88 M822 215 L862 215 M590 115 L560 88" ${T}/>`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.robot'), t0); tracer(c, qa(el, '.ne'), t0 + 0.4, 0.3, 0.1); surgir(c, qa(el, '.humain'), t0 + 0.7);
        const e = qa(el, '.eclat'); gsap.set(e, { drawSVG: '0%' });
        c.ft(e, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 2 * fois(d - 1, 1.0) - 1, repeatDelay: 0.15 }, t0 + 1.1);
        c.ft(qa(el, '.humain'), { y: 0 }, { y: -16, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d - 1, 1.2) - 1 }, t0 + 1.2);
      },
    },
    deplacement: {
      svg: () => `<circle class="vide" cx="230" cy="270" r="74" ${T} stroke-dasharray="4 22" opacity=".55"/><circle class="plein" cx="710" cy="270" r="74" fill="var(--ac)" opacity=".3"/>
        <path class="arc" d="M250 150 C380 10 580 10 700 150" ${T} stroke-dasharray="2 24"/>
        <g class="epingle"><path d="M230 265 C170 190 185 110 230 110 C275 110 290 190 230 265 Z" fill="var(--ac)"/><circle cx="230" cy="165" r="20" fill="var(--bg)"/></g>`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.vide'), t0); surgir(c, qa(el, '.epingle'), t0 + 0.15);
        const ts = t0 + Math.min(1.6, d * 0.35);
        gsap.set(qa(el, '.arc'), { opacity: 0 }); gsap.set(qa(el, '.plein'), { scale: 0, transformOrigin: '50% 50%' });
        c.ft(qa(el, '.arc'), { opacity: 0 }, { opacity: 0.7, duration: 0.3 }, ts);
        c.ft(qa(el, '.epingle'), { x: 0 }, { x: 480, duration: 0.8, ease: 'power2.inOut' }, ts);
        c.ft(qa(el, '.epingle'), { y: 0 }, { y: -130, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 }, ts);
        c.ft(qa(el, '.plein'), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)', transformOrigin: '50% 50%' }, ts + 0.75);
        c.ft(qa(el, '.plein'), { opacity: 0.3 }, { opacity: 0.12, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 1.4) - 1 }, ts + 1.3);
      },
    },
    commentaire: {
      svg: () => `<g class="bulle"><rect x="250" y="20" width="440" height="270" rx="70" fill="var(--ac)"/><path d="M330 280 L300 372 L420 285 Z" fill="var(--ac)"/>
        <circle class="p" cx="380" cy="155" r="24" fill="var(--bg)"/><circle class="p" cx="470" cy="155" r="24" fill="var(--bg)"/><circle class="p" cx="560" cy="155" r="24" fill="var(--bg)"/></g>`,
      jouer(c, el, p, t0, d) {
        surgir(c, qa(el, '.bulle'), t0 + 0.2);
        c.ft(qa(el, '.p'), { y: 0 }, { y: -26, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(d, 0.9) - 1, stagger: 0.12 }, t0 + 0.7);
      },
    },
  };
});
