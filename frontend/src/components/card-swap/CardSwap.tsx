import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import './CardSwap.css';

export const THEMES = {
  dark: {
    className: 'card-swap-card--dark',
    bg: '#141028',
    fg: '#f5f3ff',
    border: 'rgba(207, 198, 246, 0.22)',
  },
  light: {
    className: 'card-swap-card--light',
    bg: '#ffffff',
    fg: '#121410',
    border: '#d9d2f7',
  },
} as const;

export type CardSwapTheme = keyof typeof THEMES;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass = '', className = '', children, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card-swap-card ${customClass} ${className}`.trim()}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export interface CardSwapHandle {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export interface CardSwapProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  depth?: number;
  skewAmount?: number;
  visibleCards?: number;
  delay?: number;
  pauseOnHover?: boolean;
  draggable?: boolean;
  swapOnFrontClick?: boolean;
  theme?: CardSwapTheme;
  onChange?: (index: number) => void;
  onCardClick?: (index: number) => void;
  className?: string;
}

interface SpringState {
  x: number;
  y: number;
  z: number;
  rotZ: number;
  skewY: number;
  opacity: number;
  vx: number;
  vy: number;
  vz: number;
  vRot: number;
}

export const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(
  (
    {
      children,
      width = 480,
      height = 370,
      cardDistance = 42,
      verticalDistance = 30,
      depth = 65,
      skewAmount = 4,
      visibleCards = 3,
      delay = 5200,
      pauseOnHover = true,
      draggable = true,
      swapOnFrontClick = true,
      theme = 'light',
      onChange,
      onCardClick,
      className = '',
    },
    ref
  ) => {
    const childArray = Children.toArray(children);
    const total = childArray.length;

    const containerRef = useRef<HTMLDivElement>(null);
    const cardElsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [order, setOrder] = useState<number[]>(() =>
      Array.from({ length: total }, (_, i) => i)
    );
    const [scaleFactor, setScaleFactor] = useState<number>(1);
    const [reducedMotion, setReducedMotion] = useState<boolean>(false);

    const orderRef = useRef<number[]>(order);
    orderRef.current = order;

    const isHoveredRef = useRef<boolean>(false);
    const isInViewRef = useRef<boolean>(true);
    const isDraggingRef = useRef<boolean>(false);
    const dragCardIdxRef = useRef<number | null>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragDeltaRef = useRef({ x: 0, y: 0 });
    const hasDraggedRef = useRef<boolean>(false);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onCardClickRef = useRef(onCardClick);
    onCardClickRef.current = onCardClick;

    // Physics state per original card index
    const springsRef = useRef<SpringState[]>(
      Array.from({ length: total }, () => ({
        x: 0,
        y: 0,
        z: 0,
        rotZ: 0,
        skewY: 0,
        opacity: 1,
        vx: 0,
        vy: 0,
        vz: 0,
        vRot: 0,
      }))
    );

    // Keep order array synced if children count changes
    useEffect(() => {
      setOrder(Array.from({ length: total }, (_, i) => i));
      springsRef.current = Array.from({ length: total }, () => ({
        x: 0,
        y: 0,
        z: 0,
        rotZ: 0,
        skewY: 0,
        opacity: 1,
        vx: 0,
        vy: 0,
        vz: 0,
        vRot: 0,
      }));
    }, [total]);

    // Live prefers-reduced-motion tracking
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Responsive ResizeObserver so cards never clip on smaller viewports
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateScale = () => {
        const availW = Math.max(260, el.clientWidth - 24);
        const availH = Math.max(260, el.clientHeight - 24);
        const stackW = width + Math.max(0, Math.min(visibleCards, total) - 1) * cardDistance;
        const stackH = height + Math.max(0, Math.min(visibleCards, total) - 1) * verticalDistance;
        const s = Math.min(1, availW / stackW, availH / stackH);
        setScaleFactor(s);
      };

      updateScale();
      const ro = new ResizeObserver(updateScale);
      ro.observe(el);
      return () => ro.disconnect();
    }, [width, height, cardDistance, verticalDistance, visibleCards, total]);

    // IntersectionObserver to pause auto-swap & rAF when off-screen
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          isInViewRef.current = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    const rotateNext = useCallback(() => {
      if (total <= 1) return;
      setOrder((prev) => {
        const [first, ...rest] = prev;
        const nextOrder = [...rest, first];
        // Give the dismissed front card a gentle downward/sideways fling impulse
        const sp = springsRef.current[first];
        if (sp) {
          sp.vy += 420;
          sp.vx -= 160;
        }
        onChangeRef.current?.(nextOrder[0]);
        return nextOrder;
      });
    }, [total]);

    const rotatePrev = useCallback(() => {
      if (total <= 1) return;
      setOrder((prev) => {
        const last = prev[prev.length - 1];
        const nextOrder = [last, ...prev.slice(0, -1)];
        const sp = springsRef.current[last];
        if (sp) {
          sp.vy -= 260;
        }
        onChangeRef.current?.(nextOrder[0]);
        return nextOrder;
      });
    }, [total]);

    const goToIndex = useCallback(
      (targetIdx: number) => {
        if (total <= 1 || targetIdx < 0 || targetIdx >= total) return;
        setOrder((prev) => {
          const pos = prev.indexOf(targetIdx);
          if (pos <= 0) return prev;
          const nextOrder = [...prev.slice(pos), ...prev.slice(0, pos)];
          onChangeRef.current?.(nextOrder[0]);
          return nextOrder;
        });
      },
      [total]
    );

    useImperativeHandle(
      ref,
      () => ({
        next: rotateNext,
        prev: rotatePrev,
        goTo: goToIndex,
      }),
      [rotateNext, rotatePrev, goToIndex]
    );

    // Auto-swap timer (paused on hover, drag, off-screen, or prefers-reduced-motion)
    useEffect(() => {
      if (delay <= 0 || total <= 1 || reducedMotion) return;
      const timer = window.setInterval(() => {
        if (!isInViewRef.current || isDraggingRef.current) return;
        if (pauseOnHover && isHoveredRef.current) return;
        rotateNext();
      }, delay);
      return () => window.clearInterval(timer);
    }, [delay, total, pauseOnHover, reducedMotion, rotateNext]);

    // Global drag-fling listeners
    useEffect(() => {
      if (!draggable) return;

      const handlePointerMove = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
          hasDraggedRef.current = true;
        }
        dragDeltaRef.current = { x: dx, y: dy };
      };

      const handlePointerUp = () => {
        if (!isDraggingRef.current) return;
        const { x: dx, y: dy } = dragDeltaRef.current;
        const draggedCard = dragCardIdxRef.current;
        isDraggingRef.current = false;
        dragCardIdxRef.current = null;
        dragDeltaRef.current = { x: 0, y: 0 };

        if (Math.hypot(dx, dy) > 75 && draggedCard !== null) {
          const sp = springsRef.current[draggedCard];
          if (sp) {
            sp.vx = dx * 4;
            sp.vy = dy * 4;
          }
          rotateNext();
        }

        window.setTimeout(() => {
          hasDraggedRef.current = false;
        }, 40);
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, [draggable, rotateNext]);

    // Spring-damped animation loop
    useEffect(() => {
      if (total === 0) return;
      let rafId = 0;
      let lastTime = performance.now();

      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        if (!isInViewRef.current) {
          lastTime = now;
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.033);
        lastTime = now;

        const currentOrder = orderRef.current;
        const maxVis = Math.min(visibleCards, total);
        const centerOffsetX = -((maxVis - 1) * cardDistance) * 0.45;
        const centerOffsetY = ((maxVis - 1) * verticalDistance) * 0.45;

        const stiffness = 175;
        const damping = 21;

        for (let slot = 0; slot < currentOrder.length; slot++) {
          const cardIdx = currentOrder[slot];
          const el = cardElsRef.current[cardIdx];
          const sp = springsRef.current[cardIdx];
          if (!el || !sp) continue;

          const isVisible = slot < visibleCards;
          const clampedSlot = Math.min(slot, visibleCards - 1);

          let targetX = centerOffsetX + clampedSlot * cardDistance;
          let targetY = centerOffsetY - clampedSlot * verticalDistance;
          const targetZ = -clampedSlot * depth;
          let targetRot = reducedMotion ? 0 : clampedSlot * 1.4;
          const targetSkew = reducedMotion ? 0 : clampedSlot === 0 ? 0 : -skewAmount * 0.35;
          const targetOpacity = isVisible ? Math.max(0.55, 1 - clampedSlot * 0.14) : 0;

          if (isDraggingRef.current && dragCardIdxRef.current === cardIdx && slot === 0) {
            targetX += dragDeltaRef.current.x / Math.max(scaleFactor, 0.5);
            targetY += dragDeltaRef.current.y / Math.max(scaleFactor, 0.5);
            targetRot = Math.max(-14, Math.min(14, dragDeltaRef.current.x * 0.06));
          }

          if (reducedMotion) {
            sp.x = targetX;
            sp.y = targetY;
            sp.z = targetZ;
            sp.rotZ = targetRot;
            sp.skewY = targetSkew;
            sp.opacity = targetOpacity;
          } else {
            const ax = (targetX - sp.x) * stiffness - sp.vx * damping;
            const ay = (targetY - sp.y) * stiffness - sp.vy * damping;
            const az = (targetZ - sp.z) * stiffness - sp.vz * damping;
            const aRot = (targetRot - sp.rotZ) * stiffness - sp.vRot * damping;

            sp.vx += ax * dt;
            sp.vy += ay * dt;
            sp.vz += az * dt;
            sp.vRot += aRot * dt;

            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            sp.z += sp.vz * dt;
            sp.rotZ += sp.vRot * dt;
            sp.skewY += (targetSkew - sp.skewY) * Math.min(1, dt * 10);
            sp.opacity += (targetOpacity - sp.opacity) * Math.min(1, dt * 10);
          }

          el.style.transform = `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, ${sp.z.toFixed(1)}px) rotateZ(${sp.rotZ.toFixed(2)}deg) skewY(${sp.skewY.toFixed(2)}deg)`;
          el.style.opacity = sp.opacity.toFixed(3);
          el.style.zIndex = String(total - slot);
          el.style.pointerEvents = isVisible ? 'auto' : 'none';
        }
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, [total, visibleCards, cardDistance, verticalDistance, depth, skewAmount, reducedMotion, scaleFactor]);

    const themeConfig = THEMES[theme];

    return (
      <div
        ref={containerRef}
        className={`card-swap-container ${className}`.trim()}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        <div
          className="card-swap-stage"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scaleFactor})`,
          }}
        >
          {childArray.map((child, idx) => {
            const slot = order.indexOf(idx);
            const isFront = slot === 0;

            return (
              <div
                key={idx}
                ref={(el) => {
                  cardElsRef.current[idx] = el;
                }}
                onPointerDown={(e) => {
                  if (!draggable || !isFront || e.button !== 0) return;
                  isDraggingRef.current = true;
                  dragCardIdxRef.current = idx;
                  hasDraggedRef.current = false;
                  dragStartRef.current = { x: e.clientX, y: e.clientY };
                  dragDeltaRef.current = { x: 0, y: 0 };
                }}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  onCardClickRef.current?.(idx);
                  if (isFront) {
                    if (swapOnFrontClick) rotateNext();
                  } else {
                    goToIndex(idx);
                  }
                }}
                className={`card-swap-card ${themeConfig.className} ${isFront ? 'card-swap-card--front' : ''}`}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CardSwap.displayName = 'CardSwap';
export default CardSwap;

