"use client";

import { getPart } from "@/lib/content/engine";
import { useEngineStore } from "@/lib/store";

export function PartPanel({ compact = false }: { compact?: boolean }) {
  const selectedPart = useEngineStore((state) => state.selectedPart);
  const selectPart = useEngineStore((state) => state.selectPart);
  const part = getPart(selectedPart);

  return (
    <aside
      className={`pointer-events-auto w-full rounded-[1.5rem] border border-black/8 bg-[#faf8f3]/94 shadow-[0_20px_60px_rgba(38,34,29,0.12)] backdrop-blur-md ${
        compact ? "p-4" : "p-5 sm:w-[19rem] sm:p-6"
      }`}
      aria-live="polite"
      aria-label="Selected engine part"
    >
      {part ? (
        <>
          <div
            className={`flex items-start justify-between gap-4 ${
              compact ? "mb-3" : "mb-5"
            }`}
          >
            <div>
              <p className="mb-2 font-mono text-[0.62rem] tracking-[0.2em] text-[#8a8277] uppercase">
                Selected part
              </p>
              <h2
                className={`font-serif leading-none text-[#282520] ${
                  compact ? "text-xl" : "text-[1.75rem]"
                }`}
              >
                {part.name}
              </h2>
            </div>
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 text-[#716a61] transition-colors duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f7771]"
              aria-label="Close part details"
              onClick={() => selectPart(null)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {!compact && (
            <div
              className="mb-5 h-px w-10"
              style={{ backgroundColor: part.colour }}
            />
          )}
          <p className="mb-3 text-sm font-semibold leading-5 text-[#37332e]">
            {part.summary}
          </p>
          {!compact && (
            <p className="text-[0.82rem] leading-6 text-[#6d665d]">
              {part.detail}
            </p>
          )}

          {!compact && (
            <div className="mt-5 rounded-xl bg-[#eeeae1] px-4 py-3.5">
              <p className="mb-1 font-mono text-[0.58rem] tracking-[0.18em] text-[#8a8277] uppercase">
                Did you know?
              </p>
              <p className="text-xs leading-5 text-[#59534c]">{part.fact}</p>
            </div>
          )}
        </>
      ) : (
        <div className="py-2">
          <p className="mb-2 font-mono text-[0.62rem] tracking-[0.2em] text-[#8a8277] uppercase">
            Explore the model
          </p>
          <h2 className="mb-3 font-serif text-2xl text-[#282520]">
            Select a part
          </h2>
          <p className="text-sm leading-6 text-[#6d665d]">
            Choose a marker to learn what each part does.
          </p>
        </div>
      )}
    </aside>
  );
}
