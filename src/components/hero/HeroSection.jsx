import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import InfinityLines from './InfinityLines';
import FlowingWaves from './FlowingWaves';

// Shared scroll state accessible by Three.js components
const scrollState = { progress: 0 };

export function useScrollProgress() {
  return scrollState;
}

function Scene() {
  return (
    <>
      <InfinityLines />
      <FlowingWaves />
      <EffectComposer>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function HeroSection() {
  const sectionRef = useRef(null);
  const [textOpacity, setTextOpacity] = useState(1);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
    scrollState.progress = progress;

    // Fade text out as user scrolls
    setTextOpacity(Math.max(0, 1 - progress * 2.5));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section ref={sectionRef} className="relative w-full h-[300vh] bg-[#06060c]">
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <color attach="background" args={['#06060c']} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>

        {/* Text Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
          style={{ opacity: textOpacity }}
        >
          <div className="mt-24 md:mt-32 text-center">
            <h1 className="text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-5">
              CORELOOP
            </h1>
            <p className="text-white/60 text-xs sm:text-sm md:text-base tracking-[0.3em] md:tracking-[0.4em] font-light">
              움직이는 지능
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10 transition-opacity duration-500"
          style={{ opacity: textOpacity > 0.5 ? 1 : 0 }}
        >
          <span className="text-white/30 text-[10px] tracking-[0.3em]">스크롤</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
