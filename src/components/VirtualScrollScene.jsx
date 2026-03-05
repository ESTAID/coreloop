import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { FEATURED_CAROUSEL, PORTFOLIO_DATA } from '../data/constants';
import { scrollState } from './scrollState';
import InfinityLines from './hero/InfinityLines';
import FlowingWaves from './hero/FlowingWaves';

// =============================================
// Virtual Scroll Constants & State
// =============================================
const TOTAL_SECTIONS = 12;
const SECTION_HEIGHT = 8;
const MAX_SCROLL = (TOTAL_SECTIONS - 1) * SECTION_HEIGHT;
const DAMPING = 0.07;

const vScroll = { target: 0, current: 0 };

// =============================================
// Overlay opacity calculation
// =============================================
function calcOpacity(scrollY, enterAt, exitAt) {
  const fadeLen = SECTION_HEIGHT * 0.8;
  if (scrollY < enterAt || scrollY > exitAt) return 0;
  if (scrollY < enterAt + fadeLen) return (scrollY - enterAt) / fadeLen;
  if (scrollY > exitAt - fadeLen) return (exitAt - scrollY) / fadeLen;
  return 1;
}

// =============================================
// 3D: Scroll Sync — damping + shared state
// =============================================
function ScrollSync() {
  useFrame(() => {
    vScroll.current += (vScroll.target - vScroll.current) * DAMPING;
    // Write to shared scrollState so InfinityLines/FlowingWaves can read it
    scrollState.progress = vScroll.current / MAX_SCROLL;
  });
  return null;
}

