import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

// Inner scene — particle system that reacts to mouse
function ParticleScene({ count = 2800, color = '#22c55e', secondaryColor = '#84cc16' }) {
  const meshRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  // Build geometry with random positions & velocities
  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);
    const c3 = new THREE.Color('#f59e0b'); // accent golden

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 30;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = (Math.random() - 0.5) * 15;

      vel[i3]     = (Math.random() - 0.5) * 0.008;
      vel[i3 + 1] = Math.random() * 0.012 + 0.002; // drift upward
      vel[i3 + 2] = (Math.random() - 0.5) * 0.005;

      // Mix 3 colors
      const t = Math.random();
      let c;
      if (t < 0.6) c = c1;
      else if (t < 0.85) c = c2;
      else c = c3;

      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, vel, col];
  }, [count, color, secondaryColor]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  // Track mouse globally
  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  // Attach mouse listener
  useMemo(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const arr = posAttr.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3]     += velocities[i3]     + mouseRef.current.x * 0.002;
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];

      // Wrap particles back when they drift too far
      if (arr[i3 + 1] > 12) {
        arr[i3 + 1] = -12;
        arr[i3] = (Math.random() - 0.5) * 30;
      }
      if (Math.abs(arr[i3]) > 16) arr[i3] *= -0.95;
    }
    posAttr.needsUpdate = true;

    // Subtle overall rotation parallax with mouse
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mouseRef.current.x * 0.1,
      0.05
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouseRef.current.y * 0.08,
      0.05
    );
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * ParticleField — floating agricultural grain/seed particles
 * with mouse-parallax interaction. Used as hero background.
 */
export default function ParticleField({
  className = '',
  style = {},
  count = 2800,
  color = '#22c55e',
  secondaryColor = '#84cc16',
}) {
  return (
    <ThreeCanvas
      className={className}
      style={style}
      camera={{ position: [0, 0, 8], fov: 75 }}
      frameloop="always"
      dpr={[1, 1.5]}
    >
      <ParticleScene count={count} color={color} secondaryColor={secondaryColor} />
    </ThreeCanvas>
  );
}
