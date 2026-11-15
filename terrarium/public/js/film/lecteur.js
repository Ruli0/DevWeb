/*
 * Le lecteur du site : il joue en temps réel les mêmes scénarios que les vidéos,
 * dans le vivarium vivant de la page d'accueil (sans l'ambiance, déjà présente).
 */
(function () {
  'use strict';
  const T = window.Terrarium;

  T.lecteur = function (scene, dire, conteneur, scenarios) {
    let tl = null;
    let actif = null;
    let jeton = 0;
    let resoudre = null; // termine la promesse de la scène en cours

    const parChapitre = (id) => scenarios.find((s) => s.chapitre === id || s.id === id);

    // Les habitants que la scène dirige cessent un instant de vivre leur vie.
    function figer(sc) {
      if (typeof sc.decor.cameleon === 'number') {
        scene.balade.pause();
        scene.pas.pause();
      }
      if (sc.decor.mouche === 'cachee') scene.mouche.retenir();
    }
    function relacher(sc) {
      if (typeof sc.decor.cameleon === 'number' && !T.reduce) scene.balade.restart();
      if (sc.decor.mouche === 'cachee') scene.mouche.liberer();
    }

    function poserCartes(sc) {
      conteneur.querySelectorAll('.carte').forEach((c) => c.remove());
      sc.plans.forEach((p, i) => {
        if (!p.carte) return;
        const div = document.createElement('div');
        div.className = 'carte';
        div.id = `carte-${i}`;
        div.setAttribute('aria-hidden', 'true');
        div.innerHTML = T.film.carteHTML(p.carte);
        conteneur.appendChild(div);
      });
    }

    // Remet le vivarium au repos et rend la main à la vie normale.
    function liberer(fini) {
      if (resoudre) { resoudre(Boolean(fini)); resoudre = null; }
      if (!tl) return;
      tl.pause();
      tl.seek(0.001, true);
      tl.kill();
      tl = null;
      scene.svg.setAttribute('viewBox', '0 0 600 744'); // caméra au repos, quel que soit le premier plan
      conteneur.querySelectorAll('.carte').forEach((c) => c.remove());
      relacher(actif);
      actif = null;
    }

    function jouer(id) {
      liberer();
      const sc = parChapitre(id);
      if (!sc) return Promise.resolve(false);
      const moi = ++jeton;
      actif = { ...sc, decor: sc.decor || {} };
      poserCartes(actif);
      figer(actif);
      tl = T.film.construire({
        svg: scene.svg,
        racine: conteneur,
        scenario: actif,
        ambiance: false,
        legende: (texte) => dire(texte),
      });
      // Avec « animations réduites », le site accélère tout : la scène garde sa vitesse.
      if (T.reduce) tl.timeScale(1 / gsap.globalTimeline.timeScale());
      return new Promise((fin) => {
        resoudre = fin;
        tl.eventCallback('onComplete', () => { if (moi === jeton) liberer(true); });
        tl.play(0);
      });
    }

    return {
      jouer,
      arreter() { jeton += 1; liberer(); },
      detruire() { jeton += 1; liberer(); },
      ids: scenarios.map((s) => s.chapitre),
    };
  };
})();
