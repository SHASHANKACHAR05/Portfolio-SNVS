'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  CSSProperties,
  ReactNode,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import './TiltedCard.css';

/* ─────────────────────────── helpers ─────────────────────────── */

const FLIP_THRESHOLD = 6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseColor = (value: string | undefined): [number, number, number] | null => {
  const text = String(value || '').trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const full =
      hex[1].length === 3
        ? hex[1].replace(/./g, (digit) => digit + digit)
        : hex[1];
    return [0, 2, 4].map((index) =>
      parseInt(full.slice(index, index + 2), 16)
    ) as [number, number, number];
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  if (rgb)
    return [rgb[1], rgb[2], rgb[3]].map((ch) =>
      clamp(Math.round(parseFloat(ch)), 0, 255)
    ) as [number, number, number];
  return null;
};

const toLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

const smoother = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

interface SpringState {
  rx: number; vrx: number;
  ry: number; vry: number;
  scale: number; vscale: number;
  gx: number; vgx: number;
  gy: number; vgy: number;
  px: number; vpx: number;
  py: number; vpy: number;
  glare: number; vglare: number;
  shadow: number; vshadow: number;
  tooltip_rotate: number; vtoolip_rotate: number;
  flip: number; vflip: number;
  float_x: number; vfloat_x: number;
  float_y: number; vfloat_y: number;
  float_rz: number; vfloat_rz: number;
  intro: number; vintro: number;
}

type SpringKey = keyof SpringState;

const stepSpring = (
  state: SpringState,
  key: SpringKey,
  target: number,
  omega: number,
  zeta: number,
  dt: number
): boolean => {
  const velocity = `v${key}` as SpringKey;
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    (state[velocity] as number) +=
      (omega * omega * (target - (state[key] as number)) -
        2 * zeta * omega * (state[velocity] as number)) *
      h;
    (state[key] as number) += (state[velocity] as number) * h;
  }
  const settled =
    Math.abs(target - (state[key] as number)) < 0.001 &&
    Math.abs(state[velocity] as number) < 0.01;
  if (settled) {
    (state[key] as number) = target;
    (state[velocity] as number) = 0;
  }
  return !settled;
};

/* ─────────────────────────── TiltedCardLayer ─────────────────── */

export interface TiltedCardLayerProps {
  depth?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const TiltedCardLayer: React.FC<TiltedCardLayerProps> = ({
  depth = 20,
  className = '',
  style,
  children,
}) => (
  <div
    className={`tilted-card__layer ${className}`.trim()}
    style={{ '--tc-depth': depth, ...style } as CSSProperties}
  >
    {children}
  </div>
);

/* ─────────────────────────── TiltedCard ─────────────────────── */

export interface TiltedCardProps {
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  showTooltip?: boolean;
  overlayContent?: ReactNode;
  displayOverlayContent?: boolean;
  overlayDepth?: number;
  backContent?: ReactNode;
  flipOnClick?: boolean;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  containerWidth?: number | string;
  containerHeight?: number | string;
  imageWidth?: number | string;
  imageHeight?: number | string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  perspective?: number | string;
  radius?: number | string;
  smoothness?: number;
  glare?: number;
  glareColor?: string;
  shadow?: number;
  parallax?: number;
  axis?: 'both' | 'horizontal' | 'vertical';
  reverse?: boolean;
  trackWindow?: boolean;
  floating?: boolean;
  gyroscope?: boolean;
  intro?: boolean;
  introDelay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.05,
  rotateAmplitude = 12,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  overlayDepth = 30,
  backContent = null,
  flipOnClick = true,
  flipped: controlledFlipped,
  onFlip,
  onClick,
  perspective = 800,
  radius = 15,
  smoothness = 0.6,
  glare = 0.5,
  glareColor = '#ffffff',
  shadow = 0.5,
  parallax = 1,
  axis = 'both',
  reverse = false,
  trackWindow = false,
  floating = false,
  gyroscope = true,
  intro = true,
  introDelay = 0,
  className = '',
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const edgeGlareRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<SpringState>({
    rx: 0, vrx: 0,
    ry: 0, vry: 0,
    scale: 1, vscale: 0,
    gx: 50, vgx: 0,
    gy: 50, vgy: 0,
    px: 0, vpx: 0,
    py: 0, vpy: 0,
    glare: 0, vglare: 0,
    shadow: 0, vshadow: 0,
    tooltip_rotate: -6, vtoolip_rotate: 0,
    flip: 0, vflip: 0,
    float_x: 0, vfloat_x: 0,
    float_y: 0, vfloat_y: 0,
    float_rz: 0, vfloat_rz: 0,
    intro: intro ? 1 : 0, vintro: 0,
  });
  const targetRef = useRef({
    rx: 0, ry: 0, scale: 1,
    gx: 50, gy: 50,
    px: 0, py: 0,
    glare: 0, shadow: 0,
    tooltip_rotate: -6,
    flip: 0,
    float_x: 0, float_y: 0, float_rz: 0,
    intro: 0,
  });
  const prevTimeRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const tooltipPosRef = useRef({ x: 0, y: 0 });
  const flipTotalRef = useRef(0);

  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const hasBack = backContent !== null;
  const dir = reverse ? -1 : 1;

