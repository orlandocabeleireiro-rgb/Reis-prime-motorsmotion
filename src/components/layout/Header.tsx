"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { NAV, SITE } from "@/config/site";
import { useLenis } from "./SmoothScroll";

/**
 * Header transparente que ganha fundo preto com blur depois do scroll.
 * Na página inicial, enquanto a intro está ativa, usa mix-blend-difference
 * para continuar legível tanto no túnel escuro como no flash branco.
 */
export function Header() {
  const [solid, setSolid] = useState(false);
  const [overIntro, setOverIntro] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const update = () => {
      const intro = document.getElementById("intro");
      const y = window.scrollY;
      if (intro) {
        const end = intro.offsetTop + intro.offsetHeight - window.innerHeight;
        setOverIntro(y < end - 2);
        setSolid(y >= end - 2);
      } else {
        setOverIntro(false);
        setSolid(y > 24);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-(--header-h) transition-[background-color,backdrop-filter,border-color] duration-500 ${
          solid && !open
            ? "border-b border-white/[0.06] bg-ink/75 backdrop-blur-xl"
            : "border-b border-transparent"
        } ${overIntro && !open ? "mix-blend-difference" : ""}`}
      >
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="group relative z-10 flex items-center gap-3" aria-label={`${SITE.name} — início`}>
            <Logo className="h-[18px] w-auto text-paper md:h-5" />
            <span className="label hidden !text-[0.58rem] !tracking-[0.4em] text-paper/70 sm:inline">Prime Motors</span>
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative text-[0.72rem] font-medium tracking-[0.16em] text-paper/80 uppercase transition-colors hover:text-paper"
                  >
                    {item.label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-gradient-to-r from-silver-dark via-white to-silver-dark transition-transform duration-500 ease-(--ease-premium) group-hover:origin-left group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a href={SITE.phoneHref} className="btn btn-ghost hidden !h-10 !px-5 md:inline-flex">
              <Icon name="phone" className="size-4" />
              Ligar
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movel"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="relative z-10 grid size-11 place-items-center rounded-full border border-white/15 text-paper lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink/95 px-6 pt-28 pb-10 backdrop-blur-2xl lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 2rem)" }}
            animate={{ clipPath: "circle(150% at 92% 2rem)" }}
            exit={{ clipPath: "circle(0% at 92% 2rem)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="flex flex-col gap-2">
              {NAV.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display flex items-baseline gap-4 py-2 text-[1.65rem] font-semibold tracking-tight text-paper"
                  >
                    <span className="label !text-[0.6rem]">0{i + 1}</span>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="hairline my-8" />
            <div className="mt-auto flex flex-col gap-3 text-sm text-paper/70">
              <a href={SITE.phoneHref} className="flex items-center gap-3">
                <Icon name="phone" className="size-4" /> {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3">
                <Icon name="mail" className="size-4" /> {SITE.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
