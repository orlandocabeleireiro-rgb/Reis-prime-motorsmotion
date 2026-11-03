import type { Badge, BodyType, Fuel, Gearbox, Traction } from "@/types/car";

export const FUEL_LABEL: Record<Fuel, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel",
  hibrido: "Híbrido",
  "hibrido-plugin": "Híbrido Plug-in",
  eletrico: "Elétrico",
  gpl: "GPL",
};

export const GEARBOX_LABEL: Record<Gearbox, string> = {
  manual: "Manual",
  automatica: "Automática",
};

export const BODY_LABEL: Record<BodyType, string> = {
  citadino: "Citadino",
  utilitario: "Utilitário",
  sedan: "Sedan",
  carrinha: "Carrinha",
  suv: "SUV",
  coupe: "Coupé",
  descapotavel: "Descapotável",
};

export const BADGE_LABEL: Record<Badge, string> = {
  novidade: "Novidade",
  "baixa-preco": "Baixa de preço",
  "garantia-18": "Garantia 18 meses",
};

export const TRACTION_LABEL: Record<Traction, string> = {
  dianteira: "Dianteira",
  traseira: "Traseira",
  integral: "Integral",
};

export const FUELS = Object.keys(FUEL_LABEL) as Fuel[];
export const GEARBOXES = Object.keys(GEARBOX_LABEL) as Gearbox[];
export const BODIES = Object.keys(BODY_LABEL) as BodyType[];
