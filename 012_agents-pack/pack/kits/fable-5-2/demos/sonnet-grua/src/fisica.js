// Péndulo esférico de la almeja: la punta de la pluma la arrastra con el cable (restricción de longitud) y la almeja conserva su impulso.
import * as THREE from 'three';

const G_ACC = 9.8, AMORT = 0.09, PASO_MAX = 1 / 150;

export class FisicaCable {
  constructor(grua, exc) {
    this.grua = grua; this.exc = exc; this.suelo = (G, yaw, ab) => exc.suelo(G, yaw, ab);                       // suelo(G, yaw, abierta) → { tope, base }
    this.G = new THREE.Vector3(); this.V = new THREE.Vector3(); this.q = new THREE.Quaternion();
    this.Pprev = new THREE.Vector3(); this.Vp = new THREE.Vector3(); this.tension = 0; this.enSuelo = false; this.yaw = 0;
    this.tmp = new THREE.Vector3(); this.n = new THREE.Vector3(); this.qt = new THREE.Quaternion(); this.e = new THREE.Euler(); this.qy = new THREE.Quaternion();
  }

  iniciar() {
    const { grua } = this, atar = grua.almeja.grupo.userData.atar.y;
    this.G.set(grua.punta.x, grua.punta.y - grua.estado.cable - atar, grua.punta.z); this.V.set(0, 0, 0); this.Pprev.copy(grua.punta);
    this.yaw = grua.arriba.rotation.y; this.orientar(1);
  }

  orientar(k) {                                                   // la almeja cuelga alineada con el cable y gira con la grúa, con inercia
    const up = this.tmp.subVectors(this.grua.punta, this.G).normalize();
    this.qt.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    const objetivo = this.grua.arriba.rotation.y; let d = objetivo - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, k * 1.8);
    this.qy.setFromEuler(this.e.set(0, this.yaw, 0)); this.qt.multiply(this.qy);
    this.q.slerp(this.qt, Math.min(1, k * 6));
  }

  paso(dt) {
    const { grua, G, V, n } = this, P = grua.punta, est = grua.estado, atar = grua.almeja.grupo.userData.atar.y;
    this.Vp.subVectors(P, this.Pprev).divideScalar(Math.max(dt, 1e-4)); this.Pprev.copy(P);
    const pasos = Math.max(1, Math.ceil(dt / PASO_MAX)), h = dt / pasos, Lmax = est.cable + atar;
    this.tension = 0; this.enSuelo = false;
    for (let i = 0; i < pasos; i++) {
      V.y -= G_ACC * h; V.multiplyScalar(1 - AMORT * h); G.addScaledVector(V, h);
      const d = G.distanceTo(P);
      if (d > Lmax) {                                              // cable tenso: proyecta sobre la esfera y quita la velocidad relativa que se aleja
        n.subVectors(G, P).divideScalar(d); G.copy(P).addScaledVector(n, Lmax);
        const vr = (V.x - this.Vp.x) * n.x + (V.y - this.Vp.y) * n.y + (V.z - this.Vp.z) * n.z;
        if (vr > 0) { V.addScaledVector(n, -vr); this.tension = Math.max(this.tension, vr); }
      }
      this.contacto(h);
    }
    this.orientar(dt);
    return this.tension;
  }

  contacto(h) {
    const { G, V } = this, s = this.suelo(G, this.yaw, this.grua.estado.almeja), exc = this.exc;
    const y = s.tope + (exc.muerde ? Math.min(s.base, exc.baseMordida) : s.base);   // al morder, las puntas se hunden en la tierra
    const pen = y - G.y;
    if (pen > 0) {
      G.y += pen < 0.1 ? pen : Math.max(pen - 0.3, Math.min(pen, 2.5 * h)); if (V.y < 0) V.y = 0; this.enSuelo = true;
      const f = Math.max(0, 1 - 6 * h); V.x *= f; V.z *= f;       // arrastre contra la tierra
    }
  }
}
