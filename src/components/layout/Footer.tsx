import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { SocialIcon } from "@/components/ui/BrandMark";
import { NAV, SITE } from "@/config/site";

const SOCIAL = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
] as const;

export function Footer() {
  return (
    <footer id="contactos" className="relative overflow-hidden border-t border-white/[0.06] bg-ink pt-24 pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-[8vw] flex justify-center opacity-[0.04]">
        <Logo className="w-[110vw] max-w-none text-paper" title="" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label mb-6">Contactos</p>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-tight md:text-4xl">
              Venha conhecer <span className="text-metal">o stand.</span>
            </h2>
            <ul className="mt-8 space-y-4 text-paper/80">
              <li>
                <a href={SITE.phoneHref} className="flex items-center gap-3 transition-colors hover:text-paper">
                  <Icon name="phone" className="size-4 text-silver" /> {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition-colors hover:text-paper">
                  <Icon name="mail" className="size-4 text-silver" /> {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 size-4 text-silver" />
                <address className="not-italic">
                  {SITE.address.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="label mb-6">Horário</p>
            <dl className="space-y-3 text-sm">
              {SITE.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6 border-b border-white/[0.06] pb-3">
                  <dt className="text-paper/60">{h.days}</dt>
                  <dd className="text-paper">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="label mt-10 mb-5">Redes sociais</p>
            <ul className="flex gap-3">
              {SOCIAL.map((s) => (
                <li key={s.key}>
                  <a
                    href={SITE.social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-11 place-items-center rounded-full border border-white/12 text-paper/70 transition-all duration-500 hover:border-silver-light/60 hover:text-paper hover:shadow-[0_0_24px_rgba(217,220,224,0.25)]"
                  >
                    <SocialIcon name={s.key} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <p className="label mb-6">Onde estamos</p>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/10] overflow-hidden rounded-2xl silver-border bg-ink-2"
              aria-label="Abrir no mapa — localização da Reis Prime Motors (Google Maps)"
            >
              <MapPlaceholder />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-ink/80 px-4 py-2 text-xs tracking-[0.16em] uppercase backdrop-blur transition-colors group-hover:bg-paper group-hover:text-ink">
                Abrir no mapa <Icon name="arrowUpRight" className="size-3.5" />
              </span>
            </a>
          </div>
        </div>

        <div className="hairline mt-20 mb-8" />
        <div className="flex flex-col gap-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {2026} {SITE.name}. Todos os direitos reservados.
          </p>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="transition-colors hover:text-paper">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
                  Livro de Reclamações
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/** Mapa ilustrativo (substituir por um embed real quando houver morada definitiva). */
function MapPlaceholder() {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(217,220,224,0.05)" />
        </pattern>
        <radialGradient id="map-glow">
          <stop offset="0" stopColor="rgba(217,220,224,0.35)" />
          <stop offset="1" stopColor="rgba(217,220,224,0)" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#0e0e10" />
      <rect width="800" height="500" fill="url(#map-grid)" />
      <path d="M-20 360C160 320 260 380 420 300S700 160 820 190" stroke="#26272b" strokeWidth="26" fill="none" />
      <path d="M-20 360C160 320 260 380 420 300S700 160 820 190" stroke="#3a3c40" strokeWidth="1" strokeDasharray="10 12" fill="none" />
      <path d="M180 -20 260 520M560 -20 500 520M-20 120H820" stroke="#1d1e21" strokeWidth="14" fill="none" />
      <path d="M0 450C200 430 300 470 800 420" stroke="#15161a" strokeWidth="40" fill="none" />
      <circle cx="430" cy="296" r="90" fill="url(#map-glow)" className="transition-transform duration-700 group-hover:scale-110" style={{ transformOrigin: "430px 296px" }} />
      <circle cx="430" cy="296" r="9" fill="#f5f5f5" />
      <circle cx="430" cy="296" r="18" fill="none" stroke="#d9dce0" strokeOpacity=".5" />
      <text x="452" y="290" fill="#f5f5f5" fontSize="15" fontFamily="sans-serif" letterSpacing="3">
        REIS PRIME MOTORS
      </text>
    </svg>
  );
}
