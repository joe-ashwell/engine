"use client";

import type { ReactNode } from "react";
import { useEngineStore } from "@/lib/store";

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`group grid size-10 place-items-center rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f7771] ${
        active
          ? "bg-[#28322f] text-white shadow-sm"
          : "text-[#6e675e] hover:bg-black/5 hover:text-[#292621]"
      }`}
    >
      {children}
    </button>
  );
}

function Icon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function Toolbar() {
  const cutaway = useEngineStore((state) => state.cutaway);
  const exploded = useEngineStore((state) => state.exploded);
  const autoRotate = useEngineStore((state) => state.autoRotate);
  const showLabels = useEngineStore((state) => state.showLabels);
  const showCombustion = useEngineStore((state) => state.showCombustion);
  const showAirflow = useEngineStore((state) => state.showAirflow);
  const toggleCutaway = useEngineStore((state) => state.toggleCutaway);
  const toggleExploded = useEngineStore((state) => state.toggleExploded);
  const toggleAutoRotate = useEngineStore((state) => state.toggleAutoRotate);
  const toggleLabels = useEngineStore((state) => state.toggleLabels);
  const toggleCombustion = useEngineStore((state) => state.toggleCombustion);
  const toggleAirflow = useEngineStore((state) => state.toggleAirflow);
  const reset = useEngineStore((state) => state.reset);

  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/8 bg-[#faf8f3]/92 p-1.5 shadow-[0_12px_35px_rgba(38,34,29,0.1)] backdrop-blur-md"
      role="toolbar"
      aria-label="Engine view tools"
    >
      <ToolButton
        label="Automatic rotation"
        active={autoRotate}
        onClick={toggleAutoRotate}
      >
        <Icon>
          <path d="M4 10a8 8 0 0 1 13-4l2 2" />
          <path d="M19 4v4h-4" />
          <path d="M20 14a8 8 0 0 1-13 4l-2-2" />
          <path d="M5 20v-4h4" />
        </Icon>
      </ToolButton>
      <ToolButton label="Cutaway view" active={cutaway} onClick={toggleCutaway}>
        <Icon>
          <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
          <path d="m4.8 7.3 7.2 4 7.2-4M12 21v-9.7" />
          <path d="M12 3v8.3" />
        </Icon>
      </ToolButton>
      <ToolButton
        label="Exploded view"
        active={exploded}
        onClick={toggleExploded}
      >
        <Icon>
          <path d="m12 3 5 3-5 3-5-3 5-3Z" />
          <path d="m7 11 5 3 5-3M7 16l5 3 5-3" />
        </Icon>
      </ToolButton>
      <ToolButton label="Part labels" active={showLabels} onClick={toggleLabels}>
        <Icon>
          <path d="M4 7h9" />
          <path d="M4 12h16" />
          <path d="M4 17h7" />
        </Icon>
      </ToolButton>
      <ToolButton
        label="Combustion"
        active={showCombustion}
        onClick={toggleCombustion}
      >
        <Icon>
          <path d="M12 21c3.6 0 5.5-2.4 5.5-5.2 0-3.4-2.7-5.2-2.7-8.8-1.8 1.7-2.8 4.3-2.8 4.3S11 8.6 9.2 7c0 4.3-2.7 6-2.7 8.8C6.5 18.6 8.4 21 12 21Z" />
        </Icon>
      </ToolButton>
      <ToolButton
        label="Air flow"
        active={showAirflow}
        onClick={toggleAirflow}
      >
        <Icon>
          <path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" />
          <path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5" />
          <path d="M3 16h8" />
        </Icon>
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
      <ToolButton label="Reset model" onClick={reset}>
        <Icon>
          <path d="M4 4v6h6" />
          <path d="M5.6 16a8 8 0 1 0 .2-8.2L4 10" />
        </Icon>
      </ToolButton>
    </div>
  );
}
