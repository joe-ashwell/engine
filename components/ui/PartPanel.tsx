"use client";

import { getPart, getStroke, strokes } from "@/lib/content/engine";
import { useEngineStore } from "@/lib/store";

function CloseButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 text-[#716a61] transition-colors duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f7771]"
      aria-label={label}
      onClick={onClick}
    >
      <span aria-hidden="true">×</span>
    </button>
  );
}

function StrokePrimer({ compact }: { compact: boolean }) {
  const angle = useEngineStore((state) => state.angle);
  const dismissPrimer = useEngineStore((state) => state.dismissPrimer);
  const current = getStroke(angle);

  return (
    <div>
      <div
        className={`flex items-start justify-between gap-4 ${
          compact ? "mb-3" : "mb-4"
        }`}
      >
        <div>
          <p className="mb-2 font-mono text-[0.62rem] tracking-[0.2em] text-[#8a8277] uppercase">
            How it works
          </p>
          <h2
            className={`font-serif text-[#282520] ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            Four-stroke cycle
          </h2>
        </div>
        <CloseButton label="Close cycle guide" onClick={dismissPrimer} />
      </div>
      <ol className={compact ? "space-y-1.5" : "space-y-2.5"}>
        {strokes.map((stroke) => {
          const active = stroke.id === current.id;
          return (
            <li
              key={stroke.id}
              className={`rounded-xl px-3 transition-colors duration-200 ${
                compact ? "py-1.5" : "py-2.5"
              } ${active ? "bg-[#5f7771]/10" : ""}`}
            >
              <div className="mb-0.5 flex items-baseline justify-between gap-2">
                <span
                  className={`text-sm font-semibold ${
                    active ? "text-[#36443f]" : "text-[#37332e]"
                  }`}
                >
                  {stroke.name}
                </span>
                <span className="font-mono text-[0.58rem] text-[#8a8277]">
                  {stroke.range}
                </span>
              </div>
              <p
                className={`leading-5 ${
                  compact
                    ? "text-xs text-[#6d665d]"
                    : "text-[0.82rem] text-[#6d665d]"
                }`}
              >
                {compact ? stroke.summary : stroke.detail}
              </p>
            </li>
          );
        })}
      </ol>
      <p
        className={`text-[#8a8277] ${
          compact ? "mt-3 text-[0.68rem]" : "mt-4 text-xs leading-5"
        }`}
      >
        Choose a marker to study a part.
      </p>
    </div>
  );
}

export function PartPanel({ compact = false }: { compact?: boolean }) {
  const selectedPart = useEngineStore((state) => state.selectedPart);
  const selectPart = useEngineStore((state) => state.selectPart);
  const showPrimer = useEngineStore((state) => state.showPrimer);
  const part = getPart(selectedPart);

  if (!part && !showPrimer) return null;

  return (
    <aside
      className={`pointer-events-auto w-full rounded-[1.5rem] border border-black/8 bg-[#faf8f3]/94 shadow-[0_20px_60px_rgba(38,34,29,0.12)] backdrop-blur-md ${
        compact ? "p-4" : "p-5 sm:w-[19rem] sm:p-6"
      }`}
      aria-live="polite"
      aria-label={part ? "Selected engine part" : "Four-stroke cycle"}
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
            <CloseButton
              label="Close part details"
              onClick={() => selectPart(null)}
            />
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
        <StrokePrimer compact={compact} />
      )}
    </aside>
  );
}
