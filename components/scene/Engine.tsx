"use client";

import { Outlines, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CombustionEffects } from "@/components/scene/CombustionEffects";
import { GasFlow } from "@/components/scene/GasFlow";
import { Hotspot } from "@/components/scene/Hotspot";
import { valveMotion } from "@/lib/engine-motion";
import type { PartId } from "@/lib/content/engine";
import manifest from "@/lib/generated/inline-four-manifest.json";
import {
  getPlayhead,
  setPlayhead,
  useEngineStore,
} from "@/lib/store";

type CadNodeName =
  | "BlockFull"
  | "BlockCutaway"
  | "HeadFull"
  | "HeadCutaway"
  | "SumpFull"
  | "SumpCutaway"
  | "LinersFull"
  | "LinersCutaway"
  | "IntakeManifold"
  | "ExhaustManifold"
  | "Piston"
  | "Rod"
  | "Crankshaft"
  | "Flywheel"
  | "IntakeValve"
  | "ExhaustValve"
  | "SparkPlug"
  | "IntakeCamshaft"
  | "ExhaustCamshaft"
  | "TimingGear";

type CadNodes = Record<CadNodeName, THREE.Mesh>;
type CadModel = { nodes: CadNodes };

const CAD_COLOURS: Record<CadNodeName, string> = {
  BlockFull: "#2d3a3b",
  BlockCutaway: "#344847",
  HeadFull: "#3d4848",
  HeadCutaway: "#455856",
  SumpFull: "#292f30",
  SumpCutaway: "#333c3d",
  LinersFull: "#848a88",
  LinersCutaway: "#949a97",
  IntakeManifold: "#46756e",
  ExhaustManifold: "#935239",
  Piston: "#c3c1ba",
  Rod: "#858887",
  Crankshaft: "#303435",
  Flywheel: "#292c2d",
  IntakeValve: "#53877e",
  ExhaustValve: "#a45a43",
  SparkPlug: "#ded7c7",
  IntakeCamshaft: "#3d5150",
  ExhaustCamshaft: "#514542",
  TimingGear: "#606464",
};

const UP = new THREE.Vector3(0, 1, 0);
const ROD_START = new THREE.Vector3();
const ROD_END = new THREE.Vector3();
const ROD_DIRECTION = new THREE.Vector3();
const ROD_MIDDLE = new THREE.Vector3();
const UI_SYNC_INTERVAL_SECONDS = 1 / 12;
const SHADOW_CASTERS = new Set<CadNodeName>([
  "BlockFull",
  "BlockCutaway",
  "HeadFull",
  "HeadCutaway",
  "SumpFull",
  "SumpCutaway",
  "Piston",
  "Rod",
  "Crankshaft",
  "Flywheel",
]);
const SHADOW_RECEIVERS = new Set<CadNodeName>([
  ...SHADOW_CASTERS,
  "LinersFull",
  "LinersCutaway",
  "IntakeManifold",
  "ExhaustManifold",
]);
const {
  crankRadius,
  rodLength,
  crankY,
  valveClosedY,
  valveLift,
} = manifest.dimensions;
const GHOST_COLOUR = new THREE.Color("#e6e2d9");
const SELECTED_COLOUR = new THREE.Color("#48675e");
const PART_NODES: Record<PartId, CadNodeName[]> = {
  piston: ["Piston"],
  "connecting-rod": ["Rod"],
  crankshaft: ["Crankshaft"],
  "crank-journal": ["Crankshaft"],
  counterweight: ["Crankshaft"],
  "cylinder-block": ["BlockFull", "BlockCutaway"],
  "cylinder-head": ["HeadFull", "HeadCutaway"],
  sump: ["SumpFull", "SumpCutaway"],
  liners: ["LinersFull", "LinersCutaway"],
  "timing-gear": ["TimingGear"],
  "intake-valve": ["IntakeValve"],
  "exhaust-valve": ["ExhaustValve"],
  "spark-plug": ["SparkPlug"],
  camshaft: ["IntakeCamshaft", "ExhaustCamshaft"],
  flywheel: ["Flywheel"],
  "intake-manifold": ["IntakeManifold"],
  "exhaust-manifold": ["ExhaustManifold"],
};
const MESH_PART: Partial<Record<CadNodeName, PartId>> = {
  BlockFull: "cylinder-block",
  BlockCutaway: "cylinder-block",
  HeadFull: "cylinder-head",
  HeadCutaway: "cylinder-head",
  SumpFull: "sump",
  SumpCutaway: "sump",
  LinersFull: "liners",
  LinersCutaway: "liners",
  IntakeManifold: "intake-manifold",
  ExhaustManifold: "exhaust-manifold",
  Piston: "piston",
  Rod: "connecting-rod",
  Crankshaft: "crankshaft",
  Flywheel: "flywheel",
  IntakeValve: "intake-valve",
  ExhaustValve: "exhaust-valve",
  SparkPlug: "spark-plug",
  IntakeCamshaft: "camshaft",
  ExhaustCamshaft: "camshaft",
  TimingGear: "timing-gear",
};

