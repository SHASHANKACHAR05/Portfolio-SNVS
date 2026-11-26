import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { FastForward, RotateCcw } from 'lucide-react';

export const TOTAL_BLOCKS = 22;

export interface CursorWorker {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  active: boolean;
  assignedBlockId?: string;
}

const INITIAL_WORKERS: CursorWorker[] = [
  { id: 'c-01', name: 'arch-01', role: 'Architect', x: 100, y: 150, targetX: 100, targetY: 150, vx: 0, vy: 0, active: false },
  { id: 'c-02', name: 'wire-02', role: 'Wireframe', x: 250, y: 180, targetX: 250, targetY: 180, vx: 0, vy: 0, active: false },
  { id: 'c-03', name: 'frame-03', role: 'Framing', x: 750, y: 200, targetX: 750, targetY: 200, vx: 0, vy: 0, active: false },
  { id: 'c-04', name: 'layout-04', role: 'Layout', x: 850, y: 350, targetX: 850, targetY: 350, vx: 0, vy: 0, active: false },
  { id: 'c-05', name: 'type-05', role: 'Typography', x: 200, y: 280, targetX: 200, targetY: 280, vx: 0, vy: 0, active: false },
  { id: 'c-06', name: 'spec-06', role: 'Specification', x: 400, y: 220, targetX: 400, targetY: 220, vx: 0, vy: 0, active: false },
  { id: 'c-07', name: 'mesh-07', role: 'Mesh Grid', x: 300, y: 400, targetX: 300, targetY: 400, vx: 0, vy: 0, active: false },
  { id: 'c-08', name: 'align-08', role: 'Alignment', x: 600, y: 300, targetX: 600, targetY: 300, vx: 0, vy: 0, active: false },
  { id: 'c-09', name: 'asset-09', role: 'Assets', x: 800, y: 250, targetX: 800, targetY: 250, vx: 0, vy: 0, active: false },
  { id: 'c-10', name: 'badge-10', role: 'Credentials', x: 900, y: 450, targetX: 900, targetY: 450, vx: 0, vy: 0, active: false },
  { id: 'c-11', name: 'audit-11', role: 'Audit & QA', x: 450, y: 500, targetX: 450, targetY: 500, vx: 0, vy: 0, active: false },
  { id: 'c-12', name: 'finish-12', role: 'Polish', x: 650, y: 550, targetX: 650, targetY: 550, vx: 0, vy: 0, active: false },
];

export const TRACKED_BLOCK_IDS = [
  'block-eyebrow',
  'block-name',
  'block-tagline',
  'block-summary-1',
  'block-summary-2',
  'block-focus-label',
  'block-pill-1',
  'block-pill-2',
  'block-pill-3',
  'block-pill-4',
  'block-pill-5',
  'block-cta-work',
  'block-cta-case',
  'block-cta-resume',
  'block-cta-email',
  'block-portrait-frame',
  'block-portrait-img',
  'block-badge-pmp',
  'block-career-card',
  'block-career-now',
  'block-career-prev',
  'block-career-social',
];

interface SwarmHeroBuilderProps {
  heroRef: React.RefObject<HTMLElement>;
}

