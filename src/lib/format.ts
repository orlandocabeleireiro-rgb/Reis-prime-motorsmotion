const eur = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0, useGrouping: "always" } as Intl.NumberFormatOptions);

/** 45900 → "45.900 €" */
export const formatPrice = (value: number) => `${eur.format(value).replace(/\s/g, ".")} €`;

/** 28500 → "28.500 km" */
export const formatKm = (value: number) => `${eur.format(value).replace(/\s/g, ".")} km`;

export const formatNumber = (value: number) => eur.format(value).replace(/\s/g, ".");

export const pluralize = (n: number, one: string, many: string) => (n === 1 ? one : many);
