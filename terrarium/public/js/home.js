/* Page d'accueil : le vivarium vivant, ses cinq scènes, puis les chapitres. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc } = T.ui;

  // Chaque scène de nature illustre le concept d'un chapitre.
  const SCENES = [
    { id: 'bocal', acteur: 'La boîte en verre', concept: 'Fenêtre de contexte' },
    { id: 'cycle', acteur: 'Le caméléon', concept: "Boucle d'outils" },
    { id: 'couches', acteur: 'Le ruisseau', concept: 'Middleware' },
    { id: 'capteurs', acteur: 'La dionée', concept: 'Hooks' },
    { id: 'ecosysteme', acteur: 'Les fourmis', concept: 'Multi-agents' },
  ];
  const INVITE = 'Touche le caméléon, le ruisseau, la dionée, la fourmilière ou le cadre en verre.';
  let lecteur = null; // joue les scénarios : public/js/film/lecteur.js

  T.home = {
    quitter() {
      if (lecteur) lecteur.detruire();
      lecteur = null;
    },

    render(root, chapitres, faits, scenarios) {
      root.innerHTML = `
        <section class="hero">
          <p class="eyebrow">Cinq scènes à regarder, cinq chapitres pour pratiquer</p>
          <h1>Les agents IA, racontés par un vivarium</h1>
          <p class="lead">Un caméléon qui chasse, un ruisseau qui filtre, une dionée qui se referme. Chaque habitant montre une idée clé du fonctionnement d'un agent.</p>
        </section>

        <section class="stage-wrap" aria-label="Le vivarium">
          <div class="stage" id="stage"></div>
          <div class="plaque">
            <p id="legende" aria-live="polite">${INVITE}</p>
            <a id="plaque-lien" class="plaque-lien" hidden></a>
          </div>
          <div class="scene-chips" role="group" aria-label="Scènes">
            ${SCENES.map((s) => `<button type="button" class="chip" data-v="${s.id}" aria-pressed="false"><strong>${esc(s.acteur)}</strong><span>${esc(s.concept)}</span></button>`).join('')}
            <button type="button" class="chip tout" id="tout-jouer"><strong>Tout regarder</strong><span>Les cinq scènes à la suite</span></button>
          </div>
        </section>

        <section aria-labelledby="titre-chapitres">
          <h2 id="titre-chapitres">Les chapitres</h2>
          <p class="lead petit">Après la scène, la pratique : chaque chapitre a un labo interactif, du code et un quiz.</p>
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

      const legende = root.querySelector('#legende');
      const lien = root.querySelector('#plaque-lien');
      const chips = root.querySelectorAll('.chip[data-v]');
      const scene = T.art.monter(root.querySelector('#stage'));

      function dire(texte) {
        legende.textContent = texte;
        gsap.fromTo(legende, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }
      lecteur = T.lecteur(scene, dire, root.querySelector('#stage'), scenarios);
      const monLecteur = lecteur;

      function marquer(id) {
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === id)));
      }

      async function jouer(id) {
        lien.hidden = true;
        marquer(id);
        root.querySelector('.stage-wrap').scrollIntoView({ block: 'start', behavior: T.reduce ? 'auto' : 'smooth' });
        const fini = await monLecteur.jouer(id);
        if (!fini || lecteur !== monLecteur) return false;
        marquer(null);
        const chapitre = chapitres.find((c) => c.id === id);
        lien.href = `#${id}`;
        lien.textContent = `Pratiquer : chapitre ${chapitre.numero}, ${chapitre.titre} →`;
        lien.hidden = false;
        return true;
      }

      root.querySelector('.scene-chips').addEventListener('click', async (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        if (chip.id === 'tout-jouer') {
          for (const s of SCENES) {
            if (!(await jouer(s.id))) return;
            await new Promise((ok) => setTimeout(ok, 900));
            if (lecteur !== monLecteur) return;
          }
          lien.hidden = true;
          dire('Fin de la visite. Passe aux chapitres pour pratiquer.');
        } else if (chip.getAttribute('aria-pressed') === 'true') {
          monLecteur.arreter();
          marquer(null);
          dire(INVITE);
        } else {
          jouer(chip.dataset.v);
        }
      });

      // Les habitants du vivarium sont aussi des boutons.
      scene.svg.addEventListener('click', (e) => {
        const zone = e.target.closest('.hot');
        if (zone) jouer(zone.dataset.v);
      });

      gsap.from('.hero > *', { y: 16, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
      gsap.from('#stage', { opacity: 0, scale: 0.97, duration: 0.9, ease: 'power2.out' });
    },
  };
})();
