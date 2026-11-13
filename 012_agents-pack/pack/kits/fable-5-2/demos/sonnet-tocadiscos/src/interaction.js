// Interacción: nombre de la pieza al pasar el mouse, resaltado, desarme animado y encuadre de cámara.
import * as THREE from 'three';
import { findPart, applyExplode } from './parts.js';

const ss = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

export function setupHover({ camera, renderer, root, tip, glass, onPick, onDrag }) {
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const hlCache = new Map();
  const state = { hover: null, x: 0, y: 0, down: null, dragging: false, pointerOver: false };
  const hl = (mat) => {
    if (!hlCache.has(mat)) { const c = mat.clone(); c.emissive = new THREE.Color(0x2f6fb0); c.emissiveIntensity = Math.max(0.3, mat.emissiveIntensity || 0); hlCache.set(mat, c); }
    return hlCache.get(mat);
  };
  const paint = (obj, on) => obj.traverse((o) => {
    if (!o.isMesh || o.userData.noHl || findPart(o) !== obj) return;
    if (on) { o.userData.orig = o.material; o.material = Array.isArray(o.material) ? o.material.map(hl) : hl(o.material); }
    else if (o.userData.orig) { o.material = o.userData.orig; o.userData.orig = null; }
  });
  const pick = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObject(root, true).filter((h) => h.object.isMesh && findPart(h.object));
    return hits.find((h) => !(Array.isArray(h.object.material) ? false : h.object.material === glass)) || hits[0] || null;
  };
  const set = (p) => {
    if (p === state.hover) return;
    if (state.hover) paint(state.hover, false);
    state.hover = p; if (p) paint(p, true);
    renderer.domElement.style.cursor = p ? 'pointer' : 'grab';
    tip.hidden = !p;
    if (p) { const d = p.userData.part; tip.querySelector('b').textContent = d.name; tip.querySelector('span').textContent = d.info; }
  };
  const move = (e) => {
    state.x = e.clientX; state.y = e.clientY;
    if (state.dragging) { onDrag(state.down, e, pick); return; }
    if (e.buttons) { tip.hidden = true; return; }
    const h = pick(e); set(h ? findPart(h.object) : null);
    if (h) place(tip, e.clientX, e.clientY);
  };
  const d = renderer.domElement;
  d.addEventListener('pointermove', move);
  d.addEventListener('pointerleave', () => set(null));
  d.addEventListener('pointerdown', (e) => {
    const h = pick(e); state.down = h ? { part: findPart(h.object), x: e.clientX, y: e.clientY, hit: h } : null;
    if (state.down && onDrag(state.down, e, pick, 'start')) { state.dragging = true; d.setPointerCapture(e.pointerId); }
  });
  d.addEventListener('pointerup', (e) => {
    const moved = state.down && Math.hypot(e.clientX - state.down.x, e.clientY - state.down.y) > 5;
    if (state.dragging) { onDrag(state.down, e, pick, 'end'); state.dragging = false; }
    else if (state.down && !moved) onPick(state.down.part);
    state.down = null;
  });
  return { set, hover: () => state.hover, place: (x, y) => place(tip, x, y) };
}

function place(tip, x, y) {
  const w = tip.offsetWidth || 260, h = tip.offsetHeight || 60;
  tip.style.left = Math.min(innerWidth - w - 10, x + 16) + 'px';
  tip.style.top = Math.min(innerHeight - h - 10, y + 18) + 'px';
}

/** Desarme animado con encuadre de cámara. */
export function makeExplode(camera, controls) {
  const s = { t: 0, target: 0, anim: null };
  s.toggle = () => {
    s.target = s.target ? 0 : 1;
    const dir = camera.position.clone().sub(controls.target);
    const to = controls.target.clone(); to.y += s.target ? 17 : -17;
    const k = s.target ? 2.05 : 1 / 2.05;
    s.anim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), t1: to, p1: to.clone().add(dir.multiplyScalar(k)) };
  };
  s.update = (dt) => {
    s.t += (s.target - s.t) * Math.min(1, dt * 2.6);
    if (Math.abs(s.t - s.target) < 0.0005) s.t = s.target;
    applyExplode(s.t);
    const a = s.anim; if (!a) return;
    a.t += dt / 1.4; const e = ss(a.t);
    camera.position.lerpVectors(a.p0, a.p1, e); controls.target.lerpVectors(a.t0, a.t1, e);
    if (a.t >= 1) s.anim = null;
  };
  return s;
}

/** Acerca la cámara a una pieza (desde la lista lateral). */
export function focusPart(camera, controls, obj, state) {
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  const dist = Math.max(size * 2.4, 22);
  state.focus = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), t1: c, p1: c.clone().addScaledVector(dir, dist) };
}

export function updateFocus(camera, controls, state, dt) {
  const f = state.focus; if (!f) return;
  f.t += dt / 0.9; const e = ss(f.t);
  camera.position.lerpVectors(f.p0, f.p1, e); controls.target.lerpVectors(f.t0, f.t1, e);
  if (f.t >= 1) state.focus = null;
}
