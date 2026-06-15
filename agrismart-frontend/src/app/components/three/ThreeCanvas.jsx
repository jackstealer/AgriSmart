import { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';

// Error boundary to gracefully handle WebGL failures
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Smooth loading spinner shown while 3D assets load
function ThreeLoader() {
  return (
    <div className="three-loader">
      <div className="three-loader-orb" />
    </div>
  );
}

/**
 * ThreeCanvas — reusable wrapper for all Three.js scenes.
 * Handles: ErrorBoundary, Suspense, performance, shadows, and responsive sizing.
 */
export default function ThreeCanvas({
  children,
  className = '',
  style = {},
  camera = { position: [0, 0, 5], fov: 60 },
  gl = {},
  shadows = false,
  frameloop = 'always',
  fallback = null,
  dpr = [1, 2],
}) {
  return (
    <ThreeErrorBoundary fallback={fallback}>
      <div className={`three-canvas-wrapper ${className}`} style={style}>
        <Suspense fallback={<ThreeLoader />}>
          <Canvas
            camera={camera}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              ...gl,
            }}
            shadows={shadows}
            frameloop={frameloop}
            dpr={dpr}
            style={{ width: '100%', height: '100%' }}
          >
            {children}
          </Canvas>
        </Suspense>
      </div>
    </ThreeErrorBoundary>
  );
}
