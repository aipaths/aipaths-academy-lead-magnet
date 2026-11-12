import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

// Cámara de juego: gira con el mouse alrededor de la grúa y la sigue; con C pasa a la vista del operador.
export class Camara {
  constructor(camara, lienzo, grua) {
    this.c = camara; this.grua = grua; this.modo = 0;
    this.orbita = new OrbitControls(camara, lienzo);
    Object.assign(this.orbita, { enableDamping: true, dampingFactor: 0.08, minDistance: 8, maxDistance: 110, maxPolarAngle: 1.52, enablePan: false });
    camara.position.set(22, 9.5, -27); this.orbita.target.set(5, 6, -1.5); this.ancla = new THREE.Vector3(grua.e.x, 0, grua.e.z);
    this.a = new THREE.Vector3(); this.b = new THREE.Vector3();
  }
  cambiar() { this.modo = (this.modo + 1) % 3; this.orbita.enabled = this.modo === 0; this.c.fov = this.modo === 1 ? 62 : 36; this.c.updateProjectionMatrix(); }
  paso() {
    const { c, grua } = this, e = grua.e, al = grua.almeja.grupo.position;
    if (this.modo === 0) {                      // exterior: acompaña a la grúa cuando se traslada
      this.a.set(e.x - this.ancla.x, 0, e.z - this.ancla.z); this.ancla.add(this.a);
      c.position.add(this.a); this.orbita.target.add(this.a); this.orbita.update();
    } else if (this.modo === 1) {               // desde la butaca del operador, mirando la almeja
      grua.sup.grupo.localToWorld(this.a.set(3.0, 2.55, -1.2)); c.position.copy(this.a);   // justo delante del parabrisas
      this.b.lerp(al, 0.12); c.lookAt(this.b.x, this.b.y - 1, this.b.z);
    } else {                                    // de cerca, siguiendo a la almeja
      grua.sup.grupo.localToWorld(this.a.set(9, 3.2, -9)); c.position.lerp(this.a, 0.06);
      this.b.lerp(al, 0.1); c.lookAt(this.b.x, this.b.y - 1, this.b.z);
    }
  }
}
