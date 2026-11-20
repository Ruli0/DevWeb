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
  const DEC = typeof require === 'function' ? require('./jeu-decors.js') : (typeof self !== 'undefined' ? self : this).Avis.jeuDecors;
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
      description: 'Jeu de mots fléchés : "mots": [{ "texte", "sens": "h"|"v", "ligne", "colonne", "indice": { "texte", "a", "fin" }, "reponse": { "a" } }] (de trois à six mots qui se croisent, du plus facile au plus dur) ; "palier": le mot après lequel s’allume le palier du milieu (défaut : 1 pour trois mots, 2 au-delà) ; "figures": trois figures parmi singe, classique, moliere, academicien, hugo ; "cadence": 15 (une réponse toutes les 15 s : "indice.fin" = la phrase après laquelle commence le silence de réflexion) ; "titre" : l’accroche en haut ; "decor": "livres" ou "plage" (fond et scène du bas) ; "lueur": false coupe la lueur des cases du mot cherché ; "pulse": { "a" } : l’instant où la barre pulse (intro) ; "stades" : trois noms de palier.',
      max: 60,
      ancres: (p) => (p.muet ? [] : [[p.pulse, 'a'], ...(p.mots || []).flatMap((m) => [[m.indice, 'a'], [m.reponse, 'a']])]),
      textes: (p) => [p.titre, ...(p.mots || []).map((m) => m.indice && m.indice.texte)],
      valider(p) {
        const e = GR.construire(p.mots).erreurs.slice();
        if ((p.mots || []).length < 3 || (p.mots || []).length > 6) e.push('le jeu prévoit de trois à six mots qui se croisent');
        (p.mots || []).forEach((m, k) => {
          if (!m.indice || !m.indice.texte || (!m.indice.a && !p.muet)) e.push(`mot ${k + 1} : "indice": { "texte", "a" }`);
          if (!m.reponse || (!m.reponse.a && !p.muet)) e.push(`mot ${k + 1} : "reponse": { "a" } (le mot dit par l’orbe)`);
          if (p.cadence && !p.muet && !(m.indice && m.indice.fin)) e.push(`mot ${k + 1} : avec "cadence", "indice": { "fin" } est nécessaire (la phrase après laquelle commence la réflexion)`);
        });
        if (p.cadence !== undefined && !(p.cadence >= 5 && p.cadence <= 30)) e.push('"cadence" : entre 5 et 30 secondes');
        return e;
      },
      dessin: (p, u) => {
        const prog = p.affichage === 'progressif', g = GR.construire(p.mots), D = GR.dims(g, prog), st = p.stades || ['Singe', 'Homme classique', 'Molière'], fig = p.figures || ['singe', 'classique', 'moliere'], xs = [60, 480, 900];
        const neuves = GR.nouvelles(g, p.mots.length);
        // Les cases : du papier découpé aux bords irréguliers (forme stable), une ombre nette, une couleur par mot ; le halo est dessous.
        const cases = g.cases.map((x, n) => {
          const premier = Math.min(...x.mots), col = GR.COULEURS[premier % GR.COULEURS.length];
          const fl = x.mots.filter((k) => neuves[k] && neuves[k][0] === x).map((k) => (p.mots[k].sens === 'h' ? '→' : '↓')).join('');
          const gauche = x.c * D.pas, haut = x.l * D.pas, forme = GR.papier(n + 1, D.caseTaille, D.caseTaille);
          return `<div class="halo" style="left:${gauche}px;top:${haut}px;--wc:${col}"></div><div class="case" data-m="${x.mots.join(' ')}" data-cx="${D.gx + gauche + D.caseTaille / 2}" data-cy="${D.gy + haut + D.caseTaille / 2}" style="left:${gauche}px;top:${haut}px;--wc:${col}"><div class="pap" style="clip-path:${forme}"><i style="background:${col}"></i><u></u><s></s>${fl ? `<b>${fl}</b>` : ''}<em>${u.esc(x.lettre)}</em></div></div>`;
        }).join('');
        const paliers = st.map((nom, i) => `<div class="palier" style="left:${xs[i]}px">${GR.figure(fig[i])}${prog ? '' : `<p>${u.esc(nom)}</p>`}</div>`).join('');
        // Le minuteur : une tranche par mot (de la définition à la réponse, puis de réponse en réponse) ; un chiffre par seconde restante.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const chiffres = debuts.map((d, w) => { const n = Math.max(1, Math.round(fins[w] - d)); return Array.from({ length: n }, (_, j) => `<span data-w="${w}" data-j="${j}">${prog ? '' : n - j}</span>`).join(''); }).join('');
        const minuteur = `<div class="minuteur${prog ? ' prog' : ''}"><svg width="84" height="84" viewBox="0 0 84 84"><circle class="m-fond" cx="42" cy="42" r="34"/><circle class="m-doux" cx="42" cy="42" r="34"/><circle class="m-vif" cx="42" cy="42" r="34"/></svg><div class="m-nb">${chiffres}</div></div>`;
        let ox = 150, oy = 390;
        try { const e = require('./orbe.js').emplacement({ orbe: p.orbe, grille: true, fond: 'nuit' }); ox = e.x; oy = e.y; } catch (err) { /* page : pas de require */ }
        const etincelles = g.cases.map(() => '<i class="etincelle"></i>').join('');
        const mu = p.muet || p.muetCfg, N = p.mots.length;
        const indices = (mu && mu.texteIntro ? `<p class="i-intro">${u.esc(mu.texteIntro)}</p>` : '') + p.mots.map((m, k) => `<p class="i-ind"${prog ? ` style="font-size:${m.indice.texte.length <= 30 ? 84 : m.indice.texte.length <= 48 ? 72 : 60}px"` : ''}>${mu && !prog ? `<small>Mot ${k + 1}/${N}</small>` : ''}${u.esc(m.indice.texte)}</p>`).join('') + (mu && mu.texteFin ? `<p class="i-fin">${u.esc(mu.texteFin)}</p>` : '');
        const dec = DEC.decor(p.decor), fond = `<svg class="fond-papier" viewBox="0 0 1080 1920" style="--titre:${dec.titre}">${dec.fond}${dec.bas}</svg>`;
        return `${fond}${p.titre && !prog ? `<p class="jeu-titre${mu && mu.titreFixe ? ' fixe' : ''}" style="--titre:${dec.titre}">${u.md(p.titre)}</p>` : ''}<div class="bandeau${prog ? ' prog' : ''}" style="clip-path:none">${prog ? '' : `<div class="pap" style="clip-path:${GR.papier(77, 770, 172)}"></div>`}<div class="indices">${indices}</div></div>${prog ? '' : '<i class="scotch s1"></i><i class="scotch s2"></i>'}<div class="grille" data-ox="${ox}" data-oy="${oy}" style="left:${D.gx}px;top:${D.gy}px;--case:${D.caseTaille}px">${cases}</div>${prog ? '' : '<div class="tampon">TROUVÉ</div>'}${minuteur}<div class="barre${prog ? ' prog' : ''}"><div class="strip"><div class="pap" style="clip-path:${GR.papier(88, 1004, 156)}"></div></div><div class="rail"><i></i></div>${paliers}</div>${etincelles}${prog ? (p.animation === 'fusee' ? DEC.fusee() : DEC.danse()) : ''}`;
      },
      jouer(c, el, p, t0, d) {
        const cases = qa(el, '.case'), indices = qa(el, '.indices p.i-ind'), intro = q(el, '.indices p.i-intro'), pFin = q(el, '.indices p.i-fin'), paliers = qa(el, '.palier'), rail = q(el, '.rail i'), grille = q(el, '.grille');
        const ox = +grille.dataset.ox, oy = +grille.dataset.oy, sparks = qa(el, '.etincelle'), bandeau = q(el, '.bandeau'), tampon = q(el, '.tampon'), scotchs = qa(el, '.scotch');
        const premier = p.mots[0].indice.t, muet = !!p.muetCfg, prog = p.affichage === 'progressif', fixe = !!(p.muetCfg && p.muetCfg.titreFixe), N = p.mots.length, mid = p.palier || (N === 3 ? 1 : 2);
        gsap.set(qa(el, '.case em'), { opacity: 0 }); gsap.set(qa(el, '.case u'), { opacity: 0 }); gsap.set(qa(el, '.case s'), { opacity: 0 }); gsap.set(qa(el, '.halo'), { opacity: 0 });
        gsap.set(indices, { opacity: 0 }); if (intro) gsap.set(intro, { opacity: 0 }); if (pFin) gsap.set(pFin, { opacity: 0 }); gsap.set([bandeau, ...scotchs], { opacity: 0 }); gsap.set(rail, { scaleX: 0 }); gsap.set(sparks, { opacity: 0, left: ox - 9, top: oy - 9 });
        gsap.set(paliers[0], { opacity: 1, scale: 1 }); gsap.set(paliers.slice(1), { opacity: 0.35, scale: 0.85 });
        // Le décor : vagues qui se balancent, crabe, dauphin, souris, livres qui sautent, nuages (jeu-decors.js, tout est fini et déterministe).
        DEC.animer(c, el, p.decor, t0, d);
        if (q(el, '.plume')) gsap.set(q(el, '.plume'), { svgOrigin: '976 1690' });
        const titre = q(el, '.jeu-titre');
        if (titre) { c.lignes(titre, t0 + 0.05); if (!fixe) c.ft(titre, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0 + (muet ? Math.min(premier - 0.9, 2.6) : premier - 0.35)); }
        if (prog) gsap.set(cases, { opacity: 0 }); else c.ft(cases, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.025 }, t0 + 0.1);
        c.ft(q(el, '.barre'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t0 + 0.4);
        const tBandeau = t0 + (fixe ? 0 : muet && intro ? Math.min(premier - 0.9, 2.6) + 0.3 : premier - 0.2);
        c.ft([bandeau, ...scotchs], { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, tBandeau);
        if (intro) { c.ft(intro, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tBandeau + 0.2); c.ft(intro, { opacity: 1 }, { opacity: 0, duration: 0.25 }, t0 + premier - 0.15); }
        // L'intro : la barre pulse une fois (« voyons jusqu'où tu arrives »).
        if (p.pulse && p.pulse.t != null) { c.ft(paliers[0], { scale: 1 }, { scale: 1.18, duration: 0.35, ease: 'power2.out' }, t0 + p.pulse.t); c.ft(paliers[0], { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'power2.inOut' }, t0 + p.pulse.t + 0.35); }
        // Le minuteur : l'anneau se vide, un chiffre par seconde ; il passe en couleur vive pendant les trois dernières secondes.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const mn = q(el, '.minuteur'), doux = q(el, '.m-doux'), vif = q(el, '.m-vif'), tour = 213.6;
        gsap.set(mn, { opacity: 0 }); gsap.set([doux, vif], { attr: { 'stroke-dasharray': tour, 'stroke-dashoffset': 0 } }); gsap.set(vif, { opacity: 0 }); gsap.set(qa(el, '.m-nb span'), { opacity: 0 });
        c.ft(mn, { opacity: 0 }, { opacity: 0.85, duration: 0.5 }, t0 + debuts[0]);
        c.ft(mn, { opacity: 0.85 }, { opacity: 0, duration: 0.6 }, t0 + fins[N - 1] + 0.3);
        if (pFin) c.ft(pFin, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t0 + fins[N - 1] + 1.5);
        c.ft([bandeau, ...scotchs], { opacity: 0.85 }, { opacity: 0, duration: 0.5 }, t0 + (pFin ? Math.max(d - 0.4, fins[N - 1] + 2.4) : fins[N - 1] + 1.6));
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
        // Progressif : la caméra (échelle + translation de la grille) cadre les mots déjà posés, puis dézoome à chaque mot qui arrive.
        const vues = [];
        if (prog) {
          const gx = parseFloat(grille.style.left), gy = parseFloat(grille.style.top), sz = parseFloat(grille.style.getPropertyValue('--case'));
          const R = cases.map((x) => ({ l: parseFloat(x.style.left), t: parseFloat(x.style.top), k: Math.min(...x.dataset.m.split(' ').map(Number)) }));
          for (let k = 0; k < N; k += 1) {
            const S = R.filter((r) => r.k <= k), l = Math.min(...S.map((r) => r.l)), t = Math.min(...S.map((r) => r.t)), r2 = Math.max(...S.map((r) => r.l + sz)), b = Math.max(...S.map((r) => r.t + sz));
            const s = Math.max(1, Math.min(960 / (r2 - l), 740 / (b - t), 175 / sz));
            vues.push({ scale: s, x: 540 - gx - s * (l + r2) / 2, y: 1010 - gy - s * (t + b) / 2 });
          }
          gsap.set(grille, Object.assign({ transformOrigin: '0 0' }, vues[0]));
          (p.animation === 'fusee' ? DEC.fuser : DEC.danser)(c, el, p, t0, d);
        }
        const niveau = (j) => (j < mid ? 0.5 * j / mid : 0.5 + 0.5 * (j - mid) / (N - mid)), deja = new Set();
        p.mots.forEach((m, k) => {
          const ti = t0 + m.indice.t, tr = t0 + m.reponse.t, suivant = k + 1 < N ? t0 + p.mots[k + 1].indice.t : tr + 2;
          // L'indice en cours remplace le précédent dans le bandeau.
          // Muet : le nouvel indice arrive 0,8 s après le zéro du minuteur, l'ancien est parti à 0,4 s (jamais deux textes superposés).
          c.ft(indices[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, muet && k ? ti + 0.8 : (fixe ? t0 + Math.min(m.indice.t, 0.3) : ti));
          c.ft(indices[k], { opacity: 1 }, { opacity: 0, duration: 0.25 }, muet ? tr + 0.4 : Math.max(tr + 1.1, suivant - 0.3));
          // Pendant la recherche, les cases du mot s'illuminent doucement, la case de départ en tête, puis respirent jusqu'à la réponse.
          const siennes = cases.filter((x) => x.dataset.m.split(' ').includes(String(k)));
          const siennes0 = siennes.filter((x) => !deja.has(x)), tp = prog ? ti + (muet && k ? 0.6 : 0) : ti, tpop = prog ? tp + (k ? 0.3 : 0) : ti;
          // Progressif : la suite de cases de ce mot arrive (pop) au début de sa fenêtre ; les croisements déjà posés restent.
          if (prog) {
            c.ft(siennes0, { opacity: 0, y: 40, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.9)', stagger: 0.12 }, tpop);
            if (k) c.ft(grille, vues[k - 1], Object.assign({ duration: 0.9, ease: 'power2.inOut' }, vues[k]), tp - 0.1);
          }
          const H = GR.horaires(tr, siennes0.length, t0 + (m.reponse.f == null ? m.reponse.t : m.reponse.f));
          if (p.lueur !== false) {
            const te = H.depart - 0.05;
            siennes0.forEach((cell, i) => {
              const lueurs = [q(cell, 's'), cell.previousElementSibling], base = i === 0 ? 0.85 : 0.5, bas = base * 0.45, ta = tpop + (prog ? 0.35 : 0.3) + i * 0.12;
              c.ft(lueurs, { opacity: 0 }, { opacity: base, duration: 0.6, ease: 'power2.out' }, ta);
              if (i === 0 && q(cell, 'b')) { c.ft(q(cell, 'b'), { scale: 1 }, { scale: 1.7, duration: 0.3, ease: 'power2.out' }, ta); c.ft(q(cell, 'b'), { scale: 1.7 }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, ta + 0.3); }
              let v = base, tc = ta + 0.7, bas1 = true;
              while (tc + 0.8 <= te - 0.1) { const v2 = bas1 ? bas : base; c.ft(lueurs, { opacity: v }, { opacity: v2, duration: 0.8, ease: 'sine.inOut' }, tc); v = v2; bas1 = !bas1; tc += 0.8; }
              c.ft(lueurs, { opacity: v }, { opacity: 0, duration: 0.3 }, Math.max(tc, te - 0.05));
            });
          }
          // La révélation : une étincelle part de l'orbe vers chaque case neuve, la case s'illumine d'une onde, la lettre monte en devenant nette.
          siennes0.forEach((cell, j) => {
            deja.add(cell);
            const ta = H.pose[j], tl = ta - GR.LETTRE.vol;
            const sp = sparks[cases.indexOf(cell)], dx = +cell.dataset.cx - ox, dy = +cell.dataset.cy - oy;
            if (!prog) {
            c.ft(sp, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.08 }, tl);
            c.ft(sp, { x: 0 }, { x: dx, duration: GR.LETTRE.vol, ease: 'power1.in' }, tl);
            c.ft(sp, { y: 0 }, { y: dy, duration: GR.LETTRE.vol, ease: 'power3.out' }, tl);
            c.ft(sp, { scale: 1 }, { scale: 0.3, duration: 0.2, ease: 'power2.in' }, tl + 0.35);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, ta); }
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.9, duration: 0.14 }, ta);
            c.ft(q(cell, 'i'), { opacity: 0.9 }, { opacity: 0.5, duration: 0.7, ease: 'power2.out' }, ta + 0.14);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, ta);
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.55, filter: 'blur(7px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2.2)' }, ta);
          });
          // Un croisement déjà révélé par un mot précédent : un simple éclat de la couleur du nouveau mot.
          siennes.filter((x) => !siennes0.includes(x)).forEach((cell) => { c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.7, duration: 0.6, ease: 'power2.out' }, tr + 0.2); });
          // Le mot complet : une vague de lumière balaie ses lettres, un tampon « TROUVÉ » s'écrase sur le bandeau.
          siennes.forEach((cell, i) => {
            c.ft(q(cell, 'em'), { scale: 1 }, { scale: 1.16, duration: 0.18, ease: 'power2.out' }, H.fin + 0.15 + i * 0.07);
            c.ft(q(cell, 'em'), { scale: 1.16 }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, H.fin + 0.33 + i * 0.07);
          });
          const plume = q(el, '.plume');
          if (plume) { c.ft(plume, { rotation: 0 }, { rotation: -9, duration: 0.18, ease: 'power2.out' }, H.fin + 0.1); c.ft(plume, { rotation: -9 }, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, H.fin + 0.28); }
          if (!prog) { c.ft(tampon, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, H.fin + 0.1);
          c.ft(tampon, { opacity: 1 }, { opacity: 0, duration: 0.35 }, H.fin + 1.3); }
          const tb = H.fin + 0.2;
          c.ft(rail, { scaleX: niveau(k) }, { scaleX: niveau(k + 1), duration: 0.8, ease: 'power2.inOut' }, tb);
          const monte = k === mid - 1 ? 1 : k === N - 1 ? 2 : -1;
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
