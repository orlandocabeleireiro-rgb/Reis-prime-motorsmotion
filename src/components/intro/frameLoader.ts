import { INTRO, framePath, type IntroFolder } from "@/config/intro";

export interface FrameStore {
  images: (HTMLImageElement | null)[];
  /** Devolve o frame carregado mais próximo do índice pedido. */
  nearest: (index: number) => HTMLImageElement | null;
  cancel: () => void;
}

function loadImage(src: string, priority: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority ? "high" : "low";
    img.onload = () => {
      // decode() garante que o frame já está descodificado antes de ir para o canvas
      img.decode().then(() => resolve(img), () => resolve(img));
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Carrega a sequência em duas fases:
 *  1. Prioritária: primeiros N frames + 1 em cada `priorityStride` (scrub nunca fica vazio).
 *  2. Restantes em segundo plano, com concorrência limitada.
 */
export function loadFrames(
  folder: IntroFolder,
  total: number,
  {
    onPriorityProgress,
    onPriorityDone,
    onAllDone,
    only,
  }: {
    onPriorityProgress?: (ratio: number) => void;
    onPriorityDone?: () => void;
    onAllDone?: () => void;
    /** Carregar apenas estes índices (ex.: modo de movimento reduzido). */
    only?: number[];
  } = {},
): FrameStore {
  const images: (HTMLImageElement | null)[] = new Array(total).fill(null);
  let cancelled = false;

  const prioritySet = new Set<number>();
  if (only) only.forEach((i) => prioritySet.add(i));
  else {
    for (let i = 0; i < Math.min(INTRO.priorityFrames, total); i++) prioritySet.add(i);
    for (let i = 0; i < total; i += INTRO.priorityStride) prioritySet.add(i);
    prioritySet.add(total - 1);
  }
  const priority = [...prioritySet].sort((a, b) => a - b);
  const rest = only ? [] : Array.from({ length: total }, (_, i) => i).filter((i) => !prioritySet.has(i));

  const run = async (queue: number[], concurrency: number, isPriority: boolean, onEach?: () => void) => {
    let cursor = 0;
    const worker = async () => {
      while (!cancelled && cursor < queue.length) {
        const index = queue[cursor++];
        try {
          images[index] = await loadImage(framePath(folder, index), isPriority);
        } catch {
          /* frame em falta: o nearest() usa o vizinho mais próximo */
        }
        onEach?.();
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  };

  (async () => {
    let done = 0;
    await run(priority, 6, true, () => {
      done++;
      onPriorityProgress?.(done / priority.length);
    });
    if (cancelled) return;
    onPriorityDone?.();
    // pequena pausa para não competir com o primeiro render da página
    await new Promise((r) => setTimeout(r, 150));
    await run(rest, 4, false);
    if (!cancelled) onAllDone?.();
  })();

  const nearest = (index: number) => {
    const i = Math.max(0, Math.min(total - 1, Math.round(index)));
    if (images[i]) return images[i];
    for (let d = 1; d < total; d++) {
      if (i - d >= 0 && images[i - d]) return images[i - d];
      if (i + d < total && images[i + d]) return images[i + d];
    }
    return null;
  };

  return {
    images,
    nearest,
    cancel: () => {
      cancelled = true;
    },
  };
}
