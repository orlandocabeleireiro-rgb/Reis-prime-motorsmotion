import "server-only";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export interface IntroManifest {
  desktop: number;
  mobile: number;
}

/**
 * Conta os frames que existem em public/intro/<variante>/frame_0001.webp …
 * É isto que faz a intro real substituir a provisória automaticamente:
 * basta haver frames na pasta (lido no build, ou em cada pedido em `npm run dev`).
 */
export function getIntroManifest(): IntroManifest {
  const count = (variant: string) => {
    try {
      const files = readdirSync(join(process.cwd(), "public", "intro", variant)).filter((f) => /^frame_\d{4}\.webp$/.test(f));
      // garante sequência contínua a partir de 0001
      let n = 0;
      const set = new Set(files);
      while (set.has(`frame_${String(n + 1).padStart(4, "0")}.webp`)) n++;
      return n;
    } catch {
      return 0;
    }
  };
  return { desktop: count("desktop"), mobile: count("mobile") };
}
