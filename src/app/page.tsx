import { Suspense } from "react";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { StandHero } from "@/components/stand/StandHero";
import { StandSkeleton } from "@/components/stand/StandSkeleton";
import { StandExplorerLazy } from "@/components/stand/StandExplorerLazy";
import { WhySection } from "@/components/sections/WhySection";
import { FinanceSection } from "@/components/sections/FinanceSection";
import { SellSection } from "@/components/sections/SellSection";
import { getCars } from "@/lib/cars-repository";
import { getIntroManifest } from "@/lib/intro-manifest";
import { LazyMount } from "@/components/ui/LazyMount";

export default async function Home() {
  const cars = await getCars();
  const brandCount = new Set(cars.map((c) => c.brand)).size;

  return (
    <>
      <IntroSequence manifest={getIntroManifest()}>
        <StandHero total={cars.length} brands={brandCount} />
      </IntroSequence>

      <section id="stand" aria-labelledby="stand-title" className="relative pt-6 pb-28 md:pb-40">
        <h2 id="stand-title" className="sr-only">
          Viaturas em stock
        </h2>
        <LazyMount fallback={<StandSkeleton count={cars.length} />}>
          <StandExplorerLazy cars={cars} />
        </LazyMount>
      </section>

      {/* limites de Suspense: a hidratação destas secções é feita em blocos separados (menos bloqueio da thread principal) */}
      <Suspense>
        <WhySection />
      </Suspense>
      <Suspense>
        <FinanceSection />
      </Suspense>
      <Suspense>
        <SellSection />
      </Suspense>
    </>
  );
}
