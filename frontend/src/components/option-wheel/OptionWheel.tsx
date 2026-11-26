import React, { useEffect, useRef, useState, useCallback } from 'react';
import './OptionWheel.css';

export interface OptionWheelProps {
  items: string[];
  activeIndex?: number;
  defaultIndex?: number;
  onChange?: (index: number, item: string) => void;
  onSelectActive?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: 'left' | 'right' | 'center';
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: boolean;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  soundUrl?: string;
  soundVolume?: number;
  className?: string;
}

const wrapIndex = (idx: number, len: number): number => {
  if (len <= 0) return 0;
  return ((idx % len) + len) % len;
};

export const OptionWheel: React.FC<OptionWheelProps> = ({
  items,
  activeIndex,
  defaultIndex = 0,
  onChange,
  onSelectActive,
  textColor = '#9FB4BF',
  activeColor = '#3AA8D0',
  side = 'left',
  fontSize = 22,
  spacing = 54,
  curve = 28,
  tilt = 12,
  blur = 2.4,
  fade = true,
  minOpacity = 0.22,
  smoothing = 0.14,
  inset = 18,
  loop = true,
  draggable = true,
  soundUrl,
  soundVolume = 0.35,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const count = items.length;
  const initialIdx = activeIndex !== undefined ? activeIndex : defaultIndex;

  const targetRef = useRef<number>(initialIdx);
  const currentRef = useRef<number>(initialIdx);
  const lastReportedIdxRef = useRef<number>(wrapIndex(initialIdx, count));
  const [renderedActiveIdx, setRenderedActiveIdx] = useState<number>(wrapIndex(initialIdx, count));
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartTargetRef = useRef<number>(0);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSelectActiveRef = useRef(onSelectActive);
  onSelectActiveRef.current = onSelectActive;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Optional tick sound Audio instance + cleanup
  useEffect(() => {
    if (!soundUrl) {
      audioRef.current = null;
      return;
    }
    const audio = new Audio(soundUrl);
    audio.volume = Math.max(0, Math.min(1, soundVolume));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [soundUrl, soundVolume]);

  const playTick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch {
      // Ignore autoplay blocks
    }
  }, []);

  // Sync controlled activeIndex prop if parent updates it externally
  useEffect(() => {
    if (activeIndex === undefined || count === 0) return;
    const normalizedCurrent = wrapIndex(Math.round(targetRef.current), count);
    if (normalizedCurrent !== activeIndex) {
      if (loop) {
        let delta = activeIndex - normalizedCurrent;
        if (delta > count / 2) delta -= count;
        if (delta < -count / 2) delta += count;
        targetRef.current = Math.round(targetRef.current) + delta;
      } else {
        targetRef.current = Math.max(0, Math.min(count - 1, activeIndex));
      }
      lastReportedIdxRef.current = activeIndex;
      setRenderedActiveIdx(activeIndex);
    }
  }, [activeIndex, count, loop]);

  const clampTarget = useCallback(
    (val: number) => {
      if (loop || count <= 1) return val;
      return Math.max(0, Math.min(count - 1, val));
    },
    [loop, count]
  );

  const stepBy = useCallback(
    (delta: number) => {
      const next = clampTarget(Math.round(targetRef.current) + delta);
      targetRef.current = next;
    },
    [clampTarget]
  );

  // Scoped non-passive wheel listener so scrolling inside the wheel box never hijacks the rest of the page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let wheelAccum = 0;
    let lastStepTime = 0;
    let resetTimer = 0;
    const STEP_COOLDOWN_MS = 160;
    const THRESHOLD = 65;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, 180);

      // Ignore inertia bursts during cooldown so the wheel never keeps spinning uncontrollably
      if (now - lastStepTime < STEP_COOLDOWN_MS) {
        wheelAccum = 0;
        return;
      }

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      wheelAccum += delta;

      if (Math.abs(wheelAccum) >= THRESHOLD) {
        const direction = Math.sign(wheelAccum);
        wheelAccum = 0;
        lastStepTime = now;
        stepBy(direction);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.clearTimeout(resetTimer);
      el.removeEventListener('wheel', onWheel);
    };
  }, [stepBy]);

  // Global pointer move / up for smooth dragging
  useEffect(() => {
    if (!draggable) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dy = e.clientY - dragStartYRef.current;
      if (Math.abs(dy) > 6) {
        hasDraggedRef.current = true;
      }
      const nextTarget = clampTarget(dragStartTargetRef.current - dy / Math.max(spacing, 28));
      targetRef.current = nextTarget;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      targetRef.current = clampTarget(Math.round(targetRef.current));
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 40);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggable, spacing, clampTarget]);

  // Animation loop with clean rAF teardown
  useEffect(() => {
    if (count === 0) return;
    let rafId: number;

    const renderFrame = () => {
      const easeFactor = reducedMotion ? 1 : Math.max(0.05, Math.min(1, smoothing));
      const diff = targetRef.current - currentRef.current;

      if (Math.abs(diff) < 0.0005) {
        currentRef.current = targetRef.current;
      } else {
        currentRef.current += diff * easeFactor;
      }

      const nearestInt = Math.round(currentRef.current);
      const activeWrapped = loop
        ? wrapIndex(nearestInt, count)
        : Math.max(0, Math.min(count - 1, nearestInt));

      if (activeWrapped !== lastReportedIdxRef.current) {
        lastReportedIdxRef.current = activeWrapped;
        setRenderedActiveIdx(activeWrapped);
        playTick();
        onChangeRef.current?.(activeWrapped, items[activeWrapped]);
      }

      // Position each visible item along the curved rotary arc
      for (let i = 0; i < count; i++) {
        const btn = itemRefs.current[i];
        if (!btn) continue;

        let offset = i - currentRef.current;
        if (loop) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }

        const absOffset = Math.abs(offset);
        const y = offset * spacing;

        // Convex wheel arc: active item protrudes furthest out, items above & below curve back toward the edge
        const curveOffset = Math.pow(absOffset, 1.55) * (curve * 0.42);
        const arcX =
          side === 'center'
            ? 0
            : side === 'right'
            ? -inset + curveOffset
            : inset - curveOffset;

        // Fan tilt: items above tilt up-right (-deg), items below tilt down-right (+deg) for side="left"
        const rotateDeg = reducedMotion
          ? 0
          : offset * (tilt * 0.65) * (side === 'right' ? -1 : 1);
        const scale = Math.max(0.82, 1 - absOffset * 0.055);
        const opacity = fade
          ? Math.max(minOpacity, 1 - absOffset * 0.25)
          : 1;
        const itemBlur = reducedMotion ? 0 : Math.min(blur * 3.2, Math.max(0, (absOffset - 0.25) * blur));

        btn.style.transform = `translate3d(${arcX.toFixed(1)}px, calc(-50% + ${y.toFixed(1)}px), 0) rotate(${rotateDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        btn.style.opacity = absOffset > 3.6 ? '0' : opacity.toFixed(3);
        btn.style.filter = itemBlur > 0.05 ? `blur(${itemBlur.toFixed(2)}px)` : 'none';
        btn.style.pointerEvents = absOffset > 3.2 ? 'none' : 'auto';
        btn.style.zIndex = String(Math.round(50 - absOffset * 10));
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [count, items, spacing, curve, tilt, blur, fade, minOpacity, smoothing, inset, side, loop, reducedMotion, playTick]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartYRef.current = e.clientY;
    dragStartTargetRef.current = currentRef.current;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = lastReportedIdxRef.current;
      onSelectActiveRef.current?.(idx, items[idx]);
    }
  };

  const handleItemClick = (index: number) => {
    if (hasDraggedRef.current) return;
    const currentWrapped = wrapIndex(Math.round(targetRef.current), count);
    if (index === currentWrapped) {
      onSelectActiveRef.current?.(index, items[index]);
      return;
    }

    if (loop) {
      let delta = index - currentWrapped;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      targetRef.current = Math.round(targetRef.current) + delta;
    } else {
      targetRef.current = index;
    }
  };

  const sideClass =
    side === 'right'
      ? 'option-wheel__item--right'
      : side === 'center'
      ? 'option-wheel__item--center'
      : 'option-wheel__item--left';

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      role="listbox"
      tabIndex={0}
      aria-label="Product thinking lifecycle wheel"
      aria-activedescendant={`option-wheel-item-${renderedActiveIdx}`}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={`option-wheel ${className}`.trim()}
    >
      <div className="option-wheel__track">
        {items.map((item, idx) => {
          const isActive = idx === renderedActiveIdx;
          return (
            <button
              key={item}
              id={`option-wheel-item-${idx}`}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => handleItemClick(idx)}
              className={`option-wheel__item ${sideClass} ${isActive ? 'option-wheel__item--active' : ''}`}
              style={{
                fontSize: `${fontSize}px`,
                color: isActive ? activeColor : textColor,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
      {fade && (
        <>
          <div className="option-wheel__fade-top" aria-hidden="true" />
          <div className="option-wheel__fade-bottom" aria-hidden="true" />
        </>
      )}
    </div>
  );
};

