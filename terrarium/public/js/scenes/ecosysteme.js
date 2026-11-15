/* Chapitre 5 — L'écosystème : un orchestrateur et des sous-agents isolés. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { nombre, trace, secouer } = T.ui;

  // Géométrie : le bocal du jardinier en haut, trois mini-bocaux en bas.
  const PRINCIPAL = { x: 125, y: 14, w: 110, h: 100 };
  const MINIS = {
    fourmi: { x: 18, y: 190, w: 84, h: 70, nom: 'Fourmi' },
    cloporte: { x: 138, y: 190, w: 84, h: 70, nom: 'Cloporte' },
    collembole: { x: 258, y: 190, w: 84, h: 70, nom: 'Collembole' },
  };
  const milieu = (b) => b.x + b.w / 2;

  const BETES = {
    fourmi: '<circle r="4.5" cx="-8"/><circle r="3.5"/><circle r="4.2" cx="8"/><path d="M8 -4 l4 -6 M-8 4 l-3 6 M0 3.5 v7 M8 4 l3 6"/>',
    cloporte: '<ellipse rx="13" ry="7.5"/><path d="M-6 -7 v14 M0 -7.5 v15 M6 -7 v14 M13 -2 l5 -4"/>',
    collembole: '<ellipse rx="10" ry="5"/><circle cx="12" r="4"/><path d="M15 -3 l5 -6 M-10 2 l-7 5"/>',
  };

  function bocal(id, b, classe) {
    return `<g class="eco-jar ${classe}" data-jar="${id}">
      <clipPath id="clip-${id}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="13"/></clipPath>
      <rect class="glass-fill" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="13"/>
      <rect class="niveau" data-niveau="${id}" clip-path="url(#clip-${id})" x="${b.x}" y="${b.y + b.h}" width="${b.w}" height="0"/>
      <rect class="glass" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="13"/>
    </g>`;
  }

  T.scenes.ecosysteme = function (root, env) {
    let course = 0;
    const bilans = {};

    root.innerHTML = `
      <div class="eco-scene">
        <svg class="eco-svg" viewBox="0 0 360 300" role="img" aria-label="Le bocal du jardinier relié à trois mini-bocaux : la fourmi, le cloporte et le collembole.">
          ${Object.entries(MINIS).map(([id, b]) => `<path class="lien" id="e-lien-${id}" d="M${milieu(PRINCIPAL)} ${PRINCIPAL.y + PRINCIPAL.h} C${milieu(PRINCIPAL)} 160 ${milieu(b)} 150 ${milieu(b)} ${b.y}"/>`).join('')}
          ${bocal('principal', PRINCIPAL, 'principal')}
          <text class="eco-nom" x="${milieu(PRINCIPAL)}" y="${PRINCIPAL.y + 44}" text-anchor="middle">Jardinier</text>
          <text class="eco-tokens" id="e-t-principal" x="${milieu(PRINCIPAL)}" y="${PRINCIPAL.y + 64}" text-anchor="middle">0</text>
          <text class="eco-cap" x="${milieu(PRINCIPAL)}" y="${PRINCIPAL.y + 80}" text-anchor="middle">/ 16 000 tokens</text>
          ${Object.entries(MINIS).map(([id, b]) => `
            ${bocal(id, b, 'mini')}
            <g transform="translate(${milieu(b)} ${b.y + b.h - 18})"><g class="bete" id="e-bete-${id}">${BETES[id]}</g></g>
            <text class="eco-nom" x="${milieu(b)}" y="${b.y + b.h + 16}" text-anchor="middle">${b.nom}</text>
            <text class="eco-tokens small" id="e-t-${id}" x="${milieu(b)}" y="${b.y + b.h + 31}" text-anchor="middle">0 token</text>`).join('')}
          <circle class="pastille" id="e-pastille" r="7" cx="-20" cy="-20"/>
        </svg>
        <div class="controls">
          <button type="button" class="btn primary" data-mode="equipe">Déléguer à l'équipe</button>
          <button type="button" class="btn ghost" data-mode="seul">Tout faire seul</button>
        </div>
        <p class="demande"><span class="tag">Demande</span> Prépare le terrarium pour l'hiver.</p>
        <p class="status" id="e-bilan" role="status">Choisis une façon de faire.</p>
        <ol class="trace" id="e-trace" aria-label="Journal de la mission" aria-live="polite"></ol>
      </div>`;

    const journal = trace(root.querySelector('#e-trace'));
    const bilan = root.querySelector('#e-bilan');
    const pastille = root.querySelector('#e-pastille');
    const boutons = root.querySelectorAll('[data-mode]');
    const svg = root.querySelector('.eco-svg');
    const valeurs = { principal: 0, fourmi: 0, cloporte: 0, collembole: 0 };

    function niveau(id, tokens, capacite, duree) {
      const b = id === 'principal' ? PRINCIPAL : MINIS[id];
      const rect = root.querySelector(`[data-niveau="${id}"]`);
      const ratio = Math.min(1, tokens / capacite);
      const h = b.h * ratio;
      gsap.to(rect, { attr: { y: b.y + b.h - h, height: h }, duration: duree ?? 0.7, ease: 'power2.out' });
      const txt = root.querySelector(`#e-t-${id}`);
      const obj = { v: valeurs[id] };
      valeurs[id] = tokens;
      gsap.to(obj, {
        v: tokens, duration: duree ?? 0.7, ease: 'power2.out',
        onUpdate: () => { txt.textContent = id === 'principal' ? nombre(obj.v) : `${nombre(obj.v)} tokens`; },
      });
      const jar = root.querySelector(`[data-jar="${id}"]`);
      jar.classList.toggle('deborde', tokens > capacite);
      if (tokens > capacite) secouer(jar);
    }

    // Fait voyager une pastille le long d'un lien (brief vers le bas, rapport vers le haut).
    function voyager(agent, versLeBas) {
      const lien = `#e-lien-${agent}`;
      pastille.setAttribute('class', 'pastille ' + (versLeBas ? 'brief' : 'rapport'));
      return gsap.fromTo(pastille, { opacity: 1 }, {
        motionPath: { path: lien, align: lien, alignOrigin: [0.5, 0.5], start: versLeBas ? 0 : 1, end: versLeBas ? 1 : 0 },
        duration: 0.7, ease: 'power1.inOut',
        onComplete: () => gsap.set(pastille, { opacity: 0 }),
      });
    }

    function remettre(capacite) {
      gsap.killTweensOf(root.querySelectorAll('.bete, .pastille, [data-niveau]'));
      gsap.set(pastille, { opacity: 0 });
      gsap.set(root.querySelectorAll('.bete'), { x: 0, rotation: 0 });
      Object.keys(valeurs).forEach((id) => niveau(id, 0, capacite, 0.2));
    }

    async function lancer(mode) {
      const moi = ++course;
      boutons.forEach((b) => { b.disabled = true; });
      journal.clear();
      svg.classList.toggle('solo', mode === 'seul');
      bilan.className = 'status';
      bilan.textContent = mode === 'seul' ? 'Le jardinier fait tout lui-même…' : 'Le jardinier délègue…';

      const sim = await env.api.simulate('ecosysteme', { mode });
      if (!env.vivant() || moi !== course) return;
      remettre(sim.capacite);
      await env.attendre(300);

      for (const step of sim.steps) {
        if (!env.vivant() || moi !== course) return;
        if (step.type === 'brief') {
          await voyager(step.agent, true);
          journal.add('Brief', step.texte, 't-hook');
        } else if (step.type === 'travail') {
          journal.add('En parallèle', step.texte, 't-pensee');
          step.agents.forEach((a) => {
            niveau(a.agent, a.tokens, sim.capacite, 1.6);
            gsap.to(`#e-bete-${a.agent}`, { x: 14, rotation: 8, duration: 0.2, repeat: 7, yoyo: true, ease: 'sine.inOut' });
          });
          await env.attendre(1700);
        } else if (step.type === 'rapport') {
          await voyager(step.agent, false);
          journal.add('Résumé', `${step.texte} (${nombre(step.tokens)} tokens)`, 't-resultat');
        } else if (step.type === 'solo') {
          journal.add(step.deborde ? 'Déborde' : 'Seul', step.texte, step.deborde ? 't-refus' : 't-pensee');
          await env.attendre(300);
        } else if (step.type === 'reponse') {
          journal.add('Réponse', step.texte, step.degrade ? 't-refus' : 't-reponse');
        } else {
          journal.add('Départ', step.texte, '');
        }
        if (!env.vivant() || moi !== course) return;
        niveau('principal', step.principal, sim.capacite);
        await env.attendre(650);
      }

      bilans[mode] = sim.bilan;
      const phrases = [];
      if (bilans.equipe) phrases.push(`En équipe : ${nombre(bilans.equipe.principal)} tokens dans le bocal du jardinier, pour ${nombre(bilans.equipe.travailTotal)} tokens de travail réparti.`);
      if (bilans.seul) phrases.push(`Seul : ${nombre(bilans.seul.principal)} tokens pour un bocal de ${nombre(sim.capacite)}. Il déborde.`);
      if (!bilans.equipe || !bilans.seul) phrases.push('Essaie maintenant l\'autre façon pour comparer.');
      bilan.textContent = phrases.join(' ');
      bilan.className = 'status ' + (mode === 'equipe' ? 'succes' : 'danger');
      boutons.forEach((b) => { b.disabled = false; });
    }

    root.querySelector('.controls').addEventListener('click', (e) => {
      const b = e.target.closest('[data-mode]');
      if (b) lancer(b.dataset.mode);
    });

    niveau('principal', 900, 16000, 0.6);
  };
})();
