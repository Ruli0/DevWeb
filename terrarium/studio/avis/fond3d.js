/*
 * Fonds 3D des jeux (Three.js, shader plein écran) : une vraie scène calculée pixel par pixel, rendue à mi-résolution
 * (540 × 960, agrandie) pour tenir le rendu sans carte graphique (~0,45 s par image).
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
  function desert(canvas, L) {
  const W = canvas.width, H = canvas.height;
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const U = { uT: { value: 0 }, uL: { value: L }, uR: { value: new THREE.Vector2(W, H) } };
  const frag = `
precision highp float;
uniform float uT, uL; uniform vec2 uR;
#define PI 3.14159265
const float PZ = 48.0;               // période du terrain en profondeur
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p, float per){     // bruit de valeur, périodique en y de période per (en cellules)
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  float y0 = mod(i.y, per), y1 = mod(i.y + 1.0, per);
  float a = hash(vec2(i.x, y0)), b = hash(vec2(i.x+1.0, y0)), c = hash(vec2(i.x, y1)), d = hash(vec2(i.x+1.0, y1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float terrain(vec2 xz){
  // Dunes : crêtes allongées en travers du vent (étirées en x), adoucies ; deux octaves seulement (pas de montagnes).
  vec2 p = vec2(xz.x / 9.0, xz.y / 6.0); float per = PZ / 6.0;
  float h = 0.0, a = 1.0;
  for (int k = 0; k < 3; k++) { float n = vnoise(p + vec2(13.0*float(k), 0.0), per); float r = 1.0 - abs(2.0*n - 1.0); h += a * r * r; p *= 2.0; per *= 2.0; a *= 0.3; }
  h = smoothstep(0.0, 1.3, h) * 1.25;
  h += 0.018 * sin(xz.x * 9.0 + xz.y * 2.0 + 4.0 * vnoise(xz*0.5, PZ*0.5));   // rides du vent
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
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uR) / uR.y;
  float speed = PZ / uL, z = speed * uT;
  float cx = 0.6 * sin(2.0*PI*uT/uL);
  float sol = max(max(terrain(vec2(cx, z)), terrain(vec2(cx, z + 1.5))), terrain(vec2(cx, z + 3.0)));   // la caméra suit le relief
  vec3 ro = vec3(cx, sol + 0.75 + 0.06 * sin(4.0*PI*uT/uL), z);
  float yaw = 0.05 * sin(2.0*PI*uT/uL);
  vec3 fw = normalize(vec3(sin(yaw), 0.0, cos(yaw))), rt = normalize(cross(vec3(0,1,0), fw)), up = cross(fw, rt);
  vec2 hz = uv + vec2(0.0, 0.0015 * sin(uv.x * 90.0 + 2.0*PI*3.0*uT/uL) * smoothstep(0.1, -0.05, uv.y));   // brume de chaleur
  vec3 rd = normalize(fw * 1.25 + rt * hz.x + up * (hz.y + 0.03));   // horizon vers 53 % de la hauteur
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
  col = 1.0 - exp(-col * 1.35); col = pow(col, vec3(0.95)); col *= 1.0 - 0.3 * dot(uv, uv);   // étalonnage doux + vignette                       // vignette
  gl_FragColor = vec4(col, 1.0);
}`;
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }', fragmentShader: frag })));
  return { maj(t) { U.uT.value = t; r.render(sc, cam); } };
}
  return { desert };
});
