"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BRANDS } from "@/data/brands";
import { useLeadForm } from "@/hooks/useLeadForm";
import { Icon } from "@/components/ui/Icon";
import { Reveal, SplitWords } from "@/components/ui/Reveal";

const STEPS = [
  { t: "Envie os dados", d: "Marca, modelo, ano e quilómetros. Fotos ajudam, mas não são obrigatórias." },
  { t: "Proposta em 24h", d: "Avaliamos com base no mercado real e enviamos uma proposta clara." },
  { t: "Pagamento imediato", d: "Tratamos da documentação e pagamos no momento da entrega." },
];

const YEARS = Array.from({ length: 2026 - 1999 + 1 }, (_, i) => 2026 - i);

export function SellSection() {
  const { status, error, onSubmit, reset } = useLeadForm("venda");

  return (
    <section id="vender" className="relative overflow-hidden border-t border-white/[0.06] py-28 md:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(217,220,224,0.08),transparent_60%)]"
      />
      <Reveal className="relative mx-auto grid max-w-[1600px] gap-16 px-5 md:px-10 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="label mb-6" data-reveal="fade">
            Vender o meu carro
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1] font-bold tracking-[-0.03em]">
            <SplitWords text="Vendemos o" /> <SplitWords text="seu carro." className="text-metal" />
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/65" data-reveal="up">
            Compramos o seu carro ou aceitamos como retoma. Rápido, transparente e sem complicações.
          </p>
          <ol className="mt-12 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-5" data-reveal="up">
                <span className="font-display grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-sm text-silver-light">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">{s.t}</p>
                  <p className="mt-1 text-paper/55">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-7" data-reveal="up">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-ink-2 to-ink p-6 md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <span className="grid size-16 place-items-center rounded-full bg-paper text-ink">
                    <Icon name="check" className="size-7" />
                  </span>
                  <p className="font-display mt-8 text-2xl font-semibold">Pedido recebido!</p>
                  <p className="mt-3 max-w-sm text-paper/60">Vamos analisar os dados e enviamos-lhe uma proposta nas próximas 24 horas úteis.</p>
                  <button type="button" onClick={reset} className="btn btn-ghost mt-8">
                    Enviar outro pedido
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
                  <p className="label sm:col-span-2">A sua viatura</p>
                  <Field label="Marca">
                    <select name="brand" required className="field" defaultValue="">
                      <option value="" disabled>
                        Selecione
                      </option>
                      {BRANDS.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                      <option value="Outra">Outra</option>
                    </select>
                  </Field>
                  <Field label="Modelo">
                    <input name="model" required className="field" placeholder="Ex.: Série 3 320d" />
                  </Field>
                  <Field label="Ano">
                    <select name="year" required className="field" defaultValue="">
                      <option value="" disabled>
                        Selecione
                      </option>
                      {YEARS.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Quilómetros">
                    <input name="km" required inputMode="numeric" pattern="[0-9 .]*" className="field" placeholder="Ex.: 85000" />
                  </Field>

                  <p className="label mt-4 sm:col-span-2">Os seus contactos</p>
                  <Field label="Nome" className="sm:col-span-2">
                    <input name="name" required autoComplete="name" className="field" placeholder="Nome e apelido" />
                  </Field>
                  <Field label="Telefone">
                    <input name="phone" type="tel" required autoComplete="tel" className="field" placeholder="912 345 678" />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" autoComplete="email" className="field" placeholder="nome@email.pt" />
                  </Field>
                  <Field label="Observações (opcional)" className="sm:col-span-2">
                    <textarea name="message" rows={3} className="field" placeholder="Estado, extras, revisões…" />
                  </Field>
                  <label className="flex items-start gap-3 text-sm text-paper/60 sm:col-span-2">
                    <input type="checkbox" name="consent" required className="mt-1 size-4 accent-[#d9dce0]" />
                    Aceito ser contactado pela Reis Prime Motors sobre este pedido.
                  </label>
                  {error && (
                    <p className="text-sm text-red-300 sm:col-span-2" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="mt-2 sm:col-span-2">
                    <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
                      {status === "sending" ? "A enviar…" : "Pedir avaliação gratuita"}
                      <Icon name="arrowRight" className="size-4" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[0.78rem] text-paper/60">{label}</span>
      {children}
    </label>
  );
}
