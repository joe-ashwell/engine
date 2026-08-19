"use client";

import { EngineCanvas } from "@/components/scene/EngineCanvas";
import { CyclePanel } from "@/components/ui/CyclePanel";
import { PartPanel } from "@/components/ui/PartPanel";
import { Toolbar } from "@/components/ui/Toolbar";

export function Explorer() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#eeeae1] text-[#292621]">
      <section
        id="explorer"
        className="absolute inset-0"
        aria-labelledby="engine-title"
      >
        <div className="h-full w-full">
          <EngineCanvas />
        </div>

        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="absolute top-5 left-5 max-w-[16rem] sm:top-8 sm:left-8 sm:max-w-[20rem]">
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

          <div className="absolute right-8 bottom-6 hidden max-h-[calc(100svh-12.5rem)] overflow-y-auto lg:block">
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
