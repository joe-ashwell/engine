"use client";

import {
  getCylinderStroke,
  getStroke,
  strokes,
} from "@/lib/content/engine";
import { useEngineStore } from "@/lib/store";

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={playing ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      {playing ? (
        <>
          <path d="M9 6v12" />
          <path d="M15 6v12" />
        </>
      ) : (
        <path d="m9 6 9 6-9 6V6Z" />
      )}
    </svg>
  );
}

export function CyclePanel() {
  const angle = useEngineStore((state) => state.angle);
  const playing = useEngineStore((state) => state.playing);
  const speed = useEngineStore((state) => state.speed);
  const setAngle = useEngineStore((state) => state.setAngle);
  const setPlaying = useEngineStore((state) => state.setPlaying);
  const setSpeed = useEngineStore((state) => state.setSpeed);
  const stroke = getStroke(angle);

  return (
    <section
      className="pointer-events-auto w-full rounded-[1.5rem] border border-black/8 bg-[#faf8f3]/94 p-4 shadow-[0_20px_60px_rgba(38,34,29,0.12)] backdrop-blur-md sm:p-5"
      aria-label="Four-stroke cycle controls"
    >
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#28322f] text-white transition-colors duration-200 hover:bg-[#3b4844] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f7771]"
          aria-label={playing ? "Pause engine" : "Play engine"}
        >
          <PlayIcon playing={playing} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-[#302c27]">
              {stroke.name} stroke
            </p>
            <output
              className="shrink-0 font-mono text-[0.67rem] tabular-nums text-[#81796f]"
              htmlFor="cycle-scrubber"
            >
              {Math.round(angle)}° / 720°
            </output>
          </div>
          <p className="truncate text-[0.7rem] text-[#7c746a]">
            {stroke.summary}
          </p>
        </div>

        <label className="hidden items-center gap-2 border-l border-black/10 pl-3 sm:flex">
          <span className="font-mono text-[0.58rem] tracking-wider text-[#81796f] uppercase">
            Speed
          </span>
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="rounded-lg bg-[#eeeae1] px-2 py-1.5 text-xs text-[#3b3732] outline-none focus-visible:ring-2 focus-visible:ring-[#5f7771]"
            aria-label="Animation speed"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>

      <div
        className="mb-3 grid grid-cols-4 gap-1.5"
        aria-label="Cylinder stroke status"
      >
        {[0, 1, 2, 3].map((cylinder) => {
          const cylinderStroke = getCylinderStroke(angle, cylinder);
          return (
            <div
              key={cylinder}
              className="rounded-lg bg-[#eeeae1] px-2 py-1.5 text-center"
            >
              <span className="block font-mono text-[0.5rem] tracking-wider text-[#8b8378] uppercase">
                Cyl {cylinder + 1}
              </span>
              <span className="block truncate text-[0.63rem] font-medium text-[#4d4942]">
                {cylinderStroke.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <div className="mb-1.5 grid grid-cols-4 gap-1" aria-hidden="true">
          {strokes.map((item) => (
            <div
              key={item.id}
              className={`h-1 rounded-full transition-colors duration-200 ${
                item.id === stroke.id ? "bg-[#5f7771]" : "bg-black/10"
              }`}
            />
          ))}
        </div>
        <input
          id="cycle-scrubber"
          type="range"
          min="0"
          max="719.9"
          step="0.1"
          value={angle}
          onChange={(event) => setAngle(Number(event.target.value))}
          onPointerDown={() => setPlaying(false)}
          className="cycle-range w-full"
          aria-label="Engine cycle angle"
        />
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {strokes.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              setPlaying(false);
              setAngle(index * 180 + 45);
            }}
            className={`rounded-md py-1 text-center font-mono text-[0.56rem] tracking-[0.08em] uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5f7771] ${
              item.id === stroke.id
                ? "text-[#36443f]"
                : "text-[#999187] hover:text-[#4b4640]"
            }`}
            aria-current={item.id === stroke.id ? "step" : undefined}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}
