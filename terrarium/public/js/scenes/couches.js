/* Chapitre 3 — Les couches : une requête traverse les middlewares. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc, trace, secouer } = T.ui;

  const COUCHES = {
    journal: { matiere: 'Mousse', role: 'Journalisation', aide: 'Note tout ce qui passe' },
    filtre: { matiere: 'Sable', role: 'Filtre de données sensibles', aide: 'Masque les adresses e-mail' },
    cache: { matiere: 'Terreau', role: 'Cache', aide: 'Retient les réponses déjà données' },
    debit: { matiere: 'Galets', role: 'Limite de débit', aide: '3 requêtes au maximum' },
  };

  T.scenes.couches = function (root, env) {
    let memoire = { appels: 0, cache: [] };
    let enCours = false;
    let envois = 0;

    root.innerHTML = `
      <div class="couches-scene">
        <div class="pipe">
          <div class="pipe-end" id="k-haut">
            <span class="tag">Requête</span>
            <code id="k-payload">Arrose la plante de camille@exemple.fr</code>
          </div>
          <ol class="layers" id="k-layers">
            ${['journal', 'filtre', 'cache', 'debit'].map((id) => `
              <li class="layer l-${id}" data-id="${id}" data-flip-id="layer-${id}">
                <div class="layer-head">
                  <span class="texture" aria-hidden="true"></span>
                  <span class="layer-nom"><strong>${COUCHES[id].matiere}</strong> · ${COUCHES[id].role}<small>${COUCHES[id].aide}</small></span>
                </div>
                <div class="layer-tools">
                  <label class="switch"><input type="checkbox" id="k-on-${id}" checked><span>Active</span></label>
                  <button type="button" class="mini ghost" data-move="-1" aria-label="Monter ${COUCHES[id].matiere}">▲</button>
                  <button type="button" class="mini ghost" data-move="1" aria-label="Descendre ${COUCHES[id].matiere}">▼</button>
                </div>
                <p class="effect" data-effect></p>
              </li>`).join('')}
          </ol>
          <div class="pipe-end model" id="k-modele">
            <span class="tag">Le modèle</span>
            <span class="effect" data-effect></span>
          </div>
          <span class="rail" aria-hidden="true"></span>
          <span class="drop-dot" id="k-goutte" aria-hidden="true"></span>
        </div>
        <div class="controls">
          <button type="button" class="btn primary" id="k-verser">Verser une requête</button>
          <button type="button" class="btn ghost" id="k-reset">Vider le cache et le quota</button>
        </div>
        <p class="status" id="k-lecon" role="status">Requêtes versées : 0</p>
        <ol class="trace" id="k-trace" aria-label="Journal du passage" aria-live="polite"></ol>
      </div>`;

    const pipe = root.querySelector('.pipe');
    const liste = root.querySelector('#k-layers');
    const goutte = root.querySelector('#k-goutte');
    const payload = root.querySelector('#k-payload');
    const haut = root.querySelector('#k-haut');
    const modele = root.querySelector('#k-modele');
    const lecon = root.querySelector('#k-lecon');
    const journal = trace(root.querySelector('#k-trace'));
    const bVerser = root.querySelector('#k-verser');

    const centre = (el) => el.offsetTop + el.offsetHeight / 2 - goutte.offsetHeight / 2;
    const actives = () => [...liste.children].filter((li) => li.querySelector('input').checked).map((li) => li.dataset.id);

    function majBoutons() {
      const items = [...liste.children];
      items.forEach((li, i) => {
        li.querySelector('[data-move="-1"]').disabled = i === 0;
        li.querySelector('[data-move="1"]').disabled = i === items.length - 1;
        li.classList.toggle('off', !li.querySelector('input').checked);
      });
    }

    liste.addEventListener('click', (e) => {
      const b = e.target.closest('[data-move]');
      if (!b || enCours) return;
      const li = b.closest('.layer');
      const sens = Number(b.dataset.move);
      const voisin = sens < 0 ? li.previousElementSibling : li.nextElementSibling;
      if (!voisin) return;
      const etat = Flip.getState(liste.children);
      if (sens < 0) liste.insertBefore(li, voisin); else liste.insertBefore(voisin, li);
      Flip.from(etat, { duration: 0.4, ease: 'power2.inOut' });
      majBoutons();
      b.focus();
    });
    liste.addEventListener('change', majBoutons);

    function nettoyer() {
      root.querySelectorAll('[data-effect]').forEach((p) => { p.textContent = ''; });
      root.querySelectorAll('.layer, .pipe-end').forEach((el) => el.classList.remove('actif', 'alerte', 'refus'));
      payload.textContent = 'Arrose la plante de camille@exemple.fr';
      haut.querySelector('.tag').textContent = 'Requête';
      goutte.classList.remove('retour');
    }

    async function verser() {
      if (enCours) return;
      enCours = true;
      bVerser.disabled = true;
      nettoyer();
      journal.clear();
      envois += 1;

      const sim = await env.api.simulate('couches', { layers: actives(), state: memoire });
      if (!env.vivant()) return;
      memoire = sim.state;
      lecon.textContent = `Requête n° ${envois} en cours…`;
      lecon.className = 'status';

      gsap.set(goutte, { y: centre(haut), opacity: 1, scale: 1 });
      for (const step of sim.steps) {
        const cible = step.phase === 'modele' ? modele : liste.querySelector(`[data-id="${step.layer}"]`);
        if (step.phase === 'remontee') goutte.classList.add('retour');
        await gsap.to(goutte, { y: centre(cible), duration: step.passif ? 0.25 : 0.5, ease: 'power2.inOut' });
        if (!env.vivant()) return;
        if (step.passif) continue;

        cible.classList.add('actif');
        if (step.fuite) cible.classList.add('alerte');
        if (step.refus) { cible.classList.add('refus'); secouer(cible); }
        const sens = step.phase === 'descente' ? '↓ ' : step.phase === 'remontee' ? '↑ ' : '';
        const zone = cible.querySelector('[data-effect]');
        zone.textContent = (zone.textContent ? zone.textContent + '  ' : '') + sens + step.texte;
        if (step.payload && step.payload !== payload.textContent) {
          payload.textContent = step.payload;
          gsap.fromTo(payload, { backgroundColor: 'var(--amber-soft)' }, { backgroundColor: 'transparent', duration: 1, clearProps: 'backgroundColor' });
        }
        const nom = step.phase === 'modele' ? 'Modèle' : COUCHES[step.layer].matiere;
        journal.add(nom, sens + step.texte, step.fuite ? 't-alerte' : step.refus ? 't-refus' : step.phase === 'modele' ? 't-pensee' : '');
        gsap.fromTo(goutte, { scale: 1.5 }, { scale: 1, duration: 0.3 });
        await env.attendre(520);
        if (!env.vivant()) return;
      }

      goutte.classList.add('retour');
      await gsap.to(goutte, { y: centre(haut), duration: 0.4, ease: 'power2.inOut' });
      if (!env.vivant()) return;
      haut.querySelector('.tag').textContent = 'Réponse';
      payload.textContent = sim.reponse;
      gsap.to(goutte, { opacity: 0, duration: 0.3 });

      const alerte = sim.steps.some((s) => s.fuite || s.refus);
      lecon.textContent = sim.lecons.join(' ');
      lecon.className = 'status ' + (alerte ? 'danger' : 'succes');
      journal.add('Réponse', sim.reponse, 't-reponse');
      enCours = false;
      bVerser.disabled = false;
      bVerser.textContent = 'Verser la même requête';
    }

    bVerser.addEventListener('click', verser);
    root.querySelector('#k-reset').addEventListener('click', () => {
      if (enCours) return;
      memoire = { appels: 0, cache: [] };
      envois = 0;
      nettoyer();
      journal.clear();
      lecon.textContent = 'Cache vidé et quota remis à zéro.';
      lecon.className = 'status';
      bVerser.textContent = 'Verser une requête';
    });

    majBoutons();
    gsap.set(goutte, { opacity: 0 });
    // Garde ce repère pour le positionnement de la goutte.
    pipe.dataset.pret = '1';
  };
})();
