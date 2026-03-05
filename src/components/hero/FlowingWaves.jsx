import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from '../scrollState';

const WAVE_COUNT = 5;
const SEGMENTS = 200;

function WaveLine({ index }) {
  const materialRef = useRef();
  const scroll = useScrollProgress();

  const baseY = -1.4 - index * 0.2;
  const amplitude = 0.3 + index * 0.08;
  const frequency = 0.6 + index * 0.1;
  const phaseOffset = index * 0.9;
  const opacity = 0.1 + (WAVE_COUNT - index) * 0.03;

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const x = (i / SEGMENTS) * 14 - 7;
      const y = baseY + Math.sin(x * frequency + phaseOffset) * amplitude;
      points.push(new THREE.Vector3(x, y, -1));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, SEGMENTS, 0.003, 4, false);
  }, [baseY, amplitude, frequency, phaseOffset]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uScrollProgress: { value: 0 },
        uColor: { value: new THREE.Color('#4488aa') },
        uGlowColor: { value: new THREE.Color('#00c8ff') },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScrollProgress;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Scroll amplifies wave motion
          float scrollAmp = 1.0 + uScrollProgress * 2.0;
          pos.y += sin(pos.x * 0.4 + uTime * 0.5 + ${phaseOffset.toFixed(2)}) * 0.08 * scrollAmp;
          pos.y += sin(pos.x * 0.15 + uTime * 0.3 + uScrollProgress * 6.28) * 0.05;
          // Scroll shifts waves horizontally
          pos.x += uScrollProgress * ${(1.5 + index * 0.3).toFixed(2)};
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform float uScrollProgress;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        varying vec2 vUv;
        void main() {
          float fade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
          // Traveling glow along the wave
          float glowPos = fract(uTime * 0.15 + uScrollProgress * 2.0 + ${(phaseOffset * 0.3).toFixed(2)});
          float glowDist = min(abs(vUv.x - glowPos), min(abs(vUv.x - glowPos + 1.0), abs(vUv.x - glowPos - 1.0)));
          float glow = smoothstep(0.15, 0.0, glowDist) * 0.5;
          vec3 color = mix(uColor, uGlowColor, glow);
          float alpha = (uOpacity + glow * 0.2) * fade;
          alpha *= 1.0 + uScrollProgress * 0.25;
          gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
        }
      `,
    });
  }, [opacity, phaseOffset, index]);

  materialRef.current = material;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scroll.progress;
    }
  });

  return <mesh geometry={geometry} material={material} />;
}

export default function FlowingWaves() {
  return (
    <group>
      {Array.from({ length: WAVE_COUNT }).map((_, i) => (
        <WaveLine key={i} index={i} />
      ))}
    </group>
  );
}
