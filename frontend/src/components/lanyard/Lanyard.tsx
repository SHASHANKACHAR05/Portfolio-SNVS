import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './Lanyard.css';

export interface LanyardProps {
  frontImage: string;
  backImage?: string;
  orientation?: 'portrait' | 'landscape';
  finish?: 'glossy' | 'holographic' | 'metallic' | 'matte';
  metal?: 'silver' | 'gold' | 'graphite';
  cardColor?: string;
  strapColor?: string;
  strapImage?: string;
  anchor?: 'left' | 'center' | 'right';
  cornerRadius?: number;
  size?: number;
  bandLength?: number;
  bandWidth?: number;
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  className?: string;
}

interface RopeNode {
  x: number;
  y: number;
  z: number;
  oldX: number;
  oldY: number;
  oldZ: number;
}

const METAL_PRESETS: Record<'silver' | 'gold' | 'graphite', { color: number; metalness: number; roughness: number }> = {
  silver: { color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 },
  gold: { color: 0xd4af37, metalness: 0.92, roughness: 0.18 },
  graphite: { color: 0x3a424c, metalness: 0.88, roughness: 0.28 },
};

const FINISH_PRESETS: Record<
  'glossy' | 'holographic' | 'metallic' | 'matte',
  { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number; foilStrength: number }
