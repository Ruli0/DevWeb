/* Chapitre 4 — Les capteurs : des hooks avant et après chaque action. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc, trace } = T.ui;

  const HOOKS = [
    { id: 'garde', moment: 'Avant', nom: 'Garde-plantes', aide: "Bloque « arracher_plantes »" },
    { id: 'limiteur', moment: 'Avant', nom: "Limiteur d'eau", aide: 'Ramène « vaporiser » à 50 ml au plus' },
    { id: 'carnet', moment: 'Après', nom: 'Carnet de bord', aide: 'Note chaque action réalisée' },
    { id: 'hygrometre', moment: 'Après', nom: 'Hygromètre', aide: "Ajoute l'humidité au contexte après un arrosage" },
  ];
  const ETIQUETTE = { pensee: 'Pensée', appel: "Appel d'outil", resultat: 'Résultat', reponse: 'Réponse' };

  function plante(x, h, moisie) {
    return `<g class="plant" data-base="${x} 150">
      <path class="stem" d="M${x} 150 V${150 - h}"/>
      <ellipse class="leaf" cx="${x - 11}" cy="${150 - h * 0.45}" rx="11" ry="5" transform="rotate(24 ${x} ${150 - h * 0.45})"/>
      <ellipse class="leaf" cx="${x + 11}" cy="${150 - h * 0.7}" rx="11" ry="5" transform="rotate(-24 ${x} ${150 - h * 0.7})"/>
      <ellipse class="leaf" cx="${x}" cy="${150 - h - 5}" rx="6" ry="10"/>
      ${moisie ? `<g class="moisie"><ellipse cx="${x + 13}" cy="${150 - h * 0.28}" rx="11" ry="5" transform="rotate(-20 ${x} ${150 - h * 0.28})"/>
        <circle cx="${x + 10}" cy="${150 - h * 0.3}" r="1.4"/><circle cx="${x + 16}" cy="${150 - h * 0.34}" r="1.4"/></g>` : ''}
    </g>`;
  }

  T.scenes.capteurs = function (root, env) {
    let course = 0;

    root.innerHTML = `
      <div class="capteurs-scene">
        <svg class="mini-terra" viewBox="0 0 300 190" role="img" aria-label="Un petit terrarium avec trois plantes, dont une feuille moisie, et deux capteurs sur les côtés.">
          <defs><clipPath id="clip-mini"><rect x="50" y="26" width="200" height="150" rx="18"/></clipPath></defs>
          <rect class="glass-fill" x="50" y="26" width="200" height="150" rx="18"/>
          <g clip-path="url(#clip-mini)">
            <rect class="l-soil" x="50" y="148" width="200" height="30"/>
            <rect class="flood" id="h-eau" x="50" y="26" width="200" height="150"/>
          </g>
          ${plante(105, 62, false)}${plante(150, 84, true)}${plante(196, 52, false)}
          <rect class="glass" x="50" y="26" width="200" height="150" rx="18"/>
          <rect class="cork" id="h-couvercle" x="84" y="14" width="132" height="14" rx="5"/>
          <g class="capteur" id="h-avant"><rect x="14" y="74" width="30" height="46" rx="7"/><circle class="led" cx="29" cy="88" r="5"/><text x="29" y="111" text-anchor="middle">avant</text></g>
          <g class="capteur" id="h-apres"><rect x="256" y="74" width="30" height="46" rx="7"/><circle class="led" cx="271" cy="88" r="5"/><text x="271" y="111" text-anchor="middle">après</text></g>
        </svg>

        <fieldset class="hooks">
          <legend>Capteurs branchés</legend>
          ${HOOKS.map((h) => `
            <label class="hook-row">
              <input type="checkbox" id="h-on-${h.id}" value="${h.id}">
              <span class="moment m-${h.moment === 'Avant' ? 'avant' : 'apres'}">${h.moment}</span>
              <span class="hook-nom"><strong>${esc(h.nom)}</strong><small>${esc(h.aide)}</small></span>
            </label>`).join('')}
        </fieldset>

        <div class="controls">
          <button type="button" class="btn primary" id="h-lancer">Lancer l'agent</button>
        </div>
        <p class="demande" id="h-demande"><span class="tag">Demande</span> Il y a de la moisissure. Règle ça.</p>
        <p class="status" id="h-issue" role="status">Aucun capteur branché : l'agent fera ce qu'il veut.</p>
        <ol class="trace" id="h-trace" aria-label="Journal de l'agent" aria-live="polite"></ol>
      </div>`;

    const journal = trace(root.querySelector('#h-trace'));
    const issue = root.querySelector('#h-issue');
    const bouton = root.querySelector('#h-lancer');
    const eau = root.querySelector('#h-eau');
    const couvercle = root.querySelector('#h-couvercle');
    const plantes = root.querySelectorAll('.plant');
    const moisie = root.querySelector('.moisie');
    const origineEau = { transformOrigin: '50% 100%' };

    function remettre() {
      gsap.killTweensOf([eau, couvercle, moisie, ...plantes]);
      gsap.set(plantes, { y: 0, opacity: 1, rotation: 0 });
      gsap.set(moisie, { y: 0, opacity: 1 });
      gsap.set(eau, { scaleY: 0, ...origineEau });
      gsap.set(couvercle, { y: 0, rotation: 0 });
    }

    const EFFETS = {
      arrache: () => gsap.to(plantes, { y: -150, opacity: 0, rotation: (i) => (i - 1) * 25, duration: 0.8, stagger: 0.1, ease: 'back.in(1.4)' }),
      feuille: () => gsap.to(moisie, { y: 34, opacity: 0, duration: 0.7, ease: 'power1.in' }),
      inonde: () => gsap.to(eau, { scaleY: 0.72, duration: 1.2, ease: 'power2.out', ...origineEau }),
      arrose: () => gsap.to(eau, { scaleY: 0.09, duration: 0.8, ease: 'power2.out', ...origineEau }),
      aere: () => {
        gsap.to(couvercle, { y: -14, rotation: -8, transformOrigin: '0% 50%', duration: 0.5 });
        gsap.to(eau, { scaleY: 0.12, duration: 1.4, ease: 'power1.inOut', ...origineEau });
      },
    };

    function clignoter(moment, verdict) {
      const led = root.querySelector(`#h-${moment} .led`);
      led.classList.toggle('bloque', verdict === 'bloque');
      gsap.fromTo(led, { scale: 2.2, opacity: 1 }, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.6, ease: 'power2.out' });
      gsap.fromTo(led, { fillOpacity: 1 }, { fillOpacity: 0.25, duration: 1.4, delay: 0.3 });
    }

    root.querySelector('.hooks').addEventListener('change', () => {
      const n = root.querySelectorAll('.hooks input:checked').length;
      issue.className = 'status';
      issue.textContent = n === 0 ? "Aucun capteur branché : l'agent fera ce qu'il veut."
        : `${n} capteur${n > 1 ? 's' : ''} branché${n > 1 ? 's' : ''}. Lance l'agent pour voir la différence.`;
    });

    bouton.addEventListener('click', async () => {
      const moi = ++course;
      const hooks = [...root.querySelectorAll('.hooks input:checked')].map((i) => i.value);
      bouton.disabled = true;
      journal.clear();
      remettre();
      issue.className = 'status';
      issue.textContent = "L'agent travaille…";

      const sim = await env.api.simulate('capteurs', { hooks });
      for (const step of sim.steps) {
        if (!env.vivant() || moi !== course) return;
        if (step.type === 'hook') {
          clignoter(step.moment, step.verdict);
          journal.add(step.moment === 'avant' ? 'Capteur avant' : 'Capteur après', step.texte, step.verdict === 'bloque' ? 't-refus' : 't-hook');
        } else {
          journal.add(ETIQUETTE[step.type], step.texte, step.erreur ? 't-refus' : 't-' + step.type);
          if (step.effet) EFFETS[step.effet]();
        }
        await env.attendre(step.type === 'pensee' ? 700 : 900);
      }
      if (!env.vivant() || moi !== course) return;

      const r = sim.issue;
      const morceaux = [];
      if (!r.plantes) morceaux.push("Plus aucune plante : rien n'a empêché l'agent de tout arracher.");
      else morceaux.push('Les plantes sont sauvées : le garde-plantes a bloqué, et le modèle a trouvé une autre solution.');
      if (r.inonde) morceaux.push("Terrarium inondé : 200 ml d'un coup, et personne pour le signaler.");
      else if (r.corrige) morceaux.push("Inondation rattrapée : l'hygromètre a prévenu le modèle, qui a aéré.");
      else morceaux.push("Arrosage limité à 50 ml avant même d'être exécuté.");
      morceaux.push(r.carnet ? `${r.carnet} actions notées dans le carnet.` : 'Aucune trace de ce qui a été fait.');
      issue.textContent = morceaux.join(' ');
      issue.className = 'status ' + (r.plantes && !r.inonde ? 'succes' : 'danger');
      bouton.disabled = false;
      bouton.textContent = "Relancer l'agent";
    });

    remettre();
  };
})();
