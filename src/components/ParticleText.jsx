import { useEffect, useRef, useCallback } from 'react';

const WORDS = ['당신의 상상', '우리의 기술로', '현실이 됩니다', 'made by', 'CORELOOP'];
const PIXEL_STEPS = 6;

function getFont(w) {
  const size = Math.max(32, Math.min(100, w * 0.1));
  return `bold ${size}px Helvetica, Arial, sans-serif`;
}

function generateRandomPos(cx, cy, mag, w, h) {
  const rx = Math.random() * w;
  const ry = Math.random() * h;
  let dx = rx - cx;
  let dy = ry - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: cx + (dx / len) * mag, y: cy + (dy / len) * mag };
}

function createParticle(w, h) {
  const pos = generateRandomPos(w / 2, h / 2, (w + h) / 2, w, h);
  return {
    x: pos.x, y: pos.y,
    vx: 0, vy: 0, ax: 0, ay: 0,
    tx: 0, ty: 0,
    maxSpeed: 4 + Math.random() * 6,
    maxForce: 0,
    size: 6 + Math.random() * 6,
    isKilled: false,
    startR: 0, startG: 0, startB: 0,
    targetR: 0, targetG: 0, targetB: 0,
    colorWeight: 0,
    colorBlendRate: 0.0025 + Math.random() * 0.0275,
  };
}

function moveParticle(p) {
  const dx = p.tx - p.x;
  const dy = p.ty - p.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const proximityMult = dist < 100 ? dist / 100 : 1;

  const twdx = (dx / dist) * p.maxSpeed * proximityMult;
  const twdy = (dy / dist) * p.maxSpeed * proximityMult;

  let sx = twdx - p.vx;
  let sy = twdy - p.vy;
  const sLen = Math.sqrt(sx * sx + sy * sy) || 1;
  sx = (sx / sLen) * p.maxForce;
  sy = (sy / sLen) * p.maxForce;

  p.vx += sx; p.vy += sy;
  p.x += p.vx; p.y += p.vy;
}

function killParticle(p, w, h) {
  if (p.isKilled) return;
  const pos = generateRandomPos(w / 2, h / 2, (w + h) / 2, w, h);
  p.tx = pos.x;
  p.ty = pos.y;
  const cw = p.colorWeight;
  p.startR += (p.targetR - p.startR) * cw;
  p.startG += (p.targetG - p.startG) * cw;
  p.startB += (p.targetB - p.startB) * cw;
  p.targetR = 0; p.targetG = 0; p.targetB = 0;
  p.colorWeight = 0;
  p.isKilled = true;
}

function getTextPixels(word, w, h) {
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = getFont(w);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, w / 2, h / 2);
  return ctx.getImageData(0, 0, w, h).data;
}

export default function ParticleText({ className }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  const setWord = useCallback((word) => {
    const s = stateRef.current;
    if (!s) return;
    const { w, h, particles } = s;
    const pixels = getTextPixels(word, w, h);

    const newR = 200 + Math.random() * 55;
    const newG = 200 + Math.random() * 55;
    const newB = 200 + Math.random() * 55;

    const coords = [];
    for (let i = 0; i < w * h; i += PIXEL_STEPS) {
      if (pixels[i * 4] > 128) coords.push(i);
    }
    // Fisher-Yates shuffle
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }

    let pi = 0;
    for (const coordIndex of coords) {
      let p;
      if (pi < particles.length) {
        p = particles[pi];
        p.isKilled = false;
      } else {
        p = createParticle(w, h);
        p.maxForce = p.maxSpeed * 0.05;
        particles.push(p);
      }

      const cw = p.colorWeight;
      p.startR += (p.targetR - p.startR) * cw;
      p.startG += (p.targetG - p.startG) * cw;
      p.startB += (p.targetB - p.startB) * cw;
      p.targetR = newR; p.targetG = newG; p.targetB = newB;
      p.colorWeight = 0;

      p.tx = coordIndex % w;
      p.ty = Math.floor(coordIndex / w);
      pi++;
    }

    for (let i = pi; i < particles.length; i++) {
      killParticle(particles[i], w, h);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    stateRef.current = { w, h, particles: [], wordIndex: 0 };
    setWord(WORDS[0]);

    // Scroll handler — no repeat, direction-aware
    let accumulatedScroll = 0;
    const SCROLL_THRESHOLD = 2000;

    const onWheel = (e) => {
      e.preventDefault();
      const s = stateRef.current;
      if (!s) return;

      accumulatedScroll += e.deltaY;

      if (accumulatedScroll >= SCROLL_THRESHOLD) {
        accumulatedScroll = 0;
        if (s.wordIndex < WORDS.length - 1) {
          s.wordIndex++;
          setWord(WORDS[s.wordIndex]);
        }
      } else if (accumulatedScroll <= -SCROLL_THRESHOLD) {
        accumulatedScroll = 0;
        if (s.wordIndex > 0) {
          s.wordIndex--;
          setWord(WORDS[s.wordIndex]);
        }
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Touch swipe for mobile
    let touchStartY = 0;
    let touchAccumulated = 0;
    const TOUCH_THRESHOLD = 120;

    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchAccumulated = 0;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const s = stateRef.current;
      if (!s) return;
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      touchAccumulated += dy;

      if (touchAccumulated >= TOUCH_THRESHOLD) {
        touchAccumulated = 0;
        if (s.wordIndex < WORDS.length - 1) {
          s.wordIndex++;
          setWord(WORDS[s.wordIndex]);
        }
      } else if (touchAccumulated <= -TOUCH_THRESHOLD) {
        touchAccumulated = 0;
        if (s.wordIndex > 0) {
          s.wordIndex--;
          setWord(WORDS[s.wordIndex]);
        }
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    // Right-click drag to scatter
    let isRightDragging = false;
    const onMouseDown = (e) => { if (e.button === 2) isRightDragging = true; };
    const onMouseUp = (e) => { if (e.button === 2) isRightDragging = false; };
    const onMouseMove = (e) => {
      if (!isRightDragging || !stateRef.current) return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      for (const p of stateRef.current.particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        if (dx * dx + dy * dy < 2500) killParticle(p, stateRef.current.w, stateRef.current.h);
      }
    };
    const onContextMenu = (e) => e.preventDefault();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('contextmenu', onContextMenu);

    // Animation loop
    let animId;
    const draw = () => {
      const s = stateRef.current;
      if (!s) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, w, h);

      const { particles } = s;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        moveParticle(p);

        const cw = p.colorWeight;
        const r = Math.round(p.startR + (p.targetR - p.startR) * cw);
        const g = Math.round(p.startG + (p.targetG - p.startG) * cw);
        const b = Math.round(p.startB + (p.targetB - p.startB) * cw);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(p.x, p.y, 2, 2);

        if (p.colorWeight < 1) {
          p.colorWeight = Math.min(p.colorWeight + p.colorBlendRate, 1);
        }

        if (p.isKilled && (p.x < 0 || p.x > w || p.y < 0 || p.y > h)) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('contextmenu', onContextMenu);
      stateRef.current = null;
    };
  }, [setWord]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
    />
  );
}
