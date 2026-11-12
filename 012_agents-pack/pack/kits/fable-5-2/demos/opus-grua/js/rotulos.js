// Texturas dibujadas en canvas: rótulos de la máquina y franjas de advertencia.
import * as THREE from 'three';

function lienzo(w, h, dibujar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  dibujar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function texRotulo(texto, sub = '') {
  return lienzo(1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#121212'; g.textBaseline = 'middle';
    let x = 20;
    if (sub) { g.font = '700 74px "Helvetica Neue", Arial, sans-serif'; g.fillText(sub, x, h * 0.56); x += g.measureText(sub).width + 34; }
    g.font = 'italic 900 128px "Helvetica Neue", Arial, sans-serif';
    g.fillText(texto, x, h * 0.55);
  });
}

export function texFranjas() {
  return lienzo(256, 256, (g, w, h) => {
    g.fillStyle = '#e9e7e1'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c0211b';
    for (let k = -4; k < 8; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64 + 32, 0); g.lineTo(k * 64 + 32 + h, h); g.lineTo(k * 64 + h, h); g.fill(); }
  });
}

export function texRejilla() {
  return lienzo(256, 256, (g, w, h) => {
    g.fillStyle = '#1b1c1d'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3c3e'; for (let y = 6; y < h; y += 16) g.fillRect(8, y, w - 16, 6);
  });
}
