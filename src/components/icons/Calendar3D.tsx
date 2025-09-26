import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface Calendar3DProps {
  className?: string;
}

function CalendarMesh() {
  const meshRef = useRef<Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Calendar base */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.2, 0.1, 1]} />
        <meshPhongMaterial color="#3b82f6" />
      </mesh>
      
      {/* Calendar body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.2, 0.05]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>
      
      {/* Calendar grid lines */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`h-${i}`} position={[0, 0.4 - i * 0.2, 0.03]}>
          <boxGeometry args={[0.8, 0.01, 0.01]} />
          <meshPhongMaterial color="#e5e7eb" />
        </mesh>
      ))}
      
      {[...Array(7)].map((_, i) => (
        <mesh key={`v-${i}`} position={[-0.3 + i * 0.1, 0, 0.03]}>
          <boxGeometry args={[0.01, 1, 0.01]} />
          <meshPhongMaterial color="#e5e7eb" />
        </mesh>
      ))}
      
      {/* Calendar ring holes */}
      <mesh position={[-0.3, 0.7, 0.03]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05]} />
        <meshPhongMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0.3, 0.7, 0.03]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05]} />
        <meshPhongMaterial color="#6b7280" />
      </mesh>
      
      {/* Highlighted date */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshPhongMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}

export const Calendar3D = ({ className }: Calendar3DProps) => {
  return (
    <div className={className} style={{ width: '24px', height: '24px' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 1]} intensity={0.8} />
        <CalendarMesh />
      </Canvas>
    </div>
  );
};