import * as THREE from 'three';
import { OBRA } from './medidas.js';
import { textura } from './escena.js';
import { fbm, ruido2, escalon } from './ruido.js';

// El suelo es un mapa de alturas: una grilla de N×N números. Cavar resta, soltar suma.
export class Terreno {
  constructor() {
    const { N, tam } = OBRA;
    this.N = N; this.tam = tam; this.celda = tam / (N - 1); this.mitad = tam / 2;
    this.h = new Float32Array(N * N);       // altura de cada punto
    this.fresca = new Float32Array(N * N);  // 1 = tierra removida (más oscura y húmeda)
    this.sucio = null;                      // zona que cambió y hay que redibujar
    this.activo = null;                     // zona donde la tierra todavía se está desmoronando
    this.formaInicial();
  }

  formaInicial() {
    const { N, celda, mitad } = this, { pozo, montana, reposo } = OBRA;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = -mitad + i * celda, z = -mitad + j * celda, k = j * N + i;
      const borde = escalon(mitad, mitad - 7, Math.max(Math.abs(x), Math.abs(z)));
      let y = (fbm(x * 0.06, z * 0.06, 3) - 0.47) * 0.5 + (fbm(x * 0.7, z * 0.7, 2) - 0.47) * 0.07;
      // huellas de camión a lo largo de la calle de obra (z = 12,5)
      const calle = Math.abs(Math.abs(z - OBRA.camion.z) - 1.0);
      y -= 0.05 * escalon(0.35, 0.1, calle) * (0.6 + 0.4 * ruido2(x * 0.5, 3));
      // acopio de tierra: un cono al ángulo de reposo, con la punta redondeada
      const dm = Math.hypot(x - montana.x, z - montana.z) * (1 + 0.18 * (ruido2(x * 0.4, z * 0.4) - 0.5));
      const cono = Math.max(0, 2.7 - reposo * 0.93 * dm);
      const monte = cono > 2.3 ? 2.3 + (cono - 2.3) * 0.35 : cono;
      // excavación empezada
      const dp = Math.hypot((x - pozo.x) * 0.85, z - pozo.z);
      const hoyo = -1.15 * escalon(3.6, 1.2, dp) * (0.85 + 0.3 * ruido2(x * 0.7, z * 0.7));
      // acopios viejos al fondo de la obra y el carril del camión, más pisado
      let otros = 0; for (const [mx, mz, mh] of [[-24, 20, 3.2], [-17, 27, 2.2], [24, 27, 2.6], [-33, 4, 1.8]]) otros += Math.max(0, mh - reposo * 0.85 * Math.hypot(x - mx, z - mz) * (1 + 0.2 * (ruido2(x * 0.3 + mx, z * 0.3) - 0.5)));
      const carril = escalon(2.6, 1.2, Math.abs(z - OBRA.camion.z)) * (0.25 + 0.3 * fbm(x * 0.2, z * 0.6, 2));
      this.h[k] = (y + monte + hoyo + otros) * borde;
      this.fresca[k] = Math.min(1, escalon(0.02, 0.5, monte) + escalon(4.6, 2.6, dp) * 0.9 + escalon(0.05, 0.6, otros) * 0.55 + carril + escalon(0.35, 0.1, calle) * 0.25);
    }
  }

  indice(x, z) { return [(x + this.mitad) / this.celda, (z + this.mitad) / this.celda]; }

  alturaEn(x, z) {
    const N = this.N; let [fi, fj] = this.indice(x, z);
    if (fi < 0 || fj < 0 || fi > N - 1 || fj > N - 1) return 0;
    const i = Math.min(N - 2, Math.floor(fi)), j = Math.min(N - 2, Math.floor(fj)); fi -= i; fj -= j;
    const h = this.h, k = j * N + i;
    return h[k] * (1 - fi) * (1 - fj) + h[k + 1] * fi * (1 - fj) + h[k + N] * (1 - fi) * fj + h[k + N + 1] * fi * fj;
  }

  marcar(i0, j0, i1, j1) {
    const N = this.N, s = this.sucio;
    i0 = Math.max(1, i0); j0 = Math.max(1, j0); i1 = Math.min(N - 2, i1); j1 = Math.min(N - 2, j1);
    this.sucio = s ? [Math.min(s[0], i0), Math.min(s[1], j0), Math.max(s[2], i1), Math.max(s[3], j1)] : [i0, j0, i1, j1];
  }

  async crearMalla() {
    const { N, celda, mitad } = this;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2), idx = new Uint32Array((N - 1) * (N - 1) * 6);
    for (let j = 0, p = 0, u = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = -mitad + i * celda, z = -mitad + j * celda;
      pos[p++] = x; pos[p++] = 0; pos[p++] = z; uv[u++] = x / 7; uv[u++] = z / 7;
    }
    for (let j = 0, q = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
      const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
      idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('fresca', new THREE.BufferAttribute(this.fresca, 1));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), mitad * 1.6);
    this.geo = geo;
    this.material = await materialTierra();
    this.malla = new THREE.Mesh(geo, this.material);
    this.malla.receiveShadow = true; this.malla.castShadow = true; this.material.shadowSide = THREE.FrontSide;
    this.marcar(0, 0, N, N); this.redibujar();
    const grupo = new THREE.Group();
    grupo.add(this.malla, alrededores(this.material, mitad));
    return grupo;
  }

  // Vuelca al dibujo sólo la zona que cambió (alturas y normales).
  redibujar() {
    if (!this.sucio) return;
    const { N, h, celda } = this, [i0, j0, i1, j1] = this.sucio;
    const pos = this.geo.attributes.position.array, nor = this.geo.attributes.normal.array;
    for (let j = Math.max(0, j0 - 1); j <= Math.min(N - 1, j1 + 1); j++) for (let i = Math.max(0, i0 - 1); i <= Math.min(N - 1, i1 + 1); i++) {
      const k = j * N + i;
      pos[k * 3 + 1] = h[k];
      const dx = (h[k + (i < N - 1 ? 1 : 0)] - h[k - (i > 0 ? 1 : 0)]) / (2 * celda);
      const dz = (h[k + (j < N - 1 ? N : 0)] - h[k - (j > 0 ? N : 0)]) / (2 * celda);
      const l = 1 / Math.hypot(dx, 1, dz);
      nor[k * 3] = -dx * l; nor[k * 3 + 1] = l; nor[k * 3 + 2] = -dz * l;
    }
    // a la placa de video sólo viajan las filas que cambiaron, no todo el terreno
    const f0 = Math.max(0, j0 - 1), filas = Math.min(N - 1, j1 + 1) - f0 + 1;
    for (const [nombre, ancho] of [['position', 3], ['normal', 3], ['fresca', 1]]) {
      const a = this.geo.attributes[nombre]; a.clearUpdateRanges(); a.addUpdateRange(f0 * N * ancho, filas * N * ancho); a.needsUpdate = true;
    }
    this.sucio = null;
  }
}

