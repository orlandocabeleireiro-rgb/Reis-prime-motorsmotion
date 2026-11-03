"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INTRO, type IntroFolder } from "@/config/intro";
import { useLenis } from "@/components/layout/SmoothScroll";
import { pointer, startPointerTracking } from "@/lib/pointer";
import type { IntroManifest } from "@/lib/intro-manifest";
import { loadFrames, type FrameStore } from "./frameLoader";
import { IntroLoader, createProgressStore } from "./IntroLoader";
import { IntroTitle } from "./IntroTitle";
import { drawTunnel } from "./placeholderTunnel";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** aproximação exponencial independente do framerate */
const approach = (current: number, target: number, rate: number, dtMs: number) =>
  current + (target - current) * (1 - Math.pow(1 - rate, Math.min(dtMs, 64) / 16.67));

type Point = { x: number; y: number };
type Source = { kind: "frames"; folder: IntroFolder; count: number } | { kind: "placeholder" };

/**
 * Intro cinematográfica controlada 100% pelo scroll (nunca autoplay):
 *  - frames reais (public/intro) num <canvas>; se não houver frames, túnel provisório desenhado em canvas
 *  - lerp entre frames: para quando o scroll para, recua quando se sobe
 *  - parallax / rotação 3D com o rato ou inclinação do telemóvel (canvas e texto a velocidades diferentes)
 *  - motion blur (zoom) + aberração cromática proporcionais à velocidade do scroll
 *  - flash (bloom) e revelação do stand por duas máscaras circulares a partir dos faróis
 */
