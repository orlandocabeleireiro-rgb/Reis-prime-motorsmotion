/**
 * Configuração da intro (sequência de frames controlada pelo scroll).
 *
 * Depois de correr ./scripts/convert-intro.sh com os vídeos reais:
 *  - confirme FRAME_COUNT (= nº de ficheiros em public/intro/desktop)
 *  - ajuste HEADLIGHTS: posição (0–1, relativa ao frame original) de cada farol
 *    no momento em que a imagem fica branca. É daí que nascem as máscaras circulares.
 *  - POSTER_FRAME: frame mostrado a quem tem "reduzir movimento" ativo.
 */
export type IntroVariant = "desktop" | "mobile";

export const INTRO = {
  frameCount: 150,
  /** Frames carregados antes de esconder o ecrã de carregamento (o resto vem em segundo plano). */
  priorityFrames: 12,
  /** Também prioritário: 1 em cada N frames, para o scrub nunca ficar vazio. */
  priorityStride: 12,
  posterFrame: 118,
  /** Altura total da secção da intro, em ecrãs (100vh). Inclui a transição. */
  scrollScreens: 5,
  /** Fração do scroll em que o vídeo chega ao último frame. O resto é a transição. */
  videoEnd: 0.74,
  size: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 1080, height: 1920 },
  },
  headlights: {
    desktop: [
      { x: 0.32, y: 0.56 },
      { x: 0.68, y: 0.56 },
    ],
    mobile: [
      { x: 0.32, y: 0.56 },
      { x: 0.68, y: 0.56 },
    ],
  },
} as const;

export const framePath = (variant: IntroVariant, index: number) =>
  `/intro/${variant}/frame_${String(index + 1).padStart(4, "0")}.webp`;