// Tierra apisonada de obra + tierra removida, mezcladas según el atributo "fresca".
async function materialTierra() {
  const A = 'assets/dry_mud_field_001_', B = 'assets/brown_mud_rocks_01_';
  const [map, normalMap, mapFresca] = await Promise.all([
    textura(A + 'Diffuse.jpg', { srgb: true, aniso: 8 }), textura(B + 'nor_gl.jpg', { aniso: 2 }),
    textura(B + 'Diffuse.jpg', { srgb: true }),
  ]);
  const m = new THREE.MeshStandardMaterial({ map, normalMap, roughness: 0.94, metalness: 0, envMapIntensity: 0.7 });
  m.normalScale.set(0.8, 0.8);   // el relieve fino sale de la textura con piedras: la otra repetía una huella cada 7 m
  m.onBeforeCompile = (s) => {
    s.uniforms.mapFresca = { value: mapFresca };
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float fresca; varying float vFresca; varying vec3 vMundo; varying float vLadera;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFresca = fresca; vMundo = position; vLadera = 1.0 - normal.y;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D mapFresca; varying float vFresca; varying vec3 vMundo; varying float vLadera;')
      .replace('#include <map_fragment>', `
        vec4 c1 = texture2D(map, vMapUv);
        float macro = dot(texture2D(map, vMapUv * 0.113 + vec2(0.31, 0.17)).rgb, vec3(0.333));
        c1.rgb *= mix(0.72, 1.28, smoothstep(0.12, 0.42, macro));
        float lejos = smoothstep(22.0, 85.0, length(vViewPosition));
        c1.rgb = mix(c1.rgb, texture2D(map, vMapUv * 0.19 + vec2(0.4, 0.1)).rgb, lejos * 0.6) * 1.2;
        vec3 suelta = texture2D(mapFresca, vMapUv * 1.9).rgb;
        // en las laderas la textura vista desde arriba se estira en rayas: ahí se proyecta de costado
        suelta = mix(suelta, texture2D(mapFresca, vec2(vMundo.x + vMundo.z, vMundo.y * 1.3) * 0.27).rgb, smoothstep(0.1, 0.24, vLadera)) * vec3(0.66, 0.56, 0.47);
        float f = smoothstep(0.05, 0.75, vFresca + (macro - 0.27) * 0.6);
        diffuseColor.rgb *= mix(c1.rgb, suelta, f);`);
  };
  return m;
}

// El resto de la obra: un marco plano enorme alrededor del cuadrado que se deforma.
function alrededores(material, mitad) {
  const R = 1400, xs = [-R, -mitad, mitad, R], pos = [], uv = [], idx = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { pos.push(xs[i], 0, xs[j]); uv.push(xs[i] / 7, xs[j] / 7); }
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    if (i === 1 && j === 1) continue;
    const a = j * 4 + i, b = a + 1, c = a + 4, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const malla = new THREE.Mesh(g, material); malla.receiveShadow = true;
  return malla;
}
