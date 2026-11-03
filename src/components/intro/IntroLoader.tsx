"use client";

import { memo, useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/ui/Logo";

/** Pequeno store para a percentagem: só o loader volta a renderizar quando ela muda. */
export function createProgressStore() {
  let value = 0;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (v: number) => {
      const rounded = Math.round(v * 100) / 100;
      if (rounded === value) return;
      value = rounded;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
export type ProgressStore = ReturnType<typeof createProgressStore>;

/**
 * Ecrã de carregamento: logótipo prateado que se "enche" com a percentagem de frames carregados.
 * A saída é uma transição CSS (transform/opacity), executada no compositor.
 */
export const IntroLoader = memo(function IntroLoader({ visible, store }: { visible: boolean; store: ProgressStore }) {
  const ratio = useSyncExternalStore(store.subscribe, store.get, () => 0);
  const pct = Math.round(ratio * 100);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setGone(true), 1600);
    return () => clearTimeout(t);
  }, [visible]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink transition-transform delay-200 duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        visible ? "" : "-translate-y-full"
      }`}
      role="status"
      aria-live="polite"
      aria-label={visible ? `A carregar ${pct}%` : "Carregado"}
    >
      <div
        className={`relative w-[min(62vw,340px)] transition-[opacity,transform] duration-500 ease-out ${
          visible ? "" : "scale-95 opacity-0"
        }`}
      >
        {/* base apagada */}
        <Logo className="w-full text-white/[0.07]" title="" />
        {/* camada prateada revelada pela percentagem */}
        <div className="absolute inset-0 transition-[clip-path] duration-500 ease-out" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
          <Logo variant="silver" className="w-full" />
        </div>
      </div>

      <div className={`mt-10 flex w-[min(62vw,340px)] items-center gap-4 transition-opacity duration-300 ${visible ? "" : "opacity-0"}`}>
        <span className="label !tracking-[0.4em]">A carregar</span>
        <span className="relative h-px flex-1 overflow-hidden bg-white/10">
          <span
            className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-silver-dark via-white to-silver-light transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${ratio})` }}
          />
        </span>
        <span className="font-display w-12 text-right text-sm tabular-nums text-paper">{pct}%</span>
      </div>
    </div>
  );
});
