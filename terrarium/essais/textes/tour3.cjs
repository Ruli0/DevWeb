// Tour de texte 3 : 4 propositions (taille, place, style), sur deux images de la démo.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const HTML = require('path').join(__dirname, '../../videos/studio/demo/index.html'); // après npm run video -- demo
const BASE = `.invite { display: none; } .ligne-texte { left: 60px; width: 880px; top: 200px; text-align: center; }`;
const V = {
  a: { nom: 'A · Bulle', fonte: 'Fredoka:wght@700', css: `.ligne { font: 700 112px/1.04 "Fredoka", sans-serif; color: #fff; -webkit-text-stroke: 14px #050b12; paint-order: stroke fill; text-shadow: 0 6px 18px rgba(0,0,0,.7); }
      .c.acc { color: #b6ff5c; text-shadow: 0 0 18px rgba(182,255,92,.7), 0 6px 18px rgba(0,0,0,.7); } .chevron { display: none; } .c.cur { background: #fff; }` },
  b: { nom: 'B · Titre phonk', fonte: 'Rubik:ital,wght@1,900', css: `.ligne { font: italic 900 104px/1.0 "Rubik", sans-serif; text-transform: uppercase; letter-spacing: -0.01em; color: #fff; text-shadow: 0 0 2px #000, 5px 5px 0 #050b12, 0 10px 26px rgba(0,0,0,.8); }
      .c.acc { color: #b6ff5c; text-shadow: 0 0 2px #000, 5px 5px 0 #050b12, 0 0 24px rgba(182,255,92,.6); } .chevron { display: none; } .c.cur { background: #b6ff5c; }` },
  c: { nom: 'C · Écran de Mousse XXL', fonte: 'Space+Mono:wght@700', css: `.invite { display: block; left: 0; width: 1080px; text-align: center; top: 196px; font-size: 26px; color: rgba(255,198,92,.75); }
      .ligne-texte { top: 236px; } .ligne { display: inline-block; padding: 18px 30px 22px; border-radius: 22px; background: rgba(5,11,18,.82); border: 3px solid rgba(255,198,92,.7); box-shadow: 0 0 30px rgba(255,198,92,.35);
        font: 700 80px/1.15 "Space Mono", monospace; color: #fff3dd; text-shadow: 0 0 10px rgba(255,198,92,.5); }
      .c.acc { color: #ffc65c; text-shadow: 0 0 14px rgba(255,198,92,.9); } .chevron { color: #ffc65c; } .c.cur { background: #ffc65c; }` },
  d: { nom: 'D · Lettres lumineuses', fonte: 'Baloo+2:wght@800', css: `.ligne { font: 800 118px/0.98 "Baloo 2", sans-serif; color: #c9ff8a; -webkit-text-stroke: 10px #03080d; paint-order: stroke fill; text-shadow: 0 0 22px rgba(141,255,106,.85), 0 0 4px rgba(141,255,106,.9); }
      .c.acc { color: #9af8ff; text-shadow: 0 0 24px rgba(94,242,255,.95), 0 0 4px rgba(94,242,255,.9); } .chevron { display: none; } .c.cur { background: #c9ff8a; }` },
};
(async () => {
  const b = await chromium.launch(); const images = [];
  for (const [k, v] of Object.entries(V)) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    await p.goto('file://' + HTML);
    await p.waitForFunction(() => !!window.__timelines, null, { timeout: 8000 });
    await p.addStyleTag({ url: `https://fonts.googleapis.com/css2?family=${v.fonte}&display=block` });
    await p.addStyleTag({ content: BASE + v.css });
    await p.evaluate(() => document.fonts.ready.then(() => true));
    await p.waitForTimeout(800);
    for (const t of [1.4, 8.3]) {
      await p.evaluate((t) => { Object.values(window.__timelines)[0].seek(t, false); document.querySelectorAll('.clip').forEach((c) => { const s = +c.dataset.start; c.style.display = t >= s && t < s + +c.dataset.duration ? '' : 'none'; }); }, t);
      const f = `/tmp/${k}-${t}.png`; await p.screenshot({ path: f }); images.push(f);
    }
    await p.close();
  }
  await b.close();
  const n = images.length;
  execSync(`ffmpeg -v error -y ${images.map((f) => `-i ${f}`).join(' ')} -filter_complex "${images.map((_, i) => `[${i}:v]scale=432:768[v${i}]`).join(';')};${images.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${n}:layout=${images.map((_, i) => `${(i % 4) * 432}_${Math.floor(i / 4) * 768}`).join('|')}" ${__dirname}/planche-textes3.png`);
  console.log('ok');
})();
