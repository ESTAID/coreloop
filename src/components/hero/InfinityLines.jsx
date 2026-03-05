import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from '../scrollState';

const POINTS_PER_LINE = 200;
const DESKTOP_LINE_COUNT = 24;
const MOBILE_LINE_COUNT = 14;

function getLemniscatePoint(t, scale = 2.2) {
  const sinT = Math.sin(t);
  const cosT = Math.cos(t);
  const denom = 1 + sinT * sinT;
  return new THREE.Vector3(
    (scale * cosT) / denom,
    (scale * sinT * cosT) / denom,
    0
  );
}

const vertexShader = `
  uniform float uScrollProgress;
  uniform float uLineSpread;
  uniform float uTime;

  varying vec2 vUv;
  varying float vBrightness;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Scroll-driven breathing: lines expand/contract
    float breathe = sin(uScrollProgress * 3.14159) * uLineSpread;
    pos.y += normal.y * breathe * 0.3;
    pos.x += normal.x * breathe * 0.15;
    pos.z += normal.z * breathe * 0.2;

    // Brightness varies along the tube for depth
    vBrightness = 0.8 + 0.2 * sin(uv.x * 6.28 + uTime * 2.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uTraceSpeed;
  uniform float uTraceLength;
  uniform float uTraceOffset;
  uniform float uScrollProgress;
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform vec3 uAccentColor;

  varying vec2 vUv;
  varying float vBrightness;

  void main() {
    // === Scroll-driven flow: main energy pulse traveling along the line ===
    // Scroll progress maps directly to position on the curve (wraps 2 full loops)
    float scrollHead = fract(uScrollProgress + uTraceOffset * 0.3);

    // Wide glowing tail behind the scroll head
    float dScroll = vUv.x - scrollHead;
    // Wrap distance for closed loop
    dScroll = dScroll - floor(dScroll + 0.5);
    float tailLength = 0.25;
    // Tail trails behind the head (negative direction)
    float scrollFlow = smoothstep(-tailLength, 0.0, dScroll) * smoothstep(0.03, 0.0, dScroll);
    // Bright leading edge
    float scrollEdge = smoothstep(0.015, 0.0, abs(dScroll)) * 0.8;

    // === Ambient time-based trace (subtle, keeps things alive when not scrolling) ===
    float timeTrace = fract(uTime * uTraceSpeed * 0.5 + uTraceOffset);
    float dTime = vUv.x - timeTrace;
    dTime = dTime - floor(dTime + 0.5);
    float ambientTrace = smoothstep(-uTraceLength, 0.0, dTime) * smoothstep(0.01, 0.0, dTime) * 0.35;

    // Combine: scroll flow dominates when scrolling, ambient fills in at rest
    float scrollIntensity = smoothstep(0.0, 0.05, uScrollProgress);
    float trace = mix(ambientTrace, max(scrollFlow, scrollEdge), scrollIntensity);

    // Base alpha
    float alpha = uOpacity + trace * 0.5;

    // Color: base silver → blue glow on flow → bright cyan on leading edge
    vec3 color = uColor;
    color = mix(color, uGlowColor, scrollFlow * 0.6 + ambientTrace * 0.4);
    color = mix(color, uAccentColor, scrollEdge * 0.5);

    color *= vBrightness;

    float pulse = sin(uTime * 2.0 + uTraceOffset * 6.28) * 0.04 + 1.0;
    alpha *= pulse;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

function InfinityLine({ index, totalLines, pointsPerLine }) {
  const materialRef = useRef();
  const scroll = useScrollProgress();
  const offsetFactor = (index - totalLines / 2) / totalLines;

  const { geometry, uniforms } = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= pointsPerLine; i++) {
      const t = (i / pointsPerLine) * Math.PI * 2;
      const base = getLemniscatePoint(t);
      const offsetY = offsetFactor * 0.22;
      const offsetZ = offsetFactor * 0.08;
      const wobble = Math.sin(t * 3 + index * 0.5) * 0.02;
      pts.push(new THREE.Vector3(
        base.x,
        base.y + offsetY + wobble,
        base.z + offsetZ
      ));
    }

    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geo = new THREE.TubeGeometry(curve, pointsPerLine, 0.004, 5, true);

    const baseOpacity = 0.06 + (1 - Math.abs(offsetFactor) * 2) * 0.25;

    const uni = {
      uTime: { value: 0 },
      uOpacity: { value: baseOpacity },
      uTraceSpeed: { value: 0.18 + (index % 5) * 0.04 },
      uTraceLength: { value: 0.08 + (index % 4) * 0.025 },
      uTraceOffset: { value: index / totalLines },
      uScrollProgress: { value: 0 },
      uLineSpread: { value: Math.abs(offsetFactor) },
      uColor: { value: new THREE.Color('#c8c8d8') },
      uGlowColor: { value: new THREE.Color('#6eb5ff') },
      uAccentColor: { value: new THREE.Color('#00e5ff') },
    };

    return { geometry: geo, uniforms: uni };
  }, [offsetFactor, index, totalLines, pointsPerLine]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scroll.progress;
    }
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function InfinityLines() {
  const groupRef = useRef();
  const { viewport } = useThree();
  const scroll = useScrollProgress();

  const isMobile = viewport.width < 6;
  const lineCount = isMobile ? MOBILE_LINE_COUNT : DESKTOP_LINE_COUNT;
  const pointsPerLine = isMobile ? 100 : POINTS_PER_LINE;
  const baseScale = Math.min(1, viewport.width / 10);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle idle sway only — no scroll rotation
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.015;
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.03;
    groupRef.current.position.y = 0.3 + Math.sin(t * 0.4) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0.3, 0]} scale={baseScale}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <InfinityLine
          key={i}
          index={i}
          totalLines={lineCount}
          pointsPerLine={pointsPerLine}
        />
      ))}
    </group>
  );
}
