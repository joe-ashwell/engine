"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import manifest from "@/lib/generated/inline-four-manifest.json";
import { useEngineStore } from "@/lib/store";

export function CombustionEffects() {
  const gasRefs = useRef<THREE.Mesh[]>([]);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const sparkRefs = useRef<THREE.Mesh[]>([]);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame(() => {
    const angle = useEngineStore.getState().angle;

    manifest.cylinderX.forEach((_, cylinder) => {
      const gas = gasRefs.current[cylinder];
      const ring = ringRefs.current[cylinder];
      const spark = sparkRefs.current[cylinder];
      if (!gas || !ring || !spark) return;

      const localAngle =
        (angle + manifest.firingOffsets[cylinder]) % 720;
      const powerProgress = (localAngle - 360) / 180;
      const active = powerProgress >= 0 && powerProgress < 0.72;
      const sparkActive = localAngle >= 358 && localAngle < 372;
      const theta = THREE.MathUtils.degToRad(
        angle + manifest.crankPhases[cylinder],
      );
      const pinZ = manifest.dimensions.crankRadius * Math.sin(theta);
      const pinY =
        manifest.dimensions.crankY +
        manifest.dimensions.crankRadius * Math.cos(theta);
      const pistonY =
        pinY +
        Math.sqrt(
          manifest.dimensions.rodLength ** 2 - pinZ ** 2,
        );
      const pistonTop =
        pistonY + manifest.dimensions.pistonHeight / 2;
      const chamberHeight = Math.max(
        0.08,
        manifest.dimensions.deckY - pistonTop,
      );
      const fade = active ? Math.sin((powerProgress / 0.72) * Math.PI) : 0;

      gas.visible = active;
      gas.position.y = pistonTop + chamberHeight / 2;
      gas.scale.set(0.48, chamberHeight * 0.52, 0.48);
      (gas.material as THREE.MeshBasicMaterial).opacity =
        0.18 + fade * 0.36;

      ring.visible = active && !reducedMotion;
      ring.position.y = pistonTop + chamberHeight * 0.58;
      ring.scale.setScalar(0.35 + powerProgress * 0.85);
      (ring.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.55 - powerProgress * 0.7);

      spark.visible = sparkActive;
      spark.scale.setScalar(
        sparkActive ? 0.7 + Math.sin(localAngle * 2) * 0.18 : 0.001,
      );
    });
  });

  return (
    <group>
      {manifest.cylinderX.map((x, cylinder) => (
        <group key={`combustion-${x}`} position-x={x}>
          <mesh
            ref={(node) => {
              if (node) gasRefs.current[cylinder] = node;
            }}
            visible={false}
          >
            <sphereGeometry args={[1, 20, 12]} />
            <meshBasicMaterial
              color="#e78932"
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh
            ref={(node) => {
              if (node) ringRefs.current[cylinder] = node;
            }}
            rotation={[Math.PI / 2, 0, 0]}
            visible={false}
          >
            <torusGeometry args={[0.42, 0.025, 8, 32]} />
            <meshBasicMaterial
              color="#ffd079"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh
            ref={(node) => {
              if (node) sparkRefs.current[cylinder] = node;
            }}
            position={[0, 2.03, 0]}
            visible={false}
          >
            <octahedronGeometry args={[0.11, 0]} />
            <meshBasicMaterial
              color="#fff3a6"
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
