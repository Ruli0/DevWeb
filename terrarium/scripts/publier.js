// Le kit de publication : rendu final en 60 images par seconde, vidéo prête à envoyer, et une fiche de publication.
//   npm run video -- <id> --publier        ou        node scripts/publier.js <id> [--sans-rendu]
// Écrit dans videos/studio/<id>/ (hors dépôt) : <id>-final.mp4 (60 i/s, recompressé en crf 18) et publication.md.
// Refuse de produire un rendu final s'il reste quelque chose à écrire (question de fin ou publication marquées "_a_ecrire") ou si la voix
// est une maquette muette. Fonction pure : preparer(episode, voix) → { bloquants, rappels, fiche }.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const nu = (t) => String(t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

function preparer(ep, voix, { rendu } = {}) {
  const bloquants = [], rappels = [];
  const aEcrire = (o, ou) => { if (o && o._a_ecrire) bloquants.push(`${ou} est encore à écrire (clé "_a_ecrire")`); };
  const dernier = (ep.plans || [])[(ep.plans || []).length - 1] || {};
  aEcrire(dernier.question, 'la question de fin');
  aEcrire(ep.publication, 'le texte de publication');
  if (ep.publication && !nu(ep.publication.texte) && !ep.publication._a_ecrire) bloquants.push('le texte de publication est vide');
  if (voix && voix.maquette) bloquants.push('la voix est une maquette muette : enregistre ta voix (ou génère-la) avant le rendu final');
  if (voix && voix.muet) rappels.push('Version muette : aucune voix, donc pas de mention « contenu généré par IA » à cocher. Ajoute un son de la bibliothèque de TikTok si tu veux de la musique plus connue.');
  if (voix && voix.generee) rappels.push('Voix générée par IA : coche « contenu généré par IA » à la publication. Ta vraie voix reste préférable.');
  if ((ep.plans || []).some((p) => p.fond === 'photo' || (p.collage || []).length)) rappels.push('Ta photo apparaît dans la vidéo : vérifie que tu es d’accord pour la montrer, et qu’elle ne révèle rien de privé (lieu, plaque, visage d’un tiers).');
  if (['travail', 'relations'].includes(ep.rubrique)) rappels.push('Sujet d’opinion : présente-le comme ton avis, sans chiffre ni source que tu n’as pas vérifiés.');
  if ((ep.plans || []).some((p) => p.plan === 'grille')) rappels.push('Jeu de mots fléchés : présente-le comme un jeu, pas comme un test scientifique (« indicateur de l’intelligence conversationnelle » est une formule de ton, sans source). Invite à commenter son score.');
  if (ep.musique === 'reverie') rappels.push('Musique « Rêverie » : une musique originale synthétisée. Tu peux la couper (musique « aucune ») et ajouter un son de la bibliothèque de TikTok à la publication (licence couverte par l’appli).');
  rappels.push('Regarde la vidéo une fois en entier, son allumé, sur ton téléphone, avant de publier.');
  const pub = ep.publication || {};
  const question = nu(dernier.question && dernier.question.texte);
  const commentaire = pub.commentaire || (question ? `${question} 👇` : 'Et toi, qu’en penses-tu ? 👇');
  const mots = (voix && voix.mots || []).filter((m) => !/^[?!.…,;:]+$/.test(m.m));
  const premiere = []; for (const m of mots) { premiere.push(m.m); if (/[.?!…]$/.test(m.m)) break; if (premiere.length >= 20) break; }
  const fiche = [
    `# Publication : ${ep.titre || ep.id}`, '',
    '## Texte', '', nu(pub.texte) || '_à écrire_', '',
    '## Hashtags', '', (pub.hashtags || []).join(' ') || '_à choisir (trois à cinq)_', '',
    '## Commentaire à épingler', '', commentaire, '',
    '## Avant de publier', '', ...rappels.map((r) => `- [ ] ${r}`), '',
    '## Accroches de rechange', '',
    `Première phrase actuelle : « ${premiere.join(' ')} » (${premiere.length} mots).`,
    'Essaie la même idée sous trois formes (voir `production/ACCROCHES.md`) : une **question qui pique**, un **contre-pied** (« Arrête de… »), une **scène** (« Hier, … »). Garde celle que tu dirais à un ami.', '',
    '## Fichiers', '', rendu ? `- vidéo : \`${rendu.fichier}\` (${rendu.duree} s, 60 images par seconde, ${rendu.taille} Mo, niveau ${rendu.niveau} LUFS)` : '- vidéo : _non rendue_', '',
    '## Après la publication', '',
    '- [ ] Note l’heure de publication.', '- [ ] Au bout de 48 h : vues, rétention à 3 secondes, visionnage complet, commentaires, partages (dans `videos/resultats.csv`).', '',
  ].join('\n');
  return { bloquants, rappels, fiche, commentaire };
}

