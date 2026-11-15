/* Petits outils d'interface partagés par les scènes. */
(function () {
  'use strict';
  const T = (window.Terrarium = window.Terrarium || {});
  T.scenes = {};
  T.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  const nombre = (n) => Math.round(n).toLocaleString('fr-FR');

  // Journal d'exécution : une ligne par événement de la simulation.
  function trace(ol) {
    return {
      clear() { ol.innerHTML = ''; },
      add(etiquette, texte, genre) {
        const li = document.createElement('li');
        li.className = 'trace-line ' + (genre || '');
        li.innerHTML = `<span class="tag">${esc(etiquette)}</span><span class="txt">${esc(texte)}</span>`;
        ol.appendChild(li);
        gsap.from(li, { opacity: 0, x: -10, duration: 0.3, ease: 'power2.out' });
        ol.scrollTop = ol.scrollHeight;
        return li;
      },
    };
  }

  // Compteur animé (le texte de l'élément suit la valeur).
  function compter(el, vers, duree) {
    const obj = { v: Number(el.dataset.v) || 0 };
    el.dataset.v = vers;
    gsap.to(obj, {
      v: vers, duration: duree ?? 0.6, ease: 'power2.out', overwrite: true,
      onUpdate: () => { el.textContent = nombre(obj.v); },
    });
  }

  // Petite secousse pour signaler un refus ou un débordement.
  function secouer(el) {
    gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' });
  }

  T.ui = { esc, nombre, trace, compter, secouer };
})();
