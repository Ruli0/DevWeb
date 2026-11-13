/* Chapitre 2 — Le cycle de l'eau : la boucle d'outils, pas à pas. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc, trace } = T.ui;

  const CHEMIN = 'M180 70 A95 95 0 0 1 275 165 A95 95 0 0 1 180 260 A95 95 0 0 1 85 165 A95 95 0 0 1 180 70';
  // Position de chaque étape sur le cercle (0 = en haut, sens des aiguilles).
  const ARRET = { pensee: 0, appel: 0.25, resultat: 0.5, contexte: 0.75 };
  const ETIQUETTE = { pensee: 'Pensée', appel: "Appel d'outil", resultat: 'Résultat', contexte: 'Contexte', reponse: 'Réponse' };

  T.scenes.cycle = async function (root, env) {
    root.innerHTML = `
      <div class="cycle-scene">
        <p class="demande" id="c-demande"></p>
        <svg class="cycle-svg" viewBox="0 0 360 330" role="img" aria-label="Un cycle en quatre étapes : le modèle réfléchit, appelle un outil, reçoit le résultat, puis le résultat retourne au contexte.">
          <path id="c-chemin" class="loop" d="${CHEMIN}"/>
          <path class="loop-arrow" d="M258 98 l10 2 l-4 -10"/>
          <path class="loop-arrow" d="M247 243 l2 -10 l-10 4"/>
          <path class="loop-arrow" d="M102 232 l-10 -2 l4 10"/>
          <path class="loop-arrow" d="M113 87 l-2 10 l10 -4"/>

          <g class="station" data-s="pensee"><circle cx="180" cy="70" r="21"/>
            <path class="ico" d="M170 74 a6 6 0 0 1 2 -11 a8 8 0 0 1 15 2 a5 5 0 0 1 1 9 z"/></g>
          <text class="st-label" x="180" y="34" text-anchor="middle">Le modèle réfléchit</text>

          <g class="station" data-s="appel"><circle cx="275" cy="165" r="21"/>
            <path class="ico" d="M268 158 v8 M275 161 v10 M282 158 v8"/></g>
          <text class="st-label" x="306" y="161" text-anchor="start">Appel</text>
          <text class="st-label" x="306" y="175" text-anchor="start">d'outil</text>

          <g class="station" data-s="resultat"><circle cx="180" cy="260" r="21"/>
            <path class="ico" d="M169 256 h22 M180 256 v10 M180 262 l-6 5 M180 262 l6 5"/></g>
          <text class="st-label" x="180" y="302" text-anchor="middle">Résultat de l'outil</text>

          <g class="station" data-s="contexte"><circle cx="85" cy="165" r="21"/>
            <path class="ico" d="M78 172 q-4 -5 0 -9 q4 -4 0 -9 M86 172 q-4 -5 0 -9 q4 -4 0 -9 M94 172 q-4 -5 0 -9 q4 -4 0 -9"/></g>
          <text class="st-label" x="54" y="161" text-anchor="end">Retour au</text>
          <text class="st-label" x="54" y="175" text-anchor="end">contexte</text>

          <text class="tour" id="c-tour" x="180" y="150" text-anchor="middle">Prêt</text>
          <text class="humid" id="c-humid" x="180" y="182" text-anchor="middle">32 %</text>
          <text class="humid-label" x="180" y="199" text-anchor="middle">humidité</text>

          <g id="c-goutte" class="goutte"><path d="M0 -11 C6 -3 8.5 2 8.5 6 A8.5 8.5 0 0 1 -8.5 6 C-8.5 2 -6 -3 0 -11Z"/></g>
        </svg>
        <div class="controls">
          <button type="button" class="btn primary" id="c-suivant">Étape suivante</button>
          <button type="button" class="btn ghost" id="c-auto" aria-pressed="false">Lecture auto</button>
          <button type="button" class="btn ghost" id="c-reset">Recommencer</button>
        </div>
        <ol class="trace" id="c-trace" aria-label="Journal de la boucle" aria-live="polite"></ol>
      </div>`;

    const sim = await env.api.simulate('cycle', {});
    if (!env.vivant()) return;

    const goutte = root.querySelector('#c-goutte');
    const tourTxt = root.querySelector('#c-tour');
    const humid = root.querySelector('#c-humid');
    const journal = trace(root.querySelector('#c-trace'));
    const bSuivant = root.querySelector('#c-suivant');
    const bAuto = root.querySelector('#c-auto');
    const chemin = { path: '#c-chemin', align: '#c-chemin', alignOrigin: [0.5, 0.5] };
    root.querySelector('#c-demande').innerHTML = `<span class="tag">Demande</span> ${esc(sim.demande)}`;

    let index = 0;
    let position = 0;
    let auto = false;
    let occupe = false;

    function reinitialiser() {
      index = 0;
      position = 0;
      journal.clear();
      tourTxt.textContent = 'Prêt';
      humid.textContent = '32 %';
      bSuivant.disabled = false;
      bSuivant.textContent = 'Étape suivante';
      root.querySelectorAll('.station').forEach((s) => s.classList.remove('actif'));
      gsap.killTweensOf(goutte);
      gsap.set(goutte, { motionPath: { ...chemin, start: 0, end: 0 }, scale: 1, opacity: 1 });
    }

    function allumer(type) {
      root.querySelectorAll('.station').forEach((s) => s.classList.toggle('actif', s.dataset.s === type));
      const st = root.querySelector(`.station[data-s="${type}"]`);
      if (st) gsap.fromTo(st, { scale: 1.18 }, { scale: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' });
    }

    async function avancer() {
      if (occupe || index >= sim.steps.length) return;
      occupe = true;
      const step = sim.steps[index];
      index += 1;

      if (step.type === 'reponse') {
        allumer(null);
        await gsap.to(goutte, { x: 180, y: 165, scale: 0, opacity: 0, duration: 0.6, ease: 'power2.in' });
        tourTxt.textContent = `Fini en ${sim.tours} tours`;
      } else {
        const cible = ARRET[step.type];
        const fin = cible < position ? 1 : cible; // la pensée suivante boucle le tour
        if (fin !== position) {
          await gsap.to(goutte, { motionPath: { ...chemin, start: position, end: fin }, duration: 0.7, ease: 'power1.inOut' });
        }
        position = fin === 1 ? 0 : fin;
        allumer(step.type);
        tourTxt.textContent = `Tour ${step.tour}`;
        if (step.humidite) humid.textContent = `${step.humidite} %`;
      }
      if (!env.vivant()) return;
      journal.add(ETIQUETTE[step.type], step.texte, 't-' + step.type);

      occupe = false;
      if (index >= sim.steps.length) {
        bSuivant.disabled = true;
        bSuivant.textContent = 'Boucle terminée';
        reglerAuto(false);
      }
    }

    function reglerAuto(actif) {
      auto = actif;
      bAuto.setAttribute('aria-pressed', String(actif));
      bAuto.textContent = actif ? 'Pause' : 'Lecture auto';
    }

    async function lectureAuto() {
      while (auto && env.vivant() && index < sim.steps.length) {
        await avancer();
        await env.attendre(650);
      }
    }

    bSuivant.addEventListener('click', () => { reglerAuto(false); avancer(); });
    bAuto.addEventListener('click', () => {
      if (index >= sim.steps.length) reinitialiser();
      reglerAuto(!auto);
      if (auto) lectureAuto();
    });
    root.querySelector('#c-reset').addEventListener('click', () => { reglerAuto(false); occupe = false; reinitialiser(); });

    reinitialiser();
  };
})();
