
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// Simple cube component without OrbitControls to avoid compatibility issues
const Cube: React.FC<{
  position?: [number, number, number];
  color?: string;
  size?: number;
}> = ({ position = [0, 0, 0], color = '#0077ff', size = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh position={position} ref={meshRef}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Simplified visualization without OrbitControls
const DataVisualization: React.FC = () => {
  return (
    <group>
      <Cube position={[-2, 0, 0]} color="#4285F4" />
      <Cube position={[0, 0, 0]} color="#34A853" />
      <Cube position={[2, 0, 0]} color="#EA4335" />
    </group>
  );
};

// Simplified 3D scene without OrbitControls
const ThreeDScene: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${className} w-full h-full`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <DataVisualization />
      </Canvas>
    </div>
  );
};

export default ThreeDScene;
