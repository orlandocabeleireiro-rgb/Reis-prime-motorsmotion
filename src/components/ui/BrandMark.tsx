import { BRAND_ICON_PATHS, SOCIAL_ICON_PATHS } from "@/data/brand-icons";

/** Logótipo monocromático da marca (Simple Icons) ou, se não existir, o nome em texto. */
export function BrandMark({ id, name, className = "size-6" }: { id: string; name: string; className?: string }) {
  const path = BRAND_ICON_PATHS[id];
  if (!path) {
    return (
      <span className="font-display text-[0.62rem] leading-none font-semibold tracking-[0.12em] whitespace-nowrap uppercase">
        {name}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function SocialIcon({ name, className = "size-4" }: { name: keyof typeof SOCIAL_ICON_PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={SOCIAL_ICON_PATHS[name]} />
    </svg>
  );
}