function dampPosition(
  group: THREE.Group | null,
  target: [number, number, number],
  delta: number,
) {
  if (!group) return;
  group.position.x = THREE.MathUtils.damp(
    group.position.x,
    target[0],
    9,
    delta,
  );
  group.position.y = THREE.MathUtils.damp(
    group.position.y,
    target[1],
    9,
    delta,
  );
  group.position.z = THREE.MathUtils.damp(
    group.position.z,
    target[2],
    9,
    delta,
  );
}

function CadMesh({
  nodes,
  name,
  visible = true,
}: {
  nodes: CadNodes;
  name: CadNodeName;
  visible?: boolean;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const node = nodes[name];
  const baseColour = useMemo(() => new THREE.Color(CAD_COLOURS[name]), [name]);
  const selectedPart = useEngineStore((state) => state.selectedPart);
  const isolatedNodes = selectedPart ? PART_NODES[selectedPart] : null;
  const isolated = !isolatedNodes || isolatedNodes.includes(name);
  const selected = selectedPart !== null && isolated;

  useFrame((_, rawDelta) => {
    if (!material.current) return;
    const delta = Math.min(rawDelta, 0.05);
    material.current.color.lerp(
      selected ? SELECTED_COLOUR : isolated ? baseColour : GHOST_COLOUR,
      1 - Math.exp(-12 * delta),
    );
    material.current.metalness = THREE.MathUtils.damp(
      material.current.metalness,
      isolated ? 0.62 : 0,
      12,
      delta,
    );
    material.current.roughness = THREE.MathUtils.damp(
      material.current.roughness,
      isolated ? 0.31 : 1,
      12,
      delta,
    );
  });

  if (!node) return null;
  const partId = MESH_PART[name];
  return (
    <mesh
      name={name}
      geometry={node.geometry}
      position={node.position}
      quaternion={node.quaternion}
      scale={node.scale}
      dispose={null}
      frustumCulled={false}
      visible={visible}
      castShadow={SHADOW_CASTERS.has(name)}
      receiveShadow={SHADOW_RECEIVERS.has(name)}
      onClick={(event) => {
        if (!partId || !visible) return;
        event.stopPropagation();
        useEngineStore.getState().selectPart(partId);
      }}
      onPointerOver={(event) => {
        if (!partId || !visible) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <meshStandardMaterial
        ref={material}
        color={CAD_COLOURS[name]}
        metalness={0.62}
        roughness={0.31}
        opacity={1}
      />
      {selected && (
        <Outlines
          color="#38544c"
          thickness={0.018}
          opacity={0.82}
          transparent
        />
      )}
    </mesh>
  );
}

export function Engine() {
  const { nodes } = useGLTF(manifest.model) as unknown as CadModel;
  const cutaway = useEngineStore((state) => state.cutaway);
  const exploded = useEngineStore((state) => state.exploded);
  const showCombustion = useEngineStore((state) => state.showCombustion);
  const showAirflow = useEngineStore((state) => state.showAirflow);
  const pistons = useRef<THREE.Group[]>([]);
  const rods = useRef<THREE.Group[]>([]);
  const intakeValves = useRef<THREE.Group[]>([]);
  const exhaustValves = useRef<THREE.Group[]>([]);
  const crankshaft = useRef<THREE.Group>(null);
  const flywheel = useRef<THREE.Group>(null);
  const intakeCam = useRef<THREE.Group>(null);
  const exhaustCam = useRef<THREE.Group>(null);
  const block = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const sump = useRef<THREE.Group>(null);
  const liners = useRef<THREE.Group>(null);
  const lastUiSync = useRef(0);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const state = useEngineStore.getState();
    let angle = getPlayhead();
    if (state.playing) {
      angle = (angle + delta * 90 * state.speed) % 720;
      setPlayhead(angle);
      if (
        clock.elapsedTime - lastUiSync.current >=
        UI_SYNC_INTERVAL_SECONDS
      ) {
        lastUiSync.current = clock.elapsedTime;
        useEngineStore.setState({ angle });
      }
    }

    const crankAngle = THREE.MathUtils.degToRad(angle);
    const explode = state.exploded;

    manifest.cylinderX.forEach((x, cylinder) => {
      const theta =
        crankAngle + THREE.MathUtils.degToRad(manifest.crankPhases[cylinder]);
      const pinZ = crankRadius * Math.sin(theta);
      const pinY = crankY + crankRadius * Math.cos(theta);
      const pistonY =
        pinY + Math.sqrt(rodLength * rodLength - pinZ * pinZ);
      const piston = pistons.current[cylinder];
      const rod = rods.current[cylinder];

      if (piston) {
        piston.position.set(
          x,
          pistonY + (explode ? 0.75 : 0),
          THREE.MathUtils.damp(
            piston.position.z,
            explode ? 1.05 : 0,
            9,
            delta,
          ),
        );
      }

      if (rod) {
        ROD_START.set(x, pinY, pinZ);
        ROD_END.set(x, pistonY, 0);
        ROD_DIRECTION.subVectors(ROD_END, ROD_START);
        ROD_MIDDLE.addVectors(ROD_START, ROD_END).multiplyScalar(0.5);
        rod.position.set(
          ROD_MIDDLE.x,
          ROD_MIDDLE.y,
          THREE.MathUtils.damp(
            rod.position.z,
            ROD_MIDDLE.z + (explode ? 1.5 : 0),
            9,
            delta,
          ),
        );
        rod.quaternion.setFromUnitVectors(UP, ROD_DIRECTION.normalize());
      }

      const localAngle =
        (angle + manifest.firingOffsets[cylinder]) % 720;
      const intake = intakeValves.current[cylinder];
      const exhaust = exhaustValves.current[cylinder];
      if (intake) {
        intake.position.set(
          x,
          valveClosedY -
            valveMotion(localAngle, true, valveLift) +
            (explode ? 1.2 : 0),
          0.42 + (explode ? 0.95 : 0),
        );
      }
      if (exhaust) {
        exhaust.position.set(
          x,
          valveClosedY -
            valveMotion(localAngle, false, valveLift) +
            (explode ? 1.2 : 0),
          -0.42 - (explode ? 0.95 : 0),
        );
      }
    });

    if (crankshaft.current) {
      crankshaft.current.rotation.x = crankAngle;
      dampPosition(
        crankshaft.current,
        [0, crankY, explode ? 1.9 : 0],
        delta,
      );
    }
    if (flywheel.current) {
      flywheel.current.rotation.x = crankAngle;
      dampPosition(
        flywheel.current,
        [explode ? -4.8 : -4.25, crankY, explode ? 1.25 : 0],
        delta,
      );
    }
    if (intakeCam.current) {
      intakeCam.current.rotation.x = crankAngle / 2;
      dampPosition(
        intakeCam.current,
        [0, explode ? 4.25 : 3.02, explode ? 1.15 : 0.48],
        delta,
      );
    }
    if (exhaustCam.current) {
      exhaustCam.current.rotation.x = crankAngle / 2 + Math.PI;
      dampPosition(
        exhaustCam.current,
        [0, explode ? 4.25 : 3.02, explode ? -1.15 : -0.48],
        delta,
      );
    }

    dampPosition(block.current, [0, 0, explode ? -1.3 : 0], delta);
    dampPosition(head.current, [0, explode ? 1.1 : 0, 0], delta);
    dampPosition(sump.current, [0, explode ? -0.9 : 0, 0], delta);
    dampPosition(liners.current, [0, 0, explode ? 0.7 : 0], delta);
  });

  return (
    <group>
      <group ref={block}>
        <CadMesh nodes={nodes} name="BlockFull" visible={!cutaway} />
        <CadMesh nodes={nodes} name="BlockCutaway" visible={cutaway} />
        <Hotspot partId="cylinder-block" position={[3.25, 0.5, 0.75]} />
      </group>
      <group ref={head}>
        <CadMesh nodes={nodes} name="HeadFull" visible={!cutaway} />
        <CadMesh nodes={nodes} name="HeadCutaway" visible={cutaway} />
        <Hotspot partId="cylinder-head" position={[3.35, 2.35, 0.85]} />
        <CadMesh nodes={nodes} name="IntakeManifold" />
        <CadMesh nodes={nodes} name="ExhaustManifold" />
        <Hotspot
          partId="intake-manifold"
          position={[-2.65, 2.38, 1.76]}
          alwaysVisible
        />
        <Hotspot
          partId="exhaust-manifold"
          position={[-2.75, 2.38, -1.76]}
          alwaysVisible
        />
        {manifest.cylinderX.map((x, cylinder) => (
          <group key={`plug-${x}`} position={[x, 2.74, 0]}>
            <CadMesh nodes={nodes} name="SparkPlug" />
            {cylinder === 0 && (
              <Hotspot partId="spark-plug" position={[0.2, 0.08, 0.18]} />
            )}
          </group>
        ))}
      </group>
      <group ref={sump}>
        <CadMesh nodes={nodes} name="SumpFull" visible={!cutaway} />
        <CadMesh nodes={nodes} name="SumpCutaway" visible={cutaway} />
        <Hotspot partId="sump" position={[3.35, -2.05, 0.85]} />
      </group>
      <group ref={liners}>
        <CadMesh nodes={nodes} name="LinersFull" visible={!cutaway} />
        <CadMesh nodes={nodes} name="LinersCutaway" visible={cutaway} />
        <Hotspot partId="liners" position={[2.85, 1, 0.55]} />
      </group>

      {manifest.cylinderX.map((x, cylinder) => (
        <group
          key={`piston-${x}`}
          ref={(node) => {
            if (node) pistons.current[cylinder] = node;
          }}
        >
          <CadMesh nodes={nodes} name="Piston" />
          {cylinder === 0 && (
            <Hotspot partId="piston" position={[0.67, 0.08, 0.45]} />
          )}
        </group>
      ))}

      {manifest.cylinderX.map((x, cylinder) => (
        <group
          key={`rod-${x}`}
          ref={(node) => {
            if (node) rods.current[cylinder] = node;
          }}
        >
          <CadMesh nodes={nodes} name="Rod" />
          {cylinder === 0 && (
            <Hotspot
              partId="connecting-rod"
              position={[0.3, 0, 0.35]}
            />
          )}
        </group>
      ))}

      <group ref={crankshaft}>
        <CadMesh nodes={nodes} name="Crankshaft" />
        <Hotspot
          partId="crankshaft"
          position={[1.25, 0.62, 0.55]}
          alwaysVisible
        />
        <Hotspot
          partId="crank-journal"
          position={[-1.55, 0.12, -0.78]}
        />
        <Hotspot
          partId="counterweight"
          position={[0.38, -0.6, 0.2]}
        />
      </group>
      <group ref={flywheel}>
        <CadMesh nodes={nodes} name="Flywheel" />
        <Hotspot
          partId="flywheel"
          position={[0, 0.82, 0.45]}
          alwaysVisible
        />
      </group>

      <group ref={intakeCam}>
        <CadMesh nodes={nodes} name="IntakeCamshaft" />
        <group position={[3.62, 0, 0]}>
          <CadMesh nodes={nodes} name="TimingGear" />
          <Hotspot partId="timing-gear" position={[0.18, 0.48, 0.22]} />
        </group>
        <Hotspot partId="camshaft" position={[0, 0.25, 0.32]} />
      </group>
      <group ref={exhaustCam}>
        <CadMesh nodes={nodes} name="ExhaustCamshaft" />
      </group>

      {manifest.cylinderX.map((x, cylinder) => (
        <group
          key={`intake-${x}`}
          ref={(node) => {
            if (node) intakeValves.current[cylinder] = node;
          }}
        >
          <CadMesh nodes={nodes} name="IntakeValve" />
          {cylinder === 1 && (
            <Hotspot partId="intake-valve" position={[0.26, -0.2, 0.2]} />
          )}
        </group>
      ))}
      {manifest.cylinderX.map((x, cylinder) => (
        <group
          key={`exhaust-${x}`}
          ref={(node) => {
            if (node) exhaustValves.current[cylinder] = node;
          }}
        >
          <CadMesh nodes={nodes} name="ExhaustValve" />
          {cylinder === 2 && (
            <Hotspot partId="exhaust-valve" position={[0.26, -0.2, 0.2]} />
          )}
        </group>
      ))}

      {!exploded && showCombustion && <CombustionEffects />}
      {!exploded && showAirflow && <GasFlow />}
    </group>
  );
}

useGLTF.preload(manifest.model);