> = {
  glossy: { roughness: 0.14, metalness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.06, foilStrength: 0.16 },
  holographic: { roughness: 0.22, metalness: 0.25, clearcoat: 1.0, clearcoatRoughness: 0.06, foilStrength: 0.42 },
  metallic: { roughness: 0.26, metalness: 0.65, clearcoat: 0.6, clearcoatRoughness: 0.14, foilStrength: 0.24 },
  matte: { roughness: 0.72, metalness: 0.02, clearcoat: 0.05, clearcoatRoughness: 0.5, foilStrength: 0.0 },
};

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw * 0.45, hh * 0.45);
  shape.moveTo(-hw + cr, -hh);
  shape.lineTo(hw - cr, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  shape.lineTo(hw, hh - cr);
  shape.quadraticCurveTo(hw, hh, hw - cr, hh);
  shape.lineTo(-hw + cr, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  shape.lineTo(-hw, -hh + cr);
  shape.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
  return shape;
}

function normalizeShapeUVs(geometry: THREE.ShapeGeometry, w: number, h: number) {
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs[i * 2] = (x + w / 2) / w;
    uvs[i * 2 + 1] = (y + h / 2) / h;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

function createCoverTexture(
  img: HTMLImageElement,
  targetAspect: number,
  maxAnisotropy: number,
  bgColor: string
): THREE.CanvasTexture {
  const canvasW = 1024;
  const canvasH = Math.round(canvasW / targetAspect);
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const imgAspect = img.naturalWidth / (img.naturalHeight || 1);
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imgAspect > targetAspect) {
    sw = img.naturalHeight * targetAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / targetAspect;
    sy = Math.max(0, (img.naturalHeight - sh) * 0.1);
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);

  // Crisp dark oval punch-slot cutout near top center of card (matching reference)
  ctx.fillStyle = '#0f1318';
  ctx.beginPath();
  ctx.roundRect(canvasW / 2 - 78, 34, 156, 30, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 3;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function createExecutiveBackTexture(targetAspect: number, maxAnisotropy: number): THREE.CanvasTexture {
  const canvasW = 1024;
  const canvasH = Math.round(canvasW / targetAspect);
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Subtle grid
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.07)';
  ctx.lineWidth = 2;
  for (let x = 0; x < canvasW; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasH);
    ctx.stroke();
  }
  for (let y = 0; y < canvasH; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasW, y);
    ctx.stroke();
  }

  // Top olive band
  const headerGrad = ctx.createLinearGradient(0, 0, canvasW, 220);
  headerGrad.addColorStop(0, '#4d6a10');
  headerGrad.addColorStop(1, '#6f9a0c');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, canvasW, 210);

  // Monogram
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(canvasW / 2 - 70, 136, 140, 140, 32);
  ctx.fill();
  ctx.strokeStyle = '#e7efcf';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.font = '800 60px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SB', canvasW / 2, 226);

  ctx.fillStyle = '#121410';
  ctx.font = '800 48px "Inter Tight", system-ui, sans-serif';
  ctx.fillText('N V Sai Bharath', canvasW / 2, 368);
  ctx.fillText('Singamsetty', canvasW / 2, 424);

  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(canvasW / 2 - 220, 464, 440, 60, 30);
  ctx.fill();
  ctx.fillStyle = '#4d6a10';
  ctx.font = '700 28px "Inter Tight", system-ui, sans-serif';
  ctx.fillText('PMP® · 10+ YEARS RECORD', canvasW / 2, 504);

  const lines = [
    ['CURRENT ROLE', 'Senior Manager, Technology'],
    ['PREVIOUS', 'Head of IT · NFDC India'],
    ['SCALE', '1,200+ Higher Ed Institutions'],
    ['LOCATION', 'Bengaluru, India'],
  ];

  let yPos = 605;
  ctx.textAlign = 'left';
  lines.forEach(([label, value]) => {
    ctx.fillStyle = '#4d6a10';
    ctx.font = '700 22px "Inter Tight", system-ui, sans-serif';
    ctx.fillText(label, 90, yPos);

    ctx.fillStyle = '#121410';
    ctx.font = '700 32px "Inter Tight", system-ui, sans-serif';
    ctx.fillText(value, 90, yPos + 40);

    ctx.strokeStyle = '#eef0ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, yPos + 64);
    ctx.lineTo(canvasW - 90, yPos + 64);
    ctx.stroke();

    yPos += 112;
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.45)';
  ctx.font = '600 22px "Inter Tight", system-ui, sans-serif';
  ctx.fillText('CLICK TO FLIP BACK TO PORTRAIT', canvasW / 2, canvasH - 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function applyFoilShader(
  material: THREE.MeshPhysicalMaterial,
  foilStrength: number,
  isHolographic: boolean
) {
  if (foilStrength <= 0) return;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFoilStrength = { value: foilStrength };
    shader.uniforms.uHolo = { value: isHolographic ? 1.0 : 0.0 };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uFoilStrength;
        uniform float uHolo;`
      )
      .replace(
        '#include <dithering_fragment>',
        `vec3 viewDirF = normalize(vViewPosition);
        float fresnelF = pow(1.0 - max(dot(normalize(normal), viewDirF), 0.0), 2.6);
        vec3 sheenCol = mix(
          vec3(1.0, 1.0, 1.0),
          0.5 + 0.5 * cos(6.28318 * (fresnelF * 1.4 + vec3(0.0, 0.33, 0.67))),
          uHolo
        );
        gl_FragColor.rgb += sheenCol * fresnelF * uFoilStrength;
        #include <dithering_fragment>`
      );
  };
}

