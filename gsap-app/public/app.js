/* global gsap, Flip, ScrollTrigger */
gsap.registerPlugin(Flip, ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) gsap.globalTimeline.timeScale(20);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const els = {
  form: $('#form'),
  formTitle: $('#form-title'),
  submit: $('#submit-btn'),
  cancel: $('#cancel-btn'),
  cards: $('#cards'),
  empty: $('#empty'),
  search: $('#search'),
  bars: $('#bars'),
  toast: $('#toast'),
};

let adherents = [];
const cardById = new Map();

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Erreur'), { data });
  return data;
}

// ---------------------------------------------------------------------------
// Animations d'intro
// ---------------------------------------------------------------------------
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(span);
  }
  return $$('.char', el);
}

function intro() {
  const chars = $$('.title .line').flatMap(splitChars);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from(chars, { yPercent: 110, opacity: 0, rotate: 8, duration: 0.8, stagger: 0.03 })
    .from('.subtitle', { opacity: 0, y: 10, duration: 0.5 }, '-=0.4')
    .from('.stat', { opacity: 0, y: 30, scale: 0.95, duration: 0.6, stagger: 0.08 }, '-=0.3')
    .from('.form-panel, .list-panel', { opacity: 0, y: 40, duration: 0.7, stagger: 0.12 }, '-=0.4')
    .from('.field', { opacity: 0, x: -20, duration: 0.4, stagger: 0.06 }, '-=0.5');

  // Bulles d'arrière-plan qui flottent en boucle
  $$('.blob').forEach((blob, i) => {
    gsap.to(blob, {
      x: () => gsap.utils.random(-150, 150),
      y: () => gsap.utils.random(-120, 120),
      scale: () => gsap.utils.random(0.8, 1.2),
      duration: 8 + i * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });
  });

  // Le graphique s'anime à l'arrivée dans la vue
  gsap.from('.chart-panel', {
    opacity: 0, y: 60, duration: 0.8,
    scrollTrigger: { trigger: '.chart-panel', start: 'top 90%' },
  });

  return tl;
}

// ---------------------------------------------------------------------------
// Statistiques (compteurs animés + barres)
// ---------------------------------------------------------------------------
async function refreshStats() {
  const stats = await api('/api/stats');

  $$('.stat .num').forEach((el) => {
    const target = stats[el.dataset.key];
    const obj = { v: Number(el.textContent) || 0 };
    if (obj.v === target) return;
    gsap.to(obj, {
      v: target,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
    gsap.fromTo(el, { scale: 1.3, color: '#19d3c5' }, { scale: 1, color: '#eef0ff', duration: 0.6 });
  });

  const entries = Object.entries(stats.parActivite).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  els.bars.innerHTML = entries.map(([act, n]) => `
    <div class="bar-row">
      <span>${escapeHtml(act)}</span>
      <div class="bar-track"><div class="bar-fill" data-ratio="${n / max}"></div></div>
      <strong>${n}</strong>
    </div>`).join('');

  gsap.to('.bar-fill', {
    scaleX: (_i, el) => el.dataset.ratio,
    duration: 1,
    ease: 'expo.out',
    stagger: 0.07,
    scrollTrigger: { trigger: els.bars, start: 'top 95%' },
  });
}

// ---------------------------------------------------------------------------
// Cartes (Flip pour réorganiser la grille de manière fluide)
// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function createCard(a) {
  const li = document.createElement('li');
  li.className = 'card';
  li.dataset.id = a.id;
  li.dataset.flipId = a.id;
  fillCard(li, a);

  // Effet d'inclinaison au survol avec quickTo
  const rotX = gsap.quickTo(li, 'rotationX', { duration: 0.4, ease: 'power2' });
  const rotY = gsap.quickTo(li, 'rotationY', { duration: 0.4, ease: 'power2' });
  gsap.set(li, { transformPerspective: 600 });
  li.addEventListener('pointermove', (e) => {
    const r = li.getBoundingClientRect();
    rotY(((e.clientX - r.left) / r.width - 0.5) * 14);
    rotX(-((e.clientY - r.top) / r.height - 0.5) * 14);
  });
  li.addEventListener('pointerleave', () => { rotX(0); rotY(0); });
  return li;
}

function fillCard(li, a) {
  const initiales = (a.prenom[0] + a.nom[0]).toUpperCase();
  const sexe = { F: '♀', M: '♂', A: '⚧' }[a.sexe] ?? '';
  li.innerHTML = `
    <div class="avatar">${escapeHtml(initiales)}</div>
    <div class="info">
      <div class="name">${escapeHtml(a.prenom)} ${escapeHtml(a.nom)}</div>
      <div class="tag">${sexe} ${escapeHtml(a.activite)}</div>
    </div>
    <div class="tools">
      <button class="icon-btn edit" title="Modifier" aria-label="Modifier">✎</button>
      <button class="icon-btn del" title="Supprimer" aria-label="Supprimer">✕</button>
    </div>`;
}

function render({ animate = true } = {}) {
  const q = els.search.value.trim().toLowerCase();
  const state = Flip.getState($$('.card', els.cards));

  for (const a of adherents) {
    let li = cardById.get(a.id);
    if (!li) {
      li = createCard(a);
      cardById.set(a.id, li);
    }
    const visible = !q || `${a.prenom} ${a.nom} ${a.activite}`.toLowerCase().includes(q);
    li.style.display = visible ? '' : 'none';
    els.cards.appendChild(li); // garde l'ordre des données
  }

  const anyVisible = $$('.card', els.cards).some((c) => c.style.display !== 'none');
  els.empty.hidden = anyVisible;

  if (!animate) return;
  Flip.from(state, {
    targets: $$('.card', els.cards),
    duration: 0.6,
    ease: 'power2.inOut',
    absolute: true,
    stagger: 0.02,
    onEnter: (elements) => gsap.fromTo(elements,
      { opacity: 0, scale: 0.6, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.05 }),
    onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.6, duration: 0.3 }),
  });
}

