import type { SVGProps } from "react";

/** Ícones de linha próprios (1.5px), sem bibliotecas externas. */
const paths = {
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 8h16M4 16h16",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  calendar: "M5 6h14v14H5zM5 10h14M9 4v4M15 4v4",
  gauge: "M4 16a8 8 0 1 1 16 0M12 16l4-5",
  fuel: "M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3M8 8h3",
  gearbox: "M6 5v14M12 5v14M18 5v7H6",
  power: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
  shield: "M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3ZM9 12l2 2 4-4",
  check: "M5 12l4 4 10-10",
  inspect: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-6-6M7 10l2 2 4-4",
  euro: "M17 6.5A7 7 0 0 0 6.5 10M17 17.5A7 7 0 0 1 6.5 14M4 10h9M4 14h9",
  swap: "M4 8h14l-4-4M20 16H6l4 4",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  pin: "M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  car: "M3 15v-3l2-5h14l2 5v3M3 15h18v3h-3v-2H6v2H3v-3ZM7 12h.01M17 12h.01",
  road: "M8 3 4 21M16 3l4 18M12 4v3M12 11v3M12 18v2",
  key: "M15 9a3 3 0 1 0-3-3M12 6 4 14v3h3l1-1h2v-2h2l2-2",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5", ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