function createWovenStrapTexture(baseColor: string, maxAnisotropy: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, c.width, c.height);

  // Subtle horizontal & vertical woven fabric ribs (matching reference strap)
  for (let y = 0; y < c.height; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.09)';
    ctx.fillRect(0, y, c.width, 3);
  }
  for (let x = 0; x < c.width; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
    ctx.fillRect(x, 0, 4, c.height);
  }

  // Subtle stitched edge shading
  const edgeGrad = ctx.createLinearGradient(0, 0, c.width, 0);
  edgeGrad.addColorStop(0, 'rgba(15,23,42,0.22)');
  edgeGrad.addColorStop(0.08, 'rgba(255,255,255,0.06)');
  edgeGrad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  edgeGrad.addColorStop(0.92, 'rgba(255,255,255,0.06)');
  edgeGrad.addColorStop(1, 'rgba(15,23,42,0.22)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2.2);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

// Build a flat fabric ribbon geometry along a 3D curve (no round tube!)
function updateFlatRibbonGeometry(
  geometry: THREE.BufferGeometry,
  points: THREE.Vector3[],
  ribbonWidth: number
) {
  const segs = points.length - 1;
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const halfW = ribbonWidth / 2;

  for (let i = 0; i <= segs; i++) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(segs, i + 1)];

    // Tangent along ribbon
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tz = next.z - prev.z;

    // Cross with camera forward (0, 0, 1) to get ribbon width axis
    let sx = ty;
    let sy = -tx;
    let sz = 0;
    const len = Math.hypot(sx, sy, sz) || 1;
    sx = (sx / len) * halfW;
    sy = (sy / len) * halfW;

    // Slight Z offset for clean shading
    const zCurve = tz * 0.02;

    positions.setXYZ(i * 2, p.x - sx, p.y - sy, p.z + zCurve);
    positions.setXYZ(i * 2 + 1, p.x + sx, p.y + sy, p.z - zCurve);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

export const Lanyard: React.FC<LanyardProps> = ({
  frontImage,
  backImage,
  orientation = 'portrait',
  finish = 'glossy',
  metal = 'silver',
  cardColor = '#ffffff',
  strapColor = '#94a3b8',
  strapImage,
  anchor = 'center',
  cornerRadius = 0.3,
  size = 0.6,
  bandLength = 0.2,
  bandWidth = 0.8,
  gravity = 1.65,
  damping = 0.35,
  elasticity = 0.5,
  breeze = 0.5,
  interactive = true,
  intro = true,
  className = '',
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let disposed = false;
    let rafId = 0;
    let isInView = true;

    // Live prefers-reduced-motion tracking
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mq.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mq.addEventListener('change', handleMotionChange);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0.15, 6.2);

    // Studio Environment Lighting
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGen.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGen.dispose();

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3.0, 4.5, 5.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 1.1);
    rimLight.position.set(-3.5, 2.0, -3.0);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    // Card Dimensions (Big prominent portrait card)
    const sizeScale = 0.72 + size * 0.65; // 0.6 -> 1.11x
    const cardW = (orientation === 'landscape' ? 2.1 : 1.62) * sizeScale;
    const cardH = (orientation === 'landscape' ? 1.42 : 2.18) * sizeScale;
    const cardDepth = 0.042;
    const cardCornerR = Math.max(0.04, cornerRadius * 0.52);
    const cardAspect = cardW / cardH;

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const finishPreset = FINISH_PRESETS[finish];
    const metalPreset = METAL_PRESETS[metal];

    // Badge Group: origin (0, 0, 0) is placed AT THE EXACT STRAP-TO-CLAMP PIVOT POINT
    // so rotating/swinging/flipping NEVER detaches the silver clamp from the woven strap!
    const badgeGroup = new THREE.Group();
    scene.add(badgeGroup);

    const clampCenterOffset = cardH / 2 + 0.205; // Distance from clamp pivot down to card center
    const cardSubGroup = new THREE.Group();
    cardSubGroup.position.set(0, -clampCenterOffset, 0);
    badgeGroup.add(cardSubGroup);

    // Card Body (Rounded white edge rim)
    const cardShape = createRoundedRectShape(cardW, cardH, cardCornerR);
    const rimGeo = new THREE.ExtrudeGeometry(cardShape, {
      depth: cardDepth,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 28,
    });
    rimGeo.center();
    geometries.push(rimGeo);

    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cardColor),
      roughness: 0.28,
      metalness: 0.05,
    });
    materials.push(rimMat);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    cardSubGroup.add(rimMesh);

    // Front Face
    const frontFaceGeo = new THREE.ShapeGeometry(cardShape, 28);
    normalizeShapeUVs(frontFaceGeo, cardW, cardH);
    geometries.push(frontFaceGeo);

    const frontMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: finishPreset.roughness,
      metalness: finishPreset.metalness,
      clearcoat: finishPreset.clearcoat,
      clearcoatRoughness: finishPreset.clearcoatRoughness,
    });
    applyFoilShader(frontMat, finishPreset.foilStrength, finish === 'holographic');
    materials.push(frontMat);

    const frontMesh = new THREE.Mesh(frontFaceGeo, frontMat);
    frontMesh.position.z = cardDepth / 2 + 0.012;
    cardSubGroup.add(frontMesh);

    // Back Face
    const backFaceGeo = new THREE.ShapeGeometry(cardShape, 28);
    normalizeShapeUVs(backFaceGeo, cardW, cardH);
    geometries.push(backFaceGeo);

    const backTex = createExecutiveBackTexture(cardAspect, maxAnisotropy);
    textures.push(backTex);

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      color: 0xffffff,
      roughness: finishPreset.roughness,
      metalness: finishPreset.metalness,
      clearcoat: finishPreset.clearcoat,
      clearcoatRoughness: finishPreset.clearcoatRoughness,
    });
    applyFoilShader(backMat, finishPreset.foilStrength, finish === 'holographic');
    materials.push(backMat);

    const backMesh = new THREE.Mesh(backFaceGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -(cardDepth / 2 + 0.012);
    cardSubGroup.add(backMesh);

    // Load Front Portrait Image
    const frontImgEl = new Image();
    frontImgEl.crossOrigin = 'anonymous';
    frontImgEl.onload = () => {
      if (disposed) return;
      const tex = createCoverTexture(frontImgEl, cardAspect, maxAnisotropy, cardColor);
      textures.push(tex);
      frontMat.map = tex;
      frontMat.needsUpdate = true;
    };
    frontImgEl.src = frontImage;

    if (backImage) {
      const backImgEl = new Image();
      backImgEl.crossOrigin = 'anonymous';
      backImgEl.onload = () => {
        if (disposed) return;
        const tex = createCoverTexture(backImgEl, cardAspect, maxAnisotropy, cardColor);
        textures.push(tex);
        backMat.map = tex;
        backMat.needsUpdate = true;
      };
      backImgEl.src = backImage;
    }

    // Reference-Accurate Silver Hardware Assembly (from top to bottom):
    // 1. Silver rounded-rectangle crimp clamp at bottom of strap
    // 2. Small silver eyelet loop under clamp
    // 3. Sideways-angled silver jump ring looping through eyelet into card punch-slot
    const metalMat = new THREE.MeshStandardMaterial({
      color: metalPreset.color,
      metalness: metalPreset.metalness,
      roughness: metalPreset.roughness,
    });
    materials.push(metalMat);

    const ribbonWorldWidth = 0.16 + bandWidth * 0.14; // bandWidth 0.8 -> 0.272 wide flat strap
    const clipGroup = new THREE.Group();
    clipGroup.position.set(0, 0, 0); // Locked directly at badgeGroup pivot (0, 0, 0)
    badgeGroup.add(clipGroup);

    // 3. Sideways-angled silver jump ring passing through card slot (-0.295) up to eyelet (-0.095)
    const jumpRingGeo = new THREE.TorusGeometry(0.095, 0.018, 14, 28);
    geometries.push(jumpRingGeo);
    const jumpRingMesh = new THREE.Mesh(jumpRingGeo, metalMat);
    jumpRingMesh.position.set(0, -0.2, 0.012);
    jumpRingMesh.rotation.y = Math.PI * 0.42;
    clipGroup.add(jumpRingMesh);

    // 2. Small silver eyelet attached to bottom center of crimp clamp
    const eyeletGeo = new THREE.TorusGeometry(0.036, 0.012, 12, 20);
    geometries.push(eyeletGeo);
    const eyeletMesh = new THREE.Mesh(eyeletGeo, metalMat);
    eyeletMesh.position.set(0, -0.095, 0);
    clipGroup.add(eyeletMesh);

    // 1. Silver rounded-rectangle crimp clamp centered right at pivot y = 0
    const clampW = ribbonWorldWidth + 0.045;
    const clampH = 0.135;
    const clampShape = createRoundedRectShape(clampW, clampH, 0.028);
    const clampGeo = new THREE.ExtrudeGeometry(clampShape, {
      depth: 0.046,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 12,
    });
    clampGeo.center();
    geometries.push(clampGeo);
    const clampMesh = new THREE.Mesh(clampGeo, metalMat);
    clampMesh.position.set(0, 0, 0);
    clipGroup.add(clampMesh);

    // Dynamic Anchor X & visible horizontal frustum bounds so full-width canvas NEVER clips the card on drag!
    let visibleHalfW = 2.5;
    let anchorX = 0;

    const computeBounds = () => {
      const vFovRad = (camera.fov * Math.PI) / 180;
      const halfH = Math.tan(vFovRad / 2) * camera.position.z;
      visibleHalfW = halfH * camera.aspect;
      if (anchor === 'right' && (stage.clientWidth || 0) >= 768) {
        anchorX = visibleHalfW * 0.48;
      } else if (anchor === 'left' && (stage.clientWidth || 0) >= 768) {
        anchorX = -visibleHalfW * 0.48;
      } else {
        anchorX = 0;
      }
    };

    // Woven Flat Fabric Ribbon Strap anchored above the very top edge of the viewport so it hangs seamlessly from top of page down to the clamp pivot
    const anchorY = 2.65;
    const totalStrapLength = 1.08 + bandLength * 1.0;
    const nodeCount = 10;
    const segmentLen = totalStrapLength / (nodeCount - 1);

    // Compute initial aspect & anchorX before initializing rope nodes
    const initW = stage.clientWidth || 380;
    const initH = stage.clientHeight || 440;
    camera.aspect = initW / initH;
    camera.updateProjectionMatrix();
    computeBounds();

    const nodes: RopeNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const frac = i / (nodeCount - 1);
      const ny = anchorY - i * segmentLen;
      const initX = anchorX + (intro && !reducedMotion ? frac * 0.55 : 0);
      const initZ = intro && !reducedMotion ? frac * 0.18 : 0;
      nodes.push({ x: initX, y: ny, z: initZ, oldX: initX, oldY: ny, oldZ: initZ });
    }

    const ribbonSamples = 20;
    const ribbonGeo = new THREE.BufferGeometry();
    const ribbonVerts = new Float32Array((ribbonSamples + 1) * 2 * 3);
    const ribbonUvs = new Float32Array((ribbonSamples + 1) * 2 * 2);
    const ribbonIndices: number[] = [];

    for (let i = 0; i <= ribbonSamples; i++) {
      const v = i / ribbonSamples;
      ribbonUvs[i * 4] = 0;
      ribbonUvs[i * 4 + 1] = v;
      ribbonUvs[i * 4 + 2] = 1;
      ribbonUvs[i * 4 + 3] = v;
      if (i < ribbonSamples) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        ribbonIndices.push(a, b, c, b, d, c);
      }
    }
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonVerts, 3));
    ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(ribbonUvs, 2));
    ribbonGeo.setIndex(ribbonIndices);
    geometries.push(ribbonGeo);

    const wovenTex = createWovenStrapTexture(strapColor, maxAnisotropy);
    textures.push(wovenTex);

    const strapMat = new THREE.MeshStandardMaterial({
      map: wovenTex,
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    materials.push(strapMat);

    if (strapImage) {
      const strapImgEl = new Image();
      strapImgEl.crossOrigin = 'anonymous';
      strapImgEl.onload = () => {
        if (disposed) return;
        const sTex = new THREE.Texture(strapImgEl);
        sTex.wrapS = THREE.RepeatWrapping;
        sTex.wrapT = THREE.RepeatWrapping;
        sTex.colorSpace = THREE.SRGBColorSpace;
        sTex.needsUpdate = true;
        textures.push(sTex);
        strapMat.map = sTex;
        strapMat.needsUpdate = true;
      };
      strapImgEl.src = strapImage;
    }

    const strapMesh = new THREE.Mesh(ribbonGeo, strapMat);
    strapMesh.frustumCulled = false;
    scene.add(strapMesh);

    // Hit-test & Drag State
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const dragIntersect = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();

    let isHoveringCard = false;
    let isDraggingCard = false;
    let pointerDownScreen = { x: 0, y: 0 };
    let targetFlipY = 0;
    let currentFlipY = 0;
    let flipVelocity = 0;
    let currentTiltZ = 0;
    let currentTiltX = 0;

    const updateNDC = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / (rect.height || 1)) * 2 + 1;
    };

    const hitTestCard = (clientX: number, clientY: number): boolean => {
      updateNDC(clientX, clientY);
      raycaster.setFromCamera(pointerNDC, camera);
      return raycaster.intersectObjects([rimMesh, frontMesh, backMesh], false).length > 0;
    };

    const updateCursorClasses = () => {
      canvas.classList.toggle('lanyard-canvas--dragging', isDraggingCard);
      canvas.classList.toggle('lanyard-canvas--hover', !isDraggingCard && isHoveringCard);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive || e.button !== 0) return;
      if (!hitTestCard(e.clientX, e.clientY)) return;

      isDraggingCard = true;
      pointerDownScreen = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      updateCursorClasses();

      dragPlane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, badgeGroup.position.z)
      );
      raycaster.ray.intersectPlane(dragPlane, dragIntersect);
      dragOffset.copy(badgeGroup.position).sub(dragIntersect);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;

      if (isDraggingCard) {
        updateNDC(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNDC, camera);
        if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
          const maxDragX = Math.max(0.8, visibleHalfW - cardW * 0.58);
          const desiredX = Math.max(-maxDragX, Math.min(maxDragX, dragIntersect.x + dragOffset.x));
          const desiredY = Math.max(-0.4, Math.min(1.85, dragIntersect.y + dragOffset.y));
          const tip = nodes[nodeCount - 1];
          tip.x = desiredX;
          tip.y = desiredY;
          tip.z = 0.25;
        }
      } else {
        const hit = hitTestCard(e.clientX, e.clientY);
        if (hit !== isHoveringCard) {
          isHoveringCard = hit;
          updateCursorClasses();
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingCard) return;
      isDraggingCard = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }

      const movedDist = Math.hypot(e.clientX - pointerDownScreen.x, e.clientY - pointerDownScreen.y);
      if (movedDist < 9) {
        targetFlipY += Math.PI;
      }

      isHoveringCard = hitTestCard(e.clientX, e.clientY);
      updateCursorClasses();
    };

    const handlePointerLeave = () => {
      if (!isDraggingCard && isHoveringCard) {
        isHoveringCard = false;
        updateCursorClasses();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const syncSize = () => {
      const w = stage.clientWidth || 380;
      const h = stage.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      computeBounds();
      renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 2), 3));
      renderer.setSize(w, h, false);
    };
    syncSize();

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isInView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(stage);

    // Main Physics & Render Loop (tuned to gravity=1.65, damping=0.35, elasticity=0.5, breeze=0.5)
    let lastTime = performance.now();
    const velDamping = Math.max(0.92, Math.min(0.992, 0.992 - damping * 0.045));
    const gravForce = -10.5 * gravity;
    const stretchStiffness = 0.55 + (1 - elasticity) * 0.4;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (!isInView) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      // Multi-harmonic breeze sway (live-synced with prefers-reduced-motion)
      const breezeScale = reducedMotion || isDraggingCard ? 0 : breeze;
      const breezeX = breezeScale * (Math.sin(now * 0.0017) * 1.45 + Math.sin(now * 0.0029) * 0.45);
      const breezeZ = breezeScale * (Math.cos(now * 0.0013) * 0.65);

      for (let i = 1; i < nodeCount; i++) {
        const n = nodes[i];
        if (isDraggingCard && i === nodeCount - 1) continue;

        const vx = (n.x - n.oldX) * velDamping;
        const vy = (n.y - n.oldY) * velDamping;
        const vz = (n.z - n.oldZ) * velDamping;

        n.oldX = n.x;
        n.oldY = n.y;
        n.oldZ = n.z;

        const weight = i === nodeCount - 1 ? 1.6 : 1.0;
        n.x += vx + breezeX * dt * dt;
        n.y += vy + gravForce * weight * dt * dt;
        n.z += vz + breezeZ * dt * dt;
      }

      // Elastic distance constraint solver
      for (let iter = 0; iter < 6; iter++) {
        nodes[0].x = anchorX;
        nodes[0].y = anchorY;
        nodes[0].z = 0;

        for (let i = 0; i < nodeCount - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dy, dz) || 0.0001;
          const corr = ((dist - segmentLen) / dist) * (isDraggingCard ? stretchStiffness : 0.92);

          if (i === 0) {
            b.x -= dx * corr;
            b.y -= dy * corr;
            b.z -= dz * corr;
          } else if (isDraggingCard && i + 1 === nodeCount - 1) {
            a.x += dx * corr;
            a.y += dy * corr;
            a.z += dz * corr;
          } else {
            a.x += dx * corr * 0.5;
            a.y += dy * corr * 0.5;
            a.z += dz * corr * 0.5;
            b.x -= dx * corr * 0.5;
            b.y -= dy * corr * 0.5;
            b.z -= dz * corr * 0.5;
          }
        }
      }

      // Lock badgeGroup pivot DIRECTLY onto the bottom tip of the woven strap (zero detachment at any angle!)
      const tip = nodes[nodeCount - 1];
      const prev = nodes[nodeCount - 2];

      badgeGroup.position.set(tip.x, tip.y, tip.z);

      const swingZ = Math.atan2(tip.x - prev.x, Math.max(0.05, prev.y - tip.y));
      const swingX = Math.atan2(tip.z - prev.z, Math.max(0.05, prev.y - tip.y)) * 0.55;
      const tiltEase = reducedMotion ? 1 : Math.min(1, dt * 12);

      currentTiltZ += (swingZ - currentTiltZ) * tiltEase;
      currentTiltX += (swingX - currentTiltX) * tiltEase;

      // Spring-damped flip with subtle natural overshoot
      if (reducedMotion) {
        currentFlipY = targetFlipY;
        flipVelocity = 0;
      } else {
        const flipAccel = (targetFlipY - currentFlipY) * 95 - flipVelocity * 11;
        flipVelocity += flipAccel * dt;
        currentFlipY += flipVelocity * dt;
      }

      // Subtle breeze + velocity yaw twist
      const ambientTwist = reducedMotion || isDraggingCard ? 0 : Math.sin(now * 0.0012) * 0.12 * breeze;
      const velTwist = reducedMotion ? 0 : Math.max(-0.42, Math.min(0.42, (tip.x - tip.oldX) * 6.0));

      badgeGroup.rotation.z = currentTiltZ;
      badgeGroup.rotation.x = currentTiltX;
      badgeGroup.rotation.y = currentFlipY + ambientTwist + velTwist;

      // Tuck the strap end slightly inside the silver clamp center so no gap ever appears
      const curvePts = nodes.map((n) => new THREE.Vector3(n.x, n.y, n.z));
      const curve = new THREE.CatmullRomCurve3(curvePts);
      const sampled = curve.getPoints(ribbonSamples);
      updateFlatRibbonGeometry(ribbonGeo, sampled, ribbonWorldWidth);

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      mq.removeEventListener('change', handleMotionChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
    };
  }, [
    frontImage,
    backImage,
    orientation,
    finish,
    metal,
    cardColor,
    strapColor,
    strapImage,
    anchor,
    cornerRadius,
    size,
    bandLength,
    bandWidth,
    gravity,
    damping,
    elasticity,
    breeze,
    interactive,
    intro,
  ]);

  const anchorClass =
    anchor === 'right'
      ? 'lanyard-stage--anchor-right'
      : anchor === 'left'
      ? 'lanyard-stage--anchor-left'
      : '';

  return (
    <div ref={stageRef} className={`lanyard-stage ${anchorClass} ${className}`.trim()}>
      <canvas ref={canvasRef} className="lanyard-canvas" aria-label="Interactive 3D portrait badge lanyard" />
      {interactive && (
        <div className="lanyard-hint" aria-hidden="true">
          <span>Drag to swing &middot; Click badge to flip</span>
        </div>
      )}
    </div>
  );
};
