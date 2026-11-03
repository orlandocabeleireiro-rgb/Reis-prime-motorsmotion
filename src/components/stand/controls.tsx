"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Bounds, FilterState, Range, SortKey } from "@/lib/filters";
import { SORT_OPTIONS } from "@/lib/filters";
import { BODIES, BODY_LABEL, FUELS, FUEL_LABEL, GEARBOX_LABEL, GEARBOXES } from "@/lib/labels";
import { formatNumber, formatPrice } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { Chip } from "./Chip";
import { RangeSlider } from "./RangeSlider";

export type SetFilters = (update: (f: FilterState) => FilterState) => void;

interface ControlProps {
  filters: FilterState;
  setFilters: SetFilters;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const sameRange = (a: Range, b: Range) => a[0] === b[0] && a[1] === b[1];

export function FuelControl({ filters, setFilters }: ControlProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FUELS.map((f) => (
        <Chip key={f} active={filters.fuels.includes(f)} onClick={() => setFilters((s) => ({ ...s, fuels: toggle(s.fuels, f) }))}>
          {FUEL_LABEL[f]}
        </Chip>
      ))}
    </div>
  );
}

export function BodyControl({ filters, setFilters }: ControlProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BODIES.map((b) => (
        <Chip key={b} active={filters.bodies.includes(b)} onClick={() => setFilters((s) => ({ ...s, bodies: toggle(s.bodies, b) }))}>
          {BODY_LABEL[b]}
        </Chip>
      ))}
    </div>
  );
}

export function GearboxControl({ filters, setFilters }: ControlProps) {
  const options = [null, ...GEARBOXES] as const;
  const pillId = useId();
  return (
    <div role="radiogroup" aria-label="Caixa" className="inline-flex rounded-full border border-white/14 p-1">
      {options.map((g) => {
        const active = filters.gearbox === g;
        return (
          <button
            key={g ?? "todas"}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setFilters((s) => ({ ...s, gearbox: g }))}
            className={`relative h-8 rounded-full px-4 text-[0.8rem] transition-colors ${active ? "text-ink" : "text-paper/70 hover:text-paper"}`}
          >
            {active && (
              <motion.span
                layoutId={`gearbox-pill-${pillId}`}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-paper to-silver-light"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{g ? GEARBOX_LABEL[g] : "Todas"}</span>
          </button>
        );
      })}
    </div>
  );
}
function RangeControl({
  label,
  field,
  bounds,
  step,
  format,
  filters,
  setFilters,
}: ControlProps & {
  label: string;
  field: "year" | "price" | "km";
  bounds: Range;
  step: number;
  format: (n: number) => string;
}) {
  const value = filters[field] ?? bounds;
  return (
    <RangeSlider
      label={label}
      min={bounds[0]}
      max={bounds[1]}
      step={step}
      value={value}
      format={format}
      onChange={(v) => setFilters((s) => ({ ...s, [field]: sameRange(v, bounds) ? null : v }))}
    />
  );
}

export const YearControl = (p: ControlProps & { bounds: Bounds }) => (
  <RangeControl {...p} label="Ano" field="year" bounds={p.bounds.year} step={1} format={String} />
);
export const PriceControl = (p: ControlProps & { bounds: Bounds }) => (
  <RangeControl {...p} label="Preço" field="price" bounds={p.bounds.price} step={500} format={formatPrice} />
);
export const KmControl = (p: ControlProps & { bounds: Bounds }) => (
  <RangeControl {...p} label="Quilómetros" field="km" bounds={p.bounds.km} step={1000} format={(n) => `${formatNumber(n)} km`} />
);

export function SearchInput({ filters, setFilters, className = "" }: ControlProps & { className?: string }) {
  return (
    <label className={`group relative flex items-center ${className}`}>
      <span className="sr-only">Pesquisar marca ou modelo</span>
      <Icon name="search" className="pointer-events-none absolute left-4 size-4 text-paper/60 transition-colors group-focus-within:text-paper" />
      <input
        type="search"
        value={filters.q}
        onChange={(e) => {
          const q = e.target.value;
          setFilters((s) => ({ ...s, q }));
        }}
        placeholder="Pesquisar marca ou modelo"
        className="field !h-11 !rounded-full !pl-11"
      />
    </label>
  );
}

export function SortSelect({ filters, setFilters, className = "" }: ControlProps & { className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="label pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 !text-[0.58rem] !tracking-[0.2em] text-paper/60">
        Ordenar
      </span>
      <select
        value={filters.sort}
        onChange={(e) => {
          const sort = e.target.value as SortKey;
          setFilters((s) => ({ ...s, sort }));
        }}
        className="field !h-11 !rounded-full !pl-[5.1rem] !text-[0.82rem]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} title={o.hint}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Botão com painel flutuante (barra de filtros desktop). */
export function FilterPopover({
  label,
  summary,
  active,
  children,
  width = 360,
  align = "left",
}: {
  label: string;
  summary?: string;
  active: boolean;
  children: ReactNode;
  width?: number;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (ref.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-11 items-center gap-2 rounded-full border px-4 text-[0.8rem] whitespace-nowrap transition-all duration-300 ${
          active || open ? "border-silver-light/60 text-paper shadow-[0_0_18px_rgba(217,220,224,0.12)]" : "border-white/14 text-paper/75 hover:border-white/35 hover:text-paper"
        }`}
      >
        <span>{label}</span>
        {summary && <span className="max-w-[9rem] truncate text-paper/50">· {summary}</span>}
        <svg viewBox="0 0 12 12" className={`size-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="m2 4 4 4 4-4" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ width }}
            className={`absolute top-[calc(100%+10px)] z-40 rounded-2xl border border-white/10 bg-ink-2/95 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
