"use client";

import { useId } from "react";
import type { Range } from "@/lib/filters";

/**
 * Slider duplo (de/até) acessível: dois <input type="range"> nativos sobrepostos,
 * por isso funciona com teclado, leitores de ecrã e toque sem código extra.
 */
export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: Range;
  onChange: (v: Range) => void;
  format: (n: number) => string;
}) {
  const id = useId();
  const [a, b] = value;
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;

  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span id={`${id}-label`} className="label">
          {label}
        </span>
        <span className="text-sm text-paper tabular-nums">
          {format(a)} <span className="text-paper/55">–</span> {format(b)}
        </span>
      </div>
      <div className="range-dual">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-silver-dark via-white to-silver-dark"
          style={{ left: `${pct(a)}%`, right: `${100 - pct(b)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={a}
          aria-label={`${label} — mínimo`}
          aria-valuetext={format(a)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), b), b])}
          style={{ zIndex: a > max - (max - min) * 0.1 ? 4 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={b}
          aria-label={`${label} — máximo`}
          aria-valuetext={format(b)}
          onChange={(e) => onChange([a, Math.max(Number(e.target.value), a)])}
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[0.7rem] text-paper/55 tabular-nums" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
