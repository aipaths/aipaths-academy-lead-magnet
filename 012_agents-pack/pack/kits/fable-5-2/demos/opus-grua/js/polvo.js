// Polvo: nubecitas que se levantan donde la tierra golpea o donde la almeja muerde, crecen y se disipan.
import * as THREE from 'three';

const MAX = 500;
const vert = `attribute float vida; attribute float tam; varying float vVida;
  void main() { vVida = vida; vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = tam * (1.0 + (1.0 - vida) * 2.5) * 900.0 / -mv.z; gl_Position = projectionMatrix * mv; }`;
const frag = `uniform vec3 color; varying float vVida;
  void main() { vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r) * vVida * vVida * 0.32; gl_FragColor = vec4(color, a); }`;

export class Polvo {
  constructor(escena) {
    const g = new THREE.BufferGeometry();
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3); this.vida = new Float32Array(MAX); this.tam = new Float32Array(MAX);
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('vida', new THREE.BufferAttribute(this.vida, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('tam', new THREE.BufferAttribute(this.tam, 1));
    const m = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, uniforms: { color: { value: new THREE.Color(0xb8a68c) } } });
    this.puntos = new THREE.Points(g, m); this.puntos.frustumCulled = false; escena.add(this.puntos);
    this.i = 0;
  }
  soplar(x, y, z, fuerza = 1) {
    const i = this.i = (this.i + 1) % MAX, k = i * 3;
    this.p[k] = x + (Math.random() - 0.5) * 0.6; this.p[k + 1] = y + 0.2; this.p[k + 2] = z + (Math.random() - 0.5) * 0.6;
    this.v[k] = (Math.random() - 0.5) * 1.4 * fuerza; this.v[k + 1] = 0.3 + Math.random() * 0.7 * fuerza; this.v[k + 2] = (Math.random() - 0.5) * 1.4 * fuerza;
    this.vida[i] = 1; this.tam[i] = 0.35 + Math.random() * 0.4;
  }
  actualizar(dt) {
    for (let i = 0; i < MAX; i++) {
      if (this.vida[i] <= 0) continue;
      const k = i * 3; this.vida[i] = Math.max(0, this.vida[i] - dt / 2.6);
      this.p[k] += (this.v[k] + 0.35) * dt; this.p[k + 1] += this.v[k + 1] * dt; this.p[k + 2] += this.v[k + 2] * dt;   // brisa leve hacia +x
      this.v[k] *= 1 - dt; this.v[k + 1] *= 1 - dt * 0.8; this.v[k + 2] *= 1 - dt;
    }
    this.puntos.geometry.attributes.position.needsUpdate = true;
    this.puntos.geometry.attributes.vida.needsUpdate = true;
  }
}
