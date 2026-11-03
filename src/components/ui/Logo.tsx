import { useId } from "react";

export const LOGO_VIEWBOX = "240 318 1295 247";
export const LOGO_PATHS = {
  r: "M245 323H583A73.5 73.5 0 0 1 583 470H560L515 415H588A19 19 0 0 0 588 377H300Z",
  rLeg: "M320 415H505L625 560H475Z",
  e: "M682 323H978V377H682ZM682 415H978V470H682ZM682 505H978V560H682Z",
  i: "M1068 323H1120V560H1068Z",
  s: "M1525 323L1475 377H1234A19 19 0 0 0 1234 415H1456A72.5 72.5 0 0 1 1456 560H1148L1200 505H1451A17.5 17.5 0 0 0 1451 470H1228A73.5 73.5 0 0 1 1228 323Z",
} as const;

/**
 * Logótipo REIS em vetor (redesenhado a partir de public/brand/logo-original.jpg).
 * variant="default": letras brancas + perna do R prateada (como o original)
 * variant="silver":  tudo em prata metálica (ecrã de carregamento)
 */
export function Logo({
  variant = "default",
  className,
  title = "Reis Prime Motors",
}: {
  variant?: "default" | "silver";
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const silver = `url(#${id}-s)`;
  const letters = variant === "silver" ? `url(#${id}-l)` : "currentColor";
  return (
    <svg viewBox="240 318 1295 247" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5E6166" />
          <stop offset=".42" stopColor="#D9DCE0" />
          <stop offset=".5" stopColor="#FFFFFF" />
          <stop offset=".58" stopColor="#A9ACB1" />
          <stop offset="1" stopColor="#6E7176" />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#D9DCE0" />
          <stop offset=".52" stopColor="#9A9DA2" />
          <stop offset="1" stopColor="#C9CCD0" />
        </linearGradient>
      </defs>
      <g fill={letters}>
        <path d="M245 323H583A73.5 73.5 0 0 1 583 470H560L515 415H588A19 19 0 0 0 588 377H300Z" />
        <path d="M682 323H978V377H682ZM682 415H978V470H682ZM682 505H978V560H682Z" />
        <path d="M1068 323H1120V560H1068Z" />
        <path d="M1525 323L1475 377H1234A19 19 0 0 0 1234 415H1456A72.5 72.5 0 0 1 1456 560H1148L1200 505H1451A17.5 17.5 0 0 0 1451 470H1228A73.5 73.5 0 0 1 1228 323Z" />
      </g>
      <path fill={silver} d="M320 415H505L625 560H475Z" />
    </svg>
  );
}
