
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, useTexture } from "@react-three/drei";
import { useLanguage } from "@/contexts/LanguageContext";
import jordanMap from "@/assets/jordan-map.png";
import * as THREE from "three";

// TypeScript interface for the component props
interface SentimentBarProps {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  labelPosition: [number, number, number];
}

interface ThreeDSceneProps {
  sentimentData: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// 3D Bar component
const SentimentBar = ({ position, height, color, label, labelPosition }: SentimentBarProps) => {
  // Using THREE.Mesh type to match the expected type from @react-three/fiber
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      if (clicked) {
        meshRef.current.scale.y = Math.min(meshRef.current.scale.y + 0.01, height * 1.2);
      } else if (hovered) {
        meshRef.current.scale.y = Math.min(meshRef.current.scale.y + 0.01, height * 1.1);
      } else {
        meshRef.current.scale.y = Math.max(height, meshRef.current.scale.y - 0.01);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        scale={[1, height, 1]}
        onClick={() => setClick(!clicked)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : color} 
          emissive={color} 
          emissiveIntensity={hovered ? 0.5 : 0.2} 
        />
      </mesh>
      <Text 
        position={labelPosition} 
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Rotating Jordan Map component
const JordanMap = () => {
  // Using THREE.Mesh type to match the expected type from @react-three/fiber
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(jordanMap);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 4, -5]}>
      <planeGeometry args={[6, 4]} />
      <meshBasicMaterial map={texture} transparent opacity={0.7} />
    </mesh>
  );
};

// Main 3D Scene
const ThreeDScene = ({ sentimentData }: ThreeDSceneProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Sentiment Analysis Bars */}
      <SentimentBar 
        position={[-2.5, 0, 0]} 
        height={sentimentData.positive / 20} 
        color="#10b981" 
        label={t("إيجابي")}
        labelPosition={[0, -0.5, 0]}
      />
      <SentimentBar 
        position={[0, 0, 0]} 
        height={sentimentData.neutral / 20} 
        color="#a1a1aa" 
        label={t("محايد")}
        labelPosition={[0, -0.5, 0]}
      />
      <SentimentBar 
        position={[2.5, 0, 0]} 
        height={sentimentData.negative / 20} 
        color="#ef4444" 
        label={t("سلبي")}
        labelPosition={[0, -0.5, 0]}
      />
      
      {/* Rotating Jordan Map */}
      <JordanMap />
      
      <OrbitControls 
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
      />
    </>
  );
};

// Main component export
interface ThreeDInsightViewProps {
  sentimentData?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const ThreeDInsightView = ({ sentimentData = { positive: 42, neutral: 35, negative: 23 } }: ThreeDInsightViewProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="w-full h-[350px] rounded-lg overflow-hidden border border-border">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ThreeDScene sentimentData={sentimentData} />
      </Canvas>
      <div className="absolute bottom-2 left-2 bg-black/40 text-white px-2 py-1 text-xs rounded">
        JordanInsight 3D - اسحب للتدوير - حرّك العجلة للتكبير
      </div>
    </div>
  );
};

export default ThreeDInsightView;
