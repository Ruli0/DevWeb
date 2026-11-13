/* Chapitre 1 — Le bocal : fenêtre de contexte, sélection et compactage. */
(function () {
  'use strict';
  const T = window.Terrarium;
  const { esc, nombre, compter, secouer } = T.ui;

  const CAPACITE = 8000;
  const ELEMENTS = [
    { id: 'consigne', nom: 'Consigne système', tokens: 600, genre: 'k-consigne', vital: true },
    { id: 'demande', nom: "Demande de l'utilisateur", tokens: 300, genre: 'k-demande', vital: true },
    { id: 'outils', nom: "Définitions d'outils", tokens: 1200, genre: 'k-outils' },
    { id: 'doc', nom: "Guide d'arrosage (PDF entier)", tokens: 2400, genre: 'k-source', compost: { nom: 'Guide : les 2 pages utiles', tokens: 800 } },
    { id: 'historique', nom: 'Historique : 12 échanges', tokens: 2800, genre: 'k-histo', compost: { nom: "Résumé de l'historique", tokens: 700 } },
    { id: 'releves', nom: "Résultat d'outil : 30 jours de relevés", tokens: 1800, genre: 'k-source', compost: { nom: 'Relevés : la moyenne et les 2 alertes', tokens: 500 } },
    { id: 'page', nom: 'Page web entière', tokens: 3500, genre: 'k-source', compost: { nom: 'Page web : le paragraphe utile', tokens: 900 } },
  ];

  T.scenes.bocal = function (root) {
    const dedans = new Set();
    const compostes = new Set();

    root.innerHTML = `
      <div class="bocal-scene">
        <div class="jar-col">
          <div class="jar" aria-hidden="true">
            <div class="jar-bands"></div>
          </div>
          <p class="gauge"><strong id="b-utilise" data-v="0">0</strong> / ${nombre(CAPACITE)} tokens</p>
          <p class="status" id="b-statut" role="status"></p>
        </div>
        <div class="lists">
          <section>
            <h3>Sur l'étagère</h3>
            <ul class="items" id="b-etagere"></ul>
            <p class="vide" id="b-etagere-vide" hidden>Tout est dans le bocal.</p>
          </section>
          <section>
            <h3>Dans le bocal</h3>
            <ul class="items" id="b-dedans"></ul>
            <p class="vide" id="b-dedans-vide">Rien pour l'instant.</p>
          </section>
        </div>
      </div>`;

    const jar = root.querySelector('.jar');
    const bandes = root.querySelector('.jar-bands');
    const etagere = root.querySelector('#b-etagere');
    const liste = root.querySelector('#b-dedans');
    const statut = root.querySelector('#b-statut');
    const lignes = new Map();
    const bandesPar = new Map();

    const tokensDe = (el) => (compostes.has(el.id) ? el.compost.tokens : el.tokens);
    const nomDe = (el) => (compostes.has(el.id) ? el.compost.nom : el.nom);
    const total = () => ELEMENTS.filter((e) => dedans.has(e.id)).reduce((s, e) => s + tokensDe(e), 0);

    function remplirLigne(li, el) {
      const dans = dedans.has(el.id);
      li.className = `item ${el.genre}${dans ? ' dans' : ''}`;
      li.innerHTML = dans
        ? `<span class="swatch"></span>
           <span class="item-nom">${esc(nomDe(el))}<small>${nombre(tokensDe(el))} tokens</small></span>
           ${el.compost && !compostes.has(el.id) ? '<button type="button" class="mini" data-act="composter">Composter</button>' : ''}
           <button type="button" class="mini ghost" data-act="retirer" aria-label="Retirer ${esc(nomDe(el))} du bocal">Retirer</button>`
        : `<button type="button" class="item-add" data-act="ajouter">
             <span class="swatch"></span>
             <span class="item-nom">${esc(nomDe(el))}<small>${nombre(tokensDe(el))} tokens</small></span>
             <span class="plus" aria-hidden="true">+</span>
           </button>`;
    }

    ELEMENTS.forEach((el) => {
      const li = document.createElement('li');
      li.dataset.id = el.id;
      li.dataset.flipId = 'item-' + el.id;
      remplirLigne(li, el);
      etagere.appendChild(li);
      lignes.set(el.id, li);
    });

    function majBocal() {
      const t = total();
      compter(root.querySelector('#b-utilise'), t);
      const deborde = t > CAPACITE;
      jar.classList.toggle('deborde', deborde);
      root.querySelector('.gauge').classList.toggle('deborde', deborde);
      root.querySelector('#b-etagere-vide').hidden = dedans.size < ELEMENTS.length;
      root.querySelector('#b-dedans-vide').hidden = dedans.size > 0;

      const manqueVital = ELEMENTS.some((e) => e.vital && !dedans.has(e.id));
      if (dedans.size === 0) statut.textContent = 'Le bocal est vide : le modèle ne sait rien.';
      else if (deborde) statut.textContent = `Ça déborde de ${nombre(t - CAPACITE)} tokens : ce qui dépasse est perdu. Composte ou retire quelque chose.`;
      else if (dedans.size === ELEMENTS.length) statut.textContent = `Tout tient, et il reste ${nombre(CAPACITE - t)} tokens pour réfléchir et répondre. C'est ça, le context engineering.`;
      else if (manqueVital) statut.textContent = 'Il manque la consigne ou la demande : sans elles, le reste ne sert à rien.';
      else statut.textContent = `Il reste ${nombre(CAPACITE - t)} tokens libres.`;
      statut.classList.toggle('danger', deborde);
      statut.classList.toggle('succes', !deborde && dedans.size === ELEMENTS.length);
      if (deborde) { secouer(jar); eclabousser(); }
    }

    function eclabousser() {
      if (T.reduce) return;
      for (let i = 0; i < 6; i += 1) {
        const g = document.createElement('span');
        g.className = 'splash';
        jar.appendChild(g);
        const cote = i % 2 ? 1 : -1;
        gsap.fromTo(g, { x: cote * 30, y: 0, opacity: 1 }, {
          x: cote * gsap.utils.random(70, 110), y: gsap.utils.random(60, 150), opacity: 0,
          duration: gsap.utils.random(0.6, 1), ease: 'power1.in', onComplete: () => g.remove(),
        });
      }
    }

    function hauteur(el) { return Math.max(2, (tokensDe(el) / CAPACITE) * 100) + '%'; }

    function ajouter(el) {
      const etatFlip = Flip.getState(root.querySelectorAll('.item, [data-flip-id]'));
      dedans.add(el.id);
      const li = lignes.get(el.id);
      remplirLigne(li, el);
      liste.appendChild(li);
      Flip.from(etatFlip, { duration: 0.45, ease: 'power2.inOut' });

      const bande = document.createElement('div');
      bande.className = `band ${el.genre}`;
      bandes.appendChild(bande);
      bandesPar.set(el.id, bande);
      gsap.fromTo(bande, { height: '0%' }, { height: hauteur(el), duration: 0.6, ease: 'bounce.out' });
      majBocal();
    }

    function retirer(el) {
      const etatFlip = Flip.getState(root.querySelectorAll('.item'));
      dedans.delete(el.id);
      compostes.delete(el.id);
      const li = lignes.get(el.id);
      remplirLigne(li, el);
      // On remet l'élément à sa place d'origine sur l'étagère.
      const apres = ELEMENTS.slice(ELEMENTS.indexOf(el) + 1).map((e) => lignes.get(e.id)).find((n) => n.parentNode === etagere);
      etagere.insertBefore(li, apres || null);
      Flip.from(etatFlip, { duration: 0.45, ease: 'power2.inOut' });

      const bande = bandesPar.get(el.id);
      bandesPar.delete(el.id);
      gsap.to(bande, { height: '0%', duration: 0.35, ease: 'power2.in', onComplete: () => bande.remove() });
      majBocal();
    }

    function composter(el) {
      compostes.add(el.id);
      const li = lignes.get(el.id);
      remplirLigne(li, el);
      gsap.fromTo(li, { backgroundColor: 'var(--moss-soft)' }, { backgroundColor: 'transparent', duration: 0.9, clearProps: 'backgroundColor' });
      const bande = bandesPar.get(el.id);
      bande.classList.add('composte');
      gsap.to(bande, { height: hauteur(el), duration: 0.7, ease: 'power3.inOut' });
      majBocal();
    }

    root.addEventListener('click', (e) => {
      const bouton = e.target.closest('[data-act]');
      if (!bouton) return;
      const el = ELEMENTS.find((x) => x.id === bouton.closest('.item').dataset.id);
      ({ ajouter, retirer, composter })[bouton.dataset.act](el);
    });

    // État de départ : la consigne et la demande sont déjà dans le bocal.
    ajouter(ELEMENTS[0]);
    ajouter(ELEMENTS[1]);
  };
})();
