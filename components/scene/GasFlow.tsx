"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { valveMotion } from "@/lib/engine-motion";
import manifest from "@/lib/generated/inline-four-manifest.json";
import { getPlayhead, useEngineStore } from "@/lib/store";

const PARTICLE_COUNT = 12;

function FlowPath({
  cylinder,
  intake,
}: {
  cylinder: number;
  intake: boolean;
}) {
  const x = manifest.cylinderX[cylinder];
  const z = intake ? 1 : -1;
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        intake
          ? [
              new THREE.Vector3(x, 2.4, 1.75),
              new THREE.Vector3(x, 2.38, 1.15),
              new THREE.Vector3(x, 2.2, 0.62),
              new THREE.Vector3(x, 2.02, 0.18),
              new THREE.Vector3(x, 1.86, 0),
            ]
          : [
              new THREE.Vector3(x, 1.86, 0),
              new THREE.Vector3(x, 2.02, -0.18),
              new THREE.Vector3(x, 2.2, -0.62),
              new THREE.Vector3(x, 2.38, -1.15),
              new THREE.Vector3(x, 2.4, -1.75),
            ],
      ),
    [intake, x],
  );
  const particles = useRef<THREE.InstancedMesh>(null);
  const pathMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const valveGlow = useRef<THREE.Mesh>(null);
  const statusLabel = useRef<HTMLSpanElement>(null);
  const particlesWereActive = useRef(false);
  const marker = useMemo(() => new THREE.Object3D(), []);
  const colour = intake ? "#55b8ae" : "#d47751";

  useFrame(() => {
    const angle = getPlayhead();
    const localAngle =
      (angle + manifest.firingOffsets[cylinder]) % 720;
    const lift = valveMotion(
      localAngle,
      intake,
      manifest.dimensions.valveLift,
    );
    const active = lift > 0.01;
    const progress = intake
      ? localAngle / 180
      : (localAngle - 540) / 180;

    if (pathMaterial.current) {
      pathMaterial.current.opacity = active ? 1 : 0.06;
      pathMaterial.current.emissiveIntensity = active ? 2.4 : 0.04;
    }
    if (valveGlow.current) {
      valveGlow.current.visible = active;
      valveGlow.current.scale.setScalar(0.18 + lift * 0.5);
    }
    if (intake && statusLabel.current) {
      const showLabels = useEngineStore.getState().showLabels;
      statusLabel.current.style.opacity = active && showLabels ? "1" : "0";
    }
    if (!particles.current) return;
    if (!active) {
      if (particlesWereActive.current) {
        particles.current.visible = false;
        particlesWereActive.current = false;
      }
      return;
    }
    if (!particlesWereActive.current) {
      particles.current.visible = true;
      particlesWereActive.current = true;
    }

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const t = (progress + index / PARTICLE_COUNT) % 1;
      const point = curve.getPointAt(Math.max(0, t));
      marker.position.copy(point);
      marker.scale.setScalar(1);
      marker.updateMatrix();
      particles.current.setMatrixAt(index, marker.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh renderOrder={4}>
        <tubeGeometry args={[curve, 40, 0.038, 6, false]} />
        <meshStandardMaterial
          ref={pathMaterial}
          color={colour}
          emissive={colour}
          emissiveIntensity={0.08}
          transparent
          opacity={0.06}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <instancedMesh
        ref={particles}
        args={[undefined, undefined, PARTICLE_COUNT]}
        frustumCulled={false}
        visible={false}
      >
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshBasicMaterial color={colour} toneMapped={false} depthTest={false} />
      </instancedMesh>
      <mesh ref={valveGlow} position={[x, 2.02, z * 0.18]} visible={false}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial
          color={colour}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {intake && (
        <Html
          position={[x, 2.86, 0.72]}
          center
          distanceFactor={9}
          zIndexRange={[8, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            ref={statusLabel}
            className="block whitespace-nowrap rounded-full border border-[#347c75] bg-[#e9faf6]/95 px-2.5 py-1 font-mono text-[0.58rem] font-bold tracking-[0.12em] text-[#286b65] opacity-0 shadow-lg transition-opacity duration-150"
          >
            AIR IN · CYL {cylinder + 1}
          </span>
        </Html>
      )}
    </group>
  );
}

export function GasFlow() {
  const showLabels = useEngineStore((state) => state.showLabels);

  return (
    <group>
      {manifest.cylinderX.map((_, cylinder) => (
        <group key={`flow-${cylinder}`}>
          <FlowPath cylinder={cylinder} intake />
          <FlowPath cylinder={cylinder} intake={false} />
        </group>
      ))}
      {showLabels && (
        <>
          <Html
            position={[4.35, 2.4, 1.75]}
            center
            distanceFactor={9}
            zIndexRange={[8, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="flow-label flow-label--intake">IN</span>
          </Html>
          <Html
            position={[4.35, 2.4, -1.75]}
            center
            distanceFactor={9}
            zIndexRange={[8, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="flow-label flow-label--exhaust">OUT</span>
          </Html>
        </>
      )}
    </group>
  );
}
