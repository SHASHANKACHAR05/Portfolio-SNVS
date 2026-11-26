'use client';

import React, { useCallback, useEffect, useRef, useState, CSSProperties } from 'react';
import gsap from 'gsap';
import './DepthCarousel.css';

export interface DepthCarouselItem {
  id?: string | number;
  image: string;
  alt: string;
  title?: string;
}

export interface DepthCarouselProps {
  items: DepthCarouselItem[];
  activeIndex?: number;
  initialIndex?: number;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  onSlideClick?: (index: number, item: DepthCarouselItem) => void;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  keyboard?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  depthStep?: number;
  spreadFactor?: number;
  tiltAngle?: number;
  maxBlur?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

const wrapIndex = (idx: number, len: number): number => {
  if (len <= 0) return 0;
  return ((idx % len) + len) % len;
};

const shortestOffset = (index: number, current: number, count: number, loop: boolean): number => {
  let diff = index - current;
  if (loop && count > 1) {
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
  }
  return diff;
};

const DepthCarousel: React.FC<DepthCarouselProps> = ({
  items,
  activeIndex: controlledIndex,
  initialIndex = 0,
  onChange,
  onSlideClick,
  autoplay = false,
  autoplayDelay = 4500,
  pauseOnHover = true,
  loop = true,
  draggable = true,
  wheel = true,
  keyboard = true,
  showControls = true,
  showIndicators = true,
  cardWidth = 340,
  cardHeight = 390,
  depthStep = 135,
  spreadFactor = 0.42,
  tiltAngle = 14,
  maxBlur = 3.2,
  duration = 0.65,
  className = '',
  style,
}) => {
  const count = items.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tintRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressRef = useRef<{ value: number }>({
    value: wrapIndex(controlledIndex ?? initialIndex, count),
  });
  const autoplayTimerRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef<number>(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const hoveredRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startProgress: number;
    dragging: boolean;
    moved: boolean;
  } | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    wrapIndex(controlledIndex ?? initialIndex, count)
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 440,
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Dynamic prefers-reduced-motion subscription
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    setReducedMotion(mq.matches);
    mq.addEventListener('change', handleMotionChange);
    return () => {
      mq.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Responsive stage dimensions via ResizeObserver
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSize = () => {
      const w = Math.max(240, stage.clientWidth);
      const h = Math.max(260, stage.clientHeight);
      setStageSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Compute responsive card dimensions bounded inside stage
  const responsiveW = Math.min(cardWidth, Math.max(220, stageSize.width * 0.72));
  const responsiveH = Math.min(
    cardHeight,
    Math.max(240, stageSize.height * 0.88),
    responsiveW * (cardHeight / cardWidth)
  );

  // Core GSAP depth-stack layout updater
  const renderStack = useCallback(
    (progress: number) => {
      if (count === 0) return;
      const spreadX = Math.min(responsiveW * spreadFactor, stageSize.width * 0.24);

      for (let i = 0; i < count; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;

        const offset = shortestOffset(i, progress, count, loop);
        const absOffset = Math.abs(offset);
        const clamped = Math.min(absOffset, 2.5);

        const x = offset * spreadX;
        const y = clamped * 8;
        const z = -clamped * depthStep;
        const scale = Math.max(0.72, 1 - clamped * 0.11);
        const rotateY = reducedMotion ? 0 : -offset * tiltAngle;
        const rotateZ = reducedMotion ? 0 : offset * 1.4;
        const opacity = absOffset > 2.35 ? 0 : Math.max(0.18, 1 - clamped * 0.32);
        const blur = reducedMotion ? 0 : Math.min(maxBlur, clamped * 1.25);
        const zIndex = Math.round(1000 - absOffset * 100);

        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x,
          y,
          z,
          scale,
          rotateY,
          rotateZ,
          opacity,
          zIndex,
          filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none',
          pointerEvents: absOffset > 2.2 ? 'none' : 'auto',
        });

        const tintEl = tintRefs.current[i];
        if (tintEl) {
          gsap.set(tintEl, {
            opacity: Math.min(0.62, clamped * 0.26),
          });
        }
      }
    },
    [count, loop, responsiveW, stageSize.width, spreadFactor, depthStep, tiltAngle, maxBlur, reducedMotion]
  );

  // Animate to target index
  const goTo = useCallback(
    (nextIndex: number, immediate = false) => {
      if (count === 0) return;
      const normalized = loop ? wrapIndex(nextIndex, count) : Math.max(0, Math.min(count - 1, nextIndex));

      const currentVal = progressRef.current.value;
      const currentWrapped = wrapIndex(currentVal, count);
      let targetVal = normalized;

      if (loop && count > 1) {
        let diff = normalized - currentWrapped;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;
        targetVal = currentVal + diff;
      }

      tweenRef.current?.kill();

      if (immediate || reducedMotion) {
        progressRef.current.value = targetVal;
        renderStack(targetVal);
      } else {
        tweenRef.current = gsap.to(progressRef.current, {
          value: targetVal,
          duration,
          ease: 'power3.out',
          onUpdate: () => renderStack(progressRef.current.value),
          onComplete: () => {
            progressRef.current.value = normalized;
            renderStack(normalized);
          },
        });
      }

      setCurrentIndex(normalized);
      const activeItem = itemsRef.current[normalized];
      if (activeItem) {
        onChangeRef.current?.(normalized, activeItem);
      }
    },
    [count, loop, reducedMotion, duration, renderStack]
  );

  const stepBy = useCallback(
    (delta: number) => {
      if (count < 2) return;
      const base = Math.round(progressRef.current.value);
      goTo(base + delta);
    },
    [count, goTo]
  );

  // Sync controlled activeIndex if parent changes it (e.g. clicking domain pill)
  useEffect(() => {
    if (controlledIndex === undefined || count === 0) return;
    const normalized = wrapIndex(controlledIndex, count);
    if (normalized !== currentIndex) {
      goTo(normalized);
    }
  }, [controlledIndex, count, currentIndex, goTo]);

  // Initial and resize layout sync
  useEffect(() => {
    renderStack(progressRef.current.value);
  }, [renderStack, responsiveW, responsiveH]);

  // Autoplay timer (disabled under prefers-reduced-motion)
  useEffect(() => {
    if (autoplayTimerRef.current !== null) {
      window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    if (!autoplay || reducedMotion || count < 2) return;

    autoplayTimerRef.current = window.setInterval(() => {
      if (pauseOnHover && hoveredRef.current) return;
      if (dragRef.current?.dragging) return;
      stepBy(1);
    }, Math.max(1200, autoplayDelay));

    return () => {
      if (autoplayTimerRef.current !== null) {
        window.clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [autoplay, autoplayDelay, pauseOnHover, reducedMotion, count, stepBy]);

  // Scoped non-passive wheel listener directly on the carousel stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !wheel || count < 2) return;

    let wheelAccum = 0;
    const STEP_COOLDOWN_MS = 220;
    const THRESHOLD = 55;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      // Only intercept wheel directly over the carousel stage when multiple slides exist
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccum = 0;
      }, 200);

      if (now - wheelCooldownRef.current < STEP_COOLDOWN_MS) {
        wheelAccum = 0;
        return;
      }

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAccum += delta;

      if (Math.abs(wheelAccum) >= THRESHOLD) {
        const direction = Math.sign(wheelAccum);
        wheelAccum = 0;
        wheelCooldownRef.current = now;
        stepBy(direction);
      }
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
        wheelResetTimerRef.current = null;
      }
      stage.removeEventListener('wheel', onWheel);
    };
  }, [wheel, count, stepBy]);

  // Pointer drag interaction
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !draggable || count < 2) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement)?.closest('button')) return;

      tweenRef.current?.kill();
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startProgress: progressRef.current.value,
        dragging: false,
        moved: false,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.dragging && Math.hypot(dx, dy) > 8) {
        if (Math.abs(dy) > Math.abs(dx) && e.pointerType !== 'mouse') {
          dragRef.current = null;
          return;
        }
        drag.dragging = true;
        drag.moved = true;
        setIsDragging(true);
        stage.setPointerCapture?.(e.pointerId);
      }

      if (drag.dragging) {
        const nextProgress = drag.startProgress - dx / Math.max(180, responsiveW * 0.72);
        const clamped = loop
          ? nextProgress
          : Math.max(-0.25, Math.min(count - 1 + 0.25, nextProgress));
        progressRef.current.value = clamped;
        renderStack(clamped);
      }
    };

    const finishDrag = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const wasDragging = drag.dragging;
      dragRef.current = null;
      setIsDragging(false);
      if (stage.hasPointerCapture?.(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
      if (wasDragging) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 80);
        goTo(Math.round(progressRef.current.value));
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [draggable, count, loop, responsiveW, renderStack, goTo]);

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
      if (autoplayTimerRef.current !== null) {
        window.clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
        wheelResetTimerRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboard || count < 2) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(count - 1);
    }
  };

  if (count === 0) return null;

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`depth-carousel ${className}`.trim()}
      style={style}
      role="region"
      aria-roledescription="carousel"
      aria-label="Product Management Capabilities Carousel"
      tabIndex={keyboard ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <div
        ref={stageRef}
        className="depth-carousel__stage"
        data-dragging={isDragging ? 'true' : 'false'}
      >
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={item.id ?? `${item.alt}-${idx}`}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="depth-carousel__slide"
              data-active={isActive ? 'true' : 'false'}
              style={{
                width: `${responsiveW}px`,
                height: `${responsiveH}px`,
              }}
              onClick={() => {
                if (suppressClickRef.current) return;
                if (!isActive) {
                  goTo(idx);
                } else {
                  onSlideClick?.(idx, item);
                }
              }}
              aria-hidden={!isActive}
            >
              <img
                src={item.image}
                alt={item.alt}
                className="depth-carousel__img"
                draggable={false}
              />
              <div
                ref={(el) => {
                  tintRefs.current[idx] = el;
                }}
                className="depth-carousel__tint"
                aria-hidden="true"
              />
            </div>
          );
        })}

        {showControls && count > 1 && (
          <div className="depth-carousel__controls">
            <button
              type="button"
              className="depth-carousel__btn"
              onClick={() => stepBy(-1)}
              disabled={!loop && currentIndex === 0}
              aria-label="Previous capability"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="depth-carousel__btn"
              onClick={() => stepBy(1)}
              disabled={!loop && currentIndex === count - 1}
              aria-label="Next capability"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {showIndicators && count > 1 && (
        <div className="depth-carousel__indicators" role="tablist" aria-label="Capability slides">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={`dot-${item.id ?? idx}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View ${item.title || item.alt}`}
                className="depth-carousel__dot"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => goTo(idx)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;

