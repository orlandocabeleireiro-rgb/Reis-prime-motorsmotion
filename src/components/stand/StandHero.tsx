import { Icon } from "@/components/ui/Icon";

/**
 * Primeiro ecrã do stand — é a cena revelada pelas duas máscaras circulares
 * no fim da intro. Os brilhos subtis nascem nas posições dos faróis (--h1x/--h2x).
 */
export function StandHero({ total, brands }: { total: number; brands: number }) {
  return (
    <div className="relative flex size-full flex-col overflow-hidden bg-ink">
      {/* restos de luz dos faróis */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at var(--h1x, 32%) var(--h1y, 56%), rgba(217,220,224,0.10), transparent 22%), radial-gradient(circle at var(--h2x, 68%) var(--h2y, 56%), rgba(217,220,224,0.10), transparent 22%)",
        }}
      />
      {/* grelha de linhas prateadas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hairline absolute inset-x-0 top-[22%]" />
        <div className="hairline absolute inset-x-0 bottom-[16%]" />
        <div className="hairline-v absolute inset-y-0 left-[8%] hidden md:block" />
        <div className="hairline-v absolute inset-y-0 right-[8%] hidden md:block" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-5 pt-[calc(var(--header-h)+2rem)] md:px-10 lg:px-[8%]">
        <p className="label mb-6 flex items-center gap-3">
          <span className="inline-block size-1.5 rounded-full bg-silver-light shadow-[0_0_12px_#d9dce0]" />
          Stand · {total} viaturas disponíveis
        </p>
        <h2
          id="stand-hero-title"
          tabIndex={-1}
          className="font-display max-w-[14ch] text-[clamp(2.6rem,8.4vw,8.5rem)] leading-[0.95] font-bold tracking-[-0.03em] outline-none"
        >
          A sua próxima <span className="text-metal">viatura</span> está aqui.
        </h2>
        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-base leading-relaxed text-paper/70 md:text-lg">
            Viaturas selecionadas uma a uma, inspecionadas e prontas a entregar. Com garantia, financiamento à medida e
            retoma do seu usado.
          </p>
          <a href="#stand" className="btn btn-primary self-start md:self-auto">
            Explorar viaturas <Icon name="arrowDown" className="size-4" />
          </a>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-3 gap-4 px-5 pb-8 md:px-10 md:pb-12 lg:px-[8%]">
        {[
          { k: String(total), v: "Viaturas em stock" },
          { k: String(brands), v: "Marcas" },
          { k: "18", v: "Meses de garantia" },
        ].map((s) => (
          <div key={s.v} className="border-t border-white/10 pt-4">
            <p className="font-display text-xl font-semibold md:text-3xl">{s.k}</p>
            <p className="label mt-1 !text-[0.58rem] md:!text-[0.65rem]">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
