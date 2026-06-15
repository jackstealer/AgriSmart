import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

// Inner octahedron crystal
function Crystal({ color = '#22c55e', accentColor = '#84cc16' }) {
  const crystalRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.rotation.x = t * 0.4;
      crystalRef.current.rotation.y = t * 0.6;
      crystalRef.current.rotation.z = t * 0.25;
      // Levitating animation
      crystalRef.current.position.y = Math.sin(t * 1.2) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.6;
      innerRef.current.rotation.y = -t * 0.4;
      innerRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={crystalRef}>
      {/* Outer glass crystal */}
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.05}
          metalness={0.9}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={innerRef} scale={0.55}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.2}
          roughness={0.0}
          metalness={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer soft glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Floating wireframe dodecahedron debris
function WireDebris({ count = 6 }) {
  const refs = useRef([]);

  const items = Array.from({ length: count }, (_, i) => ({
    pos: [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 3,
    ],
    speed: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    size: 0.08 + Math.random() * 0.12,
    color: Math.random() > 0.5 ? '#22c55e' : '#84cc16',
  }));

  useFrame((state) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const item = items[i];
      mesh.rotation.x += item.speed * 0.02;
      mesh.rotation.y += item.speed * 0.03;
      mesh.position.y = item.pos[1] + Math.sin(state.clock.elapsedTime * item.speed + item.phase) * 0.3;
      mesh.position.x = item.pos[0] + Math.cos(state.clock.elapsedTime * item.speed * 0.5 + item.phase) * 0.15;
    });
  });

  return (
    <>
      {items.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={item.pos}
        >
          <octahedronGeometry args={[item.size, 0]} />
          <meshStandardMaterial
            color={item.color}
            emissive={item.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
            wireframe={Math.random() > 0.5}
          />
        </mesh>
      ))}
    </>
  );
}

function FloatingCrystalScene({ color, accentColor }) {
  return (
    <>
      <ambientLight intensity={0.2} color="#dcfce7" />
      <pointLight position={[4, 4, 4]} intensity={2} color="#22c55e" />
      <pointLight position={[-4, -3, -2]} intensity={1} color="#84cc16" />
      <pointLight position={[0, -4, 3]} intensity={0.8} color="#f59e0b" />

      <Crystal color={color} accentColor={accentColor} />
      <WireDebris count={8} />
    </>
  );
}

/**
 * FloatingCrystal — A hovering octahedron crystal with glass material
 * and floating debris shards. Used in the "How It Works" section.
 */
export default function FloatingCrystal({
  className = '',
  style = {},
  color = '#22c55e',
  accentColor = '#84cc16',
}) {
  return (
    <ThreeCanvas
      className={className}
      style={style}
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      frameloop="always"
      dpr={[1, 2]}
    >
      <FloatingCrystalScene color={color} accentColor={accentColor} />
    </ThreeCanvas>
  );
}
