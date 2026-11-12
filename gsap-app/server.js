// Serveur Node.js (Express) : sert le front et expose une API REST d'adhérents.
import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'adherents.json');
const PORT = process.env.PORT || 3000;

const SEED = [
  { prenom: 'Alice', nom: 'Martin', sexe: 'F', activite: 'Escalade' },
  { prenom: 'Karim', nom: 'Benali', sexe: 'M', activite: 'Football' },
  { prenom: 'Léa', nom: 'Dubois', sexe: 'F', activite: 'Natation' },
  { prenom: 'Hugo', nom: 'Moreau', sexe: 'M', activite: 'Basket' },
].map((a) => ({ id: randomUUID(), creeLe: new Date().toISOString(), ...a }));

// --- Stockage simple dans un fichier JSON -------------------------------
async function load() {
  try {
    return JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    await save(SEED);
    return structuredClone(SEED);
  }
}

async function save(list) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

function validate(body) {
  const errors = {};
  const clean = {};
  for (const champ of ['prenom', 'nom', 'activite']) {
    const v = typeof body?.[champ] === 'string' ? body[champ].trim() : '';
    if (!v) errors[champ] = 'Ce champ est obligatoire.';
    else if (v.length > 50) errors[champ] = '50 caractères maximum.';
    clean[champ] = v;
  }
  clean.sexe = ['M', 'F', 'A'].includes(body?.sexe) ? body.sexe : 'A';
  return { errors, clean };
}

// --- Application ----------------------------------------------------------
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// GSAP servi depuis node_modules (pas besoin de CDN)
app.use('/vendor/gsap', express.static(path.join(__dirname, 'node_modules/gsap/dist')));

app.get('/api/adherents', async (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const list = await load();
  res.json(
    q
      ? list.filter((a) =>
          `${a.prenom} ${a.nom} ${a.activite}`.toLowerCase().includes(q))
      : list,
  );
});

app.get('/api/stats', async (_req, res) => {
  const list = await load();
  const parActivite = {};
  for (const a of list) parActivite[a.activite] = (parActivite[a.activite] ?? 0) + 1;
  res.json({
    total: list.length,
    femmes: list.filter((a) => a.sexe === 'F').length,
    hommes: list.filter((a) => a.sexe === 'M').length,
    activites: Object.keys(parActivite).length,
    parActivite,
  });
});

app.post('/api/adherents', async (req, res) => {
  const { errors, clean } = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const list = await load();
  const adherent = { id: randomUUID(), creeLe: new Date().toISOString(), ...clean };
  list.push(adherent);
  await save(list);
  res.status(201).json(adherent);
});

app.put('/api/adherents/:id', async (req, res) => {
  const { errors, clean } = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const list = await load();
  const i = list.findIndex((a) => a.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Adhérent introuvable' });
  list[i] = { ...list[i], ...clean };
  await save(list);
  res.json(list[i]);
});

app.delete('/api/adherents/:id', async (req, res) => {
  const list = await load();
  const next = list.filter((a) => a.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Adhérent introuvable' });
  await save(next);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
