"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import { Reveal, SplitWords } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

const TERMS = [24, 36, 48, 60, 72, 84];
/** Taxa anual nominal de exemplo — ajustar à financeira parceira. */
const ANNUAL_RATE = 0.0899;

export function FinanceSection() {
  const [price, setPrice] = useState(35000);
  const [down, setDown] = useState(7000);
  const [term, setTerm] = useState(72);

  const monthly = useMemo(() => {
    const capital = Math.max(0, price - down);
    const r = ANNUAL_RATE / 12;
    return capital === 0 ? 0 : (capital * r) / (1 - Math.pow(1 + r, -term));
  }, [price, down, term]);

  return (
    <section id="financiamento" className="relative border-t border-white/[0.06] py-28 md:py-40">
      <Reveal className="mx-auto grid max-w-[1600px] items-center gap-16 px-5 md:px-10 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="label mb-6" data-reveal="fade">
            Financiamento
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1] font-bold tracking-[-0.03em]">
            <SplitWords text="Leve-o hoje." /> <SplitWords text="Pague à sua medida." className="text-metal" />
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/65" data-reveal="up">
            Trabalhamos com várias financeiras para encontrar a melhor prestação para si. Simule ao lado e peça uma
            proposta personalizada — resposta em 24 horas.
          </p>
          <ul className="mt-10 space-y-3 text-paper/75">
            {["Prazos até 84 meses", "Entrada a partir de 0 €", "Retoma pode servir de entrada"].map((t) => (
              <li key={t} className="flex items-center gap-3" data-reveal="up">
                <Icon name="check" className="size-4 text-silver-light" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal="up" className="rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-ink-2 to-ink p-6 md:p-10">
          <SimSlider label="Valor da viatura" value={price} min={5000} max={150000} step={500} onChange={(v) => { setPrice(v); setDown((d) => Math.min(d, v)); }} />
          <div className="mt-8">
            <SimSlider label="Entrada" value={down} min={0} max={price} step={500} onChange={setDown} />
          </div>
          <div className="mt-8">
            <p className="label mb-4">Prazo</p>
            <div className="grid grid-cols-6 gap-1.5 rounded-full border border-white/12 p-1" role="radiogroup" aria-label="Prazo em meses">
              {TERMS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={term === t}
                  onClick={() => setTerm(t)}
                  className={`relative h-9 rounded-full text-[0.78rem] tabular-nums transition-colors ${term === t ? "text-ink" : "text-paper/65 hover:text-paper"}`}
                >
                  {term === t && <motion.span layoutId="term-pill" className="absolute inset-0 rounded-full bg-gradient-to-b from-paper to-silver-light" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/[0.08] pt-8">
            <div>
              <p className="label">Prestação estimada</p>
              <p className="font-display text-metal-static mt-2 text-5xl font-bold tabular-nums md:text-6xl" aria-live="polite">
                {formatPrice(Math.round(monthly))}
                <span className="ml-1 text-lg font-medium text-paper/50">/mês</span>
              </p>
            </div>
            <a href="#vender" className="btn btn-primary">
              Pedir proposta <Icon name="arrowRight" className="size-4" />
            </a>
          </div>
          <p className="mt-6 text-[0.72rem] leading-relaxed text-paper/55">
            Simulação meramente indicativa, com TAN de {(ANNUAL_RATE * 100).toFixed(2).replace(".", ",")}%. Não dispensa a
            consulta da FIN e está sujeita a aprovação da entidade financeira.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function SimSlider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min || 1)) * 100;
  return (
    <label className="block">
      <span className="mb-3 flex items-baseline justify-between">
        <span className="label">{label}</span>
        <span className="font-display text-lg tabular-nums">{formatPrice(value)}</span>
      </span>
      <span className="range-dual block">
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
        <span aria-hidden="true" className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-gradient-to-r from-silver-dark via-white to-silver-light" style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={formatPrice(value)} />
      </span>
    </label>
  );
}
