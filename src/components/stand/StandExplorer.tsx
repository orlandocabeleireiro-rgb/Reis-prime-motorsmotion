"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { Car } from "@/types/car";
import {
  activeChips,
  applyFilters,
  brandCounts,
  computeBounds,
  EMPTY_FILTERS,
  parseFilters,
  serializeFilters,
  type FilterState,
} from "@/lib/filters";
import { BODY_LABEL, FUEL_LABEL, GEARBOX_LABEL } from "@/lib/labels";
import { formatNumber, pluralize } from "@/lib/format";
import { CarCard } from "@/components/car/CarCard";
import { useLenis } from "@/components/layout/SmoothScroll";
import { Icon } from "@/components/ui/Icon";
import { BrandBar } from "./BrandBar";
import {
  BodyControl,
  FilterPopover,
  FuelControl,
  GearboxControl,
  KmControl,
  PriceControl,
  SearchInput,
  SortSelect,
  YearControl,
  type SetFilters,
} from "./controls";
import { FilterSheet } from "./FilterSheet";

export function StandExplorer({ cars }: { cars: Car[] }) {
  const searchParams = useSearchParams();
  const [filters, setFiltersState] = useState<FilterState>(() => parseFilters(new URLSearchParams(searchParams.toString())));
  const [sheetOpen, setSheetOpen] = useState(false);
  const bounds = useMemo(() => computeBounds(cars), [cars]);
  const sectionTop = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const setFilters: SetFilters = useCallback((update) => setFiltersState((s) => update(s)), []);

  // filtros → URL (partilhável), sem recarregar nem saltar
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = serializeFilters(filters);
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, "", url);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const results = useMemo(() => applyFilters(cars, filters), [cars, filters]);
  const counts = useMemo(() => brandCounts(cars, filters), [cars, filters]);
  const chips = activeChips(filters);
  const nonSortActive = chips.length;

  const selectBrand = (brand: FilterState["brand"]) => {
    setFilters((s) => ({ ...s, brand }));
    // manter o topo da grelha visível ao mudar de marca
    const top = sectionTop.current;
    if (top && top.getBoundingClientRect().top < 0) {
      const y = window.scrollY + top.getBoundingClientRect().top - 64;
      if (lenis) lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y });
    }
  };

  const clear = () => setFiltersState({ ...EMPTY_FILTERS, sort: filters.sort });

  const summaryList = (items: string[]) => (items.length === 0 ? undefined : items.length === 1 ? items[0] : `${items.length}`);

  return (
    <div ref={sectionTop}>
      {/* Barra de marcas (sticky) */}
      <div className="sticky top-(--header-h) z-30 border-y border-white/[0.06] bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px]">
          <BrandBar selected={filters.brand} counts={counts} onSelect={selectBrand} />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        {/* Desktop: barra de filtros horizontal */}
        <div className="relative z-20 mt-8 hidden items-center gap-2.5 lg:flex">
          <SearchInput filters={filters} setFilters={setFilters} className="w-64 xl:w-72" />
          <FilterPopover label="Combustível" summary={summaryList(filters.fuels.map((f) => FUEL_LABEL[f]))} active={filters.fuels.length > 0}>
            <p className="label mb-4">Combustível</p>
            <FuelControl filters={filters} setFilters={setFilters} />
          </FilterPopover>
          <FilterPopover label="Tipo" summary={summaryList(filters.bodies.map((b) => BODY_LABEL[b]))} active={filters.bodies.length > 0}>
            <p className="label mb-4">Tipo de carroçaria</p>
            <BodyControl filters={filters} setFilters={setFilters} />
          </FilterPopover>
          <FilterPopover label="Caixa" summary={filters.gearbox ? GEARBOX_LABEL[filters.gearbox] : undefined} active={!!filters.gearbox} width={300}>
            <p className="label mb-4">Caixa de velocidades</p>
            <GearboxControl filters={filters} setFilters={setFilters} />
          </FilterPopover>
          <FilterPopover label="Ano" summary={filters.year ? `${filters.year[0]}–${filters.year[1]}` : undefined} active={!!filters.year}>
            <YearControl filters={filters} setFilters={setFilters} bounds={bounds} />
          </FilterPopover>
          <FilterPopover label="Preço" summary={filters.price ? "Definido" : undefined} active={!!filters.price} width={400}>
            <PriceControl filters={filters} setFilters={setFilters} bounds={bounds} />
          </FilterPopover>
          <FilterPopover label="Km" summary={filters.km ? "Definido" : undefined} active={!!filters.km} width={400}>
            <KmControl filters={filters} setFilters={setFilters} bounds={bounds} />
          </FilterPopover>
          <SortSelect filters={filters} setFilters={setFilters} className="ml-auto w-56" />
        </div>

        {/* Telemóvel/tablet: pesquisa + botão Filtros */}
        <div className="mt-6 flex flex-col gap-3 lg:hidden">
          <SearchInput filters={filters} setFilters={setFilters} />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 text-[0.8rem] tracking-[0.12em] uppercase"
              aria-haspopup="dialog"
            >
              <Icon name="sliders" className="size-4" />
              Filtros
              {nonSortActive > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-paper text-[0.65rem] font-semibold text-ink">{nonSortActive}</span>
              )}
            </button>
            <SortSelect filters={filters} setFilters={setFilters} className="flex-1" />
          </div>
        </div>

        {/* Resultados + chips ativos */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-white/[0.06] pb-6">
          <p className="mr-2 text-sm text-paper/70" aria-live="polite">
            <motion.span
              key={results.length}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display mr-1.5 inline-block text-xl font-semibold text-paper tabular-nums"
            >
              {formatNumber(results.length)}
            </motion.span>
            {pluralize(results.length, "viatura encontrada", "viaturas encontradas")}
          </p>
          <AnimatePresence initial={false}>
            {chips.map((c) => (
              <motion.button
                key={c.key}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                type="button"
                onClick={() => setFiltersState(c.remove)}
                className="group flex h-8 items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] pr-2.5 pl-3.5 text-[0.75rem] text-paper/85 transition-colors hover:border-white/40"
                aria-label={`Remover filtro ${c.label}`}
              >
                {c.label}
                <Icon name="close" className="size-3.5 text-paper/50 transition-colors group-hover:text-paper" />
              </motion.button>
            ))}
          </AnimatePresence>
          {chips.length > 0 && (
            <button type="button" onClick={clear} className="ml-auto text-[0.72rem] tracking-[0.16em] text-paper/60 uppercase underline-offset-4 transition-colors hover:text-paper hover:underline">
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grelha */}
        <LayoutGroup>
          <motion.ul layout className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((car, i) => (
                <motion.li
                  key={car.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)", transition: { duration: 0.3 } }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 32 },
                    opacity: { duration: 0.8, delay: (i % 3) * 0.08 },
                    y: { duration: 0.9, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <CarCard car={car} priority={i < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>

        <AnimatePresence>
          {results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-24 text-center"
            >
              <Icon name="car" className="size-10 text-silver" />
              <p className="font-display mt-6 text-2xl font-semibold">Nenhuma viatura encontrada</p>
              <p className="mt-3 max-w-sm text-paper/60">
                Experimente alargar os filtros — ou diga-nos o que procura e nós encontramos por si.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clear} className="btn btn-primary">
                  Limpar filtros
                </button>
                <a href="#vender" className="btn btn-ghost">
                  Falar connosco
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        setFilters={setFilters}
        bounds={bounds}
        resultCount={results.length}
        onClear={clear}
      />
    </div>
  );
}
