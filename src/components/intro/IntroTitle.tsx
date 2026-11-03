import { forwardRef, memo, type CSSProperties } from "react";
import { SITE } from "@/config/site";

const LINES = [["REIS", "PRIME"], ["MOTORS"]];

// pseudo-aleatório determinístico (igual no servidor e no cliente)
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * Título da intro. Cada letra tem um vetor de dispersão próprio;
 * o contentor recebe --d (0 → 1) e as letras desfazem-se/desfocam com o scroll.
 */
export const IntroTitle = memo(
  forwardRef<HTMLDivElement, { ready: boolean }>(function IntroTitle({ ready }, ref) {
  let i = 0;
  const total = LINES.flat().join("").length;
  return (
    <div
      ref={ref}
      data-ready={ready}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center"
      style={{ "--d": 0 } as CSSProperties}
    >
      <div className="soft-out">
        <p className="label fade-up mb-6 !text-paper/70 md:mb-8" style={{ transitionDelay: "0.1s" }}>
          Stand automóvel premium · Viaturas selecionadas
        </p>
      </div>
      <h1 aria-label={SITE.name} className="font-display text-[clamp(2.8rem,15vw,6rem)] leading-[0.92] font-extrabold tracking-[-0.02em] md:text-[clamp(4rem,9.2vw,10.5rem)]">
        {LINES.map((line, li) => (
          <span key={li} className="flex flex-col items-center justify-center md:flex-row md:gap-[0.28em]">
            {line.map((word) => (
              <span key={word} aria-hidden="true" className="block whitespace-nowrap">
                {word.split("").map((ch) => {
                  const k = i++;
                  const fromCenter = (k - total / 2) / (total / 2);
                  const style = {
                    "--i": k,
                    "--dx": `${(fromCenter * 22 + (rand(k) - 0.5) * 26).toFixed(2)}vw`,
                    "--dy": `${((rand(k + 7) - 0.5) * 34 - 6).toFixed(2)}vh`,
                    "--dr": `${((rand(k + 13) - 0.5) * 50).toFixed(1)}deg`,
                  } as CSSProperties;
                  return (
                    <span key={k} className="disperse" style={style}>
                      <span className="rise-mask">
                        <span className="rise chrome-letter" style={{ "--i": k } as CSSProperties}>
                          {ch}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <div className="soft-out">
      <p
        className="fade-up mt-6 max-w-md text-[0.95rem] font-light tracking-[0.04em] text-paper/80 md:mt-9 md:text-lg"
        style={{ transitionDelay: "0.9s" }}
      >
        {SITE.tagline}
      </p>
      </div>
    </div>
  );
}),
);
