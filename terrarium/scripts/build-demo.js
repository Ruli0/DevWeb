// Fabrique une démo en un seul fichier HTML, jouable sans serveur :
// la simulation et le contenu tournent dans le navigateur, GSAP vient d'un CDN.
//   node scripts/build-demo.js             -> demo/index.html (page complète)
//   node scripts/build-demo.js --fragment  -> demo/terrarium-agentique.html (sans <html>/<body>)
//   node scripts/build-demo.js --scene=cycle -> demo/video-cycle.html (une scène en 9:16, en boucle)
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
const GSAP = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';
const fragment = process.argv.includes('--fragment');
const optionScene = process.argv.find((a) => a.startsWith('--scene='));

if (optionScene) {
  construireVideo(optionScene.split('=')[1]);
  process.exit(0);
}

const html = lire('public/index.html');
const corps = html.split('<!-- app:debut -->')[1].split('<!-- app:fin -->')[0].trim();
const police = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const balises = scripts.map((src) => {
  if (src.startsWith('/vendor/gsap/')) return `<script src="${GSAP}${path.basename(src)}"></script>`;
  const fichier = src.startsWith('/shared/') ? src.slice(1) : path.join('public', src);
  return `<script>\n${lire(fichier)}\n</script>`;
});

const contenu = `<title>Le Terrarium agentique</title>
<meta name="claude:viewport-fit-sides" content="cover">
${police}
<style>
${lire('public/style.css')}
</style>
${corps}
<script>window.TERRARIUM_OFFLINE = true;</script>
${balises.join('\n')}
`;

const sortie = path.join(racine, 'demo', fragment ? 'terrarium-agentique.html' : 'index.html');
fs.mkdirSync(path.dirname(sortie), { recursive: true });
fs.writeFileSync(sortie, fragment ? contenu
  : `<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${contenu}</body>\n</html>\n`);
console.log('Démo écrite :', path.relative(racine, sortie));

// Page vidéo : le vivarium et sa légende, en 9:16, sans aucune interface.
// Elle rejoue une scène en boucle, prête à être filmée ou reprise dans HyperFrames.
function construireVideo(id) {
  const SCENES = {
    bocal: ['La boîte en verre', 'La fenêtre de contexte'],
    cycle: ['Le caméléon', "La boucle d'outils"],
    couches: ['Le ruisseau', 'Le middleware'],
    capteurs: ['La dionée', 'Les hooks'],
    ecosysteme: ['Les fourmis', 'Le système multi-agents'],
  };
  if (!SCENES[id]) {
    console.error(`Scène inconnue : ${id}. Choix : ${Object.keys(SCENES).join(', ')}`);
    process.exit(1);
  }
  const [acteur, concept] = SCENES[id];
  const police = lire('public/index.html').match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
  const page = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080">
<title>${acteur} · ${concept}</title>
${police}
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #0f1b17; }
  .cadre {
    width: 1080px; height: 1920px; overflow: hidden; position: relative;
    display: grid; grid-template-rows: auto auto 1fr; justify-items: center;
    background: radial-gradient(120% 70% at 50% 35%, #1f3a30 0%, #0f1b17 70%);
    color: #eef6ee; font-family: "Instrument Sans", system-ui, sans-serif;
  }
  .titre { padding-top: 64px; text-align: center; }
  .titre p { margin: 0; font-size: 30px; letter-spacing: 0.14em; text-transform: uppercase; color: #9ad25f; font-weight: 600; }
  .titre h1 { margin: 10px 0 0; font: 650 74px/1.05 "Fraunces", Georgia, serif; }
  #stage { width: 990px; margin-top: 36px; filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.45)); }
  #vivarium { display: block; width: 100%; height: auto; border-radius: 28px; }
  .legende { align-self: center; width: 920px; min-height: 260px; display: grid; place-items: center; text-align: center; }
  #legende { margin: 0; font-size: 50px; line-height: 1.3; font-weight: 500; text-wrap: balance; }
</style>
</head>
<body>
<div class="cadre">
  <header class="titre"><p>${concept}</p><h1>${acteur}</h1></header>
  <div id="stage"></div>
  <div class="legende"><p id="legende"></p></div>
</div>
<script src="${GSAP}gsap.min.js"></script>
<script src="${GSAP}MotionPathPlugin.min.js"></script>
<script>
${lire('public/js/ui.js')}
</script>
<script>window.Terrarium.reduce = false;</script>
<script>
${lire('public/js/art/terrarium.js')}
</script>
<script>
${lire('public/js/art/vignettes.js')}
</script>
<script>
(function () {
  gsap.registerPlugin(MotionPathPlugin);
  const T = window.Terrarium;
  const legende = document.getElementById('legende');
  const scene = T.art.monter(document.getElementById('stage'));
  const dire = (texte) => {
    legende.textContent = texte;
    gsap.fromTo(legende, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  };
  const vignettes = T.vignettes(scene, dire);
  const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
  // window.terrariumVideo.tours compte les passages : utile pour savoir quand couper l'enregistrement.
  window.terrariumVideo = { scene: ${JSON.stringify(id)}, tours: 0 };
  (async function boucle() {
    for (;;) {
      dire(${JSON.stringify(`${acteur} : ${concept.toLowerCase()}.`)});
      await pause(2200);
      await vignettes.jouer(${JSON.stringify(id)});
      window.terrariumVideo.tours += 1;
      await pause(2500);
    }
  })();
})();
</script>
</body>
</html>
`;
  const sortie = path.join(racine, 'demo', `video-${id}.html`);
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, page);
  console.log('Page vidéo écrite :', path.relative(racine, sortie));
}
