import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points } from 'three';
import { OrbitControls } from '@react-three/drei';

const Galaxy: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  const texture = useLoader(TextureLoader, 'https://threejs.org/examples/textures/sprites/disc.png');

  const particlesCount = 20000;
  const positions: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < particlesCount; i++) {
    const radius = Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 0.2;

    positions.push(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    colors.push(radius / 5, radius / 5, 1);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        map={texture}
        vertexColors
        blending={AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

const AnimatedBackground: React.FC = () => (
  <Canvas camera={{ position: [0, 1, 10], fov: 50 }}>
    <Suspense fallback={null}>
      <Galaxy />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Suspense>
  </Canvas>
);

export default AnimatedBackground;