export function IntroSequence({ children, manifest }: { children: ReactNode; manifest: IntroManifest }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleParallaxRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const revealInnerRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<FrameStore | null>(null);

  const [source, setSource] = useState<Source | null>(null);
  const [reduced, setReduced] = useState(false);
  const [progressStore] = useState(createProgressStore);
  const [ready, setReady] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [finished, setFinished] = useState(false);
  const lenis = useLenis();

  /* 1. Escolher a fonte: frames de telemóvel, desktop, ou intro provisória */
  useEffect(() => {
    const portrait = window.innerWidth / window.innerHeight < 0.85;
    const forcePlaceholder = new URLSearchParams(window.location.search).get("intro") === "provisoria";
    let s: Source = { kind: "placeholder" };
    if (!forcePlaceholder) {
      if (portrait && manifest.mobile > 0) s = { kind: "frames", folder: "mobile", count: manifest.mobile };
      else if (manifest.desktop > 0) s = { kind: "frames", folder: "desktop", count: manifest.desktop };
      else if (manifest.mobile > 0) s = { kind: "frames", folder: "mobile", count: manifest.mobile };
    }
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* eslint-disable react-hooks/set-state-in-effect */
    setSource(s);
    setReduced(rm);
    const section = sectionRef.current;
    if (rm || (section && window.scrollY > section.offsetHeight * 0.5)) setLoaderVisible(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (!rm) startPointerTracking();
  }, [manifest]);

  /* 2. Carregar frames (ou nada, na intro provisória) */
  useEffect(() => {
    if (!source) return;
    const started = performance.now();
    const done = () => {
      setReady(true);
      const wait = Math.max(0, 700 - (performance.now() - started));
      setTimeout(() => setLoaderVisible(false), wait);
    };
    if (source.kind === "placeholder") {
      storeRef.current = null;
      progressStore.set(1);
      done();
      return;
    }
    const poster = Math.round(INTRO.posterAt * (source.count - 1));
    const store = loadFrames(source.folder, source.count, {
      only: reduced ? [poster] : undefined,
      onPriorityProgress: progressStore.set,
      onPriorityDone: done,
    });
    storeRef.current = store;
    return () => store.cancel();
  }, [source, reduced, progressStore]);

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
    if (!source) return;
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const VE = INTRO.videoEnd;
    const FX = INTRO.fx;
    const isFrames = source.kind === "frames";
    const count = isFrames ? source.count : 0;
    const posterF = INTRO.posterAt;

    let progress = 0;
    let current = reduced ? posterF : 0; // progresso do "vídeo" 0–1 (suavizado)
    let speed = 0; // velocidade de scroll normalizada 0–1 (suavizada)
    let lastScrollY = window.scrollY;
    let mx = 0;
    let my = 0;
    let lastDraw = { f: -1, speed: -1, mx: 9, my: 9, w: 0, h: 0 };
    let W = 0;
    let H = 0;
    let dpr = 1;
    let frameW = 16;
    let frameH = 9;
    let hl: Point[] = [];
    let rMax = 0;
    let finishedFlag = false;
    let titleBox = { left: 0, width: 1 };
    let base: HTMLCanvasElement | null = null;
    let red: HTMLCanvasElement | null = null;
    let blue: HTMLCanvasElement | null = null;

    const placeholderLights = () => INTRO.placeholderHeadlights[W / H < 0.85 ? "portrait" : "landscape"];

    const layout = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      const first = storeRef.current?.nearest(0);
      if (first) {
        frameW = first.naturalWidth;
        frameH = first.naturalHeight;
      }
      // nítido em retina, sem ultrapassar muito a resolução real dos frames
      const coverScale = Math.max(W / frameW, H / frameH);
      const maxDpr = isFrames ? Math.max(1, 1.35 / coverScale) : 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2, maxDpr);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      base = red = blue = null;

      // posição dos faróis no ecrã
      if (isFrames) {
        const s = Math.max(W / frameW, H / frameH);
        const dw = frameW * s;
        const dh = frameH * s;
        const ox = (W - dw) / 2;
        const oy = (H - dh) / 2;
        // se o recorte esconder os faróis (ex.: frames desktop num telemóvel), aproxima-os das margens
        hl = INTRO.headlights[source.folder].map((l) => ({
          x: Math.min(W * 0.9, Math.max(W * 0.1, ox + l.x * dw)),
          y: Math.min(H * 0.9, Math.max(H * 0.1, oy + l.y * dh)),
        }));
      } else {
        hl = placeholderLights().map((l) => ({ x: l.x * W, y: l.y * H }));
      }
      const corners = [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: 0, y: H },
        { x: W, y: H },
      ];
      rMax = Math.max(...corners.map((c) => Math.min(...hl.map((h) => Math.hypot(c.x - h.x, c.y - h.y))))) * 1.04;
      lastDraw = { f: -1, speed: -1, mx: 9, my: 9, w: 0, h: 0 };

      glowRefs.current.forEach((el, i) => {
        if (el && hl[i]) el.style.transform = `translate3d(${hl[i].x}px, ${hl[i].y}px, 0) translate(-50%, -50%)`;
      });
      if (flareRef.current && hl.length === 2) flareRef.current.style.top = `${(hl[0].y + hl[1].y) / 2}px`;
      const reveal = revealRef.current;
      if (reveal && hl.length === 2) {
        reveal.style.setProperty("--h1x", `${hl[0].x}px`);
        reveal.style.setProperty("--h1y", `${hl[0].y}px`);
        reveal.style.setProperty("--h2x", `${hl[1].x}px`);
        reveal.style.setProperty("--h2y", `${hl[1].y}px`);
      }

      // posição do logótipo, para o reflexo seguir o rato
      const h1 = titleRef.current?.querySelector("h1");
      if (h1) {
        const r = h1.getBoundingClientRect();
        titleBox = { left: r.left, width: Math.max(1, r.width) };
      }
    };

    const drawCover = (img: HTMLImageElement, alpha = 1) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    };

    const makeCanvas = () => {
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      return c;
    };

    /** Zoom blur a partir do centro: sensação de velocidade (mais forte nas bordas). */
    const zoomBlur = (amount: number) => {
      base ??= makeCanvas();
      base.getContext("2d")!.drawImage(canvas, 0, 0);
      const cw = canvas.width;
      const ch = canvas.height;
      for (let i = 1; i <= 3; i++) {
        const s = 1 + i * 0.022 * amount;
        ctx.globalAlpha = 0.3 * amount;
        ctx.drawImage(base, (cw - cw * s) / 2, (ch - ch * s) / 2, cw * s, ch * s);
      }
      ctx.globalAlpha = 1;
    };

    /** Separa os canais R/B com uma escala radial (aberração cromática, mais forte nas bordas). */
    const chromatic = (amountPx: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      base ??= makeCanvas();
      red ??= makeCanvas();
      blue ??= makeCanvas();
      base.getContext("2d")!.drawImage(canvas, 0, 0);
      const channel = (c: HTMLCanvasElement, scale: number, color: string) => {
        const g = c.getContext("2d")!;
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#000";
        g.fillRect(0, 0, cw, ch);
        g.drawImage(base!, (cw - cw * scale) / 2, (ch - ch * scale) / 2, cw * scale, ch * scale);
        g.globalCompositeOperation = "multiply";
        g.fillStyle = color;
        g.fillRect(0, 0, cw, ch);
        g.globalCompositeOperation = "source-over";
      };
      const k = amountPx / cw;
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

    const draw = (f: number, spd: number, pmx: number, pmy: number) => {
      if (isFrames) {
        const store = storeRef.current;
        if (!store) return;
        const frame = f * (count - 1);
        const i0 = Math.floor(frame);
        const t = frame - i0;
        const img0 = store.nearest(i0);
        if (!img0) return;
        if (img0.naturalWidth !== frameW || img0.naturalHeight !== frameH) layout();
        const img1 = store.nearest(Math.min(count - 1, i0 + 1));
        drawCover(img0);
        if (t > 0.02 && img1 && img1 !== img0) drawCover(img1, t);
      } else {
        drawTunnel(ctx, canvas.width, canvas.height, { f, mx: pmx, my: pmy, lights: placeholderLights() });
      }
      if (spd > 0.02) zoomBlur(spd);
      const ca = reduced ? 0 : FX.approachAberration * smooth(0.45, 0.9, f) * (1 - smooth(0.93, 1, f)) + FX.speedAberration * spd;
      if (ca > 0.4) chromatic(ca * dpr);
      lastDraw = { f, speed: spd, mx: pmx, my: pmy, w: canvas.width, h: canvas.height };
    };

    const circlePath = (p: Point, r: number) =>
      `M${(p.x - r).toFixed(1)},${p.y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;

    const updateOverlays = (p: number, f: number, parallax: number) => {
      // título desfaz-se à medida que o carro se aproxima
      const d = reduced ? smooth(0.05, 0.4, p) * 0.35 : smooth(0.025, 0.3, p);
      titleRef.current?.style.setProperty("--d", d.toFixed(4));
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(0, 0.05, p));

      // câmara (canvas) e texto mexem-se a velocidades diferentes
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(${(-mx * FX.parallaxPx * parallax).toFixed(2)}px, ${(-my * FX.parallaxPx * 0.7 * parallax).toFixed(2)}px, 0) rotateY(${(mx * FX.parallaxDeg * parallax).toFixed(3)}deg) rotateX(${(-my * FX.parallaxDeg * 0.7 * parallax).toFixed(3)}deg) scale(${(1 + 0.06 * parallax).toFixed(4)})`;
      }
      if (titleParallaxRef.current) {
        // sem transform enquanto o rato não se mexe: o título fica na camada da página (pintado logo → LCP rápido)
        const still = Math.abs(mx) < 0.0005 && Math.abs(my) < 0.0005;
        titleParallaxRef.current.style.transform = still ? "none" : `translate3d(${(mx * 30 * parallax).toFixed(2)}px, ${(my * 18 * parallax).toFixed(2)}px, 0) rotateY(${(mx * 5 * parallax).toFixed(3)}deg) rotateX(${(-my * 4 * parallax).toFixed(3)}deg)`;
      }

      if (reduced) {
        const o = smooth(0.3, 0.85, p);
        if (revealRef.current) {
          revealRef.current.style.clipPath = "none";
          revealRef.current.style.opacity = String(o);
          revealRef.current.style.visibility = o > 0 ? "visible" : "hidden";
        }
        return;
      }

      const white = smooth(VE - 0.07, VE, p);
      if (vignetteRef.current) vignetteRef.current.style.opacity = String(Math.min(1, 0.55 + 0.45 * smooth(0.25, 0.9, f) + speed * 0.3) * (1 - white));
      if (whiteRef.current) whiteRef.current.style.opacity = String(white);

      const bloom = smooth(0.6, 0.97, f);
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
      const rp = t <= 0 ? 0 : t >= 1 ? 1 : 0.03 + 0.97 * easeInOutCubic(Math.pow(t, 0.8));
      const reveal = revealRef.current;
      if (reveal) {
        if (rp <= 0) reveal.style.visibility = "hidden";
        else if (rp >= 1) {
          reveal.style.visibility = "visible";
          reveal.style.clipPath = "none";
        } else {
          reveal.style.visibility = "visible";
          const r = Math.max(1, rp * rMax);
          reveal.style.clipPath = `path('${hl.map((h) => circlePath(h, r)).join("")}')`;
        }
      }
      if (revealInnerRef.current) revealInnerRef.current.style.transform = `scale(${(1.14 - 0.14 * rp).toFixed(4)})`;
      ringRefs.current.forEach((el, i) => {
        if (!el || !hl[i]) return;
        const r = Math.max(1, rp * rMax);
        el.style.opacity = rp > 0 && rp < 1 ? String(1 - smooth(0.55, 1, rp)) : "0";
        el.style.transform = `translate3d(${hl[i].x - 100}px, ${hl[i].y - 100}px, 0) scale(${(r / 70.5).toFixed(4)})`;
      });
    };

    /** Reflexo prateado do título segue o rato (ou a inclinação do telemóvel). */
    let lastSheen = -1;
    const updateSheen = () => {
      const title = titleRef.current;
      if (!title || reduced || pointer.source === "none") return;
      const sx = pointer.source === "mouse" ? (pointer.x - titleBox.left) / titleBox.width : 0.5 + pointer.nx * 0.6;
      if (Math.abs(sx - lastSheen) < 0.001) return;
      lastSheen = sx;
      title.dataset.follow = "true";
      title.style.setProperty("--mx", sx.toFixed(4));
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
    if (!reduced) current = clamp01(progress / VE);
    let lastP = -1;
    let lastMx = 0;
    let lastMy = 0;

    const tick = (_time: number, dt: number) => {
      if (!W) return;
      const p = progress;

      // velocidade do scroll (px/s) → 0–1, suavizada; volta a 0 quando o scroll para
      const y = window.scrollY;
      const v = (Math.abs(y - lastScrollY) / Math.max(dt, 1)) * 1000;
      lastScrollY = y;
      const inVideo = p > 0 && p < VE + 0.02;
      const vTarget = inVideo ? clamp01(v / FX.speedForMax) : 0;
      speed = reduced ? 0 : approach(speed, vTarget, vTarget > speed ? 0.25 : 0.08, dt);
      if (speed < 0.004) speed = 0;

      // rato / inclinação, suavizado; desliga-se no flash para os faróis coincidirem com as máscaras
      const parallax = reduced ? 0 : 1 - smooth(VE - 0.08, VE, p);
      mx = approach(mx, pointer.nx, 0.06, dt);
      my = approach(my, pointer.ny, 0.06, dt);

      // o carro segue o scroll (sem autoplay): lerp para o alvo
      const target = reduced ? posterF : clamp01(p / VE);
      current = approach(current, target, 0.14, dt);
      if (Math.abs(target - current) < 0.0004) current = target;

      const pmx = isFrames ? 0 : mx * parallax;
      const pmy = isFrames ? 0 : my * parallax;
      const covered = !reduced && p > 0.985;
      if (
        !covered &&
        (Math.abs(lastDraw.f - current) > 0.00005 ||
          Math.abs(lastDraw.speed - speed) > 0.004 ||
          Math.abs(lastDraw.mx - pmx) > 0.002 ||
          Math.abs(lastDraw.my - pmy) > 0.002 ||
          lastDraw.w !== canvas.width ||
          lastDraw.h !== canvas.height)
      ) {
        draw(current, speed, pmx, pmy);
      }

      if (
        p !== lastP ||
        Math.abs(target - current) > 0.0001 ||
        Math.abs(mx - lastMx) > 0.001 ||
        Math.abs(my - lastMy) > 0.001 ||
        speed > 0
      ) {
        updateOverlays(p, current, parallax);
        lastP = p;
        lastMx = mx;
        lastMy = my;
      }
      updateSheen();

      const isFinished = p > VE - 0.02;
      if (isFinished !== finishedFlag) {
        finishedFlag = isFinished;
        setFinished(isFinished);
      }
    };

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      ScrollTrigger.refresh();
    });
    ro.observe(stage);
    document.fonts?.ready.then(layout);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      ro.disconnect();
    };
  }, [source, reduced]);

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
        data-intro-source={source?.kind ?? "pending"}
        className="relative"
        style={{ height: `${screens * 100}svh` }}
      >
        <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-ink [perspective:1400px]">
          <div ref={cameraRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.06)" }}>
            <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />
          </div>

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

          <div ref={titleParallaxRef} className="pointer-events-none absolute inset-0 z-20">
            <IntroTitle ref={titleRef} ready={!loaderVisible && ready} />
          </div>

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
          <div ref={revealRef} className="absolute inset-0 z-30 overflow-hidden bg-ink" style={{ visibility: "hidden" } as CSSProperties}>
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

          {source?.kind === "placeholder" && (
            <p className="pointer-events-none absolute top-[calc(var(--header-h)+0.75rem)] left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-paper/60 uppercase backdrop-blur">
              Intro provisória
            </p>
          )}

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
