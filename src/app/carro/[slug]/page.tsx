import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getCarBySlug, getSimilarCars } from "@/lib/cars-repository";
import { BRAND_NAME } from "@/data/brands";
import { BADGE_LABEL, BODY_LABEL, FUEL_LABEL, GEARBOX_LABEL, TRACTION_LABEL } from "@/lib/labels";
import { formatKm, formatNumber, formatPrice } from "@/lib/format";
import { Gallery } from "@/components/car/Gallery";
import { ContactActions } from "@/components/car/ContactActions";
import { CarCard } from "@/components/car/CarCard";
import { FavoriteButton } from "@/components/car/FavoriteButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/carro/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Viatura não encontrada" };
  const title = `${BRAND_NAME[car.brand]} ${car.model} ${car.version} (${car.year})`;
  return {
    title,
    description: `${title} · ${formatKm(car.km)} · ${FUEL_LABEL[car.fuel]} · ${formatPrice(car.price)}. ${car.description.slice(0, 120)}…`,
    openGraph: { images: [car.photos[0]] },
  };
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function CarPage({ params }: PageProps<"/carro/[slug]">) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();
  const similar = await getSimilarCars(car);
  const brand = BRAND_NAME[car.brand];
  const title = `${brand} ${car.model}`;
  const fullTitle = `${title} ${car.version}`;

  const highlights: { icon: IconName; label: string; value: string }[] = [
    { icon: "calendar", label: "Ano", value: `${MONTHS[car.month - 1]}/${car.year}` },
    { icon: "gauge", label: "Quilómetros", value: formatKm(car.km) },
    { icon: "fuel", label: "Combustível", value: FUEL_LABEL[car.fuel] },
    { icon: "gearbox", label: "Caixa", value: GEARBOX_LABEL[car.gearbox] },
    { icon: "power", label: "Potência", value: `${car.powerCv} cv` },
    { icon: "car", label: "Tipo", value: BODY_LABEL[car.body] },
  ];

  const specs: [string, string | undefined][] = [
    ["Marca", brand],
    ["Modelo", car.model],
    ["Versão", car.version],
    ["Primeiro registo", `${String(car.month).padStart(2, "0")}/${car.year}`],
    ["Quilómetros", formatKm(car.km)],
    ["Combustível", FUEL_LABEL[car.fuel]],
    ["Caixa", GEARBOX_LABEL[car.gearbox]],
    ["Potência", `${car.powerCv} cv`],
    ["Cilindrada", car.engineCc ? `${formatNumber(car.engineCc)} cm³` : undefined],
    ["Bateria", car.batteryKwh ? `${String(car.batteryKwh).replace(".", ",")} kWh` : undefined],
    ["Autonomia elétrica", car.rangeKm ? `${car.rangeKm} km (WLTP)` : undefined],
    ["Tração", TRACTION_LABEL[car.traction]],
    ["Carroçaria", BODY_LABEL[car.body]],
    ["Portas / Lugares", `${car.doors} / ${car.seats}`],
    ["Cor", car.color],
    ["Consumo combinado", car.consumption],
    ["Emissões CO₂", car.co2 !== undefined ? `${car.co2} g/km` : undefined],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: fullTitle,
    brand: { "@type": "Brand", name: brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    fuelType: FUEL_LABEL[car.fuel],
    vehicleTransmission: GEARBOX_LABEL[car.gearbox],
    color: car.color,
    image: car.photos,
    offers: { "@type": "Offer", price: car.price, priceCurrency: "EUR", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[1600px] px-5 pt-[calc(var(--header-h)+2rem)] pb-24 md:px-10 md:pt-[calc(var(--header-h)+3rem)]">
        <nav aria-label="Caminho" className="mb-8 text-xs text-paper/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/#stand" className="transition-colors hover:text-paper">
                Stand
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/?marca=${car.brand}#stand`} className="transition-colors hover:text-paper">
                {brand}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-paper/80">
              {car.model}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 xl:col-span-8">
            <Gallery photos={car.photos} alt={fullTitle} />
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              {car.badges.length > 0 && (
                <ul className="mb-5 flex flex-wrap gap-2">
                  {car.badges.map((b) => (
                    <li key={b} className="rounded-full border border-silver-light/30 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-silver-light uppercase">
                      {BADGE_LABEL[b]}
                    </li>
                  ))}
                </ul>
              )}
              <p className="label">{brand}</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-bold tracking-[-0.03em]">{car.model}</h1>
                <FavoriteButton id={car.id} label={title} className="relative mt-1 shrink-0" />
              </div>
              <p className="mt-2 text-lg text-paper/60">{car.version}</p>

              <div className="mt-8 border-y border-white/[0.08] py-6">
                {car.previousPrice && <p className="text-sm text-paper/55 line-through tabular-nums">{formatPrice(car.previousPrice)}</p>}
                <p className="font-display text-metal-static text-[2.75rem] leading-none font-bold tracking-tight tabular-nums">{formatPrice(car.price)}</p>
                <p className="mt-2 text-xs text-paper/60">IVA incluído · Financiamento disponível</p>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {highlights.map((h) => (
                  <div key={h.label} className="relative pl-7">
                    <dt className="text-[0.62rem] tracking-[0.14em] text-paper/60 uppercase">
                      <Icon name={h.icon} className="absolute top-0.5 left-0 size-4 text-silver" />
                      {h.label}
                    </dt>
                    <dd className="mt-0.5 text-sm">{h.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <ContactActions carId={car.id} carTitle={fullTitle} />
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-paper/60">
                <Icon name="shield" className="size-4 text-silver" /> Viatura inspecionada · Garantia incluída · Aceitamos retoma
              </p>
            </div>
          </aside>
        </div>

        <Reveal className="mt-24 grid gap-16 lg:grid-cols-12 lg:gap-14">
          <section className="lg:col-span-7 xl:col-span-8" aria-labelledby="descricao">
            <h2 id="descricao" className="label mb-6" data-reveal="fade">
              Descrição
            </h2>
            <p className="font-display text-xl leading-snug font-medium tracking-tight text-paper/90 md:text-2xl" data-reveal="up">
              {car.description}
            </p>

            <h2 className="label mt-16 mb-6" data-reveal="fade">
              Equipamento
            </h2>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {car.equipment.map((e) => (
                <li key={e} className="flex items-center gap-3 border-b border-white/[0.06] py-3.5 text-paper/80" data-reveal="up">
                  <Icon name="check" className="size-4 shrink-0 text-silver-light" /> {e}
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-5 xl:col-span-4" aria-labelledby="ficha">
            <h2 id="ficha" className="label mb-6" data-reveal="fade">
              Ficha técnica
            </h2>
            <dl className="overflow-hidden rounded-2xl border border-white/[0.08]" data-reveal="up">
              {specs
                .filter((s): s is [string, string] => Boolean(s[1]))
                .map(([k, v], i) => (
                  <div key={k} className={`flex justify-between gap-6 px-5 py-3.5 text-sm ${i % 2 ? "" : "bg-white/[0.02]"}`}>
                    <dt className="text-paper/50">{k}</dt>
                    <dd className="text-right text-paper">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </Reveal>

        {similar.length > 0 && (
          <section className="mt-28" aria-labelledby="semelhantes">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="label mb-4">Também pode gostar</p>
                <h2 id="semelhantes" className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Carros semelhantes
                </h2>
              </div>
              <Link href="/#stand" className="btn btn-ghost hidden md:inline-flex">
                Ver stand <Icon name="arrowRight" className="size-4" />
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {similar.map((c) => (
                <li key={c.id}>
                  <CarCard car={c} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
