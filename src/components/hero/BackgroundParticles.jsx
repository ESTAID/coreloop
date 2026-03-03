import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from './HeroSection';

const PARTICLE_COUNT = 150;

const vertexShader = `
  attribute float aOpacity;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aVelocity;

  uniform float uTime;
  uniform float uScrollProgress;

  varying float vOpacity;
  varying float vGlow;

  void main() {
    // Particles drift based on scroll + time
    vec3 pos = position;
    float drift = uTime * 0.08 + uScrollProgress * 2.0;
    pos += aVelocity * drift;

    // Wrap particles when they go out of bounds
    pos.x = mod(pos.x + 6.0, 12.0) - 6.0;
    pos.y = mod(pos.y + 4.0, 8.0) - 4.0;

    // Twinkle effect with scroll boost
    float twinkle = sin(uTime * 0.8 + aPhase) * 0.5 + 0.5;
    float scrollBrightness = 1.0 + uScrollProgress * 0.5;
    vOpacity = aOpacity * twinkle * scrollBrightness * 0.6;

    // Some particles glow brighter during scroll
    vGlow = smoothstep(0.3, 0.8, sin(uTime * 0.5 + aPhase * 2.0)) * uScrollProgress;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeScale = 1.0 + uScrollProgress * 0.5;
    gl_PointSize = aSize * sizeScale * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vOpacity;
  varying float vGlow;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // Soft glow circle
    float circle = smoothstep(0.5, 0.0, d);

    // 4-pointed star cross for sparkle
    float cross = exp(-8.0 * min(abs(uv.x), abs(uv.y)));

    float core = smoothstep(0.12, 0.0, d) * 0.8;

    float alpha = (circle * 0.3 + cross * 0.25 + core * 0.4) * vOpacity;

    // White to cyan shift on glow
    vec3 color = mix(vec3(1.0), vec3(0.6, 0.95, 1.0), vGlow);

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export default function BackgroundParticles() {
  const pointsRef = useRef();
  const materialRef = useRef();
  const scroll = useScrollProgress();

  const { positions, opacities, sizes, phases, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const opa = new Float32Array(PARTICLE_COUNT);
    const siz = new Float32Array(PARTICLE_COUNT);
    const pha = new Float32Array(PARTICLE_COUNT);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      opa[i] = Math.random() * 0.5 + 0.15;
      siz[i] = Math.random() * 3.0 + 0.8;
      pha[i] = Math.random() * Math.PI * 2;
      vel[i * 3] = (Math.random() - 0.5) * 0.3;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    return { positions: pos, opacities: opa, sizes: siz, phases: pha, velocities: vel };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scroll.progress;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          count={PARTICLE_COUNT}
          array={opacities}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={PARTICLE_COUNT}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aVelocity"
          count={PARTICLE_COUNT}
          array={velocities}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
        }}
      />
    </points>
  );
}