  const parsedGlareColor = parseColor(glareColor) ?? [255, 255, 255];
  const glareRgb = `${parsedGlareColor[0]},${parsedGlareColor[1]},${parsedGlareColor[2]}`;

  // Intro: delay then animate in
  useEffect(() => {
    if (!intro) return;
    const timer = setTimeout(() => {
      targetRef.current.intro = 0;
    }, introDelay);
    return () => clearTimeout(timer);
  }, [intro, introDelay]);

  // Floating idle animation
  useEffect(() => {
    if (!floating) return;
    let t = Math.random() * Math.PI * 2;
    const tick = () => {
      t += 0.012;
      targetRef.current.float_x = Math.sin(t * 0.7) * 4;
      targetRef.current.float_y = Math.sin(t) * 5;
      targetRef.current.float_rz = Math.sin(t * 0.5) * 1.5;
    };
    const id = setInterval(tick, 16);
    return () => clearInterval(id);
  }, [floating]);

  // Gyroscope
  useEffect(() => {
    if (!gyroscope) return;
    let permissionRequested = false;
    const handleMotion = (e: DeviceOrientationEvent) => {
      if (!isHoveredRef.current) {
        const beta = clamp(e.beta ?? 0, -45, 45);
        const gamma = clamp(e.gamma ?? 0, -45, 45);
        targetRef.current.rx = (beta / 45) * rotateAmplitude * dir;
        targetRef.current.ry = (gamma / 45) * rotateAmplitude * dir;
      }
    };
    const requestPermission = async () => {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (DOE.requestPermission && !permissionRequested) {
        permissionRequested = true;
        try {
          const perm = await DOE.requestPermission();
          if (perm === 'granted') window.addEventListener('deviceorientation', handleMotion);
        } catch {}
      }
    };
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function') {
      containerRef.current?.addEventListener('click', requestPermission, { once: true });
    } else {
      window.addEventListener('deviceorientation', handleMotion);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleMotion);
    };
  }, [gyroscope, rotateAmplitude, dir]);

  // Flip controlled sync
  useEffect(() => {
    if (controlledFlipped !== undefined) {
      targetRef.current.flip = controlledFlipped ? 1 : 0;
    }
  }, [controlledFlipped]);

  // Animation loop
  const animate = useCallback((time: number) => {
    const dt = prevTimeRef.current !== null
      ? Math.min((time - prevTimeRef.current) / 1000, 0.1)
      : 1 / 60;
    prevTimeRef.current = time;

    const s = stateRef.current;
    const tgt = targetRef.current;

    const omega = 2 * Math.PI * (1 + (1 - smoothness) * 9);
    const zeta = 0.65 + smoothness * 0.35;

    let moving = false;
    moving = stepSpring(s, 'rx', tgt.rx, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'ry', tgt.ry, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'scale', tgt.scale, omega * 1.5, zeta, dt) || moving;
    moving = stepSpring(s, 'gx', tgt.gx, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'gy', tgt.gy, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'px', tgt.px, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'py', tgt.py, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'glare', tgt.glare, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'shadow', tgt.shadow, omega, zeta, dt) || moving;
    moving = stepSpring(s, 'tooltip_rotate', tgt.tooltip_rotate, omega * 0.8, zeta, dt) || moving;
    moving = stepSpring(s, 'flip', tgt.flip, omega * 0.6, 0.7, dt) || moving;
    moving = stepSpring(s, 'float_x', tgt.float_x, 1.5, 0.5, dt) || moving;
    moving = stepSpring(s, 'float_y', tgt.float_y, 1.5, 0.5, dt) || moving;
    moving = stepSpring(s, 'float_rz', tgt.float_rz, 1.5, 0.5, dt) || moving;
    if (intro) moving = stepSpring(s, 'intro', tgt.intro, omega * 0.5, 0.75, dt) || moving;

    // Apply transforms
    const card = cardRef.current;
    if (card) {
      const introY = intro ? s.intro * 60 : 0;
      const introO = intro ? smoother(1 - s.intro) : 1;
      const flipDeg = s.flip * 180;

      card.style.transform = [
        `translateY(${introY}px)`,
        `translateX(${s.float_x}px)`,
        `translateY(${s.float_y}px)`,
        `rotateZ(${s.float_rz}deg)`,
        `rotateX(${s.rx}deg)`,
        `rotateY(${s.ry + flipDeg}deg)`,
        `scale(${s.scale})`,
      ].join(' ');
      card.style.opacity = String(introO);

      const shadowStrength = s.shadow * shadow * 40;
      const shadowOffsetX = (-s.ry / rotateAmplitude) * shadowStrength * 0.5;
      const shadowOffsetY = (s.rx / rotateAmplitude) * shadowStrength * 0.5;
      card.style.boxShadow = shadow > 0
        ? `${shadowOffsetX}px ${shadowOffsetY + shadowStrength * 0.5}px ${shadowStrength * 2}px rgba(0,0,0,${s.shadow * shadow * 0.4})`
        : 'none';
    }

    // Glare
    if (glareRef.current && glare > 0) {
      glareRef.current.style.opacity = String(s.glare * glare);
      glareRef.current.style.background = `radial-gradient(ellipse at ${s.gx}% ${s.gy}%, rgba(${glareRgb},0.6) 0%, transparent 60%)`;
    }
    if (edgeGlareRef.current && glare > 0) {
      const angle = Math.atan2(s.ry, s.rx) * (180 / Math.PI);
      edgeGlareRef.current.style.opacity = String(s.glare * glare * 0.5);
      edgeGlareRef.current.style.background = `linear-gradient(${angle}deg, rgba(${glareRgb},0.3) 0%, transparent 50%)`;
    }

    // Tooltip
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${tooltipPosRef.current.x}px`;
      tooltipRef.current.style.top = `${tooltipPosRef.current.y - 36}px`;
      tooltipRef.current.style.setProperty('--tc-tooltip-rotate', `${s.tooltip_rotate}deg`);
    }

    if (moving) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      rafRef.current = 0;
      prevTimeRef.current = null;
    }
  }, [smoothness, glare, glareRgb, shadow, rotateAmplitude, intro]);

  const startAnim = useCallback(() => {
    if (!rafRef.current) {
      prevTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const getPointerOffset = useCallback((clientX: number, clientY: number) => {
    const el = trackWindow ? document.documentElement : containerRef.current;
    if (!el) return { nx: 0, ny: 0 };
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      nx: (x / rect.width) * 2 - 1,
      ny: (y / rect.height) * 2 - 1,
    };
  }, [trackWindow]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const { nx, ny } = getPointerOffset(clientX, clientY);
    const tgt = targetRef.current;

    if (axis !== 'horizontal') tgt.rx = -ny * rotateAmplitude * dir;
    if (axis !== 'vertical') tgt.ry = nx * rotateAmplitude * dir;

    if (glare > 0) {
      tgt.gx = (nx + 1) * 50;
      tgt.gy = (ny + 1) * 50;
      tgt.glare = 1;
    }

    if (parallax > 0) {
      tgt.px = nx * parallax * 8;
      tgt.py = ny * parallax * 8;
    }

    tgt.tooltip_rotate = nx * 10 - 5;
    tooltipPosRef.current = { x: clientX, y: clientY };

    startAnim();
  }, [getPointerOffset, axis, rotateAmplitude, dir, glare, parallax, startAnim]);

  const handlePointerEnter = useCallback(() => {
    isHoveredRef.current = true;
    targetRef.current.scale = scaleOnHover;
    targetRef.current.shadow = 1;
    startAnim();
  }, [scaleOnHover, startAnim]);

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false;
    const tgt = targetRef.current;
    tgt.rx = 0; tgt.ry = 0;
    tgt.scale = 1;
    tgt.gx = 50; tgt.gy = 50;
    tgt.glare = 0;
    tgt.px = 0; tgt.py = 0;
    tgt.shadow = 0;
    tgt.tooltip_rotate = -6;
    startAnim();
  }, [startAnim]);

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (!hasBack || !flipOnClick) return;
    const totalFlip = Math.abs(flipTotalRef.current);
    if (totalFlip > FLIP_THRESHOLD) return;
    const next = !isFlipped;
    if (controlledFlipped === undefined) setInternalFlipped(next);
    onFlip?.(next);
    targetRef.current.flip = next ? 1 : 0;
    startAnim();
  }, [onClick, hasBack, flipOnClick, isFlipped, controlledFlipped, onFlip, startAnim]);

  // Event wiring
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (e: globalThis.MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handlePointerMove(t.clientX, t.clientY);
    };

    const targetEl: Element | Window = trackWindow ? window : container;

    if (trackWindow) {
      (window as Window).addEventListener('mousemove', onMouseMove as EventListener);
      (window as Window).addEventListener('touchmove', onTouchMove as EventListener, { passive: true });
    } else {
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('touchmove', onTouchMove, { passive: true });
    }
    container.addEventListener('mouseenter', handlePointerEnter);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchstart', handlePointerEnter, { passive: true });
    container.addEventListener('touchend', handlePointerLeave);

    return () => {
      if (trackWindow) {
        (window as Window).removeEventListener('mousemove', onMouseMove as EventListener);
        (window as Window).removeEventListener('touchmove', onTouchMove as EventListener);
      } else {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('touchmove', onTouchMove);
      }
      container.removeEventListener('mouseenter', handlePointerEnter);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchstart', handlePointerEnter);
      container.removeEventListener('touchend', handlePointerLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackWindow, handlePointerMove, handlePointerEnter, handlePointerLeave]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Intro: kick off animation on mount
  useEffect(() => {
    if (intro) startAnim();
  }, [intro, startAnim]);

  const isClickable = hasBack || !!onClick;

  return (
    <>
      <div
        ref={containerRef}
        className="tilted-card-container"
        style={{
          width: toLength(containerWidth),
          height: toLength(containerHeight),
          '--tc-perspective': toLength(typeof perspective === 'number' ? perspective : parseInt(String(perspective))),
        } as CSSProperties}
        tabIndex={isClickable ? 0 : undefined}
        role={isClickable ? 'button' : undefined}
        aria-label={isClickable ? (captionText || altText) : undefined}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(e);
          }
        }}
      >
        <div
          ref={cardRef}
          className={`tilted-card${hasBack && flipOnClick ? ' tilted-card--flip-ready' : ''} ${className}`.trim()}
          style={{
            width: toLength(imageWidth),
            height: toLength(imageHeight),
            '--tc-radius': toLength(typeof radius === 'number' ? radius : parseInt(String(radius))),
            '--tc-img-w': toLength(imageWidth),
            '--tc-img-h': toLength(imageHeight),
            transformStyle: 'preserve-3d',
            ...style,
          } as CSSProperties}
          onClick={handleClick}
        >
          {/* Front face */}
          <div className="tilted-card__face">
            {imageSrc && (
              <img src={imageSrc} alt={altText} className="tilted-card__img" draggable={false} />
            )}
            {children}
            {glare > 0 && <div ref={glareRef} className="tilted-card__glare" />}
            {glare > 0 && <div ref={edgeGlareRef} className="tilted-card__edge-glare" />}
          </div>

          {/* Back face */}
          {hasBack && (
            <div className="tilted-card__face tilted-card__face--back">
              {backContent}
            </div>
          )}

          {/* Overlay */}
          {displayOverlayContent && overlayContent && (
            <div
              className="tilted-card__overlay"
              style={{ '--tc-overlay-depth': overlayDepth } as CSSProperties}
            >
              {overlayContent}
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && captionText && isHoveredRef.current && (
        <div ref={tooltipRef} className="tilted-card__tooltip">
          {captionText}
        </div>
      )}
    </>
  );
};

export default TiltedCard;

