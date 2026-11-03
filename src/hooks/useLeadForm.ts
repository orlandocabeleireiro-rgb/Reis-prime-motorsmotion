"use client";
import { useState, type FormEvent } from "react";

export type LeadStatus = "idle" | "sending" | "sent" | "error";

/** Envia um formulário para /api/leads e gere o estado (a enviar / enviado / erro). */
export function useLeadForm(type: "venda" | "informacao", extra: Record<string, unknown> = {}) {
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...extra, ...data }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Não foi possível enviar. Tente novamente.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não foi possível enviar.");
    }
  };

  return { status, error, onSubmit, reset: () => setStatus("idle") };
}
