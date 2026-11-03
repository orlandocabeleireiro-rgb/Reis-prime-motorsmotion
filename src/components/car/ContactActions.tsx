"use client";

import { Portal } from "@/components/ui/Portal";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whatsappLink } from "@/config/site";
import { useLeadForm } from "@/hooks/useLeadForm";
import { Icon } from "@/components/ui/Icon";
import { SocialIcon } from "@/components/ui/BrandMark";
import { useLenis } from "@/components/layout/SmoothScroll";

/** Botões "Contactar por WhatsApp" e "Pedir informações" (formulário em modal). */
export function ContactActions({ carId, carTitle }: { carId: string; carTitle: string }) {
  const [open, setOpen] = useState(false);
  const { status, error, onSubmit, reset } = useLeadForm("informacao", { carId, car: carTitle });
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <a
          href={whatsappLink(`Olá! Tenho interesse no ${carTitle}. Ainda está disponível?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full"
        >
          <SocialIcon name="whatsapp" className="size-4" /> Contactar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="btn btn-ghost w-full"
        >
          <Icon name="mail" className="size-4" /> Pedir informações
        </button>
      </div>

      <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
            <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="info-title"
              className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] border border-white/10 bg-ink-2 p-6 md:rounded-[1.75rem] md:p-9"
              data-lenis-prevent=""
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="label">Pedir informações</p>
                  <h2 id="info-title" className="font-display mt-3 text-xl font-semibold">
                    {carTitle}
                  </h2>
                </div>
                <button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15">
                  <Icon name="close" className="size-4" />
                </button>
              </div>

              {status === "sent" ? (
                <div className="py-12 text-center" role="status">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-paper text-ink">
                    <Icon name="check" className="size-6" />
                  </span>
                  <p className="font-display mt-6 text-xl font-semibold">Mensagem enviada</p>
                  <p className="mt-2 text-paper/60">Entraremos em contacto muito em breve.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-8 grid gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-[0.78rem] text-paper/60">Nome</span>
                    <input name="name" required autoComplete="name" className="field" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-[0.78rem] text-paper/60">Telefone</span>
                      <input name="phone" type="tel" autoComplete="tel" className="field" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-[0.78rem] text-paper/60">Email</span>
                      <input name="email" type="email" autoComplete="email" className="field" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[0.78rem] text-paper/60">Mensagem</span>
                    <textarea name="message" rows={4} className="field" defaultValue={`Olá, gostaria de mais informações sobre o ${carTitle}.`} />
                  </label>
                  <label className="flex items-center gap-3 text-sm text-paper/60">
                    <input type="checkbox" name="testDrive" value="sim" className="size-4 accent-[#d9dce0]" />
                    Quero marcar um test drive
                  </label>
                  {error && (
                    <p className="text-sm text-red-300" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-2 disabled:opacity-60">
                    {status === "sending" ? "A enviar…" : "Enviar pedido"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </Portal>
    </>
  );
}
