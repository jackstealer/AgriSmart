import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

// Orbiting smaller sphere
function OrbitingSphere({ orbitRadius, speed, phase, size, color, emissiveIntensity = 1.5 }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t) * orbitRadius,
        Math.sin(t * 0.7) * orbitRadius * 0.4,
        Math.sin(t) * orbitRadius
      );
      ref.current.rotation.x += 0.03;
      ref.current.rotation.y += 0.05;
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  );
}

// Energy ring around the orb
function EnergyRing({ radius, tilt, speed, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.015, 8, 80]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// The central glowing orb
function CoreOrb() {
  const ref = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.x = t * 0.3;
      ref.current.rotation.y = t * 0.4;
      // Pulse scale
      const pulse = 1 + Math.sin(t * 2.5) * 0.06;
      ref.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 2) * 0.06;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.15);
    }
  });

  return (
    <>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#22c55e"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Core sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshStandardMaterial
          color="#16a34a"
          emissive="#16a34a"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>
    </>
  );
}

// Floating particle dots around the orb
function OrbParticles({ count = 120 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const spread = 1.6 + Math.random() * 0.8;
      pos[i * 3]     = Math.cos(theta) * r * spread;
      pos[i * 3 + 1] = y * spread;
      pos[i * 3 + 2] = Math.sin(theta) * r * spread;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
      ref.current.rotation.x = state.clock.elapsedTime * 0.08;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#84cc16"
        size={0.04}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CropOrbScene() {
  return (
    <>
      <ambientLight intensity={0.3} color="#dcfce7" />
      <pointLight position={[3, 3, 3]} intensity={2} color="#22c55e" />
      <pointLight position={[-3, -2, -2]} intensity={1} color="#16a34a" />
      <pointLight position={[0, 0, 4]} intensity={0.8} color="#84cc16" />

      <CoreOrb />
      <OrbParticles count={150} />
      <EnergyRing radius={1.3} tilt={0.5} speed={0.6} color="#22c55e" />
      <EnergyRing radius={1.6} tilt={-0.8} speed={-0.4} color="#84cc16" />
      <OrbitingSphere orbitRadius={1.5} speed={0.8} phase={0}           size={0.12} color="#22c55e" />
      <OrbitingSphere orbitRadius={1.7} speed={-0.5} phase={Math.PI}   size={0.09} color="#f59e0b" />
      <OrbitingSphere orbitRadius={1.4} speed={1.1} phase={Math.PI/2}  size={0.07} color="#84cc16" />
      <OrbitingSphere orbitRadius={1.9} speed={0.6} phase={Math.PI*1.5} size={0.1} color="#0ea5e9" />
    </>
  );
}

/**
 * CropOrb — A pulsing green energy orb with orbiting spheres
 * and energy rings. Used on the Dashboard.
 */
export default function CropOrb({ className = '', style = {} }) {
  return (
    <ThreeCanvas
      className={className}
      style={style}
      camera={{ position: [0, 0, 4.5], fov: 50 }}
      frameloop="always"
      dpr={[1, 2]}
    >
      <CropOrbScene />
    </ThreeCanvas>
  );
}
