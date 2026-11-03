"use client";

import type { ReactNode } from "react";

export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full border px-4 text-[0.8rem] transition-all duration-300 ${
        active
          ? "border-transparent bg-gradient-to-b from-paper to-silver-light font-medium text-ink shadow-[0_0_20px_rgba(217,220,224,0.25)]"
          : "border-white/14 text-paper/75 hover:border-white/40 hover:text-paper"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`text-[0.68rem] tabular-nums ${active ? "text-ink/60" : "text-paper/55"}`}>{count}</span>
      )}
    </button>
  );
}
