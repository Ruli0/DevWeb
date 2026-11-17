// Le prompteur : une page autonome (Artifact) où le texte défile pendant que l'auteur enregistre sa voix.
//   node scripts/prompteur.js <id | texte libre> [--sortie=fichier.html]
// Source du texte, dans l'ordre : videos/scripts/<id>.txt, videos/voix/<id>/script.txt, sinon l'argument lui-même.
// Écrit videos/studio/prompteur-<id>.html (hors dépôt) ; le skill « prompteur » le publie avec les capacités assets et downloads.
// Fonction pure : construire({ id, texte }) → { html, lignes }.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const nu = (t) => String(t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const mots = (l) => l.split(/\s+/).filter(Boolean).length;

// Une ligne à l'écran = une phrase, coupée aux virgules quand elle dépasse neuf mots.
function lignes(texte) {
  const out = [];
  for (const par of String(texte || '').split(/\n+/)) {
    const phrases = nu(par).match(/[^.!?…]+[.!?…]*/g) || [];
    for (const p of phrases.map((x) => x.trim()).filter(Boolean)) {
      if (mots(p) <= 9) { out.push(p); continue; }
      let cur = '';
      for (const morceau of p.split(/(?<=,|;|:)\s+/)) {
        if (cur && mots(`${cur} ${morceau}`) > 9) { out.push(cur); cur = morceau; } else cur = cur ? `${cur} ${morceau}` : morceau;
      }
      if (cur) out.push(cur);
    }
  }
  return out;
}