export const SwarmHeroBuilder: React.FC<SwarmHeroBuilderProps> = ({ heroRef }) => {
  const [builtCount, setBuiltCount] = useState<number>(0);
  const [status, setStatus] = useState<'BUILDING' | 'SYNCHRONIZED' | 'MANUAL'>('BUILDING');
  const [active, setActive] = useState<boolean>(true);

  const workersRef = useRef<CursorWorker[]>(JSON.parse(JSON.stringify(INITIAL_WORKERS)));
  const svgOverlayRef = useRef<SVGSVGElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const driftAngleRef = useRef<number>(0);

  // Mark all blocks done immediately
  const completeAllBlocks = useCallback(() => {
    isCancelledRef.current = true;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    if (heroRef.current) {
      const blocks = heroRef.current.querySelectorAll<HTMLElement>('.swarm-block');
      blocks.forEach((el) => {
        el.setAttribute('data-state', 'done');
      });
    }

    setBuiltCount(TOTAL_BLOCKS);
    setStatus('SYNCHRONIZED');
    setActive(false);
  }, [heroRef]);

  // Run the two-pass choreography
  const startChoreography = useCallback(async () => {
    if (!heroRef.current) return;

    // Wait for document fonts to be ready before measuring coordinates
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeAllBlocks();
      return;
    }

    // Reset state
    isCancelledRef.current = false;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setBuiltCount(0);
    setStatus('BUILDING');
    setActive(true);

    const heroRect = heroRef.current.getBoundingClientRect();
    const heroLeft = heroRect.left;
    const heroTop = heroRect.top;

    // Initialize all blocks to 'mark'
    const domBlocks = TRACKED_BLOCK_IDS.map((id) => {
      const el = heroRef.current?.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
      if (el) el.setAttribute('data-state', 'mark');
      return { id, el };
    }).filter((item): item is { id: string; el: HTMLElement } => item.el !== null);

    // Initial position workers around the perimeter
    workersRef.current.forEach((w, idx) => {
      w.x = (idx / 12) * heroRect.width;
      w.y = (idx % 2 === 0) ? -40 : heroRect.height + 40;
      w.targetX = w.x;
      w.targetY = w.y;
      w.active = true;
    });

    let completedCounter = 0;

    // PASS 1: Rough framing pass (structural cards & surfaces first)
    const structuralPassIds = [
      'block-portrait-frame',
      'block-career-card',
      'block-name',
      'block-tagline',
      'block-cta-work',
      'block-cta-case',
    ];

    domBlocks.forEach(({ id, el }, index) => {
      const isStructural = structuralPassIds.includes(id);
      const roughDelay = isStructural ? (index * 70) + 100 : (index * 90) + 400;

      const t1 = setTimeout(() => {
        if (isCancelledRef.current) return;

        el.setAttribute('data-state', 'rough');

        // Assign a worker cursor to visit this block
        const rect = el.getBoundingClientRect();
        const targetX = rect.left - heroLeft + rect.width / 2;
        const targetY = rect.top - heroTop + rect.height / 2;

        const workerIndex = index % workersRef.current.length;
        const worker = workersRef.current[workerIndex];
        if (worker) {
          worker.targetX = targetX;
          worker.targetY = targetY;
          worker.assignedBlockId = id;
        }
      }, roughDelay);

      timerRef.current.push(t1);

      // PASS 2: Finishing pass ('rough' -> 'done')
      const doneDelay = roughDelay + (isStructural ? 700 : 500);

      const t2 = setTimeout(() => {
        if (isCancelledRef.current) return;

        el.setAttribute('data-state', 'done');
        completedCounter += 1;
        setBuiltCount(Math.min(completedCounter, TOTAL_BLOCKS));

        if (completedCounter >= TOTAL_BLOCKS) {
          setStatus('SYNCHRONIZED');
          // Let cursors celebrate / drift away after 1s
          const tEnd = setTimeout(() => {
            if (!isCancelledRef.current) {
              setActive(false);
            }
          }, 1200);
          timerRef.current.push(tEnd);
        }
      }, doneDelay);

      timerRef.current.push(t2);
    });
  }, [heroRef, completeAllBlocks]);

  // Handle external cancel events: scroll, wheel, keyboard, touchmove
  useEffect(() => {
    const handleInputCancel = (e: Event) => {
      if (!active) return;
      // If keyboard: only specific keys
      if (e.type === 'keydown') {
        const key = (e as KeyboardEvent).key;
        if (['Escape', ' ', 'ArrowDown', 'PageDown'].includes(key)) {
          completeAllBlocks();
        }
        return;
      }
      completeAllBlocks();
    };

    window.addEventListener('wheel', handleInputCancel, { passive: true });
    window.addEventListener('touchmove', handleInputCancel, { passive: true });
    window.addEventListener('keydown', handleInputCancel);

    return () => {
      window.removeEventListener('wheel', handleInputCancel);
      window.removeEventListener('touchmove', handleInputCancel);
      window.removeEventListener('keydown', handleInputCancel);
    };
  }, [active, completeAllBlocks]);

  // GSAP Ticker Physics Loop
  useEffect(() => {
    const updateTick = () => {
      driftAngleRef.current += 0.02;

      workersRef.current.forEach((w, i) => {
        // Idle gentle float drift
        const driftX = Math.cos(driftAngleRef.current + i) * 1.5;
        const driftY = Math.sin(driftAngleRef.current + i * 1.3) * 1.5;

        // Smooth spring towards target
        const dx = (w.targetX + driftX) - w.x;
        const dy = (w.targetY + driftY) - w.y;

        w.vx = w.vx * 0.85 + dx * 0.08;
        w.vy = w.vy * 0.85 + dy * 0.08;

        w.x += w.vx;
        w.y += w.vy;

        // Update DOM element directly for high-perf render
        const cursorEl = document.getElementById(`cursor-node-${w.id}`);
        if (cursorEl) {
          cursorEl.setAttribute('transform', `translate(${w.x}, ${w.y})`);
        }

        const laserEl = document.getElementById(`cursor-laser-${w.id}`);
        if (laserEl) {
          if (active && Math.hypot(dx, dy) > 20) {
            laserEl.setAttribute('x1', `${w.x}`);
            laserEl.setAttribute('y1', `${w.y}`);
            laserEl.setAttribute('x2', `${w.targetX}`);
            laserEl.setAttribute('y2', `${w.targetY}`);
            laserEl.setAttribute('opacity', '0.25');
          } else {
            laserEl.setAttribute('opacity', '0');
          }
        }
      });
    };

    gsap.ticker.add(updateTick);

    return () => {
      gsap.ticker.remove(updateTick);
    };
  }, [active]);

  // Start choreography on mount
  useEffect(() => {
    startChoreography();
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [startChoreography]);

  return (
    <>
      {/* 12-Cursor Swarm SVG Overlay */}
      <svg
        ref={svgOverlayRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-30 transition-opacity duration-500 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ minHeight: '100%' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="cursor-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1F2839" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Lasers / Construction vectors */}
        {workersRef.current.map((w) => (
          <line
            key={`laser-${w.id}`}
            id={`cursor-laser-${w.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="0"
            stroke="#B69D74"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0"
          />
        ))}

        {/* 12 Autonomous Cursors */}
        {workersRef.current.map((w) => (
          <g key={`node-${w.id}`} id={`cursor-node-${w.id}`} filter="url(#cursor-glow)">
            {/* Minimalist Tech Arrow Cursor */}
            <path
              d="M 0 0 L 0 14 L 3.5 11 L 7 17 L 9 16 L 5.5 10 L 10.5 10 Z"
              fill="#1F2839"
              stroke="#F5F5EF"
              strokeWidth="0.8"
            />
            {/* Worker telemetry tag */}
            <g transform="translate(14, 10)">
              <rect
                x="0"
                y="-9"
                width="46"
                height="14"
                rx="3"
                fill="#1F2839"
                stroke="#B69D74"
                strokeWidth="0.75"
              />
              <text
                x="4"
                y="1"
                fill="#B69D74"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {w.name}
              </text>
            </g>
          </g>
        ))}
      </svg>

      {/* Telemetry HUD & Visitor Override Controls */}
      <div className="absolute top-24 right-4 sm:right-8 z-40 pointer-events-auto flex items-center gap-2">
        {/* Status & Counter Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1F2839] border border-[#B69D74]/40 text-[#F5F5EF] shadow-md font-mono text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'BUILDING' ? 'bg-[#B69D74] animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className="text-[10px] sm:text-xs tracking-wider text-[#B69D74] font-bold">
            SWARM // {status}
          </span>
          <span className="text-[10px] text-gray-400 border-l border-gray-700 pl-2">
            Built {builtCount} / {TOTAL_BLOCKS}
          </span>
        </div>

        {/* Action Controls */}
        {active ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              completeAllBlocks();
            }}
            className="px-2.5 py-1.5 rounded-md bg-[#1F2839] hover:bg-[#2A364B] border border-[#B69D74]/60 text-[#B69D74] hover:text-white text-xs font-mono font-semibold shadow-sm flex items-center gap-1.5"
            title="Skip build animation and reveal full layout"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Skip</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startChoreography();
            }}
            className="px-2.5 py-1.5 rounded-md bg-[#1F2839] hover:bg-[#2A364B] border border-[#B69D74]/60 text-[#B69D74] hover:text-white text-xs font-mono font-semibold shadow-sm flex items-center gap-1.5"
            title="Replay the 12-cursor build choreography"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        )}
      </div>
    </>
  );
};
