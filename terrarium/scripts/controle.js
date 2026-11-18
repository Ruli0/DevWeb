// Le contrôle automatique de l'image : regarde cinq instants de chaque plan d'une composition et signale ce qui cloche.
//   npm run video -- <id> --controle        ou        NODE_PATH=$(npm root -g) node scripts/controle.js <id | dossier de la composition>
// Il ne bloque rien : il imprime une liste et enregistre une capture par problème (cadre rouge) dans <composition>/controle/.
// Ce qui est vérifié : texte hors de la zone sûre ou plus large que l'écran, étiquette sur le visage du hibou, deux textes qui se
// recouvrent, texte peu lisible sur son fond (moins de 4,5 pour 1), image presque noire ou presque unie. Voir production/PASSATION-AVIS.md.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ZONE = { gauche: 40, droite: 1040, bas: 1450 };
const TEXTES = '.st div, .question p, .grand, .moyen, .kicker, .conclusion, .repere, .items li span, .rebours span';

const hex = (rgb) => `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
function contraste(a, b) {
  const lum = (h) => { const [r, g, v] = [0, 1, 2].map((i) => { const x = parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16) / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * v; };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
// La couleur moyenne d'une zone d'une image (ffmpeg : recadrage puis réduction à un pixel).
function moyenne(png, r) {
  const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-vf', `crop=${w}:${h}:${Math.max(0, Math.round(r.x))}:${Math.max(0, Math.round(r.y))},scale=1:1`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  return [b[0], b[1], b[2]];
}
// L'écart de luminosité d'une image entière (réduite à 24 × 24) : près de zéro, l'image est unie.
function variation(png) {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-vf', 'scale=24:24,format=gray', '-f', 'rawvideo', '-']);
  const m = b.reduce((a, v) => a + v, 0) / b.length;
  return { moyenne: m, ecart: Math.sqrt(b.reduce((a, v) => a + (v - m) ** 2, 0) / b.length) };
}
const recoupe = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function controle(dossier, { sortie = path.join(dossier, 'controle'), instants = [0.15, 0.35, 0.55, 0.75, 0.92] } = {}) {
  const { chromium } = require('playwright');
  const feuille = JSON.parse(fs.readFileSync(path.join(dossier, 'feuille.json'), 'utf8'));
  fs.rmSync(sortie, { recursive: true, force: true }); fs.mkdirSync(sortie, { recursive: true });
  const alertes = [];
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`file://${path.resolve(dossier, 'index.html')}`);
  await page.waitForFunction(() => !!(window.__timelines && Object.keys(window.__timelines).length), null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const voir = (t) => page.evaluate((instant) => {
    Object.values(window.__timelines)[0].seek(instant, false);
    document.querySelectorAll('.clip').forEach((c) => { const d = +c.dataset.start, u = +c.dataset.duration; c.style.display = instant >= d && instant < d + u ? '' : 'none'; });
  }, t);
  for (const [i, pl] of feuille.plans.entries()) {
    for (const [k, u] of instants.entries()) {
      const t = Math.min(feuille.duree - 0.05, pl.t0 + Math.max(0.3, pl.d * u));
      await voir(t);
      const cadre = path.join(sortie, `plan-${i + 1}-${k}.png`);
      // Les textes visibles, leur boîte et leur couleur ; la boîte du hibou.
      const lecture = await page.evaluate(({ textes }) => {
        const boite = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
        const visible = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.5) return false; } return true; };
        const out = { textes: [], hibou: null };
        // Un texte recouvert par un autre plan (pendant une transition) n'est pas à contrôler : on regarde ce qui est réellement au-dessus.
        const decouvert = (e, r) => { const haut = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); const plan = e.closest('.plan'); return !haut || e.contains(haut) || haut.contains(e) || (plan && plan.contains(haut)); };
        document.querySelectorAll(textes).forEach((e) => { if (!e.textContent.trim() || !visible(e)) return; const r = boite(e); if (r.width < 2 || r.height < 2 || !decouvert(e, r)) return; out.textes.push({ sel: e.matches('.st div') ? 'sous-titre' : e.matches('.question p') ? 'question' : e.className.split(' ')[0] || e.tagName.toLowerCase(), txt: e.textContent.trim().slice(0, 40), r, couleur: getComputedStyle(e).color, etiquette: !!e.matches('.st div, .question p') || (() => { const f = getComputedStyle(e).backgroundColor.match(/[\d.]+/g) || []; return f.length < 4 || +f[3] > 0.5; })() }); });
        // Un mot plus large que sa ligne : le masque de la ligne le coupe, ou il sort de l'écran.
        out.coupes = [];
        document.querySelectorAll('.ligne').forEach((e) => { if (!e.textContent.trim() || !visible(e)) return; if (e.scrollWidth > e.clientWidth + 2) { const r = boite(e); out.coupes.push({ txt: e.textContent.trim().slice(0, 40), r: { x: r.x, y: r.y, width: Math.max(r.width, e.scrollWidth), height: r.height } }); } });
        // L'orbe : sa sphère (et son halo proche) comme boîte, d'après la taille actuelle du calque.
        const ob = document.getElementById('orbe');
        if (ob && visible(ob)) { const r = ob.getBoundingClientRect(), k = r.width / 900, rayon = 118 * 1.3 * k; out.orbe = { x: r.x + r.width / 2 - rayon, y: r.y + r.height / 2 - rayon, width: 2 * rayon, height: 2 * rayon }; }
        const el = [...document.querySelectorAll('.perso.hibou')].find(visible);
        if (el) out.hibou = boite(el);
        return out;
      }, { textes: TEXTES });
      const problemes = [];
      lecture.coupes.forEach((x) => problemes.push({ cadre: x.r, msg: `« ${x.txt} » est plus large que sa ligne : le texte est coupé ou sort de l’écran` }));
      lecture.textes.forEach((x) => {
        if (x.r.x < ZONE.gauche - 1 || x.r.x + x.r.width > ZONE.droite + 1) problemes.push({ cadre: x.r, msg: `« ${x.txt} » déborde de la zone sûre (x ${Math.round(x.r.x)} à ${Math.round(x.r.x + x.r.width)}, il faut rester entre ${ZONE.gauche} et ${ZONE.droite})` });
        if (x.r.y + x.r.height > ZONE.bas) problemes.push({ cadre: x.r, msg: `« ${x.txt} » descend sous y ${ZONE.bas} (interface de TikTok)` });
      });
      for (let a = 0; a < lecture.textes.length; a += 1) for (let b = a + 1; b < lecture.textes.length; b += 1) {
        if (recoupe(lecture.textes[a].r, lecture.textes[b].r)) problemes.push({ cadre: lecture.textes[a].r, msg: `« ${lecture.textes[a].txt} » et « ${lecture.textes[b].txt} » se recouvrent` });
      }
      if (lecture.orbe) {
        lecture.textes.forEach((x) => { if (recoupe(lecture.orbe, x.r)) problemes.push({ cadre: lecture.orbe, msg: `l’orbe recouvre « ${x.txt} »` }); });
        if (lecture.hibou && recoupe(lecture.orbe, lecture.hibou)) problemes.push({ cadre: lecture.orbe, msg: 'l’orbe recouvre le hibou' });
      }
      if (lecture.hibou) {
        const tete = { x: lecture.hibou.x, y: lecture.hibou.y, width: lecture.hibou.width, height: lecture.hibou.height * 0.45 };
        lecture.textes.forEach((x) => { if (recoupe(tete, x.r)) problemes.push({ cadre: tete, msg: `« ${x.txt} » recouvre le visage du hibou` }); });
      }
      // Les textes sans étiquette : leur couleur contre le fond réel (image prise sans aucun texte).
      const sansEtiquette = lecture.textes.filter((x) => !x.etiquette);
      let vide;
      {
        await page.addStyleTag({ content: '.cadre, #st, .question { visibility: hidden !important; }' });
        const brut = path.join(sortie, '_fond.png');
        await page.screenshot({ path: brut });
        vide = variation(brut);
        sansEtiquette.forEach((x) => {
          const m = hex(moyenne(brut, x.r)), c = (x.couleur.match(/\d+(\.\d+)?/g) || [255, 255, 255]).slice(0, 3).map(Number);
          const rapport = contraste(hex(c), m);
          if (rapport < 4.5) problemes.push({ cadre: x.r, msg: `« ${x.txt} » se lit mal sur son fond (contraste ${rapport.toFixed(1)} pour 1, il en faut 4,5)` });
        });
        await page.evaluate(() => { [...document.querySelectorAll('style')].filter((s) => /visibility: hidden !important/.test(s.textContent)).forEach((s) => s.remove()); });
        fs.rmSync(brut, { force: true });
      }
      if (vide.moyenne < 8) problemes.push({ cadre: { x: 0, y: 0, width: 1080, height: 1920 }, msg: 'image presque noire (décor absent ou non chargé ?)' });
      else if (vide.ecart < 5) problemes.push({ cadre: { x: 0, y: 0, width: 1080, height: 1920 }, msg: 'image presque unie : ce plan n’a ni décor ni dessin, à illustrer' });
      if (problemes.length) {
        // Une capture par instant fautif, avec un cadre rouge autour de chaque problème.
        await page.evaluate((cadres) => { cadres.forEach((r) => { const d = document.createElement('div'); d.className = 'alerte-controle'; d.style.cssText = `position:absolute;z-index:9999;left:${r.x - 6}px;top:${r.y - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;border:6px solid #ff2a2a;box-sizing:border-box;pointer-events:none`; document.body.appendChild(d); }); }, problemes.map((p) => p.cadre));
        await page.screenshot({ path: cadre });
        await page.evaluate(() => document.querySelectorAll('.alerte-controle').forEach((d) => d.remove()));
        problemes.forEach((p) => { if (!alertes.some((a) => a.plan === i + 1 && a.msg === p.msg)) alertes.push({ plan: i + 1, t: +t.toFixed(2), msg: p.msg, capture: path.relative(dossier, cadre) }); });
      }
    }
  }
  await navigateur.close();
  return alertes;
}

module.exports = { controle };

if (require.main === module) {
  (async () => {
    const [cible] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
    if (!cible) { console.error('Usage : NODE_PATH=$(npm root -g) node scripts/controle.js <id | dossier de la composition>'); process.exit(1); }
    const dossier = fs.existsSync(path.join(cible, 'index.html')) ? cible : path.join(__dirname, '..', 'videos/studio', cible);
    if (!fs.existsSync(path.join(dossier, 'index.html'))) { console.error(`composition introuvable : ${dossier} (fais d'abord : npm run video -- ${cible})`); process.exit(1); }
    const alertes = await controle(dossier);
    if (!alertes.length) console.log(`Contrôle de l'image : rien à signaler (${path.basename(dossier)}).`);
    else {
      console.log(`Contrôle de l'image : ${alertes.length} point(s) à regarder (captures dans ${path.join(path.relative(process.cwd(), dossier), 'controle')}) :`);
      alertes.forEach((a) => console.log(`  - plan ${a.plan}, à ${a.t} s : ${a.msg}  [${a.capture}]`));
    }
  })().catch((e) => { console.error(e.message); process.exit(1); });
}
