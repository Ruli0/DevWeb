/*
 * Les plans visuels de la chaîne « avis ». Ils occupent le haut de l'image (y 280 à 1040) ; les sous-titres sont dessous.
 * Chaque plan : ancres(p) (les champs calés sur un mot de la voix), textes(p), dessin(p, u) côté Node, jouer(c, el, p, t0, d) côté page.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.plans = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const q = (el, s) => el.querySelector(s), qa = (el, s) => [...el.querySelectorAll(s)];
  const GR = typeof require === 'function' ? require('./grille.js') : (typeof self !== 'undefined' ? self : this).Avis.grille;
  const kicker = (p, u) => (p.kicker ? `<div class="kicker">${u.esc(p.kicker)}</div>` : '');

  return {
    // Aucun texte : seulement le fond (décor ou fond uni) et, si on veut, une illustration. C'est le plan par défaut :
    // le spectateur lit déjà les sous-titres, il ne faut pas lui donner un second texte à lire.
    visuel: {
      description: 'Aucun texte : le fond et, si on veut, une illustration. "moment": { "a": ancre } déclenche le temps fort de l’illustration ; "repere" : un compteur court (« Mains 1/3 »).',
      max: 14,
      ancres: (p) => [[p.moment, 'a']],
      textes: (p) => [p.repere],
      // "repere" : un compteur très court (« Mains 1/3 ») pour les vidéos en liste. Ce n'est pas une phrase.
      dessin: (p, u) => (p.repere ? `<div class="kicker repere">${u.esc(p.repere)}</div>` : ''),
      jouer(c, el, p, t0) { c.monter(q(el, '.repere'), t0); },
    },
    // Une phrase forte, en grand. "taille": "geant" pour deux ou trois mots.
    titre: {
      description: 'Une phrase forte en grand (avec un surtitre facultatif). "taille": "geant" pour deux ou trois mots.',
      max: 60,
      ancres: () => [],
      textes: (p) => [p.texte],
      dessin: (p, u) => `${kicker(p, u)}<p class="grand${p.taille === 'geant' ? ' geant' : ''}">${u.md(p.texte)}</p><i class="filet"></i>`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        c.lignes(q(el, '.grand'), t0 + 0.08);
        c.ft(q(el, '.filet'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, t0 + 0.35);
      },
    },
    // Une liste dont chaque élément arrive sur son mot. "rayer" : l'ancre où tout est barré ; "conclusion" : la phrase qui suit.
    liste: {
      description: 'Une liste : chaque élément arrive sur son mot ("a"). "rayer" barre tout sur une ancre ; "conclusion" s’affiche ensuite.',
      max: 34,
      ancres: (p) => [...(p.items || []).map((x) => [x, 'a']), [p.rayer, 'a']],
      textes: (p) => [p.titre, p.conclusion, ...(p.items || []).map((x) => x.texte)],
      dessin: (p, u) => `${kicker(p, u)}${p.titre ? `<p class="moyen">${u.md(p.titre)}</p>` : ''}
        <ul class="items">${(p.items || []).map((x) => `<li><span>${u.esc(x.texte)}<i class="rature"></i></span></li>`).join('')}</ul>
        ${p.conclusion ? `<p class="conclusion">${u.md(p.conclusion)}</p>` : ''}`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.05);
        const lis = qa(el, 'li'), ratures = qa(el, '.rature');
        gsap.set(ratures, { scaleX: 0 });
        lis.forEach((li, i) => c.ft(li, { opacity: 0, x: -90, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)', transformOrigin: '0% 50%' }, t0 + (p.items[i].t == null ? 0.4 + 0.25 * i : p.items[i].t)));
        if (p.rayer) {
          const tr = t0 + p.rayer.t;
          c.ft(ratures, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out', stagger: 0.1 }, tr);
          c.ft(lis, { opacity: 1 }, { opacity: 0.45, duration: 0.3 }, tr + 0.1);
          if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), tr + 0.35);
        } else if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), t0 + d * 0.6);
      },
    },
    // Deux jauges : celle de gauche se vide, celle de droite se remplit sur son ancre.
    bascule: {
      description: 'Deux jauges : "gauche" (ce qui perd de la valeur) se vide, "droite" (ce qui en prend) se remplit sur son ancre "a".',
      max: 30,
      ancres: (p) => [[p.droite, 'a']],
      textes: (p) => [p.gauche && p.gauche.texte, p.droite && p.droite.texte, p.droite && p.droite.sous],
      dessin: (p, u) => `${kicker(p, u)}
        <div class="jauge g"><p>${u.esc(p.gauche.texte)}</p><div class="rail"><i></i></div></div>
        <div class="jauge d"><p>${u.esc(p.droite.texte)}</p><div class="rail"><i></i></div>${p.droite.sous ? `<span>${u.esc(p.droite.sous)}</span>` : ''}</div>`,
      jouer(c, el, p, t0, d) {
        const g = q(el, '.jauge.g'), dr = q(el, '.jauge.d');
        const tb = t0 + (p.droite.t == null ? d * 0.45 : p.droite.t);
        c.monter(q(el, '.kicker'), t0);
        gsap.set(dr, { opacity: 0 });
        c.ft(g, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, t0 + 0.1);
        c.ft(q(g, 'i'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, t0 + 0.2);
        c.ft(q(g, 'i'), { scaleX: 1 }, { scaleX: 0.22, duration: 0.9, ease: 'power3.inOut' }, tb);
        c.ft(g, { opacity: 1 }, { opacity: 0.45, duration: 0.6 }, tb);
        c.ft(dr, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, tb);
        c.ft(q(dr, 'i'), { scaleX: 0.05 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, tb + 0.15);
      },
    },
    // Le compte à rebours : il occupe une pause de la voix ("pauses" dans l'épisode) pour laisser le spectateur réfléchir.
    rebours: {
      description: 'Un compte à rebours pendant une pause de la voix (voir "pauses" dans l’épisode). Les chiffres tombent chaque seconde.',
      max: 0,
      ancres: () => [],
      textes: () => [],
      dessin: (p) => `<div class="rebours"><svg width="520" height="520"><circle cx="260" cy="260" r="236" fill="none" stroke="var(--fg)" stroke-opacity=".18" stroke-width="22"/><circle class="anneau" cx="260" cy="260" r="236" fill="none" stroke="var(--ac)" stroke-width="22" stroke-linecap="round" stroke-dasharray="1483" transform="rotate(-90 260 260)"/></svg>${Array.from({ length: p.secondes || 5 }, (_, i) => `<span>${(p.secondes || 5) - i}</span>`).join('')}</div>`,
      jouer(c, el, p, t0) {
        const n = p.secondes || 5, tc = t0 + (p.t || 0), boite = q(el, '.rebours');
        gsap.set(qa(el, '.rebours span'), { opacity: 0 });
        c.ft(boite, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, t0 + 0.1);
        gsap.set(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } });
        c.ft(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': 1483 }, duration: n, ease: 'none' }, tc);
        qa(el, '.rebours span').forEach((s, i) => {
          c.ft(s, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, tc + i);
          c.ft(s, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.7, duration: 0.18, ease: 'power2.in' }, tc + i + 0.8);
          c.ft(boite, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, tc + i);
        });
      },
    },
    // Le jeu de mots fléchés : trois mots qui se croisent, révélés un par un sur leur ancre, avec la barre singe → homme classique → Molière
    // et un petit minuteur par tranche (« cadence » : une réponse toutes les N secondes, calculée par le montage).
    grille: {
      description: 'Jeu de mots fléchés : "mots": [{ "texte", "sens": "h"|"v", "ligne", "colonne", "indice": { "texte", "a", "fin" }, "reponse": { "a" } }] (trois mots qui se croisent, du plus facile au plus dur) ; "cadence": 15 (une réponse toutes les 15 s : "indice.fin" = la phrase après laquelle commence le silence de réflexion) ; "titre" : l’accroche en haut ; "lueur": false coupe la lueur des cases du mot cherché ; "pulse": { "a" } : l’instant où la barre pulse (intro) ; "stades" : trois noms de palier.',
      max: 60,
      ancres: (p) => [[p.pulse, 'a'], ...(p.mots || []).flatMap((m) => [[m.indice, 'a'], [m.reponse, 'a']])],
      textes: (p) => [p.titre, ...(p.mots || []).map((m) => m.indice && m.indice.texte)],
      valider(p) {
        const e = GR.construire(p.mots).erreurs.slice();
        if ((p.mots || []).length !== 3) e.push('le jeu prévoit trois mots qui se croisent');
        (p.mots || []).forEach((m, k) => {
          if (!m.indice || !m.indice.texte || !m.indice.a) e.push(`mot ${k + 1} : "indice": { "texte", "a" }`);
          if (!m.reponse || !m.reponse.a) e.push(`mot ${k + 1} : "reponse": { "a" } (le mot dit par l’orbe)`);
          if (p.cadence && !(m.indice && m.indice.fin)) e.push(`mot ${k + 1} : avec "cadence", "indice": { "fin" } est nécessaire (la phrase après laquelle commence la réflexion)`);
        });
        if (p.cadence !== undefined && !(p.cadence >= 5 && p.cadence <= 30)) e.push('"cadence" : entre 5 et 30 secondes');
        return e;
      },
      dessin: (p, u) => {
        const g = GR.construire(p.mots), st = p.stades || ['Singe', 'Homme classique', 'Molière'], fig = ['singe', 'classique', 'moliere'], xs = [60, 480, 900];
        // Le point de départ des étincelles : l'orbe (son emplacement dans ce plan).
        let ox = 820, oy = 930;
        try { const e = require('./orbe.js').emplacement({ orbe: p.orbe, fond: 'nuit' }); ox = e.x; oy = e.y; } catch (err) { /* page : pas de require */ }
        const cases = g.cases.map((x) => `<div class="halo" style="left:${x.c * GR.PAS}px;top:${x.l * GR.PAS}px"></div><div class="case" data-m="${x.mots.join(' ')}" data-cx="${60 + x.c * GR.PAS + GR.CASE / 2}" data-cy="${390 + x.l * GR.PAS + GR.CASE / 2}" style="left:${x.c * GR.PAS}px;top:${x.l * GR.PAS}px"><i></i><u></u><s></s>${x.nums.length ? `<b>${x.nums.join('·')}</b>` : ''}<em>${u.esc(x.lettre)}</em></div>`).join('');
        const cartes = p.mots.map((m, k) => `<div class="carte"><span>${k + 1}${m.sens === 'h' ? '→' : '↓'}</span>${u.esc(m.indice.texte)}</div>`).join('');
        const paliers = st.map((nom, i) => `<div class="palier" style="left:${xs[i]}px">${GR.figure(fig[i])}<p>${u.esc(nom)}</p></div>`).join('');
        // Le minuteur : une tranche par mot (de la définition à la réponse, puis de réponse en réponse) ; un chiffre par seconde restante.
        const debuts = [p.mots[0].indice.t, p.mots[0].reponse.t, p.mots[1].reponse.t], fins = [p.mots[0].reponse.t, p.mots[1].reponse.t, p.mots[2].reponse.t];
        const chiffres = debuts.map((d, w) => { const n = Math.max(1, Math.round(fins[w] - d)); return Array.from({ length: n }, (_, j) => `<span data-w="${w}" data-j="${j}">${n - j}</span>`).join(''); }).join('');
        const minuteur = `<div class="minuteur"><svg width="84" height="84" viewBox="0 0 84 84"><circle class="m-fond" cx="42" cy="42" r="34"/><circle class="m-doux" cx="42" cy="42" r="34"/><circle class="m-vif" cx="42" cy="42" r="34"/></svg><div class="m-nb">${chiffres}</div></div>`;
        const etincelles = g.cases.map(() => '<i class="etincelle"></i>').join('');
        return `${p.titre ? `<p class="jeu-titre">${u.md(p.titre)}</p>` : ''}<div class="grille" data-ox="${ox}" data-oy="${oy}">${cases}</div><div class="cartes">${cartes}</div>${minuteur}<div class="barre"><div class="rail"><i></i></div>${paliers}</div>${etincelles}`;
      },
      jouer(c, el, p, t0) {
        const cases = qa(el, '.case'), cartes = qa(el, '.carte'), paliers = qa(el, '.palier'), rail = q(el, '.rail i'), grille = q(el, '.grille');
        const ox = +grille.dataset.ox, oy = +grille.dataset.oy, sparks = qa(el, '.etincelle');
        if (q(el, '.jeu-titre')) c.lignes(q(el, '.jeu-titre'), t0 + 0.05);
        gsap.set(qa(el, '.case em'), { opacity: 0 }); gsap.set(qa(el, '.case u'), { opacity: 0 }); gsap.set(qa(el, '.case s'), { opacity: 0 }); gsap.set(qa(el, '.halo'), { opacity: 0 }); gsap.set(cartes, { opacity: 0 }); gsap.set(rail, { scaleX: 0 }); gsap.set(sparks, { opacity: 0, left: ox - 8, top: oy - 8 });
        gsap.set(paliers[0], { opacity: 1, scale: 1 }); gsap.set([paliers[1], paliers[2]], { opacity: 0.35, scale: 0.85 });
        c.ft(cases, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.025 }, t0 + 0.1);
        c.ft(q(el, '.barre'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t0 + 0.4);
        // L'intro : la barre pulse une fois (« voyons jusqu'où tu arrives »).
        if (p.pulse && p.pulse.t != null) { c.ft(paliers[0], { scale: 1 }, { scale: 1.18, duration: 0.35, ease: 'power2.out' }, t0 + p.pulse.t); c.ft(paliers[0], { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'power2.inOut' }, t0 + p.pulse.t + 0.35); }
        // Le minuteur : l'anneau se vide, un chiffre par seconde ; il passe en couleur vive pendant les trois dernières secondes.
        const debuts = [p.mots[0].indice.t, p.mots[0].reponse.t, p.mots[1].reponse.t], fins = [p.mots[0].reponse.t, p.mots[1].reponse.t, p.mots[2].reponse.t];
        const mn = q(el, '.minuteur'), doux = q(el, '.m-doux'), vif = q(el, '.m-vif'), tour = 213.6;
        gsap.set(mn, { opacity: 0 }); gsap.set([doux, vif], { attr: { 'stroke-dasharray': tour, 'stroke-dashoffset': 0 } }); gsap.set(vif, { opacity: 0 }); gsap.set(qa(el, '.m-nb span'), { opacity: 0 });
        c.ft(mn, { opacity: 0 }, { opacity: 0.8, duration: 0.5 }, t0 + debuts[0]);
        c.ft(mn, { opacity: 0.8 }, { opacity: 0, duration: 0.6 }, t0 + fins[2] + 0.5);
        debuts.forEach((d, w) => {
          const n = Math.max(1, Math.round(fins[w] - d)), ts = t0 + d, dur = fins[w] - d;
          c.ft([doux, vif], { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tour }, duration: dur, ease: 'none' }, ts);
          c.ft(vif, { opacity: 0 }, { opacity: 1, duration: 0.3 }, ts + dur - 3.2);
          c.ft(vif, { opacity: 1 }, { opacity: 0, duration: 0.2 }, ts + dur + 0.02);
          qa(el, `.m-nb span[data-w="${w}"]`).forEach((sp, j) => {
            const tj = ts + j * (dur / n);
            c.ft(sp, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, tj);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, tj + dur / n - 0.1);
            if (j >= n - 3) c.ft(mn, { scale: 1.14 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, tj);
          });
        });
        const niveaux = [0.5, 0.75, 1], deja = new Set();
        p.mots.forEach((m, k) => {
          const ti = t0 + m.indice.t, tr = t0 + m.reponse.t;
          c.ft(cartes[k], { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, ti);
          c.ft(cartes[k], { opacity: 1 }, { opacity: 0.5, duration: 0.4 }, tr + 1.4);
          // Pendant la recherche, les cases du mot s'illuminent doucement, la case de départ en tête, puis respirent jusqu'à la réponse.
          const siennes0 = cases.filter((x) => x.dataset.m.split(' ').includes(String(k)) && !deja.has(x));
          if (p.lueur !== false) {
            const te = tr - 0.05;
            c.ft(cartes[k], { outlineWidth: 0 }, { outlineWidth: 3, duration: 0.4 }, ti);
            c.ft(cartes[k], { outlineWidth: 3 }, { outlineWidth: 0, duration: 0.3 }, te);
            siennes0.forEach((cell, i) => {
              const lueurs = [q(cell, 's'), cell.previousElementSibling], base = i === 0 ? 0.85 : 0.5, bas = base * 0.45, ta = ti + 0.3 + i * 0.12;
              c.ft(lueurs, { opacity: 0 }, { opacity: base, duration: 0.6, ease: 'power2.out' }, ta);
              if (i === 0 && q(cell, 'b')) { c.ft(q(cell, 'b'), { scale: 1 }, { scale: 1.7, duration: 0.3, ease: 'power2.out' }, ta); c.ft(q(cell, 'b'), { scale: 1.7 }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, ta + 0.3); }
              let v = base, tc = ta + 0.7, bas1 = true;
              while (tc + 0.8 <= te - 0.1) { const v2 = bas1 ? bas : base; c.ft(lueurs, { opacity: v }, { opacity: v2, duration: 0.8, ease: 'sine.inOut' }, tc); v = v2; bas1 = !bas1; tc += 0.8; }
              c.ft(lueurs, { opacity: v }, { opacity: 0, duration: 0.3 }, Math.max(tc, te - 0.05));
            });
          }
          // La révélation : pour chaque lettre, une étincelle part de l'orbe, la case s'illumine d'une onde, la lettre monte en devenant nette.
          const siennes = cases.filter((x) => x.dataset.m.split(' ').includes(String(k)));
          let tfin = tr;
          siennes.forEach((cell, i) => {
            const tl = tr + i * 0.22, neuf = !deja.has(cell); deja.add(cell);
            if (!neuf) return;
            const sp = sparks[cases.indexOf(cell)], dx = +cell.dataset.cx - ox, dy = +cell.dataset.cy - oy;
            c.ft(sp, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.08 }, tl);
            c.ft(sp, { x: 0 }, { x: dx, duration: 0.5, ease: 'power1.in' }, tl);
            c.ft(sp, { y: 0 }, { y: dy, duration: 0.5, ease: 'power3.out' }, tl);
            c.ft(sp, { scale: 1 }, { scale: 0.3, duration: 0.2, ease: 'power2.in' }, tl + 0.35);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, tl + 0.5);
            const ta = tl + 0.5;
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.9, duration: 0.14 }, ta);
            c.ft(q(cell, 'i'), { opacity: 0.9 }, { opacity: 0.2, duration: 0.7, ease: 'power2.out' }, ta + 0.14);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, ta);
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.55, filter: 'blur(7px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2.2)' }, ta);
            tfin = Math.max(tfin, ta + 0.5);
          });
          // Une vague de lumière balaie le mot complet.
          siennes.forEach((cell, i) => {
            c.ft(q(cell, 'em'), { scale: 1 }, { scale: 1.16, duration: 0.18, ease: 'power2.out' }, tfin + 0.15 + i * 0.07);
            c.ft(q(cell, 'em'), { scale: 1.16 }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, tfin + 0.33 + i * 0.07);
          });
          const tb = tfin + 0.2;
          c.ft(rail, { scaleX: k ? niveaux[k - 1] : 0 }, { scaleX: niveaux[k], duration: 0.8, ease: 'power2.inOut' }, tb);
          const monte = k === 0 ? 1 : k === 2 ? 2 : -1;
          if (monte > 0) {
            c.ft(paliers[monte], { opacity: 0.35, scale: 0.85 }, { opacity: 1, scale: 1.1, duration: 0.5, ease: 'back.out(2)' }, tb + 0.4);
            c.ft(paliers[monte - 1], { opacity: 1, scale: 1 }, { opacity: 0.5, scale: 0.9, duration: 0.4 }, tb + 0.4);
          }
        });
      },
    },
    // La fin, après la voix : la question au spectateur et la flèche vers les commentaires.
    fin: {
      description: 'La fin, après la voix ("apres": durée en secondes) : la question au spectateur, la flèche vers les commentaires.',
      max: 48,
      ancres: () => [],
      textes: (p) => [p.texte, p.sous],
      dessin: (p, u) => `<p class="grand geant">${u.md(p.texte)}</p>${p.sous ? `<p class="moyen bas">${u.md(p.sous)}</p>` : ''}
        <svg class="fleche" width="1080" height="1920"><path d="M620 1150 C800 1170 900 1230 930 1330 M896 1296 L932 1338 L962 1292" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      jouer(c, el, p, t0) {
        c.lignes(q(el, '.grand'), t0 + 0.05);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.35);
        const f = q(el, '.fleche path');
        gsap.set(f, { drawSVG: '0%' });
        c.ft(f, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.out' }, t0 + 0.8);
      },
    },
  };
});
