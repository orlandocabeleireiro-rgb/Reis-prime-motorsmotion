/**
 * Modelo de dados das viaturas.
 * Pensado para corresponder 1:1 a uma tabela/coleção numa base de dados
 * ou a um painel de administração (ex.: Supabase, Sanity, Strapi, Prisma).
 */

export type BrandId =
  | "porsche"
  | "bmw"
  | "mercedes-benz"
  | "audi"
  | "volkswagen"
  | "volvo"
  | "peugeot"
  | "renault"
  | "seat"
  | "cupra"
  | "toyota"
  | "tesla"
  | "land-rover"
  | "ford"
  | "fiat"
  | "opel"
  | "citroen"
  | "mini"
  | "lexus";

export type Fuel = "gasolina" | "diesel" | "hibrido" | "hibrido-plugin" | "eletrico" | "gpl";
export type Gearbox = "manual" | "automatica";
export type BodyType =
  | "citadino"
  | "utilitario"
  | "sedan"
  | "carrinha"
  | "suv"
  | "coupe"
  | "descapotavel";
export type Badge = "novidade" | "baixa-preco" | "garantia-18";
export type Traction = "dianteira" | "traseira" | "integral";

export interface Car {
  id: string;
  slug: string;
  brand: BrandId;
  model: string;
  version: string;
  /** Ano do primeiro registo */
  year: number;
  /** Mês do primeiro registo (1–12) */
  month: number;
  km: number;
  fuel: Fuel;
  gearbox: Gearbox;
  /** Potência em cavalos (cv) */
  powerCv: number;
  body: BodyType;
  /** Preço em euros, IVA incluído */
  price: number;
  /** Preço anterior (para mostrar a baixa de preço) */
  previousPrice?: number;
  /** Caminhos para /public ou URLs absolutos (CDN) */
  photos: string[];
  badges: Badge[];
  equipment: string[];
  description: string;
  color: string;
  doors: number;
  seats: number;
  /** Cilindrada em cm³ (não aplicável a elétricos) */
  engineCc?: number;
  /** Bateria em kWh (elétricos / plug-in) */
  batteryKwh?: number;
  /** Autonomia elétrica em km (elétricos / plug-in) */
  rangeKm?: number;
  traction: Traction;
  /** Consumo combinado (l/100 km ou kWh/100 km) */
  consumption?: string;
  /** Emissões CO₂ (g/km) */
  co2?: number;
  /** Data em que o anúncio foi publicado (ISO 8601) — usada em "Mais recentes" */
  publishedAt: string;
}
