// Fabrique les compositions HyperFrames des vidéos TikTok (1080 × 1920).
//   node scripts/build-video.js              -> toutes les vidéos, avec leurs variantes d'accroche
//   node scripts/build-video.js cameleon     -> une seule vidéo (et ses variantes)
//   node scripts/build-video.js --sans-musique  -> sans la musique phonk (pour ajouter un son tendance dans TikTok)
//
// Pour chaque scénario videos/scenarios/<id>.json, et chaque variante d'accroche :
//   videos/hyperframes/<id>[-b|-c]/index.html   la composition (une seule timeline GSAP en pause)
//   videos/hyperframes/<id>[-b|-c]/assets/      GSAP et les bruitages : le rendu ne télécharge rien
//   videos/hyperframes/<id>/publication.md      le kit de publication (texte, hashtags, couverture)
// Rendu : npx hyperframes render, dans le dossier de la vidéo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scenarios = require('../shared/scenarios.js');
const { SONS_PAR_ACTION, SON_CARTE, SON_CAMERA, SON_AMBIANCE, SON_AMBIANCE_SOUS_MUSIQUE, SON_TERMINAL, MUSIQUES } = require('../videos/sons/table.js');
const theme = require('../public/js/art/nuit.js');
const gardien = require('../public/js/art/gardien.js');
const { ecrireMusique } = require('./build-sons.js');
const SANS_MUSIQUE = process.argv.includes('--sans-musique');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
const GSAP_FICHIERS = ['gsap.min.js', 'MotionPathPlugin.min.js'];
const LARGEUR = 1080;
const HAUTEUR = 1920;

// Le dessin, les cartes et le minutage des légendes sont du texte pur : on les calcule ici.
const bac = { window: {} };
vm.createContext(bac);
vm.runInContext(lire('public/js/art/terrarium.js'), bac);
bac.window.Terrarium.scenarios = scenarios;
vm.runInContext(lire('public/js/film/film.js'), bac);
const { art, film } = bac.window.Terrarium;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const arrondi = (n) => +n.toFixed(3);
// Durée d'un WAV mono 16 bits à 44,1 kHz (en-tête de 44 octets).
const dureeSon = (fichier) => (fs.statSync(path.join(racine, 'videos/sons', fichier)).size - 44) / (2 * 44100);

// --- Bruitages : placés d'après les actions du scénario --------------------------
function bruitages(sc) {
  const sons = [];
  const ajouter = (fichier, t, volume) => {
    if (t >= 0 && t < sc.duree) sons.push({ fichier, t: arrondi(t), volume });
  };
  // Musique : celle du scénario (phonk par défaut), sauf « musique": null » ou --sans-musique.
  const musique = SANS_MUSIQUE ? null : MUSIQUES[sc.musique === undefined ? 'phonk' : sc.musique];
  // Avec un arrangement, la piste est fabriquée pour cette vidéo (assets/sons/musique.wav).
  if (musique) sons.push({ fichier: sc.arrangement ? 'musique.wav' : musique.fichier, arrangee: Boolean(sc.arrangement), t: 0, volume: musique.volume, duree: sc.duree, fondu: musique.fonduSortie, musique: true });
  sons.push({ fichier: SON_AMBIANCE.fichier, t: 0, volume: musique ? SON_AMBIANCE_SOUS_MUSIQUE : SON_AMBIANCE.volume, duree: sc.duree });
  let vue = null;
  sc.plans.forEach((plan) => {
    if (plan.camera) {
      const cle = JSON.stringify([plan.camera.cible, plan.camera.zoom]);
      if (vue !== null && cle !== vue && (plan.camera.duree ?? 0.9) >= 0.5) ajouter(SON_CAMERA.fichier, plan.debut, SON_CAMERA.volume);
      vue = cle;
    }
    (plan.actions || []).forEach((a) => {
      const t0 = plan.debut + (a.a || 0);
      (SONS_PAR_ACTION[a.type] || []).forEach((s) => {
        const repetitions = s.parFois ? (a.fois || 3) : 1;
        for (let k = 0; k < repetitions; k += 1) ajouter(s.fichier, t0 + (s.decalage || 0) + k * (s.pas || 0), s.volume);
      });
    });
    if (plan.carte) ajouter(SON_CARTE.fichier, plan.debut, SON_CARTE.volume);
    // Nuit : le terminal de Mousse tape chaque morceau de légende.
    if (sc.theme === 'nuit') film.morceaux(plan).forEach((m) => ajouter(SON_TERMINAL.fichier, m.debut, SON_TERMINAL.volume));
  });
  sons.sort((a, b) => a.t - b.t);
  // Chaque son dure sa vraie longueur, et ceux qui se chevauchent vont sur des pistes différentes.
  const finsDePiste = [];
  for (const son of sons) {
    son.duree = arrondi(Math.min(son.duree || dureeSon(son.fichier), sc.duree - son.t));
    let piste = finsDePiste.findIndex((fin) => fin <= son.t);
    if (piste === -1) { piste = finsDePiste.length; finsDePiste.push(0); }
    finsDePiste[piste] = son.t + son.duree;
    son.piste = 5 + piste;
  }
  return sons;
}

