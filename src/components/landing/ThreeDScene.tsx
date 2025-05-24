
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Rotating cube component
const AnimatedCube = ({ position = [0, 0, 0], color = '#0077ff' }) => {
  const cubeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!cubeRef.current) return;
    cubeRef.current.rotation.x += delta * 0.2;
    cubeRef.current.rotation.y += delta * 0.3;
  });
  
  return (
    <mesh ref={cubeRef} position={position as [number, number, number]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Floating text that represents data analytics
const DataVisualization = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.001;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });
  
  return (
    <group ref={groupRef}>
      <AnimatedCube position={[-2, 0, 0]} color="#4285F4" />
      <AnimatedCube position={[0, 0, 0]} color="#34A853" />
      <AnimatedCube position={[2, 0, 0]} color="#EA4335" />
      
      {/* Lines connecting the data points */}
      <mesh position={[0, 0, 0]}>
        {/* Fixed the cylinder geometry by moving rotation to the mesh */}
        <cylinderGeometry args={[0.05, 0.05, 4, 16]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

// Main component
const ThreeDScene: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${className} w-full h-full`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={500} factor={4} fade speed={1} />
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