function construire({ id, texte, vitesse = 150 }) {
  const l = lignes(texte);
  if (!l.length) throw new Error('prompteur : texte vide');
  const donnees = JSON.stringify({ id, lignes: l, vitesse }).replace(/</g, '\\u003c');
  const html = `<title>Prompteur ${id}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Mise en page : une scène plein écran (texte centré sur une ligne de lecture), une barre de commandes en bas, un volet de prise qui monte après l'arrêt. */
:root { --fond: #f4f2ee; --texte: #1d1b19; --doux: #8d867d; --accent: #d9480f; --bouton: #ece8e1; --bord: #d8d2c8; --rec: #c92a2a;
  --titre: "Bricolage Grotesque", system-ui, sans-serif; --corps: "Inter", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fond: #121110; --texte: #f3efe8; --doux: #7a746b; --accent: #ff8a3d; --bouton: #24211e; --bord: #35312c; --rec: #ff5a4f; color-scheme: dark; } }
:root[data-theme="dark"] { --fond: #121110; --texte: #f3efe8; --doux: #7a746b; --accent: #ff8a3d; --bouton: #24211e; --bord: #35312c; --rec: #ff5a4f; color-scheme: dark; }
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { height: 100%; }
body { margin: 0; background: var(--fond); color: var(--texte); font-family: var(--corps); overflow: hidden; padding-block: 0; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
#app { height: 100%; display: flex; flex-direction: column; }
#haut { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0 6px; font-size: 13px; color: var(--doux); font-variant-numeric: tabular-nums; }
#etat { display: flex; align-items: center; gap: 8px; }
#point { width: 10px; height: 10px; border-radius: 50%; background: var(--doux); }
#point.rec { background: var(--rec); animation: clignote 1.2s steps(2, jump-none) infinite; }
@keyframes clignote { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { #point.rec { animation: none; } }
#scene { position: relative; flex: 1; min-height: 0; overflow: hidden; }
#scene::before, #scene::after { content: ""; position: absolute; left: 0; right: 0; height: 28%; z-index: 2; pointer-events: none; }
#scene::before { top: 0; background: linear-gradient(var(--fond), transparent); }
#scene::after { bottom: 0; background: linear-gradient(transparent, var(--fond)); }
#repere { position: absolute; left: 0; top: 38%; width: 4px; height: 0; }
#defile { position: absolute; left: 0; right: 0; top: 38%; will-change: transform; }
.l { font-family: var(--titre); font-weight: 600; line-height: 1.18; padding: .26em 0; color: var(--doux); text-wrap: balance; cursor: pointer; transition: color .25s; font-size: var(--taille, 40px); }
.l.fait { color: var(--doux); opacity: .55; }
.l.cour { color: var(--texte); }
#bas { padding: 10px 0 max(12px, env(safe-area-inset-bottom, 0px)); display: grid; gap: 10px; }
#reglages { display: flex; justify-content: space-between; gap: 8px; }
.r { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--doux); }
button, label.bouton { font: inherit; color: var(--texte); background: var(--bouton); border: 1px solid var(--bord); border-radius: 10px; min-height: 44px; min-width: 44px; padding: 0 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
button:focus-visible, label.bouton:focus-within { outline: 3px solid var(--accent); outline-offset: 2px; }
#principal { display: flex; gap: 10px; }
#go { flex: 1; min-height: 64px; font-size: 19px; font-weight: 600; background: var(--accent); border-color: var(--accent); color: #fff; }
:root:not([data-theme="light"]) #go { color: #1a0f07; }
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) #go { color: #fff; } }
:root[data-theme="light"] #go { color: #fff; }
#go.rec { background: var(--rec); border-color: var(--rec); color: #fff; }
#message { font-size: 13px; line-height: 1.4; color: var(--doux); min-height: 1.4em; }
#prise { position: absolute; left: 0; right: 0; bottom: 0; z-index: 5; background: var(--bouton); border-top: 1px solid var(--bord); border-radius: 16px 16px 0 0; padding: 16px max(16px, env(safe-area-inset-left, 0px)) max(16px, env(safe-area-inset-bottom, 0px)); display: grid; gap: 12px; }
#prise audio { width: 100%; }
#prise .rang { display: flex; gap: 10px; flex-wrap: wrap; }
#prise .rang > * { flex: 1; }
#envoyer { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
:root:not([data-theme="light"]) #envoyer { color: #1a0f07; }
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) #envoyer { color: #fff; } }
:root[data-theme="light"] #envoyer { color: #fff; }
#compte { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; font: 700 140px var(--titre); color: var(--accent); background: color-mix(in srgb, var(--fond) 80%, transparent); }
#niveau { height: 4px; background: var(--bord); border-radius: 2px; overflow: hidden; }
#niveau i { display: block; height: 100%; width: 0; background: var(--accent); }
</style>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Inter:wght@400;600&display=swap">
<div id="app">
  <div id="haut"><div id="etat"><span id="point"></span><span id="libelle">Prêt</span></div><span id="chrono">0:00 / 0:00</span></div>
  <div id="scene"><div id="defile"></div><div id="compte" hidden></div>
    <div id="prise" hidden>
      <audio id="ecoute" controls></audio>
      <div id="etatprise" aria-live="polite"></div>
      <div class="rang"><button id="envoyer" type="button">Envoyer à Claude</button><button id="refaire" type="button">Refaire</button></div>
      <div class="rang"><button id="telecharger" type="button">Télécharger</button><label class="bouton" for="fichier">Déposer un fichier<input id="fichier" type="file" accept="audio/*,video/mp4,video/webm,.m4a" hidden></label></div>
    </div>
  </div>
  <div id="bas">
    <div id="niveau" aria-hidden="true"><i id="jauge"></i></div>
    <div id="message" aria-live="polite"></div>
    <div id="reglages">
      <div class="r">Vitesse <button id="moins" type="button" aria-label="Plus lent">−</button><b id="wpm">150</b><button id="plus" type="button" aria-label="Plus rapide">+</button></div>
      <div class="r">Texte <button id="pm" type="button" aria-label="Texte plus petit">A−</button><button id="pp" type="button" aria-label="Texte plus grand">A+</button></div>
    </div>
    <div id="principal"><button id="pause" type="button" hidden>Pause</button><button id="go" type="button">● Enregistrer</button></div>
  </div>
</div>
<script>
(() => {
  const D = ${donnees};
  const $ = (s) => document.querySelector(s);
  const memo = { get(k, d) { try { return JSON.parse(localStorage.getItem('prompteur.' + k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('prompteur.' + k, JSON.stringify(v)); } catch (e) {} } };
  let wpm = memo.get('wpm', D.vitesse), taille = memo.get('taille', 40);
  const nbMots = (s) => s.split(/\\s+/).filter(Boolean).length;
  const defile = $('#defile'), scene = $('#scene');
  D.lignes.forEach((t, i) => { const d = document.createElement('div'); d.className = 'l'; d.textContent = t; d.dataset.i = i; defile.appendChild(d); });
  const els = [...defile.children];
  // Temps de lecture par ligne (un mot = 60/wpm s, plus une respiration en fin de phrase).
  let debuts = [], total = 0;
  const calcul = () => { debuts = []; total = 0; D.lignes.forEach((t) => { debuts.push(total); total += nbMots(t) * 60 / wpm + (/[.!?…]$/.test(t) ? 0.45 : 0.15); }); $('#wpm').textContent = wpm; };
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  let t = 0, etat = 'pret', dernier = 0, flux = null, rec = null, morceaux = [], prise = null, ctxAudio = null, analyseur = null, micOk = true;
  const tailleTexte = () => { document.documentElement.style.setProperty('--taille', taille + 'px'); };
  const place = () => {
    let k = 0; while (k + 1 < debuts.length && t >= debuts[k + 1]) k += 1;
    const fin = k + 1 < debuts.length ? debuts[k + 1] : total, f = Math.min(1, (t - debuts[k]) / Math.max(0.01, fin - debuts[k]));
    const h = els[k].offsetHeight, haut = els[k].offsetTop;
    defile.style.transform = 'translateY(' + (-(haut + h * f) + 0) + 'px)';
    els.forEach((e, i) => { e.classList.toggle('cour', i === k); e.classList.toggle('fait', i < k); });
    $('#chrono').textContent = fmt(t) + ' / ' + fmt(total);
  };
  const message = (m) => { $('#message').textContent = m || ''; };
  const regle = (e, ouvert) => { $('#libelle').textContent = e; $('#point').className = ouvert ? 'rec' : ''; };
  let raf = 0;
  const boucle = (now) => {
    if (etat === 'lit') { t = Math.min(total, t + (now - dernier) / 1000); dernier = now; place(); if (t >= total) { arreter(); return; } }
    if (analyseur) { const b = new Uint8Array(analyseur.fftSize); analyseur.getByteTimeDomainData(b); let m = 0; for (const v of b) m = Math.max(m, Math.abs(v - 128)); $('#jauge').style.width = Math.min(100, m / 128 * 140) + '%'; }
    raf = requestAnimationFrame(boucle);
  };
  const choixFormat = () => { for (const m of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } return ''; };
  async function ouvrirMicro() {
    if (flux) return true;
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('indisponible');
      flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      ctxAudio = new (window.AudioContext || window.webkitAudioContext)(); analyseur = ctxAudio.createAnalyser(); analyseur.fftSize = 512; ctxAudio.createMediaStreamSource(flux).connect(analyseur);
      return true;
    } catch (e) { micOk = false; return false; }
  }
  async function demarrer() {
    $('#prise').hidden = true; message('');
    const ok = await ouvrirMicro();
    if (!ok) { message('Micro refusé dans cette page : lis le texte ici, enregistre avec Dictaphone, puis dépose le fichier (Déposer un fichier).'); $('#go').textContent = '▶ Lire'; }
    t = 0; place();
    $('#compte').hidden = false;
    for (const n of [3, 2, 1]) { $('#compte').textContent = n; await new Promise((r) => setTimeout(r, 800)); }
    $('#compte').hidden = true;
    if (ok) { morceaux = []; const f = choixFormat(); rec = new MediaRecorder(flux, f ? { mimeType: f } : undefined); rec.ondataavailable = (e) => { if (e.data.size) morceaux.push(e.data); }; rec.onstop = fini; rec.start(1000); }
    etat = 'lit'; dernier = performance.now(); $('#go').textContent = '■ Stop'; $('#go').classList.add('rec'); $('#pause').hidden = false; $('#pause').textContent = 'Pause';
    regle(ok ? 'Enregistrement' : 'Lecture', ok);
  }
  function arreter() {
    if (etat === 'pret') return;
    etat = 'pret'; $('#go').classList.remove('rec'); $('#pause').hidden = true; $('#go').textContent = micOk ? '● Enregistrer' : '▶ Lire'; regle('Prêt', false);
    if (rec && rec.state !== 'inactive') rec.stop(); else $('#jauge').style.width = '0';
  }
  function fini() {
    const type = (rec && rec.mimeType) || 'audio/mp4';
    prise = new Blob(morceaux, { type }); $('#ecoute').src = URL.createObjectURL(prise); $('#prise').hidden = false; $('#etatprise').textContent = 'Prise de ' + fmt(t) + '. Écoute-la, puis envoie ou refais.'; $('#jauge').style.width = '0';
  }
  const ext = (b) => (/mp4|aac/.test(b.type) ? 'mp4' : 'webm');
  // La capacité « assets » n'accepte pas l'audio : on le dépose sous son conteneur (mp4 ou webm), ce que ffmpeg relit sans souci.
  async function envoyer(blob) {
    const a = await (window.claude && window.claude.use ? window.claude.use('assets') : null);
    if (!a) { $('#etatprise').textContent = 'Envoi impossible depuis cette page : utilise Télécharger.'; return; }
    const conteneur = /webm/.test(blob.type) ? 'video/webm' : 'video/mp4';
    $('#etatprise').textContent = 'Envoi…';
    try { const r = await a.upload(new Blob([blob], { type: conteneur })); $('#etatprise').textContent = 'Envoyé (' + (r.sizeBytes / 1e6).toFixed(1) + ' Mo). Écris « envoyé » à Claude dans la conversation.'; }
    catch (e) { $('#etatprise').textContent = 'Envoi refusé (' + ((e && (e.code || e.message)) || 'erreur') + '). Utilise Télécharger, puis envoie le fichier dans la conversation.'; }
  }
  $('#go').addEventListener('click', () => { if (etat === 'pret') demarrer(); else arreter(); });
  $('#pause').addEventListener('click', () => {
    if (etat === 'lit') { etat = 'pause'; if (rec && rec.state === 'recording') rec.pause(); $('#pause').textContent = 'Reprendre'; regle('Pause', false); }
    else if (etat === 'pause') { etat = 'lit'; dernier = performance.now(); if (rec && rec.state === 'paused') rec.resume(); $('#pause').textContent = 'Pause'; regle(rec ? 'Enregistrement' : 'Lecture', !!rec); }
  });
  $('#refaire').addEventListener('click', () => { prise = null; $('#prise').hidden = true; t = 0; place(); });
  $('#envoyer').addEventListener('click', () => { if (prise) envoyer(prise); });
  $('#telecharger').addEventListener('click', async () => {
    if (!prise) { $('#etatprise').textContent = 'Rien à télécharger : fais d’abord une prise.'; return; }
    const d = await (window.claude && window.claude.use ? window.claude.use('downloads') : null);
    if (!d) { $('#etatprise').textContent = 'Téléchargement indisponible ici.'; return; }
    try { await d.save({ filename: D.id + '-prise.' + ext(prise), data: prise }); } catch (e) { $('#etatprise').textContent = 'Téléchargement annulé.'; }
  });
  $('#fichier').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; prise = f; $('#ecoute').src = URL.createObjectURL(f); $('#prise').hidden = false; $('#etatprise').textContent = 'Fichier prêt (' + (f.size / 1e6).toFixed(1) + ' Mo). Envoie-le.'; });
  const regleV = (d) => { wpm = Math.max(80, Math.min(260, wpm + d)); memo.set('wpm', wpm); const f = total ? t / total : 0; calcul(); t = f * total; place(); };
  $('#moins').addEventListener('click', () => regleV(-10)); $('#plus').addEventListener('click', () => regleV(10));
  const regleT = (d) => { taille = Math.max(26, Math.min(64, taille + d)); memo.set('taille', taille); tailleTexte(); const f = total ? t / total : 0; place(); };
  $('#pm').addEventListener('click', () => regleT(-4)); $('#pp').addEventListener('click', () => regleT(4));
  defile.addEventListener('click', (e) => { const l = e.target.closest('.l'); if (l && etat !== 'lit') { t = debuts[+l.dataset.i]; place(); } });
  calcul(); tailleTexte(); place(); raf = requestAnimationFrame(boucle);
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();
</script>`;
  return { html, lignes: l };
}

module.exports = { construire, lignes };

if (require.main === module) {
  const racine = path.join(__dirname, '..');
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const sortieOpt = (process.argv.find((a) => a.startsWith('--sortie=')) || '').slice(9);
  if (!args.length) { console.error('Usage : node scripts/prompteur.js <id | texte libre> [--sortie=fichier.html]'); process.exit(1); }
  const arg = args.join(' ');
  const sources = [path.join(racine, 'videos/scripts', `${arg}.txt`), path.join(racine, 'videos/voix', arg, 'script.txt')];
  const fichier = sources.find((f) => /^[\w-]+$/.test(arg) && fs.existsSync(f));
  const id = fichier ? arg : 'libre';
  const texte = fichier ? fs.readFileSync(fichier, 'utf8') : arg;
  const { html, lignes: l } = construire({ id, texte });
  const sortie = sortieOpt || path.join(racine, 'videos/studio', `prompteur-${id}.html`);
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, html);
  console.log(`Prompteur écrit : ${path.relative(process.cwd(), sortie)} (${l.length} lignes, ${l.join(' ').split(/\s+/).length} mots).`);
}
