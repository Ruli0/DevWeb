// Fabrique une démo en un seul fichier HTML, jouable sans serveur :
// la simulation et le contenu tournent dans le navigateur, GSAP vient d'un CDN.
//   node scripts/build-demo.js             -> demo/index.html (page complète)
//   node scripts/build-demo.js --fragment  -> demo/terrarium-agentique.html (sans <html>/<body>)
//   (les vidéos se fabriquent avec scripts/build-video.js)
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
const GSAP = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';
const fragment = process.argv.includes('--fragment');

const html = lire('public/index.html');
const scenarios = fs.readdirSync(path.join(racine, 'videos/scenarios'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(lire(`videos/scenarios/${f}`)));
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
<script>window.TERRARIUM_SCENARIOS = ${JSON.stringify(scenarios)};</script>
${balises.join('\n')}
`;

const sortie = path.join(racine, 'demo', fragment ? 'terrarium-agentique.html' : 'index.html');
fs.mkdirSync(path.dirname(sortie), { recursive: true });
fs.writeFileSync(sortie, fragment ? contenu
  : `<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${contenu}</body>\n</html>\n`);
console.log('Démo écrite :', path.relative(racine, sortie));

