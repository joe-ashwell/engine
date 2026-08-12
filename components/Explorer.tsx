"use client";

import { EngineCanvas } from "@/components/scene/EngineCanvas";
import { CyclePanel } from "@/components/ui/CyclePanel";
import { PartPanel } from "@/components/ui/PartPanel";
import { Toolbar } from "@/components/ui/Toolbar";

export function Explorer() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#eeeae1] text-[#292621]">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <a
          href="#explorer"
          className="pointer-events-auto flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5f7771]"
          aria-label="Mechanica home"
        >
          <span className="grid size-8 place-items-center rounded-full border border-[#8a8277]/40 font-serif text-sm">
            M
          </span>
          <span className="font-serif text-lg tracking-tight">Mechanica</span>
        </a>
        <div className="hidden items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-[#7c746a] uppercase sm:flex">
          <span className="size-1.5 rounded-full bg-[#6d8880]" />
          Free learning tool
        </div>
      </header>

      <section
        id="explorer"
        className="absolute inset-0"
        aria-labelledby="engine-title"
      >
        <div className="h-full w-full">
          <EngineCanvas />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute top-[5.3rem] left-5 max-w-[16rem] sm:top-[6.8rem] sm:left-8 sm:max-w-[20rem]">
            <p className="mb-2 font-mono text-[0.6rem] tracking-[0.2em] text-[#827a70] uppercase">
              Machine study · 001
            </p>
            <h1
              id="engine-title"
              className="font-serif text-[2rem] leading-[0.96] tracking-[-0.035em] text-[#292621] sm:text-[3.2rem]"
            >
              Inline-four
              <br />
              engine
            </h1>
            <p className="mt-3 hidden max-w-[18rem] text-xs leading-5 text-[#70695f] sm:block">
              Follow four cylinders through intake, compression, power and
              exhaust.
            </p>
          </div>

          <div className="absolute top-[5.2rem] right-4 sm:top-[6.8rem] sm:right-8">
            <Toolbar />
          </div>

          <div className="absolute right-4 bottom-[12.2rem] left-4 lg:hidden">
            <PartPanel compact />
          </div>

          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
            <PartPanel />
          </div>

          <div className="absolute inset-x-3 bottom-3 mx-auto max-w-[42rem] sm:inset-x-6 sm:bottom-6">
            <CyclePanel />
          </div>

          <div className="absolute bottom-8 left-8 hidden items-center gap-2 font-mono text-[0.58rem] tracking-wider text-[#837b70] uppercase xl:flex">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 2h8a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z" />
              <path d="M12 2v7" />
            </svg>
            Drag to rotate · scroll to zoom
          </div>
        </div>
      </section>
    </main>
  );
}
