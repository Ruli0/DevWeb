// Fabrique une composition HyperFrames par scénario : videos/hyperframes/<id>/index.html
//   node scripts/build-video.js            -> toutes les vidéos
//   node scripts/build-video.js cameleon   -> une seule
//
// La composition est un fichier HTML autonome en 1080 × 1920 :
// - le vivarium y est écrit en SVG (calculé ici, en Node, toujours identique) ;
// - légendes et cartes sont des clips (class="clip", data-start, data-duration) ;
// - une seule timeline GSAP en pause, enregistrée dans window.__timelines[id].
// Rendu : npx hyperframes render (dans le dossier de la vidéo).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { valider } = require('../shared/scenarios.js');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
// GSAP est copié dans chaque vidéo (assets/) : le rendu ne télécharge rien.
const GSAP_FICHIERS = ['gsap.min.js', 'MotionPathPlugin.min.js'];
const LARGEUR = 1080;
const HAUTEUR = 1920;

// Le dessin et les cartes sont du texte pur : on les calcule ici.
const bac = { window: {} };
vm.createContext(bac);
vm.runInContext(lire('public/js/art/terrarium.js'), bac);
vm.runInContext(lire('public/js/film/film.js'), bac);
const { art, film } = bac.window.Terrarium;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function composition(sc) {
  const pistes = [];
  sc.plans.forEach((p, i) => {
    const temps = `data-start="${p.debut}" data-duration="${+(p.fin - p.debut).toFixed(2)}"`;
    if (p.legende) {
      pistes.push(`    <div id="leg-${i}" class="clip legende" ${temps} data-track-index="2"${p.voix ? ` data-voix="${esc(p.voix)}"` : ''}>
      <p class="leg-texte">${esc(p.legende)}</p>
    </div>`);
    }
    if (p.carte) {
      pistes.push(`    <div id="carte-${i}" class="clip carte" ${temps} data-track-index="3" data-layout-allow-overlap>
      ${film.carteHTML(p.carte)}
    </div>`);
    }
  });

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
  <div id="root" data-composition-id="${sc.id}" data-start="0" data-duration="${sc.duree}" data-width="${LARGEUR}" data-height="${HAUTEUR}">
    <div class="fond"></div>
    <header class="titre">
      <p class="titre-concept">${esc(sc.concept)}</p>
      <h1 class="titre-acteur">${esc(sc.titre)}</h1>
    </header>
    <div class="scene" data-layout-allow-overflow>
${art.svg()}
    </div>
${pistes.join('\n')}
  </div>

  <script>
    // Le dessin est déjà dans la page : le moteur n'a besoin que des couleurs et du hasard reproductible.
    window.Terrarium = { art: { PEAU: ${JSON.stringify(art.PEAU)}, graine: ${art.graine.toString()} } };
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
        ambiance: true
      });
      window.__timelines = window.__timelines || {};
      window.__timelines[scenario.id] = tl;
    })();
  </script>
</body>
</html>
`;
}

const demandes = process.argv.slice(2);
const fichiers = fs.readdirSync(path.join(racine, 'videos/scenarios')).filter((f) => f.endsWith('.json'));
let echec = false;
for (const f of fichiers) {
  const sc = JSON.parse(lire(`videos/scenarios/${f}`));
  if (demandes.length && !demandes.includes(sc.id)) continue;
  const erreurs = valider(sc);
  if (erreurs.length) {
    echec = true;
    console.error(`${f} :\n  - ${erreurs.join('\n  - ')}`);
    continue;
  }
  const sortie = path.join(racine, 'videos/hyperframes', sc.id, 'index.html');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, composition(sc));
  fs.mkdirSync(path.join(path.dirname(sortie), 'assets'), { recursive: true });
  for (const f of GSAP_FICHIERS) {
    fs.copyFileSync(path.join(racine, 'node_modules/gsap/dist', f), path.join(path.dirname(sortie), 'assets', f));
  }
  console.log(`Composition écrite : ${path.relative(racine, sortie)} (${sc.duree} s)`);
}
process.exit(echec ? 1 : 0);