async function removeCard(id) {
  const li = cardById.get(id);
  await gsap.to(li, { opacity: 0, scale: 0.5, rotation: -8, duration: 0.35, ease: 'back.in(1.7)' });
  await api(`/api/adherents/${id}`, { method: 'DELETE' });
  const state = Flip.getState($$('.card', els.cards));
  li.remove();
  cardById.delete(id);
  adherents = adherents.filter((a) => a.id !== id);
  Flip.from(state, { duration: 0.5, ease: 'power2.inOut' });
  els.empty.hidden = adherents.length > 0;
  toast('Adhérent supprimé');
  refreshStats();
}

// ---------------------------------------------------------------------------
// Formulaire
// ---------------------------------------------------------------------------
function showErrors(errors = {}) {
  $$('.error', els.form).forEach((small) => {
    const msg = errors[small.dataset.for] ?? '';
    small.textContent = msg;
    const input = els.form.elements[small.dataset.for];
    input.classList.toggle('invalid', Boolean(msg));
    if (msg) gsap.fromTo(input, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  });
}

function setEditMode(a) {
  els.form.elements.id.value = a?.id ?? '';
  els.formTitle.textContent = a ? 'Modifier un adhérent' : 'Nouvel adhérent';
  els.submit.textContent = a ? 'Enregistrer' : 'Ajouter';
  els.cancel.hidden = !a;
  if (a) {
    for (const k of ['prenom', 'nom', 'sexe', 'activite']) els.form.elements[k].value = a[k];
  } else {
    els.form.reset();
  }
  showErrors();
  gsap.fromTo('.form-panel', { boxShadow: '0 0 0 0 rgba(124,92,255,.8)' },
    { boxShadow: '0 0 0 14px rgba(124,92,255,0)', duration: 0.8 });
}

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(els.form));
  const { id } = data;
  delete data.id;

  // Validation côté client
  const errors = {};
  for (const k of ['prenom', 'nom', 'activite']) {
    if (!data[k]?.trim()) errors[k] = 'Ce champ est obligatoire.';
  }
  if (Object.keys(errors).length) return showErrors(errors);

  gsap.fromTo(els.submit, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
  try {
    if (id) {
      const updated = await api(`/api/adherents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      adherents = adherents.map((a) => (a.id === id ? updated : a));
      const li = cardById.get(id);
      fillCard(li, updated);
      gsap.fromTo(li, { rotationY: 90 }, { rotationY: 0, duration: 0.6, ease: 'power2.out' });
      toast('Adhérent modifié');
    } else {
      const created = await api('/api/adherents', { method: 'POST', body: JSON.stringify(data) });
      adherents.push(created);
      els.search.value = '';
      render();
      toast(`Bienvenue ${created.prenom} !`);
    }
    setEditMode(null);
    refreshStats();
  } catch (err) {
    if (err.data?.errors) showErrors(err.data.errors);
    else toast(err.message);
  }
});

els.cancel.addEventListener('click', () => setEditMode(null));

els.cards.addEventListener('click', (e) => {
  const li = e.target.closest('.card');
  if (!li) return;
  if (e.target.closest('.del')) removeCard(li.dataset.id).catch((err) => toast(err.message));
  else if (e.target.closest('.edit')) {
    setEditMode(adherents.find((a) => a.id === li.dataset.id));
    if (window.innerWidth < 900) els.form.scrollIntoView({ behavior: 'smooth' });
  }
});

let searchTimer;
els.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => render(), 150);
});

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
let toastTl;
function toast(message) {
  els.toast.textContent = message;
  toastTl?.kill();
  toastTl = gsap.timeline()
    .to(els.toast, { yPercent: 0, duration: 0.5, ease: 'back.out(1.7)' })
    .to(els.toast, { yPercent: 250, duration: 0.4, ease: 'power2.in' }, '+=2');
}
gsap.set(els.toast, { xPercent: -50, yPercent: 250, autoAlpha: 1 });

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
(async function init() {
  const tl = intro();
  try {
    adherents = await api('/api/adherents');
    render({ animate: false });
    tl.from('.card', { opacity: 0, y: 30, scale: 0.9, duration: 0.5, stagger: 0.06, ease: 'back.out(1.5)' }, '-=0.3');
    refreshStats();
  } catch {
    toast('Impossible de contacter le serveur');
  }
})();
