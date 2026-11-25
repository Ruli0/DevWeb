/*
 * Fonds 3D des jeux (Three.js, shader plein écran) : une vraie scène calculée pixel par pixel, rendue à mi-résolution
 * (540 × 960, agrandie) pour tenir le rendu sans carte graphique (~0,45 s par image).
 *   mirage(canvas, L) : le même désert, horizon plus haut, avec un mirage (fausse eau qui reflète le ciel, oasis tremblante).
 *   desert(canvas, L) → { maj(t) } : désert au coucher du soleil, caméra qui avance au-dessus des dunes en suivant le relief,
 *   soleil et rayons à l'horizon, brume de chaleur, grains qui scintillent. Tout est périodique sur L secondes (le terrain
 *   se répète en profondeur, la caméra avance d'une période) : la boucle de la vidéo reste parfaite.
 * Rendu déterministe : l'image ne dépend que de t (aucune minuterie, aucun hasard non reproductible).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.fond3d = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function desert(canvas, L, opts) {
  const MIR = !!(opts && opts.mirage);
  const W = canvas.width, H = canvas.height;
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const U = { uT: { value: 0 }, uL: { value: L }, uR: { value: new THREE.Vector2(W, H) }, uRev: { value: 0 }, uOnd: { value: 0 } };
  const frag = `${MIR ? '#define MIRAGE' : ''}
precision highp float;
uniform float uT, uL, uRev, uOnd; uniform vec2 uR;
#define PI 3.14159265
const float PZ = 48.0;               // période du terrain en profondeur
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p, float per){     // bruit de valeur, périodique en y de période per (en cellules)
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  float y0 = mod(i.y, per), y1 = mod(i.y + 1.0, per);
  float a = hash(vec2(i.x, y0)), b = hash(vec2(i.x+1.0, y0)), c = hash(vec2(i.x, y1)), d = hash(vec2(i.x+1.0, y1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float gZ = 0.0;                      // position de la caméra en profondeur (pour aplanir le lointain du mirage)
float terrain(vec2 xz){
  // Dunes : crêtes allongées en travers du vent (étirées en x), adoucies ; deux octaves seulement (pas de montagnes).
  vec2 p = vec2(xz.x / 9.0, xz.y / 6.0); float per = PZ / 6.0;
  float h = 0.0, a = 1.0;
  for (int k = 0; k < 3; k++) { float n = vnoise(p + vec2(13.0*float(k), 0.0), per); float r = 1.0 - abs(2.0*n - 1.0); h += a * r * r; p *= 2.0; per *= 2.0; a *= 0.3; }
  h = smoothstep(0.0, 1.3, h) * 1.25;
  h += 0.018 * sin(xz.x * 9.0 + xz.y * 2.0 + 4.0 * vnoise(xz*0.5, PZ*0.5));   // rides du vent
#ifdef MIRAGE
  h *= 1.0 - 0.92 * smoothstep(9.0, 20.0, xz.y - gZ);   // au loin, une plaine presque plate : c'est là que naît le mirage
#endif
  return h;
}
vec3 horizon(vec3 rd){
  float y = clamp(rd.y, -0.1, 1.0);
  vec3 c = mix(vec3(1.0, 0.56, 0.26), vec3(0.62, 0.24, 0.42), smoothstep(0.0, 0.12, y));
  return mix(c, vec3(0.16, 0.08, 0.26), smoothstep(0.1, 0.42, y));
}
vec3 ciel(vec3 rd, vec3 sd){
  vec3 c = horizon(rd);
  float s = max(dot(rd, sd), 0.0);
  c += vec3(1.0, 0.62, 0.3) * pow(s, 24.0) * 0.45 + vec3(1.0, 0.8, 0.55) * pow(s, 220.0) * 0.9;   // halo
  c += vec3(1.0, 0.93, 0.8) * smoothstep(0.99955, 0.99975, s) * 1.6;                              // disque net
  float ang = atan(rd.x - sd.x, rd.y - sd.y);
  c += vec3(1.0, 0.7, 0.45) * (0.5 + 0.5 * sin(ang * 22.0 + 2.0 * PI * uT / uL)) * pow(s, 6.0) * 0.07;   // rayons discrets
  return c;
}
#ifdef MIRAGE
// Un palmier en silhouette dans le plan (azimut, élévation) : tronc courbé et six palmes en arc. Renvoie la couverture (0 à 1).
float seg(vec2 p, vec2 a, vec2 b, float w){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return smoothstep(w, w * 0.4, length(pa - ba * h)); }
vec2 palmier(vec2 q, float hgt, float pench){   // (tronc, palmes)
  float tr = 0.0, fr = 0.0; vec2 top = vec2(pench * hgt, hgt);
  for (int i = 0; i < 5; i++) { float a = float(i) / 5.0, b = float(i + 1) / 5.0;      // tronc courbé, plus épais en bas
    tr = max(tr, seg(q, vec2(pench * hgt * a * a, hgt * a), vec2(pench * hgt * b * b, hgt * b), (0.0034 - 0.0012 * a) * hgt / 0.08)); }
  for (int k = 0; k < 8; k++) {                                                            // palmes pleines qui retombent
    float dir = (float(k) - 3.5) / 3.5, lg = hgt * (0.55 + 0.15 * abs(sin(float(k) * 1.7)));
    vec2 p0 = top;
    for (int j = 0; j < 5; j++) { float u = float(j + 1) / 5.0;
      vec2 p1 = top + vec2(dir * lg * u * 0.95, lg * (0.55 * u - 1.05 * u * u * (0.45 + 0.55 * abs(dir))));   // arc : monte puis retombe
      fr = max(fr, seg(q, p0, p1, (0.0058 * (1.0 - 0.8 * u) + 0.0009) * hgt / 0.08)); p0 = p1; }
  }
  fr = max(fr, smoothstep(0.006, 0.003, length(q - top) * 0.08 / hgt));                    // cœur
  return vec2(tr, fr);
}
// L'oasis : trois palmiers. Mirage (uRev = 0) : petits, au loin, en silhouette. Réelle (uRev = 1) : 2,2 fois plus grands.
// La chaleur les fait onduler (plus fort quand le mirage devient réel ou s'évanouit : uOnd).
vec2 oasis(vec2 ae, float t){
  float S = mix(1.0, 1.55, uRev), c0 = 0.115, c1 = mix(0.115, 0.128, uRev);
  vec2 q = vec2((ae.x - c1) / S + c0, ae.y / S);
  q.x += 0.0009 * sin(ae.y * 170.0 + 2.0 * PI * 5.0 * t / uL) + 0.0006 * sin(ae.y * 60.0 - 2.0 * PI * 3.0 * t / uL) + uOnd * sin(ae.y * 45.0 + 2.0 * PI * 9.0 * t / uL);   // uOnd : ondulation lente et ample (apparition, dissolution)
  vec2 c = palmier(q - vec2(0.075, 0.0), 0.075, 0.16);
  c = max(c, palmier(q - vec2(0.118, 0.0), 0.098, -0.12));
  c = max(c, palmier(q - vec2(0.152, 0.0), 0.062, 0.2));
  return c;
}
#endif
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uR) / uR.y;
  float speed = PZ / uL, z = speed * uT;
  gZ = z;
  float cx = 0.6 * sin(2.0*PI*uT/uL);
  float sol = max(max(terrain(vec2(cx, z)), terrain(vec2(cx, z + 1.5))), terrain(vec2(cx, z + 3.0)));   // la caméra suit le relief
  vec3 ro = vec3(cx, sol + 0.75 + 0.06 * sin(4.0*PI*uT/uL), z);
  float yaw = 0.05 * sin(2.0*PI*uT/uL);
  vec3 fw = normalize(vec3(sin(yaw), 0.0, cos(yaw))), rt = normalize(cross(vec3(0,1,0), fw)), up = cross(fw, rt);
  vec2 hz = uv + vec2(0.0, 0.0015 * sin(uv.x * 90.0 + 2.0*PI*3.0*uT/uL) * smoothstep(0.1, -0.05, uv.y));   // brume de chaleur
#ifdef MIRAGE
  vec3 rd = normalize(fw * 1.25 + rt * hz.x + up * (hz.y - 0.04));   // horizon plus haut (vers 46 %), entre le chrono et la grille
#else
  vec3 rd = normalize(fw * 1.25 + rt * hz.x + up * (hz.y + 0.03));   // horizon vers 53 % de la hauteur
#endif
  vec3 sd = normalize(vec3(0.2, 0.035, 1.0));   // soleil couchant, à droite, juste au-dessus de l'horizon
  float t = 0.3, hit = -1.0;
  for (int i = 0; i < 70; i++) { vec3 p = ro + rd * t; float d = p.y - terrain(p.xz); if (d < 0.004 * t) { hit = t; break; } t += max(0.02, d * 0.5); if (t > 70.0) break; }
  vec3 col = ciel(rd, sd);
  if (hit > 0.0) {
    vec3 p = ro + rd * hit; vec2 e = vec2(0.02, 0.0);
    vec3 n = normalize(vec3(terrain(p.xz - e.xy) - terrain(p.xz + e.xy), 2.0 * e.x, terrain(p.xz - e.yx) - terrain(p.xz + e.yx)));
    vec3 cle = normalize(vec3(-0.7, 0.55, -0.25));                          // lumière dorée de côté (faces éclairées)
    float dif = clamp(dot(n, cle), 0.0, 1.0); dif = dif * dif * (3.0 - 2.0 * dif);
    float contre = pow(clamp(dot(n, sd) + 0.25, 0.0, 1.0), 2.0) * pow(max(dot(rd, sd), 0.0), 3.0);   // contre-jour sur les crêtes
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
    vec3 ombre = vec3(0.22, 0.09, 0.24), lumiere = vec3(1.05, 0.66, 0.34);
    vec3 sable = mix(ombre, lumiere, dif) + vec3(1.0, 0.72, 0.4) * (contre * 1.4 + rim * 0.25);
    sable *= 0.96 + 0.04 * sin(p.x * 9.0 + p.z * 2.0 + 3.0 * vnoise(p.xz * 0.5, PZ * 0.5));   // rides discrètes
    float g = hash(floor(p.xz * 30.0)); float tw = 0.5 + 0.5 * sin(2.0*PI*(uT/uL*6.0 + g*10.0));
    sable += vec3(1.0, 0.9, 0.7) * step(0.993, g) * (dif + contre) * tw * 1.5;                 // grains qui scintillent
    vec3 rh = normalize(vec3(rd.x, 0.0, rd.z));
    vec3 cb = horizon(vec3(rh.x, 0.01, rh.z)) + vec3(1.0, 0.6, 0.3) * pow(max(dot(rh, normalize(vec3(sd.x, 0.0, sd.z))), 0.0), 16.0) * 0.25;
    col = mix(sable, cb, 1.0 - exp(-hit * 0.03));
  }
#ifdef MIRAGE
  // Le mirage : juste sous l'horizon, une fausse eau qui reflète le ciel et le soleil (vaguelettes, scintillement),
  // et l'oasis de palmiers au-dessus avec son reflet inversé. Visible seulement là où le relief laisse voir loin.
  {
    float az = atan(rd.x, rd.z) - yaw, el = rd.y, loin = hit < 0.0 ? 1.0 : smoothstep(9.0, 18.0, hit);
    float bat = 0.82 + 0.18 * sin(2.0 * PI * 2.0 * uT / uL) * sin(az * 37.0 + 2.0 * PI * uT / uL);   // le mirage respire
    float bande = smoothstep(-0.06, -0.03, el) * smoothstep(0.004, -0.002, el) * loin * bat;
    if (bande > 0.0) {
      float vag = 0.0035 * sin(az * 160.0 + 2.0 * PI * 4.0 * uT / uL) + 0.002 * sin(az * 410.0 - 2.0 * PI * 3.0 * uT / uL);
      vec3 rr = normalize(vec3(rd.x, -el * 1.6 + 0.004 + vag, rd.z));
      vec3 eau = ciel(rr, sd) * vec3(0.78, 0.95, 1.18) + vec3(0.25, 0.45, 0.6) * 0.12;
      eau += vec3(1.0, 0.9, 0.7) * pow(max(dot(normalize(vec3(rr.x, rr.y, rr.z)), sd), 0.0), 400.0) * 1.2;   // reflet du soleil
      vec2 ro2 = oasis(vec2(az, -el * 1.6 + 0.004 + vag), uT); eau = mix(eau, eau * (1.0 - 0.75 * max(ro2.x, ro2.y)), 0.8 * (1.0 - uRev));              // reflet des palmiers
      eau *= 1.0 + 0.12 * sin(el * 900.0 + 2.0 * PI * 6.0 * uT / uL);   // lignes de scintillement
      col = mix(col, eau, bande * 0.9);
    }
    // L'oasis réelle (uRev) : un lac turquoise sous les palmiers, avec reflets et éclats de soleil, et des buissons sur la rive.
    float lc = mix(0.115, 0.128, uRev), dl = (az - lc) / 0.17, prof = 0.012 + 0.1 * uRev;
    float lac = uRev * smoothstep(1.0, 0.82, length(vec2(dl, el / prof * 0.9))) * step(el, 0.0);
    if (lac > 0.0) {
      float vg = 0.002 * sin(az * 220.0 + 2.0 * PI * 3.0 * uT / uL) + 0.0012 * sin(az * 530.0 - 2.0 * PI * 5.0 * uT / uL);
      vec3 rr = normalize(vec3(rd.x, -el + vg, rd.z));
      float fres = 0.25 + 0.75 * pow(1.0 - clamp(-el * 12.0, 0.0, 1.0), 3.0);
      vec3 eauR = mix(vec3(0.04, 0.42, 0.48), ciel(rr, sd) * vec3(0.95, 1.0, 1.05), fres);
      vec2 rp = oasis(vec2(az, -el + vg), uT);
      eauR = mix(eauR, vec3(0.06, 0.16, 0.08), 0.75 * max(rp.x, rp.y));                           // reflet des palmiers
      float gl = hash(floor(vec2(az * 700.0, el * 1600.0 + floor(uT / uL * 40.0) * 3.0)));
      eauR += vec3(1.0, 0.9, 0.6) * step(0.985, gl) * pow(max(dot(rr, sd), 0.0), 6.0) * 2.5;      // éclats de soleil
      col = mix(col, eauR, lac);
    }
    float rive = uRev * smoothstep(1.05, 0.9, abs(dl)) * smoothstep(0.003 + 0.012 * vnoise(vec2(az * 90.0, 0.0), 1000.0) * uRev, 0.0, el) * step(-0.004, el);
    col = mix(col, mix(vec3(0.07, 0.25, 0.08), vec3(0.35, 0.55, 0.15), vnoise(vec2(az * 300.0, el * 300.0), 1000.0)), rive * 0.95);   // buissons
    vec2 pv = oasis(vec2(az, el), uT) * smoothstep(-0.003, 0.002, el) * max(loin, uRev);
    vec3 silh = mix(vec3(0.12, 0.04, 0.16), horizon(vec3(rd.x, 0.02, rd.z)), 0.22);
    float lum = pow(max(dot(normalize(vec3(rd.x, 0.0, rd.z)), normalize(vec3(sd.x, 0.0, sd.z))), 0.0), 40.0);
    vec3 tronc = mix(vec3(0.2, 0.1, 0.05), vec3(0.62, 0.36, 0.16), lum) * (0.82 + 0.18 * sin(el * 900.0));   // anneaux du tronc
    float foli = 0.5 + 0.5 * sin(az * 640.0 + el * 420.0 + 2.0 * sin(az * 90.0));                                                  // folioles
    vec3 palme = mix(vec3(0.02, 0.17, 0.05), vec3(0.16, 0.46, 0.1), 0.55 + 0.45 * foli) * (0.85 + 0.3 * smoothstep(0.02, 0.2, el))
               + vec3(1.0, 0.7, 0.25) * lum * 0.9 * foli;                                                       // contre-jour doré
    col = mix(col, mix(silh, tronc, uRev), pv.x);
    col = mix(col, mix(silh, palme, uRev), pv.y);
    // lucioles dorées autour de l'oasis
    if (uRev > 0.0) for (int k = 0; k < 18; k++) {
      float fk = float(k), ph = 2.0 * PI * (uT / uL * (1.0 + mod(fk, 3.0)) + hash(vec2(fk, 1.0)));
      vec2 lp = vec2(lc + (hash(vec2(fk, 2.0)) - 0.5) * 0.26 + 0.01 * sin(ph), 0.01 + hash(vec2(fk, 3.0)) * 0.17 + 0.008 * cos(ph * 1.3));
      float dd = length(vec2(az, el) - lp);
      col += vec3(1.0, 0.82, 0.4) * uRev * (exp(-dd * dd / 0.0000035) * 1.4 + exp(-dd * dd / 0.00004) * 0.25) * (0.6 + 0.4 * sin(ph * 2.0));
    }
    col *= mix(vec3(1.0), vec3(1.07, 1.0, 0.9), uRev);   // lumière plus chaude
  }
#endif
  col = 1.0 - exp(-col * 1.35); col = pow(col, vec3(0.95)); col *= 1.0 - 0.3 * dot(uv, uv);   // étalonnage doux + vignette                       // vignette
  gl_FragColor = vec4(col, 1.0);
}`;
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }', fragmentShader: frag })));
  // Révélation de l'oasis (mirage seulement) : montée en 0,5 s à opts.revel, maintien, dissolution de 0,8 s finie à opts.fin.
  const O = opts || {}, lis = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const rev = (t) => (O.revel == null ? 0 : lis((t - O.revel) / 0.5) * (1 - lis((t - O.fin + 0.8) / 0.8)));
  const ond = (t) => (O.revel == null ? 0 : 0.004 * Math.exp(-(((t - O.revel - 0.2) / 0.25) ** 2)) + 0.006 * lis((t - O.fin + 0.9) / 0.6) * (1 - lis((t - O.fin) / 0.15)));
  return { maj(t) { U.uT.value = t; U.uRev.value = rev(t); U.uOnd.value = ond(t); r.render(sc, cam); } };
}

  /*
   * L'iceberg : vue en coupe d'un immense iceberg, de la surface (ciel polaire, pointe qui dépasse) jusqu'aux abysses.
   *   iceberg(canvas, L, opts) ; opts : { t0 (décalage dans la vidéo complète), L (durée de la boucle complète),
   *   prof : [[t, profondeur], …] (instants de la vidéo complète ; profondeur 0 = surface … 4 = abysses) }.
   * Tout dépend du temps global (t + t0) : plusieurs rendus mis bout à bout se raccordent exactement.
   */
  function iceberg(canvas, Lloc, opts) {
    const O = opts || {}, W = canvas.width, H = canvas.height, LG = O.L || Lloc, T0 = O.t0 || 0, K = O.prof || [[0, 0]];
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(W, H, false);
    const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const U = { uT: { value: 0 }, uL: { value: LG }, uR: { value: new THREE.Vector2(W, H) }, uP: { value: 0 } };
    const frag = `
precision highp float;
uniform float uT, uL, uP; uniform vec2 uR;
#define PI 3.14159265
const float NIV = 7.0;                       // mètres (unités) par étage
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float vn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i), hash3(i+vec3(1,0,0)), f.x), mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), f.x), mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), f.x), f.y), f.z); }
// L'iceberg : un grand corps allongé vers le bas, élargi sous l'eau, taillé en facettes (plans) et bosselé.
float berg(vec3 p){
  vec3 c = vec3(3.0, -13.0, 11.0);
  vec3 q = p - c;
  float w = 4.2 + 1.6 * smoothstep(2.0, -8.0, p.y) - 2.2 * smoothstep(-14.0, -30.0, p.y);   // plus large sous l'eau, s'affine en bas
  float d = length(vec2(q.x, q.z) / vec2(w, w * 0.9)) - 1.0;
  d = max(d * w * 0.8, max(p.y - 3.4 + 0.25 * q.x * q.x, -31.0 - p.y));                     // pointe émergée et fond
  d = max(d, dot(q, normalize(vec3(0.6, 0.15, -0.78))) - 3.3);                               // facettes
  d = max(d, dot(q, normalize(vec3(-0.75, -0.1, -0.65))) - 3.6);
  d = max(d, dot(q, normalize(vec3(0.2, 0.55, -0.8))) - 6.0);
  d += 0.35 * vn3(p * 0.7) + 0.12 * vn3(p * 2.1);
  return d;
}
vec3 eauCouleur(float y){                     // couleur de l'eau selon la profondeur
  vec3 c = mix(vec3(0.08, 0.42, 0.55), vec3(0.03, 0.16, 0.32), smoothstep(-1.0, -12.0, y));
  c = mix(c, vec3(0.01, 0.05, 0.14), smoothstep(-10.0, -21.0, y));
  return mix(c, vec3(0.0, 0.012, 0.04), smoothstep(-19.0, -28.0, y));
}
vec3 ciel(vec3 rd){                         // crépuscule polaire : orange-rose à l'horizon, bleu profond en haut
  float y = max(rd.y, 0.0);
  vec3 c = mix(vec3(1.0, 0.62, 0.42), vec3(0.85, 0.5, 0.62), smoothstep(0.0, 0.08, y));
  c = mix(c, vec3(0.35, 0.42, 0.8), smoothstep(0.06, 0.25, y));
  c = mix(c, vec3(0.1, 0.14, 0.38), smoothstep(0.2, 0.6, y));
  float s = max(dot(rd, normalize(vec3(-0.55, 0.04, 1.0))), 0.0);
  return c + vec3(1.0, 0.7, 0.45) * pow(s, 18.0) * 0.5 + vec3(1.0, 0.85, 0.65) * pow(s, 900.0) * 2.0;
}
vec3 glace(vec3 p, vec3 n, vec3 rd, float sous){
  float haut = exp(min(p.y, 0.0) * 0.085);                                 // lumière qui baisse avec la profondeur
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  float fente = smoothstep(0.035, 0.0, abs(vn3(p * vec3(1.4, 0.25, 1.4)) - 0.5));   // fines crevasses verticales
  if (sous < 0.5) {                                                          // au-dessus de l'eau : blanc éclatant, ombres bleues, soleil chaud
    float dif = max(dot(n, normalize(vec3(-0.55, 0.3, -1.0))), 0.0);
    vec3 c = mix(vec3(0.45, 0.62, 0.9), vec3(1.0, 0.94, 0.88), dif) + vec3(1.0, 0.6, 0.4) * pow(dif, 6.0) * 0.4;
    return c * (1.0 - 0.1 * fente) + vec3(0.8, 0.9, 1.0) * fres * 0.35;
  }
  float dif = 0.35 + 0.65 * max(dot(n, normalize(vec3(-0.3, 1.0, -0.4))), 0.0);   // lumière venue de la surface
  vec3 c = mix(vec3(0.06, 0.35, 0.6), vec3(0.45, 0.88, 1.0), dif) * haut;
  c *= 1.0 - 0.2 * fente;
  c += vec3(0.5, 0.95, 1.0) * fres * (0.25 + 0.5 * haut);                   // arêtes claires
  c += vec3(0.1, 0.6, 0.8) * 0.3 * haut * pow(vn3(p * 1.3 + vec3(0.0, uT / uL * 6.2832, 0.0)), 3.0);   // lueur intérieure
  c += vec3(0.1, 0.9, 0.85) * fres * 0.35 * smoothstep(-16.0, -26.0, p.y);    // aux abysses, les arêtes luisent
  return c;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uR) / uR.y;
  float tt = 2.0 * PI * uT / uL;
  vec3 ro = vec3(-1.6 + 0.25 * sin(tt), 0.35 - uP * NIV, 0.0);
  vec3 rd = normalize(vec3(uv.x * 1.15, uv.y * 1.15 - 0.06, 1.0));
  // L'iceberg
  float t = 0.5, hit = -1.0;
  for (int i = 0; i < 64; i++) { float d = berg(ro + rd * t); if (d < 0.01 * t) { hit = t; break; } t += d * 0.75; if (t > 45.0) break; }
  float tS = abs(rd.y) > 1e-4 ? -ro.y / rd.y : -1.0;                        // la surface de l'eau (y = 0)
  vec3 col;
  float yProche = ro.y + rd.y * 0.6;                                         // la ligne d'eau balaie l'écran quand la caméra la traverse
  bool camSous = yProche < 0.0 || (ro.y < 0.0 && tS < 0.0);
  if (!camSous) {
    if (rd.y > 0.0 || (hit > 0.0 && (tS < 0.0 || hit < tS))) {
      col = ciel(rd);
      if (hit > 0.0) { vec3 p = ro + rd * hit; vec2 e = vec2(0.02, 0.0);
        vec3 n = normalize(vec3(berg(p + e.xyy) - berg(p - e.xyy), berg(p + e.yxy) - berg(p - e.yxy), berg(p + e.yyx) - berg(p - e.yyx)));
        col = glace(p, n, rd, 0.0); }
    } else {
      // vue à travers la surface : réflexion du ciel + eau ; l'iceberg sous l'eau est vu dans la brume
      vec3 pS = ro + rd * tS;
      float fres = 0.12 + 0.6 * pow(1.0 - abs(rd.y), 6.0);
      vec3 sous = eauCouleur(-1.0);
      if (hit > 0.0) { vec3 p = ro + rd * hit; vec2 e = vec2(0.02, 0.0);
        vec3 n = normalize(vec3(berg(p + e.xyy) - berg(p - e.xyy), berg(p + e.yxy) - berg(p - e.yxy), berg(p + e.yyx) - berg(p - e.yyx)));
        sous = mix(glace(p, n, rd, 1.0), eauCouleur(p.y), 1.0 - exp(-(hit - tS) * 0.12)); }
      col = mix(sous, ciel(reflect(rd, vec3(0, 1, 0))), fres);
      col += vec3(1.0) * 0.12 * pow(max(0.0, sin(pS.x * 3.0 + tt * 3.0) * sin(pS.z * 2.0 - tt * 2.0)), 6.0);   // reflets de vagues
    }
  } else {
    vec3 fond = eauCouleur(ro.y + rd.y * 12.0);
    if (rd.y > 0.0 && tS > 0.0) fond = mix(fond, vec3(0.55, 0.85, 0.95) * (0.7 + 0.3 * sin(ro.x + rd.x * 30.0 + tt * 4.0)), exp(-tS * 0.09) * smoothstep(0.0, 0.3, rd.y));   // la surface vue d'en dessous
    col = fond;
    if (hit > 0.0) { vec3 p = ro + rd * hit; vec2 e = vec2(0.02, 0.0);
      vec3 n = normalize(vec3(berg(p + e.xyy) - berg(p - e.xyy), berg(p + e.yxy) - berg(p - e.yxy), berg(p + e.yyx) - berg(p - e.yyx)));
      col = mix(glace(p, n, rd, 1.0), fond, 1.0 - exp(-hit * mix(0.05, 0.09, smoothstep(-5.0, -25.0, ro.y)))); }
    // rayons de lumière qui tombent de la surface
    float ray = pow(0.5 + 0.5 * sin(uv.x * 9.0 + uv.y * 2.5 + tt), 6.0) * 0.6 + pow(0.5 + 0.5 * sin(uv.x * 17.0 - uv.y * 3.0 - tt * 2.0), 10.0) * 0.4;
    col += vec3(0.45, 0.85, 0.95) * ray * 0.32 * exp(ro.y * 0.09) * smoothstep(-0.6, 0.5, uv.y);
  }
  col = mix(col, vec3(0.85, 0.95, 1.0), 0.6 * smoothstep(0.035, 0.0, abs(yProche)) * step(abs(ro.y), 0.3));   // ligne d'écume au passage de la surface
  // particules en suspension : elles montent quand la caméra descend (sensation de plongée)
  float pc = 0.0, bio = 0.0;
  for (int k = 0; k < 3; k++) { float fk = float(k), sc2 = 22.0 + fk * 14.0;
    vec2 g = uv * sc2 + vec2(fk * 7.3, uP * NIV * (2.4 + fk) + uT / uL * (6.0 + fk * 3.0));
    vec2 i = floor(g), f = fract(g) - 0.5; float h = hash(i + fk * 31.0);
    float dd = length(f - (vec2(hash(i + 3.1), hash(i + 7.7)) - 0.5) * 0.6);
    float pt = step(0.84, h) * smoothstep(0.09, 0.02, dd) * (0.4 + 0.6 * fk / 2.0);
    pc += pt; bio += pt * step(0.93, h);
  }
  float sousEau = camSous ? 1.0 : step(0.0, -rd.y) * step(0.0, tS);
  col += vec3(0.7, 0.85, 0.9) * pc * 0.25 * sousEau * exp(ro.y * 0.05);
  col += vec3(0.2, 1.0, 0.9) * bio * 1.4 * smoothstep(2.4, 3.6, uP) * (0.6 + 0.4 * sin(tt * 3.0 + uv.x * 40.0));   // bioluminescence aux abysses
  col = 1.0 - exp(-col * 1.4); col = pow(col, vec3(0.95)); col *= 1.0 - 0.32 * dot(uv, uv);
  gl_FragColor = vec4(col, 1.0);
}`;
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }', fragmentShader: frag })));
    const lis = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    const prof = (tg) => { if (tg <= K[0][0]) return K[0][1]; for (let i = 0; i + 1 < K.length; i += 1) if (tg <= K[i + 1][0]) return K[i][1] + (K[i + 1][1] - K[i][1]) * lis((tg - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
    return { maj(t) { const tg = t + T0; U.uT.value = tg; U.uP.value = prof(tg); r.render(sc, cam); } };
  }
  const mirage = (canvas, L, o) => desert(canvas, L, Object.assign({ mirage: true }, o || {}));
  return { desert, mirage, iceberg };
});
