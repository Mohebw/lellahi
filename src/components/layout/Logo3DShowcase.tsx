"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";

// Same pixel coordinates as the Lellahi "L" logo (see HeroVisual.tsx),
// now extruded into a rotatable 3D block sculpture.
const DOTS: [number, number][] = [
  [40, 10], [70, 10],
  [10, 30],
  [40, 40], [70, 40],
  [40, 70], [70, 70],
  [62, 90],
  [40, 100], [70, 100], [100, 100], [130, 100], [160, 100],
  [40, 130], [70, 130], [100, 130], [130, 130], [160, 130],
  [190, 130],
  [18, 145],
  [172, 190]
];

const CENTER_X = 100;
const CENTER_Y = 100;
const SCALE = 12;
const CUBE_SIZE = 0.85;

function LogoBlocks() {
  const group = useRef<THREE.Group>(null);

  const positions = useMemo(
    () =>
      DOTS.map(([x, y], i) => ({
        pos: [(x - CENTER_X) / SCALE, -(y - CENTER_Y) / SCALE, 0] as [number, number, number],
        delay: i * 0.08
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    // Gentle idle bob so it never feels static, on top of user-driven rotation
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
  });

  return (
    <group ref={group}>
      {positions.map(({ pos }, i) => (
        <RoundedBox key={i} args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} radius={0.12} smoothness={4} position={pos}>
          <meshPhysicalMaterial
            color="#FCCF04"
            metalness={0.35}
            roughness={0.25}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            emissive="#7a5c00"
            emissiveIntensity={0.15}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

export function Logo3DShowcase() {
  return (
    <div className="relative aspect-square w-full max-w-md mx-auto touch-none">
      <Canvas
        camera={{ position: [6, 4, 10], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1.4} color="#ffffff" />
          <pointLight position={[-6, -3, -4]} intensity={0.6} color="#fccf04" />
          <LogoBlocks />
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.1}
            dampingFactor={0.08}
            rotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-mustard-400/10 blur-3xl" />
    </div>
  );
}
