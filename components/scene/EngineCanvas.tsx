"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { Engine } from "@/components/scene/Engine";
import { useEngineStore } from "@/lib/store";

function Scene() {
  const autoRotate = useEngineStore((state) => state.autoRotate);
  const resetViewKey = useEngineStore((state) => state.resetViewKey);

  return (
    <>
      <color attach="background" args={["#eeeae1"]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#fffaf0", "#66706c", 1.5]} />
      <directionalLight
        castShadow
        position={[6, 9, 7]}
        intensity={2.4}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-5, 6, 4]}
        intensity={1.8}
        angle={0.5}
        color="#d9ece6"
      />
      <pointLight position={[1, 2, -5]} intensity={1.4} color="#d8b8a4" />

      <group
        position={[0.75, -0.25, 0]}
        rotation={[0, -0.22, 0]}
        scale={0.85}
      >
        <Engine />
      </group>

      <mesh
        position={[0.5, -2.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[2.7, 1.2, 1]}
      >
        <circleGeometry args={[1.25, 64]} />
        <meshBasicMaterial
          color="#4d514f"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -2.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshBasicMaterial color="#eeeae1" />
      </mesh>

      <OrbitControls
        key={resetViewKey}
        makeDefault
        target={[0.45, 0.05, 0]}
        minDistance={8}
        maxDistance={30}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI / 2.05}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.65}
      />
    </>
  );
}

export function EngineCanvas() {
  const selectPart = useEngineStore((state) => state.selectPart);

  return (
    <Canvas
      aria-label="Interactive three-dimensional inline-four engine model"
      className="touch-none"
      camera={{ position: [9, 5.3, 11.5], fov: 37, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onPointerMissed={() => selectPart(null)}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
