
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Simple animated cube component with proper typing
const AnimatedCube: React.FC<{
  position?: [number, number, number];
  color?: string;
}> = ({ position = [0, 0, 0], color = '#0077ff' }) => {
  // Using a simpler approach without refs to avoid type issues
  return (
    <mesh position={position} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Simplified data visualization without complex animations that might cause issues
const DataVisualization: React.FC = () => {
  return (
    <group>
      <AnimatedCube position={[-2, 0, 0]} color="#4285F4" />
      <AnimatedCube position={[0, 0, 0]} color="#34A853" />
      <AnimatedCube position={[2, 0, 0]} color="#EA4335" />
      
      {/* Simple line connecting cubes */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 16]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

// Simplified 3D scene with minimal features to reduce incompatibility risks
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
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDScene;
