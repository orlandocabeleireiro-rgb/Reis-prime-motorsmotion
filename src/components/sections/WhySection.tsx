import { Reveal, SplitWords } from "@/components/ui/Reveal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ScrollMarquee } from "./ScrollMarquee";

const REASONS: { icon: IconName; title: string; text: string; stat: string; statLabel: string }[] = [
  {
    icon: "shield",
    title: "Garantia",
    text: "Todas as viaturas saem com garantia — até 18 meses, com cobertura de motor, caixa e sistemas elétricos. Sem letras pequenas.",
    stat: "18",
    statLabel: "meses",
  },
  {
    icon: "inspect",
    title: "Viaturas inspecionadas",
    text: "Cada carro passa por uma inspeção técnica rigorosa, verificação de quilómetros e histórico de manutenção antes de chegar ao stand.",
    stat: "120",
    statLabel: "pontos de controlo",
  },
  {
    icon: "euro",
    title: "Financiamento",
    text: "Soluções de crédito à medida, com resposta rápida e prestações ajustadas ao seu orçamento. Tratamos de toda a burocracia.",
    stat: "24h",
    statLabel: "resposta",
  },
  {
    icon: "swap",
    title: "Retoma",
    text: "Avaliamos o seu carro atual e descontamos o valor na compra. Uma proposta justa, transparente e sem compromisso.",
    stat: "0 €",
    statLabel: "pela avaliação",
  },
];

export function WhySection() {
  return (
    <section id="sobre" className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36">
      <ScrollMarquee words={["Inspecionado", "Garantido", "Financiado", "Retoma", "Premium"]} />

      <Reveal className="relative mx-auto mt-24 grid max-w-[1600px] gap-16 px-5 md:mt-36 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="label mb-6" data-reveal="fade">
              Porquê a Reis Prime Motors
            </p>
            <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1] font-bold tracking-[-0.03em]">
              <SplitWords text="Comprar um carro deve ser" /> <SplitWords text="simples." className="text-metal" />
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/65" data-reveal="up">
              Somos um stand independente com uma ideia fixa: só vendemos carros que nós próprios compraríamos. Escolhemos
              cada viatura a dedo, preparamo-la ao detalhe e acompanhamo-lo muito depois da entrega.
            </p>
            <div className="mt-10 h-px w-full max-w-md bg-gradient-to-r from-silver-light/60 to-transparent" data-reveal="line" />
          </div>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:gap-6">
          {REASONS.map((r, i) => (
            <li
              key={r.title}
              data-reveal="up"
              className={`group relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-b from-ink-2 to-ink p-7 transition-colors duration-500 hover:border-white/20 md:p-9 ${
                i % 2 === 1 ? "sm:translate-y-16" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1/2 -right-1/2 size-full rounded-full bg-[radial-gradient(circle,rgba(217,220,224,0.12),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between">
                <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-silver-light transition-all duration-500 group-hover:border-silver-light/40 group-hover:shadow-[0_0_30px_rgba(217,220,224,0.15)]">
                  <Icon name={r.icon} className="size-6" />
                </span>
                <span className="font-display text-sm text-paper/45">0{i + 1}</span>
              </div>
              <h3 className="font-display mt-10 text-2xl font-semibold tracking-tight">{r.title}</h3>
              <p className="mt-4 leading-relaxed text-paper/60">{r.text}</p>
              <div className="mt-10 flex items-baseline gap-3 border-t border-white/[0.07] pt-6">
                <span className="font-display text-metal-static text-4xl font-bold">{r.stat}</span>
                <span className="label !text-[0.6rem]">{r.statLabel}</span>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
