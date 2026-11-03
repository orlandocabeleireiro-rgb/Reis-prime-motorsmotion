"use client";

import { Portal } from "@/components/ui/Portal";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type { Bounds, FilterState } from "@/lib/filters";
import { pluralize } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useLenis } from "@/components/layout/SmoothScroll";
import { BodyControl, FuelControl, GearboxControl, KmControl, PriceControl, YearControl, type SetFilters } from "./controls";

/** Painel de filtros que sobe a partir de baixo (telemóvel/tablet). */
export function FilterSheet({
  open,
  onClose,
  filters,
  setFilters,
  bounds,
  resultCount,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: SetFilters;
  bounds: Bounds;
  resultCount: number;
  onClear: () => void;
}) {
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    setTimeout(() => panelRef.current?.querySelector<HTMLElement>("button")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        // manter o foco dentro do painel
        const items = panelRef.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, lenis]);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-[1.75rem] border-t border-white/10 bg-ink-2 shadow-[0_-30px_80px_rgba(0,0,0,0.7)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="flex cursor-grab touch-none flex-col items-center pt-3 pb-2"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
              <div className="mt-3 flex w-full items-center justify-between px-6">
                <p className="font-display text-lg font-semibold">Filtros</p>
                <button type="button" onClick={onClose} aria-label="Fechar filtros" className="grid size-10 place-items-center rounded-full border border-white/15">
                  <Icon name="close" className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-9 overflow-y-auto overscroll-contain px-6 pt-4 pb-8" data-lenis-prevent="">
              <section>
                <p className="label mb-4">Combustível</p>
                <FuelControl filters={filters} setFilters={setFilters} />
              </section>
              <section>
                <p className="label mb-4">Tipo</p>
                <BodyControl filters={filters} setFilters={setFilters} />
              </section>
              <section>
                <p className="label mb-4">Caixa</p>
                <GearboxControl filters={filters} setFilters={setFilters} />
              </section>
              <YearControl filters={filters} setFilters={setFilters} bounds={bounds} />
              <PriceControl filters={filters} setFilters={setFilters} bounds={bounds} />
              <KmControl filters={filters} setFilters={setFilters} bounds={bounds} />
            </div>

            <div className="flex gap-3 border-t border-white/[0.08] px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={onClear} className="btn btn-ghost flex-1">
                Limpar
              </button>
              <button type="button" onClick={onClose} className="btn btn-primary flex-[2]">
                Ver {resultCount} {pluralize(resultCount, "viatura", "viaturas")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
