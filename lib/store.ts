"use client";

import { create } from "zustand";
import type { PartId } from "@/lib/content/engine";

type EngineState = {
  angle: number;
  playing: boolean;
  speed: number;
  selectedPart: PartId | null;
  cutaway: boolean;
  exploded: boolean;
  autoRotate: boolean;
  resetViewKey: number;
  setAngle: (angle: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  selectPart: (part: PartId | null) => void;
  toggleCutaway: () => void;
  toggleExploded: () => void;
  toggleAutoRotate: () => void;
  reset: () => void;
};

export const useEngineStore = create<EngineState>((set) => ({
  angle: 24,
  playing: true,
  speed: 1,
  selectedPart: "piston",
  cutaway: true,
  exploded: false,
  autoRotate: false,
  resetViewKey: 0,
  setAngle: (angle) => set({ angle: Math.max(0, Math.min(719.9, angle)) }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  selectPart: (selectedPart) => set({ selectedPart }),
  toggleCutaway: () => set((state) => ({ cutaway: !state.cutaway })),
  toggleExploded: () => set((state) => ({ exploded: !state.exploded })),
  toggleAutoRotate: () =>
    set((state) => ({ autoRotate: !state.autoRotate })),
  reset: () =>
    set((state) => ({
      angle: 24,
      playing: false,
      selectedPart: "piston",
      cutaway: true,
      exploded: false,
      autoRotate: false,
      resetViewKey: state.resetViewKey + 1,
    })),
}));
