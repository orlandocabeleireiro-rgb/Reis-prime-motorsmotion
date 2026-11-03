/**
 * Posição do rato (ou inclinação do telemóvel) partilhada pelos efeitos interativos.
 * nx/ny vão de -1 a 1 (centro = 0). Lido em requestAnimationFrame — sem re-renders do React.
 */
export interface PointerState {
  /** posição em px no ecrã (rato) */
  x: number;
  y: number;
  /** normalizado -1…1 (rato ou giroscópio) */
  nx: number;
  ny: number;
  source: "none" | "mouse" | "gyro";
}

export const pointer: PointerState = { x: -9999, y: -9999, nx: 0, ny: 0, source: "none" };

let started = false;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function startPointerTracking() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = clamp((e.clientX / window.innerWidth) * 2 - 1);
      pointer.ny = clamp((e.clientY / window.innerHeight) * 2 - 1);
      pointer.source = "mouse";
    },
    { passive: true },
  );
  document.addEventListener("mouseleave", () => {
    pointer.nx = 0;
    pointer.ny = 0;
  });

  // inclinação do telemóvel
  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null || pointer.source === "mouse") return;
    const landscape = window.innerWidth > window.innerHeight;
    const gx = landscape ? e.beta : e.gamma;
    const gy = landscape ? -e.gamma : e.beta - 45;
    pointer.nx = clamp(gx / 22);
    pointer.ny = clamp(gy / 22);
    pointer.source = "gyro";
  };
  type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
  const DOE = (window as unknown as { DeviceOrientationEvent?: IOSOrientation }).DeviceOrientationEvent;
  if (!DOE) return;
  if (typeof DOE.requestPermission === "function") {
    // iOS: só pode pedir permissão depois de um toque do utilizador
    const ask = () => {
      DOE.requestPermission?.()
        .then((s) => s === "granted" && window.addEventListener("deviceorientation", onOrientation))
        .catch(() => {});
    };
    window.addEventListener("touchend", ask, { once: true });
  } else {
    window.addEventListener("deviceorientation", onOrientation);
  }
}
