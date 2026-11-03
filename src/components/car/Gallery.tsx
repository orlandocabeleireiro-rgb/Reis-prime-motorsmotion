"use client";

import { Portal } from "@/components/ui/Portal";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useLenis } from "@/components/layout/SmoothScroll";

/** Galeria com miniaturas + visualização em ecrã inteiro (teclado, swipe). */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [dir, setDir] = useState(1);
  const lenis = useLenis();
  const n = photos.length;

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (!full) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [full, go, lenis]);

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-ink-3">
        <div className="skeleton absolute inset-0" aria-hidden="true" />
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04, x: dir * 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={photos[index]}
              alt={`${alt} — foto ${index + 1} de ${n}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setFull(true)}
          className="absolute inset-0 z-[1] cursor-zoom-in"
          aria-label="Ver fotos em ecrã inteiro"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-center justify-between p-4 md:p-5">
          <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs tabular-nums backdrop-blur-md">
            {index + 1} / {n}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md">
            <Icon name="expand" className="size-3.5" /> Ecrã inteiro
          </span>
        </div>
        {n > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Ver foto ${i + 1}`}
            aria-current={i === index}
            className={`relative aspect-[16/10] overflow-hidden rounded-xl border transition-all duration-500 ${
              i === index ? "border-silver-light/70 opacity-100" : "border-white/[0.07] opacity-50 hover:opacity-90"
            }`}
          >
            <Image src={src} alt="" fill sizes="15vw" className="object-cover" />
          </button>
        ))}
      </div>

      <Portal>
      <AnimatePresence>
        {full && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Galeria em ecrã inteiro"
            className="fixed inset-0 z-[80] flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 md:p-6">
              <span className="label tabular-nums">
                {index + 1} / {n}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => setFull(false)}
                className="grid size-11 place-items-center rounded-full border border-white/20"
                aria-label="Fechar galeria"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  initial={{ opacity: 0, x: dir * 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -80 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={photos[index]} alt={`${alt} — foto ${index + 1}`} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              {n > 1 && (
                <>
                  <NavButton side="left" onClick={() => go(-1)} always />
                  <NavButton side="right" onClick={() => go(1)} always />
                </>
              )}
            </div>
            <div className="flex justify-center gap-2 p-5">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-paper" : "w-5 bg-white/25"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}

function NavButton({ side, onClick, always = false }: { side: "left" | "right"; onClick: () => void; always?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto anterior" : "Foto seguinte"}
      className={`absolute top-1/2 z-[3] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md transition-all duration-300 hover:bg-paper hover:text-ink ${
        side === "left" ? "left-3 md:left-5" : "right-3 md:right-5"
      } ${always ? "" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"}`}
    >
      <Icon name={side === "left" ? "arrowLeft" : "arrowRight"} className="size-4" />
    </button>
  );
}
