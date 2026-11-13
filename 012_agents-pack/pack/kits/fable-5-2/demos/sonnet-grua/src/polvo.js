// Polvo y humo: sprites suaves (THREE.Points con shader propio) que suben, crecen y se desvanecen. Mordida, aterrizajes, camiones y el escape.
import * as THREE from 'three';

const MAX = 900, VIENTO = new THREE.Vector3(0.7, 0, 0.35);

export class Polvo {
  constructor(scene) {
    this.n = 0; this.cursor = 0;
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3); this.edad = new Float32Array(MAX).fill(9); this.vida = new Float32Array(MAX);
    this.s0 = new Float32Array(MAX); this.s1 = new Float32Array(MAX); this.a0 = new Float32Array(MAX); this.col = new Float32Array(MAX * 3);
    this.tam = new Float32Array(MAX); this.alfa = new Float32Array(MAX);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('tam', new THREE.BufferAttribute(this.tam, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alfa', new THREE.BufferAttribute(this.alfa, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { mapa: { value: new THREE.CanvasTexture(c) }, escala: { value: innerHeight * 0.5 } },
      vertexShader: 'attribute float tam; attribute float alfa; varying float va; varying vec3 vc; uniform float escala; void main(){ va = alfa; vc = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = tam * escala / -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D mapa; varying float va; varying vec3 vc; void main(){ float t = texture2D(mapa, gl_PointCoord).a; gl_FragColor = vec4(vc, t * va); }', vertexColors: true,
    });
    this.puntos = new THREE.Points(g, this.mat); this.puntos.frustumCulled = false; this.puntos.renderOrder = 5; scene.add(this.puntos);
  }

  ajustar(altoPx, fovGrados) { this.mat.uniforms.escala.value = altoPx / (2 * Math.tan((fovGrados * Math.PI) / 360)); }   // tamaño de punto en píxeles del buffer

  emitir(x, y, z, o = {}) {
    const i = this.cursor++ % MAX, { v = 1, up = 0.6, size = 1, grow = 2.6, life = 1.6, alpha = 0.3, color = [0.62, 0.52, 0.4] } = o, r = Math.random;
    this.p.set([x, y, z], i * 3); this.v.set([(r() - 0.5) * v, up * (0.5 + r() * 0.8), (r() - 0.5) * v], i * 3);
    this.edad[i] = 0; this.vida[i] = life * (0.7 + r() * 0.6); this.s0[i] = size * (0.7 + r() * 0.6); this.s1[i] = this.s0[i] * grow; this.a0[i] = alpha;
    this.col.set(color, i * 3);
  }

  rafaga(x, y, z, n, o) { for (let i = 0; i < n; i++) this.emitir(x + (Math.random() - 0.5) * 0.8, y, z + (Math.random() - 0.5) * 0.8, o); }

  paso(dt) {
    for (let i = 0; i < MAX; i++) {
      if (this.edad[i] >= this.vida[i]) { this.alfa[i] = 0; this.tam[i] = 0; continue; }
      this.edad[i] += dt; const u = this.edad[i] / this.vida[i], o = i * 3;
      this.v[o] += (VIENTO.x - this.v[o]) * 0.6 * dt; this.v[o + 2] += (VIENTO.z - this.v[o + 2]) * 0.6 * dt; this.v[o + 1] *= 1 - 0.8 * dt;
      this.p[o] += this.v[o] * dt; this.p[o + 1] += this.v[o + 1] * dt; this.p[o + 2] += this.v[o + 2] * dt;
      this.tam[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * Math.sqrt(u); this.alfa[i] = this.a0[i] * (1 - u) * Math.min(1, u * 8);
    }
    const g = this.puntos.geometry; for (const k of ['position', 'tam', 'alfa']) g.attributes[k].needsUpdate = true;
  }
}
