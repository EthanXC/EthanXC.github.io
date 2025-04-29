import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points, Color } from 'three';
import { OrbitControls, Html } from '@react-three/drei';

const Galaxy: React.FC = () => {
  const galaxyRef = useRef<Points>(null);
  const centralBarRef = useRef<Points>(null);
  const coreRef = useRef<Points>(null);
  const texture = useLoader(TextureLoader, 'https://threejs.org/examples/textures/sprites/disc.png');

  // Main spiral disk parameters
  const armParticlesCount = 25000;
  const armPositions: number[] = [];
  const armColors: number[] = [];

  // Central bar parameters
  const barParticlesCount = 8000;
  const barPositions: number[] = [];
  const barColors: number[] = [];
  
  // Core parameters
  const coreParticlesCount = 5000;
  const corePositions: number[] = [];
  const coreColors: number[] = [];

  // Galaxy structure constants
  const arms = 4;
  const spiralStrength = 1.8; // Slightly stronger to make arms more visible
  const diskRadius = 5;
  const barLength = 2.5; // Central bar length
  const barWidth = 0.6;  // Central bar width
  const coreRadius = 0.7;

  // Create spiral arms - more accurate Milky Way
  for (let i = 0; i < armParticlesCount; i++) {
    // Use power distribution to concentrate stars toward center
    const radius = Math.pow(Math.random(), 0.5) * diskRadius;
    
    // Determine which arm this star belongs to
    const branch = i % arms;
    const baseAngle = (branch / arms) * Math.PI * 2;
    
    // Create spiral by adding angle based on distance from center
    const angleOffset = radius * spiralStrength;
    
    // Add randomness to create natural arm width
    // Higher randomness in outer regions (0.5 to 0.8)
    const randomFactor = 0.2 + (radius / diskRadius) * 0.6;
    const angle = baseAngle + angleOffset + (Math.random() - 0.5) * randomFactor;

    const x = Math.cos(angle) * radius;
    
    // Make galaxy thinner at edges (more accurate)
    const verticalSpread = 0.12 * Math.pow(1 - radius/diskRadius, 1.5) + 0.02;
    const y = (Math.random() - 0.5) * verticalSpread;
    
    const z = Math.sin(angle) * radius;

    armPositions.push(x, y, z);

    // Color distribution based on real galactic observations
    let starColor;
    
    if (radius < 1.2) {
      // Yellowish towards central regions
      starColor = new Color(1, 0.9, 0.7);
    } else if (radius < 3) {
      // Blue-white young stars in spiral arms
      if (Math.random() < 0.7) {
        // Most stars are white-blue
        const blueVariation = 0.8 + Math.random() * 0.2;
        starColor = new Color(0.9, 0.9, blueVariation);
      } else {
        // Some stars are more yellow
        starColor = new Color(1, 0.9, 0.7);
      }
    } else {
      // Outer regions have more red giants and dust
      starColor = new Color(
        1, 
        0.6 + Math.random() * 0.3, 
        0.4 + Math.random() * 0.3
      );
    }
    
    // Add occasional bright blue stars in arms (young, hot O-type stars)
    if (Math.random() < 0.01 && radius > 1.2) {
      starColor = new Color(0.7, 0.8, 1);
    }
    
    armColors.push(starColor.r, starColor.g, starColor.b);
  }
  
  // Create central bar (key feature of Milky Way's SBc classification)
  for (let i = 0; i < barParticlesCount; i++) {
    // Bar is elongated in x-axis
    const x = (Math.random() - 0.5) * barLength * 2;
    
    // Bar is thin in y-axis (height)
    const y = (Math.random() - 0.5) * 0.2;
    
    // Bar has moderate width in z-axis
    const z = (Math.random() - 0.5) * barWidth;
    
    // Taper the bar at ends (avoid rectangular appearance)
    const distFromCenter = Math.abs(x) / barLength;
    const taperFactor = Math.pow(1 - distFromCenter, 1.2);
    
    const adjustedZ = z * taperFactor;
    const adjustedY = y * taperFactor;
    
    barPositions.push(x, adjustedY, adjustedZ);
    
    // Bar has golden/yellowish color (older stars)
    const r = 1;
    const g = 0.8 + Math.random() * 0.1;
    const b = 0.5 + Math.random() * 0.2;
    
    barColors.push(r, g, b);
  }
  
  // Create dense galactic core/bulge with central black hole
  for (let i = 0; i < coreParticlesCount; i++) {
    // Spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    // More concentrated toward center
    const radius = Math.pow(Math.random(), 0.3) * coreRadius;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // Flattened
    const z = radius * Math.cos(phi);
    
    corePositions.push(x, y, z);
    
    // Bright yellow-white color (dense star region)
    const r = 1;
    const g = 0.9 + Math.random() * 0.1;
    const b = 0.7 + Math.random() * 0.2;
    
    coreColors.push(r, g, b);
  }

  // Create geometries
  const armGeometry = new BufferGeometry();
  armGeometry.setAttribute('position', new Float32BufferAttribute(armPositions, 3));
  armGeometry.setAttribute('color', new Float32BufferAttribute(armColors, 3));
  
  const barGeometry = new BufferGeometry();
  barGeometry.setAttribute('position', new Float32BufferAttribute(barPositions, 3));
  barGeometry.setAttribute('color', new Float32BufferAttribute(barColors, 3));
  
  const coreGeometry = new BufferGeometry();
  coreGeometry.setAttribute('position', new Float32BufferAttribute(corePositions, 3));
  coreGeometry.setAttribute('color', new Float32BufferAttribute(coreColors, 3));

  // Slow rotation animation
  useFrame(() => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0002;
    }
    if (centralBarRef.current) {
      centralBarRef.current.rotation.y += 0.0002;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group>
      {/* Spiral arms */}
      <points ref={galaxyRef} geometry={armGeometry}>
        <pointsMaterial
          size={0.02}
          map={texture}
          vertexColors
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </points>
      
      {/* Central bar - key feature of barred spiral galaxies */}
      <points ref={centralBarRef} geometry={barGeometry}>
        <pointsMaterial
          size={0.025}
          map={texture}
          vertexColors
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </points>
      
      {/* Dense core */}
      <points ref={coreRef} geometry={coreGeometry}>
        <pointsMaterial
          size={0.03}
          map={texture}
          vertexColors
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </points>
      
    </group>
  );
};

const MilkyWayGalaxy: React.FC = () => (
  <Canvas camera={{ position: [0, 4, 12], fov: 60 }}>
    <Suspense fallback={null}>
      <Galaxy />
      <OrbitControls enableZoom={true} enablePan={true} />
    </Suspense>
    <color attach="background" args={['#000']} />
  </Canvas>
);

export default MilkyWayGalaxy;