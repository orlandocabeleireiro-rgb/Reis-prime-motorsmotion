/**
 * Configuração da intro controlada pelo scroll.
 *
 * O nº de frames NÃO se configura aqui: é contado automaticamente em
 * public/intro/<desktop|mobile>/ (ver src/lib/intro-manifest.ts).
 * Sem frames → intro provisória desenhada em canvas (túnel + faróis).
 */
export type IntroFolder = "desktop" | "mobile";

type Point = { x: number; y: number };

export const INTRO = {
  /** Altura total da secção da intro, em ecrãs (100svh). Inclui a transição. */
  scrollScreens: 5,
  /** Fração do scroll em que o vídeo chega ao fim. O resto é flash + revelação do stand. */
  videoEnd: 0.74,
  /** Frames carregados antes de esconder o ecrã de carregamento (o resto vem em segundo plano). */
  priorityFrames: 12,
  /** Também prioritário: 1 em cada N frames, para o scrub nunca ficar vazio. */
  priorityStride: 12,
  /** Frame mostrado com "reduzir movimento" ativo (fração da sequência: 0 = início, 1 = fim). */
  posterAt: 0.86,

  /**
   * Posição (0–1, relativa ao FRAME do vídeo) de cada farol no último frame.
   * É daqui que nascem as duas máscaras circulares que revelam o stand.
   * Ajuste se trocar o vídeo.
   */
  headlights: {
    desktop: [
      { x: 0.15, y: 0.375 },
      { x: 0.85, y: 0.375 },
    ],
    mobile: [
      { x: 0.3, y: 0.5 },
      { x: 0.7, y: 0.5 },
    ],
  } satisfies Record<IntroFolder, Point[]>,

  /** Intro provisória: posição final dos faróis (0–1, relativa ao ECRÃ). */
  placeholderHeadlights: {
    landscape: [
      { x: 0.33, y: 0.56 },
      { x: 0.67, y: 0.56 },
    ],
    portrait: [
      { x: 0.24, y: 0.55 },
      { x: 0.76, y: 0.55 },
    ],
  },

  /** Intensidades dos efeitos interativos. */
  fx: {
    /** Aberração cromática máxima em px (aproximação do carro). */
    approachAberration: 12,
    /** Aberração extra com scroll rápido (px). */
    speedAberration: 22,
    /** Velocidade de scroll (px/s) considerada "máxima" para blur/aberração. */
    speedForMax: 3500,
    /** Parallax da câmara com o rato/inclinação (px e graus). */
    parallaxPx: 16,
    parallaxDeg: 2.4,
  },
} as const;

export const framePath = (folder: IntroFolder, index: number) =>
  `/intro/${folder}/frame_${String(index + 1).padStart(4, "0")}.webp`;
