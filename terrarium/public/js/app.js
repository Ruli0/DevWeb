/* Routeur, page de chapitre, quiz et progression. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc } = T.ui;
  gsap.registerPlugin(Flip, ScrollTrigger, MotionPathPlugin);
  if (T.reduce) gsap.globalTimeline.timeScale(25);

  const app = document.getElementById('app');
  const pill = document.getElementById('progress-pill');
  const etat = { chapitres: [], faits: [], scene: null };

  function majPastille() {
    pill.textContent = `${etat.faits.length} / ${etat.chapitres.length} terminés`;
  }

  // --- Navigation ----------------------------------------------------------
  function quitterScene() {
    if (etat.scene) etat.scene.vivant = false;
    T.home.quitter();
    etat.scene = null;
    ScrollTrigger.getAll().forEach((s) => s.kill());
    gsap.killTweensOf(app.querySelectorAll('*'));
    gsap.globalTimeline.getChildren(true, false, true).forEach((tl) => tl.kill());
  }

  async function afficher() {
    quitterScene();
    const id = location.hash.slice(1);
    const resume = etat.chapitres.find((c) => c.id === id);
    if (resume) await afficherChapitre(resume);
    else {
      document.title = 'Le Terrarium agentique';
      T.home.render(app, etat.chapitres, etat.faits);
    }
    window.scrollTo(0, 0);
  }

  // --- Page de chapitre ----------------------------------------------------
  async function afficherChapitre(resume) {
    const c = await T.api.chapter(resume.id);
    const scene = { vivant: true };
    etat.scene = scene;
    if (location.hash.slice(1) !== c.id) return; // l'utilisateur a déjà changé de page
    document.title = `${c.titre} · Le Terrarium agentique`;

    const i = etat.chapitres.findIndex((x) => x.id === c.id);
    const precedent = etat.chapitres[i - 1];
    const suivant = etat.chapitres[i + 1];

    app.innerHTML = `
      <article class="chapter">
        <header class="chapter-head">
          <a class="back" href="#accueil">← Tous les chapitres</a>
          <p class="eyebrow">Chapitre ${c.numero} sur ${etat.chapitres.length}</p>
          <h1>${esc(c.titre)}</h1>
          <p class="concept-line">dans un agent : <strong>${esc(c.concept)}</strong></p>
        </header>
        <div class="prose">${c.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>

        <section class="lab" aria-labelledby="titre-lab">
          <h2 id="titre-lab">À toi de jouer</h2>
          <p class="consigne">${esc(c.consigne)}</p>
          <div class="scene" id="scene"></div>
        </section>

        <section class="reveal" aria-labelledby="titre-retenir">
          <h2 id="titre-retenir">À retenir</h2>
          <ul class="retenir">${c.retenir.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </section>

        <section class="reveal" aria-labelledby="titre-code">
          <h2 id="titre-code">Dans le code</h2>
          <figure class="code">
            <figcaption>${esc(c.code.titre)}</figcaption>
            <pre tabindex="0"><code>${esc(c.code.source)}</code></pre>
          </figure>
        </section>

        <section class="reveal quiz" aria-labelledby="titre-quiz">
          <h2 id="titre-quiz">Deux questions pour vérifier</h2>
          ${c.quiz.map((q, n) => `
            <fieldset class="question" data-n="${n}">
              <legend>${esc(q.question)}</legend>
              <div class="options">
                ${q.options.map((o, k) => `<button type="button" class="option" data-k="${k}">${esc(o)}</button>`).join('')}
              </div>
              <p class="explication" role="status"></p>
            </fieldset>`).join('')}
          <div class="quiz-fin" id="quiz-fin" ${etat.faits.includes(c.id) ? '' : 'hidden'}>
            <svg class="sprout" viewBox="0 0 60 60" aria-hidden="true">
              <path class="stem" d="M30 56 V30"/>
              <path class="leaf-l" d="M30 34 C18 34 12 26 12 18 C22 18 30 24 30 34Z"/>
              <path class="leaf-r" d="M30 30 C42 30 48 22 48 14 C38 14 30 20 30 30Z"/>
            </svg>
            <p><strong>Chapitre terminé.</strong> Une nouvelle pousse dans ton terrarium.</p>
          </div>
        </section>

        <nav class="chapter-nav" aria-label="Chapitres voisins">
          ${precedent ? `<a class="btn ghost" href="#${precedent.id}">← ${esc(precedent.titre)}</a>` : '<span></span>'}
          ${suivant ? `<a class="btn primary" href="#${suivant.id}">${esc(suivant.titre)} →</a>` : '<a class="btn primary" href="#accueil">Retour au terrarium</a>'}
        </nav>
      </article>`;

    brancherQuiz(c);

    gsap.from('.chapter-head > *, .prose > *', { y: 14, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' });
    ScrollTrigger.batch('.reveal', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 }),
    });

    const monter = T.scenes[c.id];
    if (monter) {
      monter(document.getElementById('scene'), {
        api: T.api,
        vivant: () => scene.vivant,
        attendre: (ms) => new Promise((ok) => setTimeout(ok, T.reduce ? Math.min(ms, 120) : ms)),
      });
    }
  }

  // --- Quiz ------------------------------------------------------------------
  function brancherQuiz(c) {
    const reussies = new Set();
    app.querySelectorAll('.question').forEach((fs) => {
      const q = c.quiz[Number(fs.dataset.n)];
      const explication = fs.querySelector('.explication');
      fs.addEventListener('click', (e) => {
        const bouton = e.target.closest('.option');
        if (!bouton || fs.classList.contains('ok')) return;
        const juste = Number(bouton.dataset.k) === q.reponse;
        fs.querySelectorAll('.option').forEach((b) => b.classList.remove('faux'));
        if (juste) {
          fs.classList.add('ok');
          bouton.classList.add('juste');
          fs.querySelectorAll('.option').forEach((b) => { b.disabled = true; });
          explication.textContent = `Oui. ${q.explication}`;
          gsap.fromTo(bouton, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
          reussies.add(fs.dataset.n);
          if (reussies.size === c.quiz.length) terminer(c.id);
        } else {
          bouton.classList.add('faux');
          explication.textContent = 'Pas tout à fait. Essaie une autre réponse.';
          T.ui.secouer(bouton);
        }
      });
    });
  }

  function terminer(id) {
    const fin = document.getElementById('quiz-fin');
    fin.hidden = false;
    gsap.timeline()
      .from(fin, { opacity: 0, y: 12, duration: 0.4 })
      .from(fin.querySelector('.stem'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, ease: 'power2.out' }, '<')
      .from(fin.querySelectorAll('.leaf-l, .leaf-r'), { scale: 0, transformOrigin: '50% 100%', duration: 0.6, stagger: 0.12, ease: 'back.out(2)' });
    if (etat.faits.includes(id)) return;
    etat.faits.push(id);
    majPastille();
    T.api.saveProgress(etat.faits).catch(() => {});
  }

  // --- Démarrage -------------------------------------------------------------
  async function demarrer() {
    try {
      const [chapitres, progression] = await Promise.all([T.api.chapters(), T.api.getProgress()]);
      etat.chapitres = chapitres;
      etat.faits = progression.done.filter((id) => chapitres.some((c) => c.id === id));
    } catch {
      app.innerHTML = '<p class="erreur">Impossible de charger les chapitres. Vérifie que le serveur est lancé, puis recharge la page.</p>';
      return;
    }
    majPastille();
    window.addEventListener('hashchange', afficher);
    afficher();
  }

  demarrer();
})();
