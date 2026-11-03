import type { BrandId } from "../types/car";

export interface Brand {
  id: BrandId;
  name: string;
}

/** Ordem em que as marcas aparecem na barra do stand. */
export const BRANDS: Brand[] = [
  { id: "porsche", name: "Porsche" },
  { id: "bmw", name: "BMW" },
  { id: "mercedes-benz", name: "Mercedes-Benz" },
  { id: "audi", name: "Audi" },
  { id: "volkswagen", name: "Volkswagen" },
  { id: "volvo", name: "Volvo" },
  { id: "peugeot", name: "Peugeot" },
  { id: "renault", name: "Renault" },
  { id: "seat", name: "Seat" },
  { id: "cupra", name: "Cupra" },
  { id: "toyota", name: "Toyota" },
  { id: "tesla", name: "Tesla" },
  { id: "land-rover", name: "Land Rover" },
  { id: "ford", name: "Ford" },
  { id: "fiat", name: "Fiat" },
  { id: "opel", name: "Opel" },
  { id: "citroen", name: "Citroën" },
  { id: "mini", name: "Mini" },
  { id: "lexus", name: "Lexus" },
];

export const BRAND_NAME: Record<BrandId, string> = Object.fromEntries(
  BRANDS.map((b) => [b.id, b.name]),
) as Record<BrandId, string>;
