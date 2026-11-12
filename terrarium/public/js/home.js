/* Page d'accueil : le grand bocal, dont chaque élément mène à un chapitre. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc } = T.ui;

  const BOCAL = 'M104 56 H256 V84 Q322 112 322 196 V352 Q322 400 274 400 H86 Q38 400 38 352 V196 Q38 112 104 84 Z';

  // Une plante : une tige courbe et des feuilles alternées.
  function plante(x, base, hauteur, penche, classe) {
    const sommetX = x + penche;
    const sommetY = base - hauteur;
    const cx = x - penche * 0.4;
    const cy = base - hauteur * 0.55;
    let feuilles = '';
    const n = Math.max(3, Math.round(hauteur / 22));
    for (let i = 1; i <= n; i += 1) {
      const t = i / (n + 0.4);
      const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * sommetX;
      const py = (1 - t) * (1 - t) * base + 2 * (1 - t) * t * cy + t * t * sommetY;
      const cote = i % 2 ? 1 : -1;
      const taille = 15 - t * 6;
      feuilles += `<ellipse class="leaf" cx="${(px + cote * taille * 0.8).toFixed(1)}" cy="${(py - 3).toFixed(1)}" rx="${taille.toFixed(1)}" ry="${(taille * 0.42).toFixed(1)}" transform="rotate(${cote * -28} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
    }
    return `<g class="plant ${classe || ''}" data-base="${x} ${base}">
      <path class="stem" d="M${x} ${base} Q${cx} ${cy} ${sommetX} ${sommetY}"/>${feuilles}</g>`;
  }

  const POINTS = [
    { id: 'bocal', x: 62, y: 168 },
    { id: 'cycle', x: 226, y: 124 },
    { id: 'couches', x: 180, y: 368 },
    { id: 'capteurs', x: 297, y: 204 },
    { id: 'ecosysteme', x: 96, y: 246 },
  ];

  function svgBocal(chapitres, faits) {
    const pins = POINTS.map((p) => {
      const c = chapitres.find((ch) => ch.id === p.id);
      if (!c) return '';
      return `<a href="#${c.id}" class="pin${faits.includes(c.id) ? ' done' : ''}" aria-label="Chapitre ${c.numero} : ${esc(c.titre)}, ${esc(c.concept)}">
        <circle class="pin-hit" cx="${p.x}" cy="${p.y}" r="22"/>
        <circle class="pin-dot" cx="${p.x}" cy="${p.y}" r="13"/>
        <text x="${p.x}" y="${p.y + 4.5}" text-anchor="middle">${c.numero}</text></a>`;
    }).join('');

    let graviers = '';
    for (let i = 0; i < 26; i += 1) {
      graviers += `<circle class="pebble" cx="${48 + i * 10.6 + (i % 3) * 2}" cy="${376 + (i % 4) * 5}" r="${3 + (i % 3)}"/>`;
    }

    return `<svg class="hero-jar" viewBox="0 0 360 420" role="img" aria-label="Un terrarium en bocal. Cinq points numérotés mènent aux chapitres.">
      <defs><clipPath id="clip-bocal"><path d="${BOCAL}"/></clipPath></defs>
      <path class="glass-fill" d="${BOCAL}"/>
      <g clip-path="url(#clip-bocal)">
        <rect class="l-gravel" x="30" y="362" width="300" height="44"/>
        ${graviers}
        <rect class="l-charcoal" x="30" y="349" width="300" height="13"/>
        <rect class="l-soil" x="30" y="312" width="300" height="37"/>
        <path class="l-moss" d="M30 314 Q60 298 90 310 T150 308 T210 312 T270 305 T330 312 V322 H30Z"/>
        <g class="mist"><ellipse cx="170" cy="132" rx="34" ry="13"/><ellipse cx="196" cy="124" rx="24" ry="12"/><ellipse cx="150" cy="126" rx="18" ry="9"/></g>
        <path class="rain" d="M0 -7 C4 -2 5.5 1 5.5 4 A5.5 5.5 0 0 1 -5.5 4 C-5.5 1 -4 -2 0 -7Z" transform="translate(172 150)"/>
      </g>
      ${plante(214, 310, 128, 20, 'p1')}
      ${plante(160, 310, 84, -16, 'p2')}
      ${plante(262, 312, 62, 12, 'p3')}
      <g class="mini-jar">
        <rect x="66" y="266" width="60" height="46" rx="11"/>
        <rect class="mini-lid" x="78" y="259" width="36" height="8" rx="3"/>
        <g class="ant"><circle cx="88" cy="298" r="4"/><circle cx="96" cy="297" r="3.2"/><circle cx="103" cy="296" r="3.8"/>
          <path d="M103 292 l4 -6 M88 302 l-3 5 M96 301 l0 6 M103 300 l3 5"/></g>
      </g>
      <g class="sensor">
        <rect x="286" y="222" width="22" height="34" rx="5"/>
        <circle class="led" cx="297" cy="232" r="3.5"/>
        <path d="M291 244 h12 M291 249 h8"/>
      </g>
      <path class="glass" d="${BOCAL}"/>
      <path class="glint" d="M62 150 Q56 200 60 260"/>
      <rect class="cork" x="98" y="28" width="164" height="30" rx="9"/>
      ${pins}
    </svg>`;
  }

  T.home = {
    render(root, chapitres, faits) {
      const suivant = chapitres.find((c) => !faits.includes(c.id));
      root.innerHTML = `
        <section class="hero">
          <div class="hero-text">
            <p class="eyebrow">Cinq chapitres interactifs</p>
            <h1>Les agents IA, expliqués par un terrarium</h1>
            <p class="lead">Un bocal fermé, de l'eau qui tourne en boucle, des couches, des capteurs et de petites bêtes spécialisées. Tout ce qu'il faut pour comprendre comment fonctionne un agent.</p>
            <a class="btn primary" href="#${suivant ? suivant.id : chapitres[0].id}">${faits.length === 0 ? 'Commencer par le bocal' : suivant ? `Continuer : ${esc(suivant.titre)}` : 'Revoir le premier chapitre'}</a>
          </div>
          <div class="hero-visual">${svgBocal(chapitres, faits)}</div>
        </section>
        <section aria-labelledby="titre-chapitres">
          <h2 id="titre-chapitres">Les chapitres</h2>
          <ol class="chapter-list">
            ${chapitres.map((c) => `
              <li><a class="chapter-card${faits.includes(c.id) ? ' done' : ''}" href="#${c.id}">
                <span class="num">${c.numero}</span>
                <span class="chapter-card-text">
                  <strong>${esc(c.titre)}</strong>
                  <span class="concept">${esc(c.concept)}</span>
                  <span class="resume">${esc(c.resume)}</span>
                </span>
                <span class="state">${faits.includes(c.id) ? 'Terminé' : ''}</span>
              </a></li>`).join('')}
          </ol>
        </section>`;

      // Entrée en scène, puis vie du bocal (sauf si l'on préfère moins d'animation).
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-text > *', { y: 18, opacity: 0, duration: 0.6, stagger: 0.08 })
        .from('.hero-jar .plant', { scale: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.12, ease: 'back.out(1.4)' }, 0.1)
        .from('.hero-jar .pin', { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.08, ease: 'back.out(2.5)' }, 0.6);

      if (T.reduce) return;
      root.querySelectorAll('.hero-jar .plant').forEach((p, i) => {
        gsap.to(p, { rotation: i % 2 ? 2.5 : -2.5, svgOrigin: p.dataset.base, duration: 3 + i, ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
      gsap.to('.hero-jar .mist', { x: 14, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
        .fromTo('.hero-jar .rain', { y: 0, opacity: 0 }, { opacity: 1, duration: 0.3 })
        .to('.hero-jar .rain', { y: 150, duration: 1.1, ease: 'power2.in' })
        .to('.hero-jar .rain', { opacity: 0, duration: 0.15 });
      gsap.to('.hero-jar .led', { opacity: 0.25, duration: 0.8, repeat: -1, yoyo: true, ease: 'power1.inOut' });
      gsap.to('.hero-jar .ant', { x: 10, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    },
  };
})();
