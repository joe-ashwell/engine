"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { valveMotion } from "@/lib/engine-motion";
import manifest from "@/lib/generated/inline-four-manifest.json";
import { useEngineStore } from "@/lib/store";

const PARTICLE_COUNT = 7;

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
            ]
          : [
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
  const marker = useMemo(() => new THREE.Object3D(), []);
  const colour = intake ? "#55b8ae" : "#d47751";

  useFrame(() => {
    const angle = useEngineStore.getState().angle;
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
      pathMaterial.current.opacity = active ? 0.78 : 0.14;
      pathMaterial.current.emissiveIntensity = active ? 1.25 : 0.08;
    }
    if (valveGlow.current) {
      valveGlow.current.visible = active;
      valveGlow.current.scale.setScalar(0.12 + lift * 0.36);
    }
    if (!particles.current) return;

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const t = (progress + index / PARTICLE_COUNT) % 1;
      const point = curve.getPointAt(Math.max(0, t));
      marker.position.copy(point);
      marker.scale.setScalar(active ? 1 : 0.001);
      marker.updateMatrix();
      particles.current.setMatrixAt(index, marker.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.022, 6, false]} />
        <meshStandardMaterial
          ref={pathMaterial}
          color={colour}
          emissive={colour}
          emissiveIntensity={0.08}
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh
        ref={particles}
        args={[undefined, undefined, PARTICLE_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={colour} toneMapped={false} />
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
    </group>
  );
}

export function GasFlow() {
  return (
    <group>
      {manifest.cylinderX.map((_, cylinder) => (
        <group key={`flow-${cylinder}`}>
          <FlowPath cylinder={cylinder} intake />
          <FlowPath cylinder={cylinder} intake={false} />
        </group>
      ))}
      <Html
        position={[4.35, 2.4, 1.75]}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <span className="flow-label flow-label--intake">IN</span>
      </Html>
      <Html
        position={[4.35, 2.4, -1.75]}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <span className="flow-label flow-label--exhaust">OUT</span>
      </Html>
    </group>
  );
}
