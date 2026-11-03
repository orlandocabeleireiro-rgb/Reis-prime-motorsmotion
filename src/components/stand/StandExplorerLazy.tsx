"use client";

import { lazy, Suspense } from "react";
import type { Car } from "@/types/car";
import { StandSkeleton } from "./StandSkeleton";

const StandExplorer = lazy(() => import("./StandExplorer").then((m) => ({ default: m.StandExplorer })));

/** Código do explorador (filtros, cartões, animações) só é descarregado quando o stand se aproxima. */
export function StandExplorerLazy({ cars }: { cars: Car[] }) {
  return (
    <Suspense fallback={<StandSkeleton count={cars.length} />}>
      <StandExplorer cars={cars} />
    </Suspense>
  );
}
