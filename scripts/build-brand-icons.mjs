/**
 * Extrai os logótipos (paths SVG 24x24) do pacote simple-icons para src/data/brand-icons.ts,
 * para não carregar o pacote inteiro no browser.  Uso: node scripts/build-brand-icons.mjs
 */
import * as si from "simple-icons";
import { writeFileSync } from "node:fs";

const map = {
  porsche: "siPorsche", bmw: "siBmw", "mercedes-benz": "siMercedes", audi: "siAudi",
  volkswagen: "siVolkswagen", volvo: "siVolvo", peugeot: "siPeugeot", renault: "siRenault",
  seat: "siSeat", cupra: "siCupra", toyota: "siToyota", tesla: "siTesla",
  "land-rover": "siLandrover", ford: "siFord", fiat: "siFiat", opel: "siOpel",
  citroen: "siCitroen", mini: "siMini", lexus: "siLexus",
};
const out = {};
for (const [id, key] of Object.entries(map)) if (si[key]) out[id] = si[key].path;
const social = {};
for (const [id, key] of Object.entries({ instagram: "siInstagram", facebook: "siFacebook", tiktok: "siTiktok", youtube: "siYoutube", whatsapp: "siWhatsapp" }))
  social[id] = si[key].path;
writeFileSync(
  new URL("../src/data/brand-icons.ts", import.meta.url),
  `// Gerado por scripts/build-brand-icons.mjs a partir de simple-icons (CC0). Não editar à mão.\n` +
    `export const BRAND_ICON_PATHS: Partial<Record<string, string>> = ${JSON.stringify(out, null, 2)};\n\n` +
    `export const SOCIAL_ICON_PATHS = ${JSON.stringify(social, null, 2)} as const;\n`,
);
console.log("Ícones:", Object.keys(out).join(", "));
