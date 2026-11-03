import { CarCardSkeleton as SkeletonCard } from "@/components/car/CarCardSkeleton";

/** Mesmo nº de cartões que a grelha real, para a altura da página não saltar quando monta. */
export function StandSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <div className="h-[4.6rem] border-y border-white/[0.06]" />
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="skeleton mt-8 h-11 rounded-full" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {Array.from({ length: count }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

