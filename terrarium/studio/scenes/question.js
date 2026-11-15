/*
 * Scène « question » (format « test ») : une question, deux cartes A et B, un compte à rebours sur les temps ; la carte piège s'allume.
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

  return {
    id: 'question',
    format: 'test',
    description: 'La question au spectateur : deux cartes A et B, un compte à rebours sur les temps ; à la fin, la carte « piège » s’allume.',
    params: { question: 'la question, *mot* clé', a: 'réponse A (au plus 34 caractères)', b: 'réponse B (au plus 34 caractères)', piege: '« a » ou « b » : la réponse que la vidéo va expliquer', secondes: 'durée du compte à rebours (3 par défaut)', cerveau: 'état du cerveau (facultatif)' },
    // Durée : 2 temps pour lire la question, 1 pour les cartes, le compte à rebours, 1 temps de verdict.
    temps: (p) => 4 + (p.secondes || 3) + Math.ceil(Math.max(0, String(p.question).split(' ').length - 6) * 0.6),
    min: 4,
    textes: (p) => [p.question, p.a, p.b],
    lecture: 0,
    sons: (p, d, B) => {
      const n = p.secondes || 3, t = d - (n + 1) * B;
      return [['souffle.wav', 0, 0.35], ...Array.from({ length: n }, (_, i) => ['tic.wav', t + i * B, 0.5 + 0.05 * i])];
    },
    dessin: (p, S, u) => `
      <p class="ph">${u.md(p.question)}</p>
      <div class="carte a"><b>A</b><p>${u.esc(p.a)}</p></div>
      <div class="carte b"><b>B</b><p>${u.esc(p.b)}</p></div>
      <div class="rebours"><svg width="200" height="200"><circle cx="100" cy="100" r="90" fill="none" stroke="${S.couleurs.texte}22" stroke-width="6"/><circle class="anneau" cx="100" cy="100" r="90" fill="none" stroke="#ff7a4d" stroke-width="6" stroke-linecap="round" stroke-dasharray="565.5" transform="rotate(-90 100 100)"/></svg>
        ${Array.from({ length: p.secondes || 3 }, (_, i) => `<span>${(p.secondes || 3) - i}</span>`).join('')}</div>`,
    jouer(c, el, p, t0, d) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const B = c.B, n = p.secondes || 3;
      const l = c.lignes(q('.ph'));
      gsap.set(l, { yPercent: 110 }); gsap.set([q('.carte.a'), q('.carte.b'), q('.rebours'), ...qa('.rebours span')], { opacity: 0 });
      c.ft(l, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 }, t0);
      c.coup(t0);
      const tc = t0 + d - (n + 1) * B;           // début du compte à rebours
      c.ft(q('.carte.a'), { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, tc - B);
      c.ft(q('.carte.b'), { opacity: 0, x: 300 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, tc - B + 0.12);
      c.ft(q('.rebours'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }, tc);
      c.ft(q('.anneau'), { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': 565.5 }, duration: n * B, ease: 'none' }, tc);
      qa('.rebours span').forEach((s, i) => {
        const t = tc + i * B;
        c.ft(s, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' }, t);
        c.ft(s, { opacity: 1 }, { opacity: 0, duration: 0.15 }, t + B - 0.15);
        if (c.zones) c.zones({ amygdale: 0.2 + 0.18 * i, insula: 0.1 + 0.1 * i }, t, 0.3);
      });
      c.ft(q('.rebours'), { opacity: 1 }, { opacity: 0, duration: 0.2 }, tc + n * B - 0.2);
      // Verdict : la carte piège s’allume, l’autre s’efface.
      const tv = tc + n * B, piege = q(`.carte.${p.piege || 'b'}`), autre = q(`.carte.${p.piege === 'a' ? 'b' : 'a'}`);
      c.ft(autre, { opacity: 1 }, { opacity: 0.25, duration: 0.3 }, tv);
      c.ft(piege, { borderColor: 'rgba(233,238,243,.33)', scale: 1 }, { borderColor: '#ff7a4d', scale: 1.04, duration: 0.3, ease: 'power3.out' }, tv);
      c.ft(l, { yPercent: 0 }, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, t0 + d - 0.35);
      c.ft([autre, piege], { y: 0 }, { y: 80, opacity: 0, duration: 0.3, ease: 'power2.in' }, t0 + d - 0.32);
    },
  };
});
