"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Car } from "@/types/car";
import { BRAND_NAME } from "@/data/brands";
import { BADGE_LABEL, FUEL_LABEL, GEARBOX_LABEL } from "@/lib/labels";
import { formatKm, formatPrice } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import { Tilt } from "@/components/ui/Tilt";

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const title = `${BRAND_NAME[car.brand]} ${car.model}`;

  // ao passar o rato, a posição horizontal escolhe a foto
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !mediaRef.current) return;
    const r = mediaRef.current.getBoundingClientRect();
    const i = Math.min(car.photos.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * car.photos.length)));
    if (i !== index) setIndex(i);
  };

  return (
    <Tilt className="h-full">
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-gradient-to-b from-ink-2 to-ink transition-[transform,border-color,box-shadow] duration-700 ease-(--ease-premium) hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(217,220,224,0.06)]">
      <div
        ref={mediaRef}
        className="relative aspect-[16/11] overflow-hidden bg-ink-3"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setHovered(false);
          setIndex(0);
        }}
      >
        <div className="skeleton absolute inset-0" aria-hidden="true" />
        {car.photos.map((src, i) =>
          i === 0 || hovered ? (
            <Image
              key={src}
              src={src}
              alt={i === 0 ? `${title} ${car.version}` : ""}
              fill
              priority={priority && i === 0}
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition-[opacity,transform] duration-700 ease-(--ease-premium) group-hover/card:scale-[1.04] ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null,
        )}
        {/* reflexo prateado a passar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_48%,rgba(217,220,224,0.08)_52%,transparent_65%)] transition-transform duration-[1.1s] ease-(--ease-premium) group-hover/card:translate-x-full"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {car.badges.length > 0 && (
          <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {car.badges.map((b) => (
              <li
                key={b}
                className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] uppercase backdrop-blur-md ${
                  b === "novidade"
                    ? "bg-gradient-to-b from-paper to-silver-light text-ink"
                    : b === "baixa-preco"
                      ? "border border-white/25 bg-black/50 text-paper"
                      : "border border-silver-light/30 bg-black/40 text-silver-light"
                }`}
              >
                {BADGE_LABEL[b]}
              </li>
            ))}
          </ul>
        )}
        <FavoriteButton id={car.id} label={title} className="absolute top-3 right-3 z-10" />

        {/* indicadores das fotos */}
        <div className="absolute inset-x-4 bottom-3 hidden gap-1 [@media(hover:hover)]:flex" aria-hidden="true">
          {car.photos.map((_, i) => (
            <span
              key={i}
              className={`h-[2px] flex-1 rounded-full transition-all duration-500 ${
                hovered ? (i === index ? "bg-paper" : "bg-white/30") : "bg-white/0"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="label !text-[0.6rem]">{BRAND_NAME[car.brand]}</p>
        <h3 className="font-display mt-2 text-lg leading-tight font-semibold tracking-tight md:text-xl">
          <Link href={`/carro/${car.slug}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
            {car.model}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-paper/55">{car.version}</p>

        <dl className="mt-5 grid grid-cols-3 gap-x-3 gap-y-3 border-t border-white/[0.07] pt-4 text-[0.78rem]">
          <Spec label="Ano" value={String(car.year)} />
          <Spec label="Km" value={formatKm(car.km).replace(" km", "")} />
          <Spec label="Potência" value={`${car.powerCv} cv`} />
          <Spec label="Combustível" value={FUEL_LABEL[car.fuel]} />
          <Spec label="Caixa" value={GEARBOX_LABEL[car.gearbox]} />
        </dl>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            {car.previousPrice && (
              <p className="text-xs text-paper/55 line-through tabular-nums">{formatPrice(car.previousPrice)}</p>
            )}
            <p className="font-display text-metal-static text-2xl font-semibold tracking-tight tabular-nums md:text-[1.7rem]">
              {formatPrice(car.price)}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover/card:border-transparent group-hover/card:bg-paper group-hover/card:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-500 group-hover/card:-rotate-45" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
    </Tilt>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.62rem] tracking-[0.14em] text-paper/55 uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-paper/90">{value}</dd>
    </div>
  );
}
