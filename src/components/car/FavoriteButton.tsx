"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({ id, label, className = "" }: { id: string; label: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? `Remover ${label} dos favoritos` : `Guardar ${label} nos favoritos`}
      className={`grid size-10 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 ${
        active ? "border-transparent bg-paper text-ink" : "border-white/20 bg-black/40 text-paper hover:border-white/50"
      } ${className}`}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="size-[18px]"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </motion.svg>
      <AnimatePresence>
        {active && (
          <motion.span
            key="burst"
            className="pointer-events-none absolute inset-0 rounded-full border border-paper"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
