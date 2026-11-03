export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/[0.07]" aria-hidden="true">
      <div className="skeleton aspect-[16/11]" />
      <div className="space-y-3 p-6">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton mt-6 h-16 rounded" />
        <div className="skeleton mt-6 h-7 w-32 rounded" />
      </div>
    </div>
  );
}
