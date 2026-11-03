import type { BodyType, BrandId, Car, Fuel, Gearbox } from "@/types/car";
import { BRAND_NAME } from "@/data/brands";
import { BODY_LABEL, BODIES, FUEL_LABEL, FUELS, GEARBOX_LABEL } from "./labels";
import { formatKm, formatPrice } from "./format";

export type SortKey = "recentes" | "preco-asc" | "preco-desc" | "km-asc" | "ano-desc";

export const SORT_OPTIONS: { value: SortKey; label: string; hint: string }[] = [
  { value: "recentes", label: "Mais recentes", hint: "Anúncios mais recentes primeiro" },
  { value: "preco-asc", label: "Preço ↑", hint: "Do mais barato para o mais caro" },
  { value: "preco-desc", label: "Preço ↓", hint: "Do mais caro para o mais barato" },
  { value: "km-asc", label: "Km ↓", hint: "Menos quilómetros primeiro" },
  { value: "ano-desc", label: "Ano ↓", hint: "Mais novos primeiro" },
];

export type Range = [number, number];

export interface Bounds {
  year: Range;
  price: Range;
  km: Range;
}

export interface FilterState {
  brand: BrandId | null;
  fuels: Fuel[];
  bodies: BodyType[];
  gearbox: Gearbox | null;
  year: Range | null;
  price: Range | null;
  km: Range | null;
  q: string;
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = {
  brand: null,
  fuels: [],
  bodies: [],
  gearbox: null,
  year: null,
  price: null,
  km: null,
  q: "",
  sort: "recentes",
};

const roundDown = (v: number, step: number) => Math.floor(v / step) * step;
const roundUp = (v: number, step: number) => Math.ceil(v / step) * step;

export function computeBounds(cars: Car[]): Bounds {
  const years = cars.map((c) => c.year);
  const prices = cars.map((c) => c.price);
  const kms = cars.map((c) => c.km);
  return {
    year: [Math.min(...years), Math.max(...years)],
    price: [roundDown(Math.min(...prices), 1000), roundUp(Math.max(...prices), 1000)],
    km: [0, roundUp(Math.max(...kms), 5000)],
  };
}

/* ---------- URL <-> estado ---------- */

const parseRange = (v: string | null): Range | null => {
  if (!v) return null;
  const [a, b] = v.split("-").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) ? [Math.min(a, b), Math.max(a, b)] : null;
};

export function parseFilters(sp: URLSearchParams): FilterState {
  const brand = sp.get("marca");
  const caixa = sp.get("caixa");
  const ordem = sp.get("ordem") as SortKey | null;
  return {
    brand: brand && brand in BRAND_NAME ? (brand as BrandId) : null,
    fuels: (sp.get("combustivel")?.split(",") ?? []).filter((f): f is Fuel => FUELS.includes(f as Fuel)),
    bodies: (sp.get("tipo")?.split(",") ?? []).filter((b): b is BodyType => BODIES.includes(b as BodyType)),
    gearbox: caixa === "manual" || caixa === "automatica" ? caixa : null,
    year: parseRange(sp.get("ano")),
    price: parseRange(sp.get("preco")),
    km: parseRange(sp.get("km")),
    q: sp.get("q") ?? "",
    sort: ordem && SORT_OPTIONS.some((o) => o.value === ordem) ? ordem : "recentes",
  };
}

export function serializeFilters(f: FilterState): string {
  const sp = new URLSearchParams();
  if (f.brand) sp.set("marca", f.brand);
  if (f.fuels.length) sp.set("combustivel", f.fuels.join(","));
  if (f.bodies.length) sp.set("tipo", f.bodies.join(","));
  if (f.gearbox) sp.set("caixa", f.gearbox);
  if (f.year) sp.set("ano", f.year.join("-"));
  if (f.price) sp.set("preco", f.price.join("-"));
  if (f.km) sp.set("km", f.km.join("-"));
  if (f.q.trim()) sp.set("q", f.q.trim());
  if (f.sort !== "recentes") sp.set("ordem", f.sort);
  return sp.toString();
}

/* ---------- aplicar ---------- */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const inRange = (v: number, r: Range | null) => !r || (v >= r[0] && v <= r[1]);

export function matches(car: Car, f: FilterState, ignore?: keyof FilterState): boolean {
  if (ignore !== "brand" && f.brand && car.brand !== f.brand) return false;
  if (f.fuels.length && !f.fuels.includes(car.fuel)) return false;
  if (f.bodies.length && !f.bodies.includes(car.body)) return false;
  if (f.gearbox && car.gearbox !== f.gearbox) return false;
  if (!inRange(car.year, f.year)) return false;
  if (!inRange(car.price, f.price)) return false;
  if (!inRange(car.km, f.km)) return false;
  if (f.q.trim()) {
    const hay = normalize(`${BRAND_NAME[car.brand]} ${car.model} ${car.version}`);
    const words = normalize(f.q).split(/\s+/).filter(Boolean);
    if (!words.every((w) => hay.includes(w))) return false;
  }
  return true;
}

const SORTERS: Record<SortKey, (a: Car, b: Car) => number> = {
  recentes: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  "preco-asc": (a, b) => a.price - b.price,
  "preco-desc": (a, b) => b.price - a.price,
  "km-asc": (a, b) => a.km - b.km,
  "ano-desc": (a, b) => b.year - a.year || b.month - a.month,
};

export function applyFilters(cars: Car[], f: FilterState): Car[] {
  return cars.filter((c) => matches(c, f)).sort(SORTERS[f.sort]);
}

/** Nº de viaturas por marca, respeitando os restantes filtros. */
export function brandCounts(cars: Car[], f: FilterState): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const c of cars) {
    if (!matches(c, f, "brand")) continue;
    counts[c.brand] = (counts[c.brand] ?? 0) + 1;
    total++;
  }
  counts.all = total;
  return counts;
}

/* ---------- chips ativos ---------- */

export interface ActiveChip {
  key: string;
  label: string;
  remove: (f: FilterState) => FilterState;
}

export function activeChips(f: FilterState): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (f.brand) chips.push({ key: "brand", label: BRAND_NAME[f.brand], remove: (s) => ({ ...s, brand: null }) });
  for (const fuel of f.fuels)
    chips.push({
      key: `fuel-${fuel}`,
      label: FUEL_LABEL[fuel],
      remove: (s) => ({ ...s, fuels: s.fuels.filter((x) => x !== fuel) }),
    });
  for (const body of f.bodies)
    chips.push({
      key: `body-${body}`,
      label: BODY_LABEL[body],
      remove: (s) => ({ ...s, bodies: s.bodies.filter((x) => x !== body) }),
    });
  if (f.gearbox)
    chips.push({ key: "gearbox", label: GEARBOX_LABEL[f.gearbox], remove: (s) => ({ ...s, gearbox: null }) });
  if (f.year) chips.push({ key: "year", label: `${f.year[0]} – ${f.year[1]}`, remove: (s) => ({ ...s, year: null }) });
  if (f.price)
    chips.push({
      key: "price",
      label: `${formatPrice(f.price[0])} – ${formatPrice(f.price[1])}`,
      remove: (s) => ({ ...s, price: null }),
    });
  if (f.km)
    chips.push({
      key: "km",
      label: `${formatKm(f.km[0])} – ${formatKm(f.km[1])}`,
      remove: (s) => ({ ...s, km: null }),
    });
  if (f.q.trim()) chips.push({ key: "q", label: `“${f.q.trim()}”`, remove: (s) => ({ ...s, q: "" }) });
  return chips;
}
