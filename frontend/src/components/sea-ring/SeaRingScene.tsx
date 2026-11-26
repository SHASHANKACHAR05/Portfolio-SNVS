import React, { useRef, useState, useEffect } from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { LIFECYCLE_STAGES, SEA_ASSETS, LifecycleStage } from './seaRingData';

interface SeaRingSceneProps {
  onSelectStage: (stage: LifecycleStage) => void;
  isModalOpen?: boolean;
}

export const SeaRingScene: React.FC<SeaRingSceneProps> = ({ onSelectStage, isModalOpen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interaction State
  const [rotation, setRotation] = useState<number>(0);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Refs for smooth animation loop & gesture handling
  const isDraggingRef = useRef<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const pointerDownStageRef = useRef<LifecycleStage | null>(null);
  const lastPointerSelectTimeRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rotationSpring = useRef({ current: 0, target: 0, velocity: 0 });
  const dragTracker = useRef({ startX: 0, startRot: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const isHoveredOnStage = useRef<boolean>(false);
  const onSelectStageRef = useRef(onSelectStage);
  onSelectStageRef.current = onSelectStage;
  const isModalOpenRef = useRef(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Spring animation loop: continuously rotates cards from RIGHT TO LEFT
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Parallax spring
      if (!reducedMotion) {
        const kParallax = 40;
        const dParallax = 18;
        const dx = mousePos.current.targetX - mousePos.current.x;
        const dy = mousePos.current.targetY - mousePos.current.y;
        mousePos.current.x += dx * Math.min(dt * (kParallax / dParallax), 1);
        mousePos.current.y += dy * Math.min(dt * (kParallax / dParallax), 1);
      }

      // Continuous auto-rotation from RIGHT TO LEFT (positive target delta advances in chronological order 01 -> 02 -> 03)
      if (!isDraggingRef.current) {
        const autoSpeed = isHoveredOnStage.current ? 3.0 : 6.5; // deg/sec: visible, smooth continuous movement
        if (!reducedMotion && !isPointerDownRef.current && !isModalOpenRef.current) {
          rotationSpring.current.target += autoSpeed * dt;
        }

        const kRot = 140;
        const dRot = 24;
        const diff = rotationSpring.current.target - rotationSpring.current.current;
        const accel = diff * kRot - rotationSpring.current.velocity * dRot;
        rotationSpring.current.velocity += accel * dt;
        rotationSpring.current.current += rotationSpring.current.velocity * dt;
      } else {
        rotationSpring.current.current = rotationSpring.current.target;
      }

      setRotation(rotationSpring.current.current);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion]);

  // Pointer move inside container for parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mousePos.current.targetX = Math.max(-1, Math.min(1, nx)) * 14;
    mousePos.current.targetY = Math.max(-1, Math.min(1, ny)) * 10;

    // Check if dragging
    if (isPointerDownRef.current) {
      const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);
      if (dist > 12) {
        hasMovedRef.current = true;
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        const now = performance.now();
        const dt = Math.max((now - dragTracker.current.lastTime) / 1000, 0.008);
        const deltaX = e.clientX - dragTracker.current.startX;
        const instantVx = (e.clientX - dragTracker.current.lastX) / dt;

        dragTracker.current.lastX = e.clientX;
        dragTracker.current.lastTime = now;
        dragTracker.current.velocity = instantVx * 0.12;

        const rotSensitivity = 0.28;
        // Dragging left moves cards left, dragging right moves cards right
        const newTarget = dragTracker.current.startRot + deltaX * rotSensitivity;
        rotationSpring.current.target = newTarget;
        rotationSpring.current.current = newTarget;
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    isDraggingRef.current = false;
    pointerDownPos.current = { x: e.clientX, y: e.clientY };

    dragTracker.current = {
      startX: e.clientX,
      startRot: rotationSpring.current.current,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
  };

  // Global window pointerup ensures drag state never gets stuck and clicks on moving 3D cards always fire
  useEffect(() => {
    const handleGlobalPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);
      const clickedStage = pointerDownStageRef.current;

      if (isDraggingRef.current) {
        // Apply momentum flick
        rotationSpring.current.velocity = dragTracker.current.velocity;
        rotationSpring.current.target += dragTracker.current.velocity * 0.35;
      } else if (clickedStage && !hasMovedRef.current && dist <= 12) {
        lastPointerSelectTimeRef.current = performance.now();
        onSelectStageRef.current(clickedStage);
      }

      pointerDownStageRef.current = null;
      isPointerDownRef.current = false;
      isDraggingRef.current = false;
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  const handlePointerLeave = () => {
    mousePos.current.targetX = 0;
    mousePos.current.targetY = 0;
    isHoveredOnStage.current = false;
  };

  // Scoped Wheel Spin Guard: only spins ring when hovered directly over ring stage and modal is closed
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (isModalOpen || e.ctrlKey || e.metaKey) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 4) {
        e.preventDefault();
        rotationSpring.current.target += delta * 0.16;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isModalOpen]);

  // 9 Cards Cylinder Geometry: 360 / 9 = 40 deg per slot, radius ~ 490px
  const totalCards = LIFECYCLE_STAGES.length; // 9 cards
  const angleStep = 360 / totalCards; // 40 degrees
  const cylinderRadius = 490; // px

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { isHoveredOnStage.current = true; }}
      onPointerLeave={handlePointerLeave}
      className="relative w-full rounded-3xl overflow-hidden select-none border border-[#EEF4F6]/15 shadow-2xl transition-all duration-500 bg-[#0A0E11]"
      style={{
        height: 'clamp(540px, 72vh, 760px)',
        perspective: '1200px',
      }}
    >
      {/* 1. Turquoise Sea Still Background (Proxy) */}
      <img
        src={SEA_ASSETS.STILL_PROXY}
        alt="Sunlit Sea Horizon"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none filter brightness-95 contrast-105"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.current.x * 0.4}px, ${mousePos.current.y * 0.4}px, 0) scale(1.06)`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* 2. Ambient Sea Loop Video */}
      <video
        ref={videoRef}
        src={SEA_ASSETS.LOOP_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-85 mix-blend-screen"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.current.x * 0.5}px, ${mousePos.current.y * 0.5}px, 0) scale(1.06)`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* 3. Atmospheric Vignette & Mist Layer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0E11] via-[#0E2A3B]/40 to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A0E11]/60 via-transparent to-[#0A0E11]/60" />

      {/* 4. Fine Grain / Jitter Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(#EEF4F6 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* 5. Floating Ambient Motes (14 motes) */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#9ED8E4]/60 blur-[1px] animate-pulse"
              style={{
                top: `${(i * 19) % 90 + 5}%`,
                left: `${(i * 27) % 92 + 4}%`,
                animationDuration: `${3 + (i % 5) * 1.5}s`,
                animationDelay: `${(i * 0.4)}s`,
                transform: `translate3d(${mousePos.current.x * (0.8 + (i % 3) * 0.4)}px, ${mousePos.current.y * (0.8 + (i % 3) * 0.4)}px, 0)`,
              }}
            />
          ))}
        </div>
      )}

      {/* 6. Top Stage Badge / Instructions */}
      <div className="absolute top-6 left-4 right-4 sm:left-8 sm:right-8 lg:left-12 lg:right-12 z-20 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141C22]/85 backdrop-blur-md border border-[#EEF4F6]/20 shadow-md">
          <Compass className="w-3.5 h-3.5 text-[#3AA8D0] animate-spin-slow" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#EEF4F6]">
            3D Product Ring &middot; 9 Lifecycle Phases
          </span>
        </div>
      </div>

      {/* 7. Interactive 3D Cylindrical Ring Stage (9 Cards) */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10"
        style={{
          transformStyle: 'preserve-3d',
          transform: reducedMotion
            ? 'none'
            : `rotateX(${-mousePos.current.y * 0.15}deg) rotateY(${mousePos.current.x * 0.2}deg)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div
          ref={ringRef}
          className="relative w-0 h-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${cylinderRadius}px) rotateY(${rotation}deg)`,
          }}
        >
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const slotAngle = idx * angleStep;
            
            // Normalized angle relative to viewer front (0 deg = facing viewer)
            let currentAngle = (slotAngle + rotation) % 360;
            if (currentAngle < 0) currentAngle += 360;
            const rad = (currentAngle * Math.PI) / 180;
            
            // Distance from viewer center: cos(rad) = 1 is closest, -1 is furthest back
            const cosVal = Math.cos(rad);
            const isHovered = hoveredCardId === stage.id;

            // Subtle dive curvature: dive = sin(t * PI) * -20
            const diveOffset = Math.sin(rad) * -20;

            return (
              <div
                key={stage.id}
                role="button"
                tabIndex={0}
                onPointerEnter={() => setHoveredCardId(stage.id)}
                onPointerLeave={() => setHoveredCardId(null)}
                onPointerDown={(e) => {
                  if (e.button === 0) {
                    pointerDownStageRef.current = stage;
                  }
                }}
                // Fallback click handler (e.g. keyboard / synthetic click) without double-firing
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasMovedRef.current && performance.now() - lastPointerSelectTimeRef.current > 250) {
                    onSelectStage(stage);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStage(stage);
                  }
                }}
                className="absolute top-0 left-0 -ml-[145px] -mt-[105px] w-[290px] h-[210px] rounded-2xl overflow-hidden shadow-2xl transition-[border-color,box-shadow,background-color] duration-200 group cursor-pointer border border-[#EEF4F6]/20 bg-[#111920]/95 backdrop-blur-xl p-5 flex flex-col justify-between text-left select-none hover:border-[#3AA8D0] hover:shadow-glow-gold hover:bg-[#141C22]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${slotAngle}deg) translateZ(${cylinderRadius}px) translateY(${diveOffset}px) scale(${isHovered ? 1.06 : 1})`,
                  opacity: cosVal < -0.3 ? 0.35 : Math.max(0.45, (cosVal + 0.6) / 1.6),
                  zIndex: Math.round((cosVal + 1) * 100),
                  pointerEvents: cosVal < -0.1 ? 'none' : 'auto',
                }}
              >
                {/* Glowing Top Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1E86AC] via-[#3AA8D0] to-[#9ED8E4] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Card Header */}
                <div className="space-y-1.5 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#3AA8D0]/20 text-[#9ED8E4] border border-[#3AA8D0]/30">
                      STAGE {stage.num}
                    </span>
                    <span className="text-[10px] font-mono text-[#9FB4BF] uppercase tracking-wider truncate max-w-[140px]">
                      {stage.badge}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold font-display text-[#EEF4F6] tracking-tight group-hover:text-[#3AA8D0] transition-colors">
                    {stage.name}
                  </h4>
                </div>

                {/* Card Objective Snippet */}
                <p className="text-xs text-[#9FB4BF] leading-relaxed line-clamp-3 pointer-events-none">
                  {stage.objective}
                </p>

                {/* Card Footer: Interactive CTA Indicator */}
                <div className="pt-3 border-t border-[#EEF4F6]/10 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9ED8E4]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3AA8D0]" />
                    <span>{stage.deliverables.length} Deliverables</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#05090C] bg-[#3AA8D0] group-hover:bg-[#2597C0] px-2.5 py-1 rounded-md transition-all shadow-md">
                    <span>View Phase</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                {/* Glowing Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#3AA8D0]/80 pointer-events-none transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Bottom Navigation Controls / Phase Indicator */}
      <div className="absolute bottom-5 inset-x-4 sm:inset-x-8 lg:inset-x-12 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['Discover', 'Define', 'Strategize', 'Prioritize', 'Design', 'Develop', 'Deliver', 'Measure', 'Improve'].map((ph, idx) => (
            <span
              key={ph}
              className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A0E11]/80 backdrop-blur-md border border-[#EEF4F6]/15 text-[#9FB4BF]"
            >
              {idx + 1}. {ph}
            </span>
          ))}
        </div>

        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#9ED8E4] bg-[#05090C]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#EEF4F6]/15">
          <Eye className="w-3 h-3 text-[#3AA8D0]" />
          <span>Click anywhere on card for modal</span>
        </div>
      </div>
    </div>
  );
};
