import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Html } from '@react-three/drei';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

// Floating location pin marker on the globe
function LocationPin({ position, label, color = '#22c55e', delay = 0 }) {
  const pinRef = useRef();
  const glowRef = useRef();
  const time = useRef(delay);

  useFrame((state) => {
    time.current = state.clock.elapsedTime + delay;
    if (pinRef.current) {
      pinRef.current.position.y = position[1] + Math.sin(time.current * 1.5) * 0.05;
      pinRef.current.scale.setScalar(1 + Math.sin(time.current * 2) * 0.1);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.4 + Math.sin(time.current * 2.5) * 0.3;
      glowRef.current.scale.setScalar(1 + Math.sin(time.current * 2) * 0.4);
    }
  });

  return (
    <group position={position}>
      {/* Glow ring */}
      <mesh ref={glowRef}>
        <ringGeometry args={[0.05, 0.12, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Pin dot */}
      <mesh ref={pinRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// Atmosphere glow sphere
function Atmosphere({ radius = 2.15 }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color="#22c55e"
        transparent
        opacity={0.07}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Outer glow halo
function GlowHalo() {
  return (
    <mesh>
      <sphereGeometry args={[2.35, 32, 32]} />
      <meshStandardMaterial
        color="#16a34a"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Orbiting ring around the globe
function OrbitalRing({ radius = 2.6, color = '#22c55e', tilt = 0.4, speed = 0.3 }) {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });
  return (
    <group rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[radius, 0.008, 8, 120]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Small orbiting satellite dot
function Satellite({ orbitRadius = 2.6, speed = 0.4, color = '#f59e0b', phase = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t) * orbitRadius,
        Math.sin(t * 0.5) * 0.4,
        Math.sin(t) * orbitRadius
      );
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

// Main globe mesh — stylized green-themed world
function Globe() {
  const globeRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Procedural land-like texture using canvas
  const landTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Ocean base — deep teal
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, '#0c4a6e');
    oceanGrad.addColorStop(0.5, '#075985');
    oceanGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Procedurally generated "landmasses" — green blobs
    const landShapes = [
      { x: 100, y: 80, rx: 60, ry: 30 },   // North America-like
      { x: 150, y: 140, rx: 35, ry: 25 },  // South America-like
      { x: 280, y: 75, rx: 70, ry: 35 },   // Eurasia-like
      { x: 300, y: 140, rx: 40, ry: 28 },  // Africa-like
      { x: 390, y: 100, rx: 25, ry: 18 },  // Asia East-like
      { x: 420, y: 170, rx: 30, ry: 15 },  // Australia-like
      { x: 250, y: 220, rx: 60, ry: 8 },   // Antarctica-like
    ];

    landShapes.forEach(({ x, y, rx, ry }) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      grad.addColorStop(0, '#16a34a');
      grad.addColorStop(0.5, '#15803d');
      grad.addColorStop(0.8, '#166534');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add some texture noise for realism
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 3000; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? '#22c55e' : '#0ea5e9';
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Track mouse
  useMemo(() => {
    const move = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useFrame((state) => {
    if (!globeRef.current) return;
    // Auto-rotate + mouse influence
    globeRef.current.rotation.y += 0.003;
    globeRef.current.rotation.x = THREE.MathUtils.lerp(
      globeRef.current.rotation.x,
      mouseRef.current.y * 0.15,
      0.03
    );
  });

  // Pin locations around the globe surface
  const pins = useMemo(() => [
    { position: [0.8, 1.5, 1.2], color: '#22c55e', delay: 0 },
    { position: [-1.4, 0.8, 1.1], color: '#f59e0b', delay: 0.8 },
    { position: [1.5, -0.5, 0.9], color: '#22c55e', delay: 1.5 },
    { position: [-0.5, -1.2, 1.6], color: '#84cc16', delay: 2.1 },
    { position: [0.2, 0.9, 1.9], color: '#0ea5e9', delay: 0.4 },
  ], []);

  return (
    <group ref={globeRef}>
      {/* Core globe sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          map={landTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>
      <Atmosphere />
      <GlowHalo />
      {pins.map((pin, i) => (
        <LocationPin key={i} {...pin} />
      ))}
    </group>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={0.4} color="#dcfce7" />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#22c55e" />
      <pointLight position={[0, 0, 8]} intensity={0.5} color="#16a34a" />

      <Globe />
      <OrbitalRing radius={2.6} color="#22c55e" tilt={0.4} speed={0.25} />
      <OrbitalRing radius={2.9} color="#84cc16" tilt={-0.6} speed={-0.15} />
      <Satellite orbitRadius={2.65} speed={0.5} color="#f59e0b" phase={0} />
      <Satellite orbitRadius={2.85} speed={-0.35} color="#22c55e" phase={Math.PI} />
    </>
  );
}

/**
 * AgriGlobe — A rotating stylized Earth with green landmasses,
 * atmospheric glow, location pins, and orbital rings.
 * Used in the LandingPage hero section.
 */
export default function AgriGlobe({ className = '', style = {} }) {
  return (
    <ThreeCanvas
      className={className}
      style={style}
      camera={{ position: [0, 0, 6], fov: 55 }}
      frameloop="always"
      dpr={[1, 2]}
      fallback={
        <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #16a34a22, transparent)' }} />
      }
    >
      <GlobeScene />
    </ThreeCanvas>
  );
}
