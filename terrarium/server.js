// Serveur Node.js (Express) du Terrarium agentique.
// Il sert le front, le contenu des chapitres, la simulation pas à pas
// et la progression des visiteurs.
const express = require('express');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');

const content = require('./shared/content.js');
const simulation = require('./shared/simulation.js');
const { valider } = require('./shared/scenarios.js');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const ID_VISITEUR = /^[a-z0-9-]{8,40}$/;

// --- Progression : un petit fichier JSON, écritures mises en file ----------
let file = Promise.resolve();

async function lireProgression() {
  try {
    return JSON.parse(await fs.readFile(PROGRESS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function modifierProgression(modifier) {
  const tache = file.then(async () => {
    const tout = await lireProgression();
    const resultat = modifier(tout);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(tout, null, 2));
    return resultat;
  });
  file = tache.catch(() => {});
  return tache;
}

// --- Application -------------------------------------------------------------
const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/vendor/gsap', express.static(path.join(__dirname, 'node_modules/gsap/dist')));

app.get('/api/chapters', (_req, res) => res.json(content.list()));

// Scénarios des scènes (les mêmes que pour les vidéos), relus à chaque démarrage.
const DOSSIER_SCENARIOS = path.join(__dirname, 'videos/scenarios');
const scenarios = fsSync.readdirSync(DOSSIER_SCENARIOS)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fsSync.readFileSync(path.join(DOSSIER_SCENARIOS, f), 'utf8')))
  .filter((sc) => {
    const erreurs = valider(sc);
    if (erreurs.length) console.warn(`Scénario ${sc.id} ignoré :`, erreurs.join(' ; '));
    return erreurs.length === 0;
  });
app.get('/api/scenarios', (_req, res) => res.json(scenarios));

app.get('/api/chapters/:id', (req, res) => {
  const chapitre = content.get(req.params.id);
  if (!chapitre) return res.status(404).json({ error: 'Chapitre introuvable' });
  res.json(chapitre);
});

// Simule une boucle d'agent pas à pas : le front anime la trace renvoyée.
app.post('/api/simulate', (req, res) => {
  const { scenario, options } = req.body || {};
  const trace = simulation.simulate(String(scenario), options && typeof options === 'object' ? options : {});
  if (!trace) return res.status(400).json({ error: 'Scénario inconnu', scenarios: simulation.scenarios });
  res.json(trace);
});

app.get('/api/progress/:id', async (req, res) => {
  if (!ID_VISITEUR.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' });
  const tout = await lireProgression();
  res.json({ done: tout[req.params.id]?.done ?? [] });
});

app.put('/api/progress/:id', async (req, res) => {
  if (!ID_VISITEUR.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' });
  const demandes = Array.isArray(req.body?.done) ? req.body.done : [];
  const done = content.ids.filter((id) => demandes.includes(id));
  await modifierProgression((tout) => {
    tout[req.params.id] = { done, majLe: new Date().toISOString() };
  });
  res.json({ done });
});

app.use((err, _req, res, _next) => {
  const statut = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (statut === 500) console.error(err);
  res.status(statut).json({ error: statut === 500 ? 'Erreur du serveur' : 'Requête invalide' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Terrarium agentique : http://localhost:${PORT}`));
}

module.exports = app;
