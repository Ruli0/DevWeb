/*
 * Recalage des dates de mots sur le signal sonore.
 *   recaler(voix) → une copie de la voix (mots.json) où les mots datés à l'intérieur d'un silence sont ramenés à la parole réelle.
 * Pourquoi : Whisper date parfois un mot dans un blanc (un « c'est » daté 0,7 s trop tôt à côté d'un silence inséré, des mots voisins datés au même
 * endroit). Les sous-titres et les révélations d'un jeu de mots fléchés partaient alors avant la voix. Règle : un mot dont le début tombe dans un
 * silence d'au moins 0,3 s est ramené à la fin de ce silence ; un mot dont la fin tombe dans un tel silence est ramené au début de ce silence.
 * Fonction pure, sans effet sur la voix d'origine ; voix.silences : [[début, fin]] en secondes de la voix d'origine.
 */
'use strict';
const MINI = 0.3, MARGE = 0.02;

function recaler(voix) {
  const sil = (voix.silences || []).filter(([a, b]) => b - a >= MINI);
  const mots = voix.mots.map((m) => {
    let { d, f } = m;
    const dedans = (x) => sil.find(([a, b]) => x > a + MARGE && x < b - MARGE);
    const sd = dedans(d); if (sd) d = sd[1];
    const sf = dedans(f); if (sf && sf[0] > d + 0.04) f = sf[0];
    if (f < d + 0.05) f = +(d + 0.05).toFixed(2);
    return Object.assign({}, m, { d: +d.toFixed(2), f: +f.toFixed(2) });
  });
  return Object.assign({}, voix, { mots });
}

// La fin de la phrase de réponse : le début du silence qui la suit (si elle est isolée, c'est-à-dire à moins de 1,3 s de l'ancre) ; sinon une estimation
// (le plus tard de la fin datée par Whisper et de 0,45 s après le début, au plus 1,4 s) et isolee = false.
function finParole(voix, mot) {
  const sil = (voix.silences || []).filter(([a, b]) => b - a >= 0.16 && a > mot.d + 0.05).sort((x, y) => x[0] - y[0]);
  if (sil.length && sil[0][0] - mot.d <= 1.3) return { fin: sil[0][0], isolee: true };
  const e = sil.length ? sil[0][0] : voix.duree;
  return { fin: Math.min(e, mot.d + 1.4, Math.max(mot.f, mot.d + 0.45)), isolee: false };
}

module.exports = { recaler, finParole };
