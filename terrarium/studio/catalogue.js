// Génère production/CATALOGUE.md : tout ce qu'il faut savoir pour écrire un épisode, et rien de plus.
//   node studio/catalogue.js
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { TEMPS_FORTS } = require('./temps-forts.js');
const { RIGS, DECORS, CADRAGES, PARTIES } = require('./compiler.js');
const { LECTURE } = require('../shared/scenarios.js');

function catalogue() {
  const l = [
    '# Catalogue du studio',
    '',
    '_Généré par `node studio/catalogue.js` : ne pas modifier à la main. Avec `GUIDE-EXECUTION.md`, c\'est tout ce qu\'il faut lire pour écrire un épisode._',
    '',
    '## Écrire un épisode',
    '',
    'Un fichier `videos/episodes/<id>.json`, puis `npm run video -- <id>` (planche d\'aperçu) et `npm run video -- <id> --rendu` (MP4, 60 images par seconde). Modèle : `videos/episodes/demo.json`.',
    '',
    '```json',
    '{ "id": "mon-episode", "titre": "…", "decor": "branche", "musique": "drift",',
    '  "roles": { "ia": "cameleon", "tache": "mouche" },',
    '  "temps": [ { "fort": "accroche", "texte": "…" }, …, { "fort": "boucler", "texte": "…" } ] }',
    '```',
    '',
    '- Tout se compte en **mesures** de la musique (Drift : 145 BPM, une mesure = 1,655 s). La durée de la vidéo est la somme des mesures.',
    `- **Texte** : une chaîne, ou une liste de morceaux affichés l'un après l'autre. Au plus ${LECTURE.caracteresMax} caractères par morceau ; il faut ${LECTURE.parMot} s par mot et ${LECTURE.parMorceau} s par morceau pour lire. \`*mot*\` met un mot en valeur (rose).`,
    '- **La vidéo doit boucler** : la caméra, la tâche, la couleur de l\'IA et l\'humeur de Mousse reviennent à leur état du début. Le temps fort `boucler`, placé en dernier, s\'en charge.',
    '- Le compilateur refuse un épisode qui ne respecte pas ces règles, avec un message qui dit quoi changer.',
    '',
    '## Temps forts',
    '',
    '| Temps fort | Mesures | Ce qu\'il fait | Paramètres |',
    '|---|---|---|---|',
    ...Object.entries(TEMPS_FORTS).map(([nom, t]) => `| \`${nom}\` | ${t.mesures} | ${t.role} | ${t.params} |`),
    '',
    '`"mesures": n` dans un temps fort allonge sa durée (la mise en scène reste calée sur ses premières mesures).',
    '',
    '## Personnages et gestes',
    '',
    'Les temps forts appellent ces gestes. Un épisode ne les appelle pas directement.',
    '',
  ];
  for (const rig of Object.values(RIGS)) {
    l.push(`### ${rig.id} (${rig.nom})`, '', '| Geste | Ce qu\'il fait | Paramètres |', '|---|---|---|');
    for (const [nom, g] of Object.entries(rig.GESTES)) l.push(`| \`${nom}\` | ${g.role} | ${g.params} |`);
    l.push('');
  }
  l.push('## Décors', '', '| Décor | Places |', '|---|---|');
  for (const d of Object.values(DECORS)) l.push(`| \`${d.id}\` (${d.nom}) | ${Object.entries(d.PLACES).map(([k, v]) => `${k} : ${JSON.stringify(Array.isArray(v) ? v : [v.x, v.y])}`).join(' ; ')} |`);
  l.push('', '## Cadrages', '', `${Object.entries(CADRAGES).map(([k, z]) => `\`${k}\` (zoom ${String(z).replace('.', ',')})`).join(', ')}. Le sujet est cadré aux 2/5 de la hauteur ; avec plusieurs sujets, le zoom diminue pour les garder tous à l'écran. Entre deux mouvements, la caméra avance doucement.`);
  l.push('', '## Musique', '', `Une partie par mesure, choisie par les temps forts : ${PARTIES.map((p) => `\`${p}\``).join(', ')}. Une « coupure » fait taire la musique pendant un temps (sur le raté).`, '');
  return l.join('\n');
}

if (require.main === module) {
  fs.writeFileSync(path.join(__dirname, '../production/CATALOGUE.md'), catalogue());
  console.log('production/CATALOGUE.md écrit');
}
module.exports = { catalogue };
