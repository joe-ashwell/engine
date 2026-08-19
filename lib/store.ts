"use client";

import { create } from "zustand";
import type { PartId } from "@/lib/content/engine";

const INITIAL_ANGLE = 24;
let playhead = INITIAL_ANGLE;

export function getPlayhead() {
  return playhead;
}

export function setPlayhead(angle: number) {
  playhead = ((angle % 720) + 720) % 720;
}

type EngineState = {
  angle: number;
  playing: boolean;
  speed: number;
  selectedPart: PartId | null;
  cutaway: boolean;
  exploded: boolean;
  autoRotate: boolean;
  showLabels: boolean;
  showCombustion: boolean;
  showAirflow: boolean;
  showPrimer: boolean;
  resetViewKey: number;
  setAngle: (angle: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  selectPart: (part: PartId | null) => void;
  toggleCutaway: () => void;
  toggleExploded: () => void;
  toggleAutoRotate: () => void;
  toggleLabels: () => void;
  toggleCombustion: () => void;
  toggleAirflow: () => void;
  dismissPrimer: () => void;
  reset: () => void;
};

export const useEngineStore = create<EngineState>((set) => ({
  angle: INITIAL_ANGLE,
  playing: true,
  speed: 1,
  selectedPart: null,
  cutaway: true,
  exploded: false,
  autoRotate: false,
  showLabels: true,
  showCombustion: false,
  showAirflow: false,
  showPrimer: true,
  resetViewKey: 0,
  setAngle: (angle) => {
    const nextAngle = Math.max(0, Math.min(719.9, angle));
    setPlayhead(nextAngle);
    set({ angle: nextAngle });
  },
  setPlaying: (playing) =>
    set({ playing, ...(playing ? {} : { angle: getPlayhead() }) }),
  setSpeed: (speed) => set({ speed }),
  selectPart: (selectedPart) => set({ selectedPart }),
  toggleCutaway: () => set((state) => ({ cutaway: !state.cutaway })),
  toggleExploded: () => set((state) => ({ exploded: !state.exploded })),
  toggleAutoRotate: () =>
    set((state) => ({ autoRotate: !state.autoRotate })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleCombustion: () =>
    set((state) => ({ showCombustion: !state.showCombustion })),
  toggleAirflow: () => set((state) => ({ showAirflow: !state.showAirflow })),
  dismissPrimer: () => set({ showPrimer: false }),
  reset: () => {
    setPlayhead(INITIAL_ANGLE);
    set((state) => ({
      angle: INITIAL_ANGLE,
      playing: false,
      selectedPart: null,
      cutaway: true,
      exploded: false,
      autoRotate: false,
      showLabels: true,
      showCombustion: false,
      showAirflow: false,
      showPrimer: true,
      resetViewKey: state.resetViewKey + 1,
    }));
  },
}));
