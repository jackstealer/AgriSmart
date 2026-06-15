import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

// Data node that pulses on the sphere surface
function DataNode({ position, color, delay = 0 }) {
  const ref = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    if (ref.current) {
      ref.current.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.6;
      ref.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.2);
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.5);
      ringRef.current.material.opacity = 0.6 - Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.08, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Node dot */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// Animated connection lines between nodes (wireframe-style arcs)
function DataConnections({ nodes, color = '#22c55e' }) {
  const linesRef = useRef();

  const geometry = useMemo(() => {
    const positions = [];
    // Draw lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = new THREE.Vector3(...nodes[i]);
        const b = new THREE.Vector3(...nodes[j]);
        if (a.distanceTo(b) < 1.2) {
          positions.push(...nodes[i], ...nodes[j]);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </lineSegments>
  );
}

// Main wireframe data sphere
function WireframeSphere() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.rotation.x = state.clock.elapsedTime * 0.12;
    }
  });

  // Distribute nodes on sphere surface using Fibonacci lattice
  const nodes = useMemo(() => {
    const count = 32;
    const arr = [];
    const r = 1.5;
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y) * r;
      const theta = phi * i;
      arr.push([
        Math.cos(theta) * radius,
        y * r,
        Math.sin(theta) * radius,
      ]);
    }
    return arr;
  }, []);

  const nodeColors = ['#22c55e', '#84cc16', '#0ea5e9', '#f59e0b'];

  return (
    <group ref={ref}>
      {/* Outer wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          wireframe
          transparent
          opacity={0.15}
          emissive="#22c55e"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner solid sphere with low opacity */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#16a34a"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Data nodes */}
      {nodes.map((pos, i) => (
        <DataNode
          key={i}
          position={pos}
          color={nodeColors[i % nodeColors.length]}
          delay={i * 0.15}
        />
      ))}

      {/* Connection lines */}
      <DataConnections nodes={nodes} color="#22c55e" />
    </group>
  );
}

// Orbiting ring around the sphere
function DataRing({ radius = 2, tilt = 0.3, speed = 0.4, color = '#22c55e' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * speed;
  });
  return (
    <group rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.01, 6, 80]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

function DataSphereScene() {
  return (
    <>
      <ambientLight intensity={0.2} color="#dcfce7" />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#22c55e" />
      <pointLight position={[-3, -3, -3]} intensity={0.8} color="#16a34a" />

      <WireframeSphere />
      <DataRing radius={2.0} tilt={0.4} speed={0.3} color="#22c55e" />
      <DataRing radius={2.2} tilt={-0.5} speed={-0.2} color="#84cc16" />
    </>
  );
}

/**
 * DataSphere — A wireframe data network sphere with animated pulsing nodes,
 * connection lines, and orbital data rings. Used in Dashboard market area.
 */
export default function DataSphere({ className = '', style = {} }) {
  return (
    <ThreeCanvas
      className={className}
      style={style}
      camera={{ position: [0, 0, 4.5], fov: 55 }}
      frameloop="always"
      dpr={[1, 1.5]}
    >
      <DataSphereScene />
    </ThreeCanvas>
  );
}
