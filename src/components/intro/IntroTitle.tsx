import { forwardRef, memo, type CSSProperties } from "react";
import { SITE } from "@/config/site";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/ui/Logo";

/**
 * Título da intro: o logótipo REIS em grande.
 * Cada peça do logótipo (R, perna prateada, E, I, S) tem um vetor de dispersão próprio;
 * o contentor recebe --d (0 → 1) e as peças desfazem-se/desfocam com o scroll.
 * Por cima, um reflexo prateado recortado pela forma do logótipo segue o rato (--mx).
 */
const PIECES = [
  { d: LOGO_PATHS.r, fill: "url(#intro-logo-white)", dx: -26, dy: -12, dr: -18 },
  { d: LOGO_PATHS.rLeg, fill: "url(#intro-logo-silver)", dx: -18, dy: 22, dr: 24 },
  { d: LOGO_PATHS.e, fill: "url(#intro-logo-white)", dx: -6, dy: -24, dr: 10 },
  { d: LOGO_PATHS.i, fill: "url(#intro-logo-white)", dx: 8, dy: 20, dr: -14 },
  { d: LOGO_PATHS.s, fill: "url(#intro-logo-white)", dx: 28, dy: -10, dr: 20 },
];

// máscara com a forma do logótipo (para o reflexo que segue o rato)
const MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${LOGO_VIEWBOX}'><path fill='#fff' d='${Object.values(LOGO_PATHS).join("")}'/></svg>`,
)}")`;

export const IntroTitle = memo(
  forwardRef<HTMLDivElement, { ready: boolean }>(function IntroTitle({ ready }, ref) {
    return (
      <div
        ref={ref}
        data-ready={ready}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center"
        style={{ "--d": 0 } as CSSProperties}
      >
        {/* gradientes partilhados pelas peças */}
        <svg width="0" height="0" aria-hidden="true" className="absolute">
          <defs>
            <linearGradient id="intro-logo-white" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset=".55" stopColor="#F2F3F5" />
              <stop offset="1" stopColor="#C9CCD0" />
            </linearGradient>
            <linearGradient id="intro-logo-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5E6166" />
              <stop offset=".42" stopColor="#D9DCE0" />
              <stop offset=".5" stopColor="#FFFFFF" />
              <stop offset=".58" stopColor="#A9ACB1" />
              <stop offset="1" stopColor="#6E7176" />
            </linearGradient>
          </defs>
        </svg>

        <div className="soft-out">
          <p className="label fade-up mb-7 !text-paper/70 md:mb-10" style={{ transitionDelay: "0.1s" }}>
            Stand automóvel premium · Viaturas selecionadas
          </p>
        </div>

        <h1 aria-label={SITE.name} className="intro-logo relative w-[min(84vw,58rem)]" style={{ aspectRatio: "1295 / 247" }}>
          {PIECES.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="disperse !absolute inset-0"
              style={{ "--dx": `${p.dx}vw`, "--dy": `${p.dy}vh`, "--dr": `${p.dr}deg`, "--i": i } as CSSProperties}
            >
              <span className="rise block size-full" style={{ "--i": i } as CSSProperties}>
                <svg viewBox={LOGO_VIEWBOX} className="block size-full overflow-visible drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)]">
                  <path d={p.d} fill={p.fill} />
                </svg>
              </span>
            </span>
          ))}
          {/* reflexo prateado: anda sozinho; com rato, segue o cursor */}
          <span aria-hidden="true" className="logo-sheen soft-out absolute inset-0" style={{ maskImage: MASK, WebkitMaskImage: MASK } as CSSProperties} />
        </h1>

        <div className="soft-out">
          <p
            className="fade-up mt-8 max-w-md text-[0.95rem] font-light tracking-[0.04em] text-paper/80 md:mt-12 md:text-lg"
            style={{ transitionDelay: "0.9s" }}
          >
            {SITE.tagline}
          </p>
        </div>
      </div>
    );
  }),
);