// Le texte du terminal, lettre par lettre : le moteur fait apparaître chaque .c à son tour.
// Les mots entre *étoiles* sont mis en valeur (.acc).
function lettres(texte) {
  let acc = false;
  let html = '';
  for (const ch of texte) {
    if (ch === '*') { acc = !acc; continue; }
    html += `<span class="c${acc ? ' acc' : ''}">${ch === ' ' ? ' ' : esc(ch)}</span>`;
  }
  // La dernière case est le curseur qui clignote en fin de ligne.
  return `${html}<span class="c fin">&nbsp;</span>`;
}

function composition(sc) {
  const nocturne = sc.theme === 'nuit';
  const pistes = [];
  sc.plans.forEach((p, i) => {
    // Chaque morceau de légende reste affiché jusqu'au suivant : jamais de blanc.
    film.morceaux(p).forEach((m, k) => {
      if (nocturne) {
        pistes.push(`    <div id="leg-${i}-${k}" class="clip term-ligne" data-start="${arrondi(m.debut)}" data-duration="${arrondi(m.fin - m.debut)}" data-track-index="2">
      <p class="term-texte"><span class="invite">&gt;</span> ${lettres(m.texte)}</p>
    </div>`);
        return;
      }
      pistes.push(`    <div id="leg-${i}-${k}" class="clip legende" data-start="${arrondi(m.debut)}" data-duration="${arrondi(m.fin - m.debut)}" data-track-index="2">
      <p class="leg-texte">${film.marquer(m.texte)}</p>
    </div>`);
    });
    if (p.carte) {
      pistes.push(`    <div id="carte-${i}" class="clip carte" data-start="${p.debut}" data-duration="${arrondi(p.fin - p.debut)}" data-track-index="3" data-layout-allow-overlap>
      ${film.carteHTML(p.carte)}
    </div>`);
    }
  });
  const sons = bruitages(sc).map((s, i) => `    <audio id="son-${i}" class="clip" src="assets/sons/${s.fichier}" data-start="${s.t}" data-duration="${s.duree}" data-track-index="${s.piste}" data-volume="${s.volume}"${s.fondu ? ` data-fade-out="${s.fondu}"` : ''}></audio>`);
  const serie = !sc.serie ? '' : nocturne
    ? `<div class="serie nuit">Nuit n° <b>${sc.serie.episode}</b></div>`
    : `<div class="serie">${esc(sc.serie.nom)} · <b>${sc.serie.episode}/${sc.serie.total}</b></div>`;
  const dessin = nocturne ? theme.nuit(art.svg()) : art.svg();
  const peau = nocturne ? theme.PEAU : art.PEAU;
  // Le terminal de Mousse : le cadre reste à l'écran, les lignes sont des clips.
  const terminal = nocturne ? `    <div class="terminal"><p class="term-prompt">mousse@terrarium:~$</p><div class="term-lignes"></div></div>
    <svg class="term-fil" width="1080" height="1920" aria-hidden="true"><path d="M640 1150 L700 1290" stroke="rgba(182,255,92,.6)" stroke-width="3" stroke-dasharray="6 8"/></svg>` : '';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${LARGEUR}, height=${HAUTEUR}">
<title>${esc(sc.titre)} · ${esc(sc.concept)}</title>
<script src="assets/gsap.min.js"></script>
<script src="assets/MotionPathPlugin.min.js"></script>
<style>
${lire('videos/video.css')}
</style>
</head>
<body>
  <div id="root"${nocturne ? ' class="nuit" data-fps="60"' : ''} data-composition-id="${sc.id}" data-start="0" data-duration="${sc.duree}" data-width="${LARGEUR}" data-height="${HAUTEUR}">
    <div class="scene" data-layout-allow-overflow>
${dessin}
    </div>
${nocturne ? gardien.calque() : '    <div class="voile"></div>'}
    ${serie}
${terminal}
${pistes.join('\n')}
${sons.join('\n')}
  </div>

  <script>
    // Le dessin est déjà dans la page : le moteur n'a besoin que des couleurs et du hasard reproductible.
    window.Terrarium = window.Terrarium || {};
    window.Terrarium.art = { PEAU: ${JSON.stringify(peau)}, gardien: ${JSON.stringify({ PIEDS: gardien.PIEDS, EPAULE: gardien.EPAULE, MAIN: gardien.MAIN })}, graine: ${art.graine.toString()} };
  </script>
  <script>
${lire('shared/scenarios.js')}
  </script>
  <script>
${lire('public/js/film/film.js')}

    // Construction et enregistrement de la timeline, dans le même bloc que le moteur.
    (function () {
      gsap.registerPlugin(MotionPathPlugin);
      var scenario = ${JSON.stringify(sc)};
      var tl = Terrarium.film.construire({
        svg: document.getElementById('vivarium'),
        racine: document.getElementById('root'),
        scenario: scenario,
        ambiance: true,
        cadre: '9:16'
      });
      window.__timelines = window.__timelines || {};
      window.__timelines[scenario.id] = tl;
    })();
  </script>
</body>
</html>
`;
}

// --- Kit de publication ------------------------------------------------------------
function publication(sc, variantes) {
  const pub = sc.publication || {};
  const fr = (n) => Number(n).toLocaleString('fr-FR');
  const accroche = (legende) => [].concat(legende).map((m) => m.replace(/\*/g, '')).join(' ');
  const lignes = [
    `# ${sc.titre} · ${sc.concept}`,
    '',
    sc.serie ? `Épisode ${sc.serie.episode} sur ${sc.serie.total} de la série « ${sc.serie.nom} ». Durée : ${fr(sc.duree)} s.` : `Durée : ${fr(sc.duree)} s.`,
    '',
    '## Texte du post',
    '',
    pub.texte || '',
    '',
    (pub.hashtags || []).join(' '),
    '',
    '## Couverture',
    '',
    `Image à ${fr(pub.couverture ?? 1)} s, avec le titre « ${pub.titreCouverture || sc.titre} ».`,
    '',
    '## Commentaire à épingler',
    '',
    pub.commentaire || '',
    '',
    '## Variantes d\'accroche à comparer',
    '',
    '| Variante | Dossier | Accroche |',
    '|---|---|---|',
    ...variantes.map((v) => `| ${v.nom} | \`hyperframes/${v.sc.id}/\` | ${accroche(v.sc.plans[0].legende)} |`),
    '',
    'Publie une variante à la fois, à quelques jours d\'écart, et note les résultats dans `videos/resultats.csv`.',
    '',
    '## Son',
    '',
    `La vidéo contient une boucle phonk originale, « ${sc.musique || 'phonk'} » (libre de droits, utilisable aussi sur Reels et Shorts), les bruitages et l'ambiance.`,
    '',
    'Pour surfer sur un son phonk tendance de TikTok à la place : régénère sans musique (`node scripts/build-video.js --sans-musique`), refais le rendu, puis ajoute le son dans l\'appli. Un son tendance peut aider la diffusion.',
    '',
  ];
  return lignes.join('\n');
}

