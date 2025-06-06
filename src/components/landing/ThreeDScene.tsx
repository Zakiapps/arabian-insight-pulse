
import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// Simple cube component with proper type annotations
const Cube: React.FC<{
  position?: [number, number, number];
  color?: string;
  size?: number;
}> = ({ position = [0, 0, 0], color = '#0077ff', size = 1 }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Simplified visualization
const DataVisualization: React.FC = () => {
  // Define fixed positions with the correct type [number, number, number]
  const position1: [number, number, number] = [-2, 0, 0];
  const position2: [number, number, number] = [0, 0, 0];
  const position3: [number, number, number] = [2, 0, 0];
  
  return (
    <group>
      <Cube position={position1} color="#4285F4" />
      <Cube position={position2} color="#34A853" />
      <Cube position={position3} color="#EA4335" />
    </group>
  );
};

// Performance optimized 3D scene
const ThreeDScene: React.FC<{ className?: string }> = ({ className }) => {
  // Specify the exact type for the pointLight position
  const lightPosition: [number, number, number] = [10, 10, 10];
  
  return (
    <div className={`${className} w-full h-full`}>
      <Canvas
        camera={{ position: [0, 0, 6] as [number, number, number], fov: 50 }}
        style={{ background: 'transparent' }}
        frameloop="demand" // Render only when needed for better performance
        dpr={[1, 2]} // Limit pixel ratio for better performance
      >
        <ambientLight intensity={0.5} />
        <pointLight position={lightPosition} intensity={1} />
        <DataVisualization />
      </Canvas>
    </div>
  );
};

export default ThreeDScene;
