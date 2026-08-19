"use client";

import { Html } from "@react-three/drei";
import type { PartId } from "@/lib/content/engine";
import { getPart } from "@/lib/content/engine";
import { useEngineStore } from "@/lib/store";

export function Hotspot({
  partId,
  position,
  alwaysVisible = false,
}: {
  partId: PartId;
  position: [number, number, number];
  alwaysVisible?: boolean;
}) {
  const selectedPart = useEngineStore((state) => state.selectedPart);
  const selectPart = useEngineStore((state) => state.selectPart);
  const showLabels = useEngineStore((state) => state.showLabels);
  const part = getPart(partId);
  const selected = selectedPart === partId;
  const isolating = selectedPart !== null;
  const showChrome = showLabels;

  if (!part) return null;

  return (
    <Html
      position={position}
      center
      distanceFactor={9}
      occlude={alwaysVisible || isolating ? undefined : true}
      zIndexRange={[8, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        className={`hotspot ${
          (alwaysVisible || isolating) && showChrome
            ? "hotspot--always-visible"
            : ""
        } ${selected ? "hotspot--selected" : ""} ${
          showChrome ? "" : "hotspot--labels-hidden"
        }`}
        aria-label={`Learn about the ${part.name}`}
        aria-pressed={selected}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          selectPart(partId);
        }}
      >
        <span className="hotspot__dot" aria-hidden="true" />
        <span className="hotspot__leader" aria-hidden="true" />
        <span className="hotspot__label">{part.shortName}</span>
      </button>
    </Html>
  );
}
