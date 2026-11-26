export interface FallbackSettings {
  shard: [number, number, number];
  accent: [number, number, number];
  lightMode: boolean;
  placement: number;
  material: 'glass' | 'chrome';
  count: number;
  shardSize: number;
  spread: number;
  twist: number;
  billow: number;
  speed: number;
  scale: number;
  depthOfField: number;
  vignette: number;
  intro: boolean;
  mouseInteraction: boolean;
  mouseStrength: number;
  markers: number;
  pulseOnClick: boolean;
  holdToGather: boolean;
  parallax: number;
  paused: boolean;
  dpr: number;
}

const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];
const SHARE = [0.26, 0.23, 0.2, 0.17, 0.14];
const FADE = [1, 0.82, 0.58, 0.38, 0.24];
const FULL_SLOPES: [number, number][] = [
  [0.18, -0.72],
  [-0.68, 0.04],
  [0.54, -0.06],
  [-0.22, 0.58],
  [0.72, 0.26]
];
const TAU = Math.PI * 2;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function startAeroShardsFallback(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  getSettings: () => FallbackSettings
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const rand = mulberry32(1337);
  const initialCount = Math.min(getSettings().count, 900);
  const shards: Array<{
    level: number;
    phase: number;
    lane: number;
    size: number;
    pts: [number, number][];
    spin: number;
    spinSpeed: number;
    tint: number;
    ox: number;
    oy: number;
    vx: number;
    vy: number;
    flash: number;
  }> = [];

  for (let level = 0; level < DEPTHS.length; level++) {
    const amount = Math.round(initialCount * SHARE[level]);
    for (let i = 0; i < amount; i++) {
      const nSides = rand() < 0.6 ? 3 : 4;
      const pts: [number, number][] = [];
      const baseAngle = rand() * TAU;
      for (let k = 0; k < nSides; k++) {
        const a = baseAngle + (k * TAU) / nSides + (rand() - 0.5) * 0.45;
        const r = 0.55 + rand() * 0.45;
        pts.push([Math.cos(a) * r, Math.sin(a) * r * (0.45 + rand() * 0.4)]);
      }
      shards.push({
        level,
        phase: (i + rand()) / Math.max(amount, 1),
        lane: (rand() * 2 - 1) * 0.95,
        size: (0.65 + rand() * 0.9) * (1 + level * 0.16),
        pts,
        spin: rand() * TAU,
        spinSpeed: (rand() - 0.5) * 0.9,
        tint: rand(),
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        flash: 0
      });
    }
  }

  // Survey markers
  const markers: Array<{ level: number; u: number; v: number; blinkSeed: number }> = [];
  for (let level = 0; level < 3; level++) {
    for (let i = 0; i < 16; i++) {
      markers.push({
        level,
        u: rand() * 1.1 - 0.05,
        v: rand() * 1.1 - 0.05,
        blinkSeed: rand()
      });
    }
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let inside = false;
  let presence = 0;
  let holding = false;
  let pressAt = -1;
  const rings: Array<{ x: number; y: number; age: number }> = [];

  const resize = () => {
    const s = getSettings();
    dpr = Math.min(window.devicePixelRatio || 1, s.dpr || 2);
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  io.observe(container);

  const onMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (inside) {
      pointerX = (e.clientX - rect.left) / Math.max(rect.width, 1);
      pointerY = (e.clientY - rect.top) / Math.max(rect.height, 1);
    }
  };

  const onDown = (e: PointerEvent) => {
    const s = getSettings();
    if (e.button !== 0 || !s.mouseInteraction) return;
    if (e.target instanceof Element && e.target.closest('a, button, input, textarea, select, label, [role="button"]')) {
      return;
    }
    const rect = container.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    pointerX = (e.clientX - rect.left) / Math.max(rect.width, 1);
    pointerY = (e.clientY - rect.top) / Math.max(rect.height, 1);
    inside = true;
    pressAt = clock;
  };

  const onUp = () => {
    const s = getSettings();
    if (pressAt < 0) return;
    if (!holding && s.pulseOnClick) {
      rings.push({ x: pointerX * width, y: pointerY * height, age: 0 });
      if (rings.length > 4) rings.shift();
    }
    pressAt = -1;
    holding = false;
  };

  const onLeave = () => {
    inside = false;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  document.documentElement.addEventListener('pointerleave', onLeave);

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const toRgba = (rgb: [number, number, number], a: number) =>
    `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${a.toFixed(3)})`;

  const tick = (now: number) => {
    if (!reduced) raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const s = getSettings();
    const dt = reduced ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!s.paused && !reduced) clock += dt;

    if (pressAt >= 0 && s.holdToGather && clock - pressAt > 0.18) {
      holding = true;
    }
    presence += ((inside && s.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));

    for (let i = rings.length - 1; i >= 0; i--) {
      rings[i].age += dt;
      if (rings[i].age > 2.2) rings.splice(i, 1);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const px = pointerX * width;
    const py = pointerY * height;
    const parX = (pointerX - 0.5) * width * 0.04 * s.parallax * presence;
    const parY = (pointerY - 0.5) * height * 0.04 * s.parallax * presence;

    // Draw back-to-front by level
    for (let level = DEPTHS.length - 1; level >= 0; level--) {
      const slope = FULL_SLOPES[level];
      const depthFade = FADE[level];
      const scaleFactor = 1 / (DEPTHS[level] / 3.2);

      // Markers
      if (s.markers >= 0 && level <= 2) {
        const markerRgb = s.accent;
        for (const m of markers) {
          if (m.level !== level) continue;
          const mx = ((m.u - clock * 0.012 * s.speed) % 1.1 + 1.1) % 1.1 - 0.05;
          const x = mx * width + parX * (1 - level * 0.25);
          const y = m.v * height + parY * (1 - level * 0.25);
          const blink = m.blinkSeed < 0.2 ? 0.5 + 0.5 * Math.sin(clock * 2.2 + m.blinkSeed * 30) : 0;
          const dist = Math.hypot(x - px, y - py);
          const near = presence > 0.05 && dist < 85 ? 1 - dist / 85 : 0;
          const alpha = depthFade * (0.28 + blink * 0.35 + near * 0.45);
          ctx.strokeStyle = toRgba(markerRgb, alpha);
          ctx.lineWidth = 1.2;
          const sz = 4.5 * scaleFactor * (1 + near * 0.35);
          if (s.markers === 0) {
            ctx.beginPath();
            ctx.moveTo(x - sz, y);
            ctx.lineTo(x + sz, y);
            ctx.moveTo(x, y - sz);
            ctx.lineTo(x, y + sz);
            ctx.stroke();
          } else {
            ctx.fillStyle = toRgba(markerRgb, alpha);
            ctx.beginPath();
            ctx.arc(x, y, sz * 0.5, 0, TAU);
            ctx.fill();
          }
          if (near > 0.25) {
            const fsz = sz * 2.1;
            ctx.strokeStyle = toRgba(markerRgb, near * 0.7);
            ctx.beginPath();
            ctx.rect(x - fsz, y - fsz, fsz * 2, fsz * 2);
            ctx.stroke();
          }
        }
      }

      // Shards in this depth level
      for (const sh of shards) {
        if (sh.level !== level) continue;
        const t = ((sh.phase + clock * 0.028 * s.speed / (1 + level * 0.35)) % 1 + 1) % 1;
        const u = -0.1 + 1.2 * t;
        const vNorm =
          slope[0] +
          (slope[1] - slope[0]) * t +
          0.08 * s.billow * Math.sin(t * TAU * 0.8 - clock * 0.6 * s.speed + level * 2.1) +
          sh.lane * 0.09 * s.spread;

        const baseX = u * width + parX * (1 - level * 0.16);
        const baseY = (0.5 - vNorm * 0.48) * height + parY * (1 - level * 0.16);

        // Cursor parting / hold-to-gather physics
        let fx = 0;
        let fy = 0;
        if (s.mouseInteraction && presence > 0.02) {
          const dx = baseX + sh.ox - px;
          const dy = baseY + sh.oy - py;
          const dist = Math.hypot(dx, dy);
          if (holding && level <= 2 && dist < 240) {
            const ang = Math.atan2(dy, dx) + 1.1;
            const targetR = 36 + (sh.phase * 70);
            const gx = px + Math.cos(ang + clock * 2.2) * targetR - baseX;
            const gy = py + Math.sin(ang + clock * 2.2) * targetR - baseY;
            fx += (gx - sh.ox) * 18;
            fy += (gy - sh.oy) * 18;
          } else if (dist < 130 && dist > 1) {
            const push = ((1 - dist / 130) ** 2) * 180 * s.mouseStrength * presence;
            fx += (dx / dist) * push;
            fy += (dy / dist) * push;
          }
        }

        // Click pulse ring interaction
        for (const r of rings) {
          const rad = Math.max(0, r.age - level * 0.06) * 420;
          const dx = baseX + sh.ox - r.x;
          const dy = baseY + sh.oy - r.y;
          const d = Math.hypot(dx, dy);
          const band = Math.exp(-((d - rad) ** 2) / 1400) * (1 - r.age / 2.2);
          if (band > 0.02 && d > 1) {
            sh.flash = Math.max(sh.flash, band);
            fx += (dx / d) * band * 260;
            fy += (dy / d) * band * 260;
          }
        }

        sh.vx += (fx - 14 * sh.ox - 6.5 * sh.vx) * dt;
        sh.vy += (fy - 14 * sh.oy - 6.5 * sh.vy) * dt;
        sh.ox += sh.vx * dt;
        sh.oy += sh.vy * dt;
        sh.flash *= Math.exp(-dt / 0.4);

        const x = baseX + sh.ox;
        const y = baseY + sh.oy;
        const taper = Math.sin(t * Math.PI);
        const rad = 16 * s.shardSize * sh.size * scaleFactor * s.scale * (0.35 + 0.65 * taper);
        if (rad < 1.2) continue;

        const rot = sh.spin + clock * sh.spinSpeed * s.speed * 0.5 + t * s.twist * 2.4;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);

        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let k = 0; k < sh.pts.length; k++) {
          const px0 = sh.pts[k][0] * rad;
          const py0 = sh.pts[k][1] * rad;
          const rx = px0 * cos - py0 * sin;
          const ry = px0 * sin + py0 * cos;
          if (k === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();

        const rgb = sh.tint > 0.45 ? s.shard : s.accent;
        const alpha = depthFade * (0.28 + 0.3 * taper + sh.flash * 0.35);
        ctx.fillStyle = toRgba(rgb, alpha);
        ctx.fill();
        ctx.strokeStyle = toRgba(s.accent, Math.min(0.9, alpha * 1.55));
        ctx.lineWidth = Math.max(0.75, 1.2 * scaleFactor);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw click pulse rings
    for (const r of rings) {
      const life = 1 - r.age / 2.2;
      ctx.strokeStyle = toRgba(s.accent, life * 0.45);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.age * 420, 0, TAU);
      ctx.stroke();
    }

    // Subtle edge vignette if enabled
    if (s.vignette > 0.01) {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.28,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      grad.addColorStop(0, 'rgba(250, 252, 247, 0)');
      grad.addColorStop(1, `rgba(250, 252, 247, ${(s.vignette * 0.55).toFixed(3)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  };

  resize();
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}

