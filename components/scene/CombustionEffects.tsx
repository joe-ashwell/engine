"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import manifest from "@/lib/generated/inline-four-manifest.json";
import { useEngineStore } from "@/lib/store";

export function CombustionEffects() {
  const gasRefs = useRef<THREE.Mesh[]>([]);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const sparkRefs = useRef<THREE.Mesh[]>([]);
  const lightRefs = useRef<THREE.PointLight[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame(() => {
    const angle = useEngineStore.getState().angle;

    manifest.cylinderX.forEach((_, cylinder) => {
      const gas = gasRefs.current[cylinder];
      const ring = ringRefs.current[cylinder];
      const spark = sparkRefs.current[cylinder];
      const light = lightRefs.current[cylinder];
      const label = labelRefs.current[cylinder];
      if (!gas || !ring || !spark || !light || !label) return;

      const localAngle =
        (angle + manifest.firingOffsets[cylinder]) % 720;
      const powerProgress = (localAngle - 360) / 180;
      const active = powerProgress >= 0 && powerProgress < 0.82;
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
      const fade = active ? Math.sin((powerProgress / 0.82) * Math.PI) : 0;

      gas.visible = active;
      gas.position.y = pistonTop + chamberHeight / 2;
      gas.scale.set(0.54, chamberHeight * 0.54, 0.54);
      (gas.material as THREE.MeshBasicMaterial).opacity =
        0.35 + fade * 0.5;

      ring.visible = active && !reducedMotion;
      ring.position.y = pistonTop + chamberHeight * 0.58;
      ring.scale.setScalar(0.42 + powerProgress * 1.1);
      (ring.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.85 - powerProgress * 0.9);

      spark.visible = sparkActive;
      spark.scale.setScalar(
        sparkActive ? 0.7 + Math.sin(localAngle * 2) * 0.18 : 0.001,
      );
      light.intensity = active && !reducedMotion ? fade * 4.5 : 0;
      label.style.opacity = active && powerProgress < 0.55 ? "1" : "0";
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
            <torusGeometry args={[0.42, 0.045, 8, 32]} />
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
            <octahedronGeometry args={[0.14, 0]} />
            <meshBasicMaterial
              color="#fff3a6"
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight
            ref={(node) => {
              if (node) lightRefs.current[cylinder] = node;
            }}
            position={[0, 2.02, 0]}
            color="#f5a340"
            intensity={0}
            distance={2.6}
            decay={2}
          />
          <Html
            position={[0, 2.86, 0]}
            center
            distanceFactor={9}
            style={{ pointerEvents: "none" }}
          >
            <span
              ref={(node) => {
                if (node) labelRefs.current[cylinder] = node;
              }}
              className="block whitespace-nowrap rounded-full border border-[#a54d27] bg-[#fff4df]/95 px-2.5 py-1 font-mono text-[0.58rem] font-bold tracking-[0.12em] text-[#913b1d] opacity-0 shadow-lg transition-opacity duration-150"
            >
              FIRING · CYL {cylinder + 1}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}