// --- Génération ---------------------------------------------------------------------
const demandes = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const fichiers = fs.readdirSync(path.join(racine, 'videos/scenarios')).filter((f) => f.endsWith('.json'));
const sonsUtiles = new Set();
let echec = false;
for (const f of fichiers) {
  const base = JSON.parse(lire(`videos/scenarios/${f}`));
  if (demandes.length && !demandes.includes(base.id)) continue;
  const erreurs = scenarios.valider(base);
  if (erreurs.length) {
    echec = true;
    console.error(`${f} :\n  - ${erreurs.join('\n  - ')}`);
    continue;
  }
  const variantes = ['a', ...Object.keys(base.accroches || {})].map((nom) => ({ nom, sc: scenarios.variante(base, nom) }));
  for (const { sc } of variantes) {
    const dossier = path.join(racine, 'videos/hyperframes', sc.id);
    fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
    fs.writeFileSync(path.join(dossier, 'index.html'), composition(sc));
    for (const g of GSAP_FICHIERS) fs.copyFileSync(path.join(racine, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
    for (const s of bruitages(sc)) {
      if (s.arrangee) {
        const a = sc.arrangement;
        ecrireMusique(sc.musique, { duree: sc.duree + 0.5, parties: a.parties, coupures: a.coupures }, path.join(dossier, 'assets/sons/musique.wav'));
        continue;
      }
      sonsUtiles.add(s.fichier);
      fs.copyFileSync(path.join(racine, 'videos/sons', s.fichier), path.join(dossier, 'assets/sons', s.fichier));
    }
    console.log(`Composition écrite : videos/hyperframes/${sc.id}/ (${sc.duree} s, ${bruitages(sc).length} sons)`);
  }
  fs.writeFileSync(path.join(racine, 'videos/hyperframes', base.id, 'publication.md'), publication(base, variantes));
}
process.exit(echec ? 1 : 0);