// =============================================
// 3D: Particles
// =============================================
function Particles() {
  const count = 400;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#7799dd" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

// =============================================
// 3D: Scene composition
// =============================================
function Scene() {
  return (
    <>
      <ScrollSync />
      <InfinityLines />
      <FlowingWaves />
      <Particles />
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

// =============================================
// Main Component
// =============================================
export default function VirtualScrollScene() {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceCardsRef = useRef(null);
  const portfolioRef = useRef(null);
  const ctaRef = useRef(null);
  const progressRef = useRef(null);
  const scrollHintRef = useRef(null);
  const statusRef = useRef(null);
  const sectionDotsRef = useRef([]);

  const sections = useMemo(
    () => [
      { ref: 'heroRef', enter: 0, exit: 14 },
      { ref: 'aboutRef', enter: 16, exit: 30 },
      { ref: 'serviceCardsRef', enter: 32, exit: 50 },
      { ref: 'portfolioRef', enter: 52, exit: 72 },
      { ref: 'ctaRef', enter: 74, exit: 88 },
    ],
    [],
  );

  const overlayRefs = { heroRef, aboutRef, serviceCardsRef, portfolioRef, ctaRef };

  useEffect(() => {
    let lastSection = 0;

    const onWheel = (e) => {
      e.preventDefault();
      vScroll.target += e.deltaY * 0.01;
      vScroll.target = Math.max(0, Math.min(MAX_SCROLL, vScroll.target));
    };

    const onKeyDown = (e) => {
      const step = SECTION_HEIGHT;
      const bigStep = step * 3;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          vScroll.target = Math.min(MAX_SCROLL, vScroll.target + step);
          break;
        case 'ArrowUp':
          e.preventDefault();
          vScroll.target = Math.max(0, vScroll.target - step);
          break;
        case 'PageDown':
          e.preventDefault();
          vScroll.target = Math.min(MAX_SCROLL, vScroll.target + bigStep);
          break;
        case 'PageUp':
          e.preventDefault();
          vScroll.target = Math.max(0, vScroll.target - bigStep);
          break;
        case 'Home':
          e.preventDefault();
          vScroll.target = 0;
          break;
        case 'End':
          e.preventDefault();
          vScroll.target = MAX_SCROLL;
          break;
      }
    };

    let lastTouchY = 0;
    const onTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const dy = lastTouchY - e.touches[0].clientY;
      vScroll.target += dy * 0.05;
      vScroll.target = Math.max(0, Math.min(MAX_SCROLL, vScroll.target));
      lastTouchY = e.touches[0].clientY;
    };

    let rafId;
    const update = () => {
      const s = vScroll.current;

      sections.forEach((sec) => {
        const el = overlayRefs[sec.ref]?.current;
        if (el) {
          const o = calcOpacity(s, sec.enter, sec.exit);
          el.style.opacity = o;
          el.style.pointerEvents = o > 0.1 ? 'auto' : 'none';
        }
      });

      if (progressRef.current) {
        progressRef.current.style.height = `${(s / MAX_SCROLL) * 100}%`;
      }

      const activeSec = Math.round(s / (MAX_SCROLL / (sections.length - 1)));
      sectionDotsRef.current.forEach((dot, i) => {
        if (dot) {
          dot.style.opacity = i === activeSec ? '1' : '0.25';
          dot.style.transform = i === activeSec ? 'scale(1.5)' : 'scale(1)';
        }
      });

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = s < SECTION_HEIGHT * 0.3 ? '1' : '0';
      }

      const currentSec = Math.round(s / SECTION_HEIGHT) + 1;
      if (currentSec !== lastSection && statusRef.current) {
        statusRef.current.textContent = `섹션 ${currentSec} / ${TOTAL_SECTIONS}`;
        lastSection = currentSec;
      }

      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    document.body.style.overflow = 'hidden';
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(rafId);
      document.body.style.overflow = '';
      vScroll.target = 0;
      vScroll.current = 0;
      scrollState.progress = 0;
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#06060c]">
      {/* === Three.js Canvas === */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        className="!absolute !inset-0"
      >
        <color attach="background" args={['#06060c']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* === Header === */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="text-white/90 text-xl font-light tracking-wider flex items-center">
          <span className="text-blue-400 font-bold text-2xl mr-1.5">CL</span>
          CoreLoop
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white/40 text-sm hover:text-white/80 transition-colors">
            서비스
          </a>
          <a href="#" className="text-white/40 text-sm hover:text-white/80 transition-colors">
            포트폴리오
          </a>
          <Link to="/blog" className="text-white/40 text-sm hover:text-white/80 transition-colors">
            블로그
          </Link>
        </nav>
        <button className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-full text-sm backdrop-blur-sm border border-white/10 transition-colors">
          <Mail className="w-4 h-4 mr-2" />
          문의하기
        </button>
      </header>

      {/* === Content Overlays === */}

      {/* 1. Hero */}
      <div
        ref={heroRef}
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center">
          <h1 className="text-white text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extralight tracking-[0.25em] md:tracking-[0.35em] mb-4 select-none">
            CORELOOP
          </h1>
          <p className="text-white/40 text-xs sm:text-sm md:text-lg tracking-[0.3em] md:tracking-[0.5em] font-light">
            움직이는 지능
          </p>
        </div>
      </div>

      {/* 2. About / Services Intro */}
      <div
        ref={aboutRef}
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className="text-center max-w-2xl mx-auto px-6">
          <p className="text-blue-400/80 text-xs md:text-sm tracking-[0.3em] mb-4 uppercase">
            Services
          </p>
          <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-light tracking-wide mb-6">
            What We Build
          </h2>
          <p className="text-white/40 text-sm md:text-lg leading-relaxed">
            최신 기술과 창의적인 사고로
            <br />
            디지털 경험의 새로운 기준을 만들어갑니다.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['React', 'Next.js', 'Three.js', 'AI/ML', 'Cloud'].map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 text-xs md:text-sm text-white/50 border border-white/10 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Service Cards */}
      <div
        ref={serviceCardsRef}
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className="max-w-5xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {FEATURED_CAROUSEL.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-6 md:p-7 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-default"
              >
                <h3 className="text-white text-base md:text-lg font-medium mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4 md:mt-5 max-w-[680px] mx-auto">
            {FEATURED_CAROUSEL.slice(3).map((item) => (
              <div
                key={item.id}
                className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-6 md:p-7 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-default"
              >
                <h3 className="text-white text-base md:text-lg font-medium mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Portfolio */}
      <div
        ref={portfolioRef}
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className="max-w-5xl mx-auto px-6 w-full">
          <p className="text-blue-400/80 text-xs md:text-sm tracking-[0.3em] mb-4 uppercase text-center">
            Portfolio
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-light tracking-wide mb-8 text-center">
            Our Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PORTFOLIO_DATA.map((item) => (
              <div
                key={item.id}
                className="group bg-white/[0.03] backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/15 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-white text-sm md:text-base font-medium mb-1">
                    {item.title}
                  </h3>
                  <p className="text-white/25 text-xs md:text-sm line-clamp-2">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. CTA */}
      <div
        ref={ctaRef}
        className="fixed inset-0 flex items-center justify-center z-10"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className="text-center max-w-xl mx-auto px-6">
          <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-light tracking-wide mb-5">
            Let's Create
          </h2>
          <p className="text-white/40 text-sm md:text-lg leading-relaxed mb-10">
            함께 미래를 만들어갈 준비가 되셨나요?
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
            프로젝트 시작하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* === Progress Bar + Section Dots === */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex items-center gap-3">
        <div className="flex flex-col gap-3 items-center">
          {sections.map((_, i) => (
            <div
              key={i}
              ref={(el) => (sectionDotsRef.current[i] = el)}
              className="w-1.5 h-1.5 rounded-full bg-white transition-all duration-300"
              style={{ opacity: i === 0 ? 1 : 0.25 }}
            />
          ))}
        </div>
        <div className="w-[3px] h-[200px] bg-white/[0.08] rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="w-full bg-white/60 rounded-full transition-[height] duration-75"
            style={{ height: '0%' }}
          />
        </div>
      </div>

      {/* === Scroll Indicator === */}
      <div
        ref={scrollHintRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 transition-opacity duration-700"
      >
        <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>

      {/* === Accessibility === */}
      <div ref={statusRef} className="sr-only" aria-live="polite" aria-atomic="true">
        섹션 1 / {TOTAL_SECTIONS}
      </div>
    </div>
  );
}