function hyperframes() {
  const local = path.join(process.env.HOME || '', '.cache/avis-hyperframes/node_modules/.bin/hyperframes');
  return fs.existsSync(local) ? { cmd: local, args: [] } : { cmd: 'npx', args: ['--yes', 'hyperframes'] };
}

module.exports = { preparer };

if (require.main === module) {
  const [id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!id) { console.error('Usage : node scripts/publier.js <id> [--sans-rendu]'); process.exit(1); }
  const racine = path.join(__dirname, '..');
  const ep = JSON.parse(fs.readFileSync(path.join(racine, 'videos/episodes', `${id}.json`), 'utf8'));
  const muet = (ep.plans || []).some((p) => p.plan === 'grille' && p.muet);
  const voix = muet ? { muet: true } : JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix', ep.voix || id, 'mots.json'), 'utf8'));
  const dossier = path.join(racine, 'videos/studio', id);
  const r0 = preparer(ep, voix);
  if (r0.bloquants.length) { console.error(`Rendu final refusé pour « ${id} » :\n  - ${r0.bloquants.join('\n  - ')}`); process.exit(1); }
  // Les jeux de mots fléchés : la réponse ne doit jamais être affichée avant la voix (vérifié sur le signal sonore, voir scripts/verifier-voix.js).
  if ((ep.plans || []).some((p) => p.plan === 'grille' && !p.muet)) {
    const v = spawnSync('node', [path.join(__dirname, 'verifier-voix.js'), id], { encoding: 'utf8' });
    process.stdout.write(v.stdout || ''); process.stderr.write(v.stderr || '');
    if (v.status) { console.error(`Rendu final refusé pour « ${id} » : la voix et l'image ne sont pas synchronisées (voir ci-dessus).`); process.exit(1); }
  }
  let rendu = null;
  if (!process.argv.includes('--sans-rendu')) {
    if (!fs.existsSync(path.join(dossier, 'index.html'))) { console.error(`composition absente : npm run video -- ${id}`); process.exit(1); }
    const hf = hyperframes();
    const env = { ...process.env };
    const navigateur = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
    if (!env.HYPERFRAMES_BROWSER_PATH && fs.existsSync(navigateur)) env.HYPERFRAMES_BROWSER_PATH = navigateur;
    const brut = path.join(dossier, `${id}-60.mp4`), final = path.join(dossier, `${id}-final.mp4`);
    console.log('Rendu en 60 images par seconde…');
    const r = spawnSync(hf.cmd, [...hf.args, 'render', '--workers', '3', '--fps', '60', '--quiet', '-o', `${id}-60.mp4`], { cwd: dossier, stdio: 'inherit', env });
    if (r.status) process.exit(r.status);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', brut, '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-c:a', 'copy', final]);
    fs.rmSync(brut, { force: true });
    const duree = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final]).toString().trim();
    const niveau = spawnSync('ffmpeg', ['-hide_banner', '-i', final, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '';
    const lufs = (niveau.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop();
    rendu = { fichier: path.relative(racine, final), duree: duree.toFixed(1), taille: (fs.statSync(final).size / 1e6).toFixed(1), niveau: lufs ? lufs.replace(/[^-\d.]/g, '') : '?' };
    console.log(`Vidéo prête : ${rendu.fichier} (${rendu.duree} s, ${rendu.taille} Mo, ${rendu.niveau} LUFS)`);
  }
  const r1 = preparer(ep, voix, { rendu });
  fs.writeFileSync(path.join(dossier, 'publication.md'), r1.fiche);
  console.log(`Fiche de publication : ${path.relative(racine, path.join(dossier, 'publication.md'))}`);
  r1.rappels.forEach((x) => console.log(`  - ${x}`));
}
