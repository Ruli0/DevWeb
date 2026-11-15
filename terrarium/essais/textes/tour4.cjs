// Tour de texte 4 : quatre variantes du style D (lettres lumineuses), sur deux images de la démo.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const HTML = require('path').join(__dirname, '../../videos/studio/demo/index.html'); // après npm run video -- demo
const BASE = `.invite { display: none; } .ligne-texte { left: 60px; width: 880px; top: 200px; text-align: center; }`;
const ACC = '.c.acc { color: #9af8ff; text-shadow: 0 0 24px rgba(94,242,255,.95), 0 0 4px rgba(94,242,255,.9); } .chevron { display: none; } .c.cur { background: #c9ff8a; }';
const D = `font: 800 118px/0.98 "Baloo 2", sans-serif; color: #c9ff8a; -webkit-text-stroke: 10px #03080d; paint-order: stroke fill; text-shadow: 0 0 22px rgba(141,255,106,.85), 0 0 4px rgba(141,255,106,.9);`;
const V = {
  // 1. Le mot clé énorme, sur sa propre ligne.
  d1: { fonte: 'Baloo+2:wght@800', css: `.ligne { ${D} font-size: 108px; } .mot.acc { display: block; font-size: 176px; line-height: 0.95; } .c.fin { display: none; } .c.acc { color: #9af8ff; text-shadow: 0 0 30px rgba(94,242,255,1), 0 0 6px rgba(94,242,255,.9); } .chevron { display: none; } .c.cur { background: #c9ff8a; }` },
  // 2. Néon : cœur blanc, halo vert large.
  d2: { fonte: 'Baloo+2:wght@800', css: `.ligne { font: 800 124px/0.98 "Baloo 2", sans-serif; color: #fbfff6; -webkit-text-stroke: 6px #0a3a16; paint-order: stroke fill; text-shadow: 0 0 8px #b6ff5c, 0 0 26px #8dff6a, 0 0 60px rgba(141,255,106,.8), 0 0 110px rgba(141,255,106,.5); }
      .c.acc { color: #fbfeff; -webkit-text-stroke: 6px #063040; text-shadow: 0 0 8px #9af8ff, 0 0 26px #5ef2ff, 0 0 60px rgba(94,242,255,.85), 0 0 110px rgba(94,242,255,.5); } .chevron { display: none; } .c.cur { background: #fbfff6; }` },
  // 3. Sur un bandeau sombre flou : le texte se détache toujours de l'image.
  d3: { fonte: 'Baloo+2:wght@800', css: `.ligne { ${D} display: inline-block; padding: 26px 40px 30px; border-radius: 48px; background: rgba(2,6,10,.72); box-shadow: 0 0 40px 30px rgba(2,6,10,.55); } ${ACC}` },
  // 4. Autocollant : le mot clé penché, plus gros, dans une pastille.
  d4: { fonte: 'Baloo+2:wght@800', css: `.ligne { ${D} line-height: 1.2; } .mot.acc { transform: rotate(-5deg) scale(1.12); margin: 22px 10px 0; } .c.acc { color: #03080d; -webkit-text-stroke: 0; text-shadow: none; background: #9af8ff; box-shadow: 0 0 26px rgba(94,242,255,.7); }
      .c.acc:first-child { border-radius: 24px 0 0 24px; padding-left: 16px; } .c.acc:last-child { border-radius: 0 24px 24px 0; padding-right: 16px; } .chevron { display: none; } .c.cur { background: #c9ff8a; }` },
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
  execSync(`ffmpeg -v error -y ${images.map((f) => `-i ${f}`).join(' ')} -filter_complex "${images.map((_, i) => `[${i}:v]scale=432:768[v${i}]`).join(';')};${images.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${n}:layout=${images.map((_, i) => `${(i % 4) * 432}_${Math.floor(i / 4) * 768}`).join('|')}" ${__dirname}/planche-textes4.png`);
  console.log('ok');
})();
