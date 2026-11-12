/*
 * Accès aux données. Par défaut, tout passe par l'API Node.js.
 * Si le serveur est absent (démo en un seul fichier), on se rabat sur les
 * mêmes modules partagés, exécutés dans le navigateur, et sur localStorage.
 */
(function () {
  'use strict';
  const T = (window.Terrarium = window.Terrarium || {});
  let horsLigne = Boolean(window.TERRARIUM_OFFLINE);

  const stock = {
    get(cle) { try { return localStorage.getItem(cle); } catch { return null; } },
    set(cle, valeur) { try { localStorage.setItem(cle, valeur); } catch { /* stockage indisponible */ } },
  };

  function idVisiteur() {
    let id = stock.get('terrarium-id');
    if (!id) {
      id = 'v-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      stock.set('terrarium-id', id);
    }
    return id;
  }

  async function appel(url, options, secours) {
    if (!horsLigne) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return await res.json();
        if (res.status < 500) throw Object.assign(new Error('Requête refusée'), { definitif: true });
      } catch (err) {
        if (err.definitif) throw err;
        horsLigne = true; // serveur injoignable : on continue en local
      }
    }
    return secours();
  }

  const json = (methode, corps) => ({
    method: methode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  });

  T.api = {
    chapters: () => appel('/api/chapters', undefined, () => T.content.list()),
    chapter: (id) => appel(`/api/chapters/${id}`, undefined, () => T.content.get(id)),
    simulate: (scenario, options) => appel('/api/simulate', json('POST', { scenario, options }),
      () => T.simulation.simulate(scenario, options)),
    async getProgress() {
      const local = () => {
        try { return { done: JSON.parse(stock.get('terrarium-done')) || [] }; } catch { return { done: [] }; }
      };
      const p = await appel(`/api/progress/${idVisiteur()}`, undefined, local);
      // Le serveur fait foi, mais on ne perd pas ce qui a été fait hors ligne.
      return { done: [...new Set([...(p.done || []), ...local().done])] };
    },
    saveProgress(done) {
      stock.set('terrarium-done', JSON.stringify(done));
      return appel(`/api/progress/${idVisiteur()}`, json('PUT', { done }), () => ({ done }));
    },
  };
})();
