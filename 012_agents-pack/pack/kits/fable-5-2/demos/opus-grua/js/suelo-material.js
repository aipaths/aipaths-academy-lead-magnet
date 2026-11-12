// Material del suelo: tierra seca (Poly Haven dry_ground_01) que se mezcla con tierra removida
// (brown_mud_02) donde se cavó o se soltó, y ripio compactado en el camino del camión.
import * as THREE from 'three';
import { pbr, tex } from './texturas.js';

export function materialSuelo() {
  const seco = pbr('dry_ground_01');
  const mat = new THREE.MeshStandardMaterial({ ...seco, roughness: 1, normalScale: new THREE.Vector2(1.1, 1.1) });
  const barro = tex('brown_mud_02_diff_1k.jpg', { color: true });
  const barroN = tex('brown_mud_02_nor_1k.jpg');
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.mapaBarro = { value: barro };
    sh.uniforms.normalBarro = { value: barroN };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 suelo;\nvarying vec2 vSuelo;\nvarying vec3 vMundo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSuelo = suelo;\nvMundo = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D mapaBarro;\nuniform sampler2D normalBarro;\nvarying vec2 vSuelo;\nvarying vec3 vMundo;\nfloat ruidoS(vec2 p){return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453);}\nfloat ruidoV(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ruidoS(i),ruidoS(i+vec2(1,0)),f.x),mix(ruidoS(i+vec2(0,1)),ruidoS(i+vec2(1,1)),f.x),f.y);}')
      .replace('#include <map_fragment>', `
        vec4 cSeco = texture2D(map, vMapUv);
        float manchas = ruidoV(vMundo.xz * 0.08) * 0.6 + ruidoV(vMundo.xz * 0.5) * 0.4;
        float fresco = smoothstep(0.05, 0.9, vSuelo.x + (manchas - 0.5) * 0.35);
        vec3 removida = vec3(0.0);
        if (fresco > 0.001) removida = texture2D(mapaBarro, vMapUv * 1.3).rgb * vec3(1.02, 0.93, 0.82) * 0.92;
        vec3 base = cSeco.rgb * vec3(0.86, 0.78, 0.66) * mix(0.82, 1.06, manchas);
        vec3 col = mix(base, removida, fresco);
        vec3 ripio = mix(base, vec3(dot(base, vec3(0.33))), 0.45) * 0.72;
        col = mix(col, ripio, vSuelo.y * (1.0 - fresco));
        diffuseColor.rgb *= col;`)
      .replace('#include <roughnessmap_fragment>', `
        float roughnessFactor = roughness * mix(0.93, 0.82, fresco);`)
      .replace('#include <normal_fragment_maps>', `
        vec3 mapN = texture2D(normalMap, vNormalMapUv).xyz;
        if (fresco > 0.001) mapN = mix(mapN, texture2D(normalBarro, vNormalMapUv * 1.3).xyz, fresco);
        mapN = mapN * 2.0 - 1.0;
        mapN.xy *= normalScale;
        normal = normalize(tbn * mapN);`);
  };
  return mat;
}
