"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INTRO, type IntroVariant } from "@/config/intro";
import { useLenis } from "@/components/layout/SmoothScroll";
import { loadFrames, type FrameStore } from "./frameLoader";
import { IntroLoader, createProgressStore } from "./IntroLoader";
import { IntroTitle } from "./IntroTitle";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Point = { x: number; y: number };

/**
 * Intro cinematográfica:
 *  - sequência de frames num <canvas> controlada pelo scroll (secção com sticky)
 *  - interpolação (lerp + crossfade) entre frames
 *  - vinheta + aberração cromática que aumentam com a aproximação do carro
 *  - flash (bloom) e revelação do stand por duas máscaras circulares que nascem dos faróis
 *
 * `children` é a cena revelada (primeiro ecrã do stand).
 */
export function IntroSequence({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const revealInnerRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<FrameStore | null>(null);

  const [variant, setVariant] = useState<IntroVariant | null>(null);
  const [reduced, setReduced] = useState(false);
  const [progressStore] = useState(createProgressStore);
  const [ready, setReady] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [finished, setFinished] = useState(false);
  const lenis = useLenis();

  /* 1. Decidir variante (desktop/mobile) e movimento reduzido */
  useEffect(() => {
    const portrait = window.innerWidth / window.innerHeight < 0.85;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* eslint-disable react-hooks/set-state-in-effect */
    setVariant(portrait ? "mobile" : "desktop");
    setReduced(rm);
    // se a página abriu já a meio (ex.: /#stand), não bloqueia com o ecrã de carregamento
    const section = sectionRef.current;
    if (rm || (section && window.scrollY > section.offsetHeight * 0.5)) setLoaderVisible(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  /* 2. Carregar frames */
  useEffect(() => {
    if (!variant) return;
    const started = performance.now();
    const store = loadFrames(variant, {
      only: reduced ? [INTRO.posterFrame] : undefined,
      onPriorityProgress: progressStore.set,
      onPriorityDone: () => {
        setReady(true);
        // mantém o logótipo visível um instante, mesmo com cache
        const wait = Math.max(0, 700 - (performance.now() - started));
        setTimeout(() => setLoaderVisible(false), wait);
      },
    });
    storeRef.current = store;
    return () => store.cancel();
  }, [variant, reduced, progressStore]);

  /* 3. Bloquear o scroll enquanto o ecrã de carregamento está visível */
  useEffect(() => {
    const root = document.documentElement;
    if (loaderVisible) {
      lenis?.stop();
      root.style.overflow = "hidden";
    } else {
      lenis?.start();
      root.style.overflow = "";
      ScrollTrigger.refresh();
    }
    return () => {
      root.style.overflow = "";
    };
  }, [loaderVisible, lenis]);

  /* 4. Render loop */
  useEffect(() => {
    if (!variant) return;
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const N = INTRO.frameCount;
    const VE = INTRO.videoEnd;
    const frameSize = INTRO.size[variant];
    const lights = INTRO.headlights[variant];

    let progress = 0;
    let current = reduced ? INTRO.posterFrame : 0;
    let lastDraw = { frame: -1, ca: -1, w: 0, h: 0 };
    let W = 0;
    let H = 0;
    let dpr = 1;
    let hl: Point[] = [];
    let rMax = 0;
    let lastP = -1;
    let finishedFlag = false;
    // canvases auxiliares para a aberração cromática
    let base: HTMLCanvasElement | null = null;
    let red: HTMLCanvasElement | null = null;
    let blue: HTMLCanvasElement | null = null;

    const resize = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      // nítido em retina, mas sem ultrapassar muito a resolução real dos frames
      const maxDpr = Math.max(1, (frameSize.width * 1.35) / Math.max(W, H * (frameSize.width / frameSize.height)));
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, maxDpr));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      base = red = blue = null;
      // posição dos faróis no ecrã (object-fit: cover)
      const s = Math.max(W / frameSize.width, H / frameSize.height);
      const dw = frameSize.width * s;
      const dh = frameSize.height * s;
      const ox = (W - dw) / 2;
      const oy = (H - dh) / 2;
      hl = lights.map((l) => ({ x: ox + l.x * dw, y: oy + l.y * dh }));
      const corners = [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: 0, y: H },
        { x: W, y: H },
      ];
      rMax = Math.max(...corners.map((c) => Math.min(...hl.map((h) => Math.hypot(c.x - h.x, c.y - h.y))))) * 1.04;
      lastDraw = { frame: -1, ca: -1, w: 0, h: 0 };
      lastP = -1;
      // posicionar os brilhos dos faróis
      glowRefs.current.forEach((el, i) => {
        if (el && hl[i]) el.style.transform = `translate3d(${hl[i].x}px, ${hl[i].y}px, 0) translate(-50%, -50%)`;
      });
      if (flareRef.current && hl[0]) flareRef.current.style.top = `${(hl[0].y + hl[1].y) / 2}px`;
      revealRef.current?.style.setProperty("--h1x", `${hl[0]?.x ?? 0}px`);
      revealRef.current?.style.setProperty("--h1y", `${hl[0]?.y ?? 0}px`);
      revealRef.current?.style.setProperty("--h2x", `${hl[1]?.x ?? 0}px`);
      revealRef.current?.style.setProperty("--h2y", `${hl[1]?.y ?? 0}px`);
    };

    const drawCover = (target: CanvasRenderingContext2D, img: HTMLImageElement, alpha = 1) => {
      const cw = target.canvas.width;
      const ch = target.canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      target.globalAlpha = alpha;
      target.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      target.globalAlpha = 1;
    };

    const makeCanvas = () => {
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      return c;
    };

    /** Separa os canais R/B com uma ligeira escala radial (aberração cromática). */
    const chromatic = (amountPx: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      base ??= makeCanvas();
      red ??= makeCanvas();
      blue ??= makeCanvas();
      const b = base.getContext("2d")!;
      b.drawImage(canvas, 0, 0);
      const channel = (c: HTMLCanvasElement, scale: number, color: string) => {
        const g = c.getContext("2d")!;
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#000";
        g.fillRect(0, 0, cw, ch);
        const dw = cw * scale;
        const dh = ch * scale;
        g.drawImage(base!, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        g.globalCompositeOperation = "multiply";
        g.fillStyle = color;
        g.fillRect(0, 0, cw, ch);
        g.globalCompositeOperation = "source-over";
      };
      const k = amountPx / cw;
      // ambos ampliados (vermelho mais), para não deixar orlas vazias nas bordas
      channel(red, 1 + k * 2, "#ff0000");
      channel(blue, 1 + k * 0.8, "#0000ff");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(red, 0, 0);
      ctx.drawImage(blue, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    };

    const draw = (frame: number, ca: number) => {
      const store = storeRef.current;
      if (!store) return;
      const i0 = Math.floor(frame);
      const f = frame - i0;
      const img0 = store.nearest(i0);
      if (!img0) return;
      const img1 = store.nearest(Math.min(N - 1, i0 + 1));
      drawCover(ctx, img0);
      if (f > 0.02 && img1 && img1 !== img0) drawCover(ctx, img1, f);
      if (ca > 0.4) chromatic(ca * dpr);
      lastDraw = { frame, ca, w: canvas.width, h: canvas.height };
    };

    const circlePath = (p: Point, r: number) =>
      `M${(p.x - r).toFixed(1)},${p.y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;

    const updateOverlays = (p: number, fp: number) => {
      // título: desfaz-se à medida que o carro se aproxima
      const d = reduced ? smooth(0.05, 0.4, p) * 0.35 : smooth(0.025, 0.3, p);
      titleRef.current?.style.setProperty("--d", d.toFixed(4));
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(0.0, 0.05, p));

      if (reduced) {
        // transição simples por fade
        const o = smooth(0.3, 0.85, p);
        if (revealRef.current) {
          revealRef.current.style.clipPath = "none";
          revealRef.current.style.opacity = String(o);
          revealRef.current.style.visibility = o > 0 ? "visible" : "hidden";
        }
        return;
      }

      // vinheta mais fechada com o carro perto, abre com o flash
      const white = smooth(VE - 0.07, VE, p);
      if (vignetteRef.current)
        vignetteRef.current.style.opacity = String((0.55 + 0.45 * smooth(0.25, 0.9, fp)) * (1 - white));
      if (whiteRef.current) whiteRef.current.style.opacity = String(white);

      // bloom dos faróis + flare anamórfico
      const bloom = smooth(0.6, 0.97, fp);
      const flash = smooth(VE - 0.05, VE + 0.01, p) * (1 - smooth(VE + 0.05, VE + 0.16, p));
      glowRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = String(Math.min(1, bloom * 0.9 + flash));
        el.style.scale = String(0.4 + bloom * 2.2 + flash * 4);
      });
      if (flareRef.current) {
        flareRef.current.style.opacity = String(bloom * (1 - white * 0.6) + flash * 0.8);
        flareRef.current.style.transform = `translateY(-50%) scaleX(${0.2 + bloom * 0.8 + flash * 0.6}) scaleY(${1 + flash * 6})`;
      }

      // revelação do stand: duas máscaras circulares a partir dos faróis
      const start = VE + 0.004;
      const t = clamp01((p - start) / (0.975 - start));
      // começa do tamanho do farol e acelera como luz a expandir; abranda no fim
      const rp = t <= 0 ? 0 : t >= 1 ? 1 : 0.03 + 0.97 * easeInOutCubic(Math.pow(t, 0.8));
      const reveal = revealRef.current;
      if (reveal) {
        if (rp <= 0) {
          reveal.style.visibility = "hidden";
        } else if (rp >= 1) {
          reveal.style.visibility = "visible";
          reveal.style.clipPath = "none";
        } else {
          reveal.style.visibility = "visible";
          const r = Math.max(1, rp * rMax);
          reveal.style.clipPath = `path('${hl.map((h) => circlePath(h, r)).join("")}')`;
        }
      }
      if (revealInnerRef.current) {
        revealInnerRef.current.style.transform = `scale(${(1.14 - 0.14 * rp).toFixed(4)})`;
      }
      ringRefs.current.forEach((el, i) => {
        if (!el || !hl[i]) return;
        const r = Math.max(1, rp * rMax);
        const s = r / 70.5;
        el.style.opacity = rp > 0 && rp < 1 ? String(1 - smooth(0.55, 1, rp)) : "0";
        el.style.transform = `translate3d(${hl[i].x - 100}px, ${hl[i].y - 100}px, 0) scale(${s.toFixed(4)})`;
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress = self.progress;
      },
      onRefresh: (self) => {
        progress = self.progress;
      },
    });
    progress = trigger.progress;
    if (!reduced) current = clamp01(progress / VE) * (N - 1);

    const tick = (_time: number, deltaMs: number) => {
      if (!W) return;
      const p = progress;
      const target = reduced ? INTRO.posterFrame : clamp01(p / VE) * (N - 1);
      // lerp independente do framerate
      const k = 1 - Math.pow(1 - 0.16, Math.min(deltaMs, 64) / 16.67);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.005) current = target;
      const fp = current / (N - 1);

      const ca = reduced ? 0 : 14 * smooth(0.45, 0.9, fp) * (1 - smooth(0.93, 1, fp));
      const covered = !reduced && p > 0.985;
      if (
        !covered &&
        (Math.abs(lastDraw.frame - current) > 0.001 ||
          Math.abs(lastDraw.ca - ca) > 0.05 ||
          lastDraw.w !== canvas.width ||
          lastDraw.h !== canvas.height)
      ) {
        draw(current, ca);
      }

      if (p !== lastP || Math.abs(target - current) > 0.001) {
        updateOverlays(p, fp);
        lastP = p;
      }

      const isFinished = p > VE - 0.02;
      if (isFinished !== finishedFlag) {
        finishedFlag = isFinished;
        setFinished(isFinished);
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      ScrollTrigger.refresh();
    });
    ro.observe(stage);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      ro.disconnect();
    };
  }, [variant, reduced]);

  const skip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const end = section.offsetTop + section.offsetHeight - window.innerHeight;
    if (lenis) lenis.scrollTo(end, { immediate: true, force: true });
    else window.scrollTo({ top: end });
    document.getElementById("stand-hero-title")?.focus({ preventScroll: true });
  };

  const screens = reduced ? 2 : INTRO.scrollScreens;

  return (
    <>
      <IntroLoader visible={loaderVisible} store={progressStore} />
      <section
        id="intro"
        ref={sectionRef}
        aria-label="Introdução"
        className="relative"
        style={{ height: `${screens * 100}svh` }}
      >
        <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
          <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />

          {/* vinheta */}
          <div
            ref={vignetteRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.95) 100%)",
              opacity: 0.55,
            }}
          />

          {/* brilho dos faróis */}
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-10 size-[38vmin] rounded-full opacity-0 mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(235,242,255,0.75) 18%, rgba(200,215,255,0.25) 45%, transparent 70%)",
              }}
            />
          ))}
          {/* flare anamórfico horizontal */}
          <div
            ref={flareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-20%] z-10 h-[3px] opacity-0 mix-blend-screen"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(170,200,255,0.5) 25%, #fff 50%, rgba(170,200,255,0.5) 75%, transparent)",
              boxShadow: "0 0 18px 4px rgba(200,220,255,0.45)",
              top: "56%",
            }}
          />
          {/* branco do flash */}
          <div ref={whiteRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-white opacity-0" />

          <IntroTitle ref={titleRef} ready={!loaderVisible && ready} />

          {/* indicação de scroll */}
          <div
            ref={hintRef}
            className="pointer-events-none absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-8"
          >
            <span className="label !text-[0.6rem] !text-paper/70">Faz scroll</span>
            <span className="relative block h-12 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-0 bg-paper" style={{ animation: "scroll-line 2.2s cubic-bezier(.76,0,.24,1) infinite" }} />
            </span>
          </div>

          {/* cena revelada (stand) */}
          <div
            ref={revealRef}
            className="absolute inset-0 z-30 overflow-hidden bg-ink"
            style={{ visibility: "hidden" } as CSSProperties}
          >
            <div ref={revealInnerRef} className="size-full will-change-transform">
              {children}
            </div>
          </div>
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => {
                ringRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="reveal-ring z-40 opacity-0"
            />
          ))}

          {/* saltar intro */}
          {!reduced && (
            <button
              type="button"
              onClick={skip}
              className={`group absolute right-5 bottom-7 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2.5 text-[0.65rem] font-medium tracking-[0.22em] text-paper/80 uppercase backdrop-blur-md transition-all duration-500 hover:border-white/50 hover:text-paper md:right-10 ${
                finished || !ready ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"
              }`}
              tabIndex={finished ? -1 : 0}
            >
              Saltar intro
              <svg viewBox="0 0 24 24" className="size-3.5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
      </section>
    </>
  );
}
