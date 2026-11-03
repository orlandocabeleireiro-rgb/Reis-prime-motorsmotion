/**
 * Gera vídeos PROVISÓRIOS da intro (túnel + carro escuro com dois faróis a aproximar-se
 * até a imagem ficar branca), para testar o pipeline enquanto os vídeos reais
 * (intro-desktop.mp4 / intro-mobile.mp4) não estão no projeto.
 *
 * Uso:  node scripts/generate-placeholder-intro.mjs <pasta-de-saída>
 * Depois: ./scripts/convert-intro.sh <saída>/intro-desktop.mp4 <saída>/intro-mobile.mp4
 *
 * Os faróis terminam nas posições definidas em src/config/intro.ts (HEADLIGHTS).
 */
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const outDir = process.argv[2] ?? "./.placeholder-intro";
const FRAMES = 150;
const FPS = 30;

const variants = [
  { name: "desktop", w: 1920, h: 1080 },
  { name: "mobile", w: 1080, h: 1920 },
];

function drawScene() {
  /* executado no browser */
  window.drawFrame = (W, H, t) => {
    const c = document.getElementById("c");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const portrait = H > W;
    const cx = W / 2;
    const vy = H * 0.47; // ponto de fuga
    const ease = (x) => x * x * (3 - 2 * x);
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

    // fundo
    g.fillStyle = "#050506";
    g.fillRect(0, 0, W, H);

    // estrada
    const road = g.createLinearGradient(0, vy, 0, H);
    road.addColorStop(0, "#0b0b0d");
    road.addColorStop(1, "#151619");
    g.fillStyle = road;
    g.beginPath();
    g.moveTo(cx - W * 0.02, vy);
    g.lineTo(cx + W * 0.02, vy);
    g.lineTo(W * 1.6, H);
    g.lineTo(-W * 0.6, H);
    g.fill();

    // marcas da estrada a deslizar
    g.strokeStyle = "rgba(220,224,230,0.25)";
    for (let i = 0; i < 14; i++) {
      const p = ((i / 14 + t * 2.2) % 1) ** 2.4;
      const y = vy + (H - vy) * p;
      const len = (H - vy) * 0.05 * (0.2 + p * 2);
      g.lineWidth = 1 + p * 10;
      g.beginPath();
      g.moveTo(cx, y);
      g.lineTo(cx, Math.min(H, y + len));
      g.stroke();
    }

    // portal do túnel
    const tw = (portrait ? W * 0.95 : W * 0.5) * (1 + t * 1.6);
    const th = tw * 0.62;
    const tx = cx - tw / 2;
    const ty = vy - th * 0.62;
    // interior iluminado
    const inner = g.createRadialGradient(cx, vy, 0, cx, vy, tw * 0.6);
    inner.addColorStop(0, "rgba(255,226,180,0.55)");
    inner.addColorStop(0.35, "rgba(140,110,80,0.25)");
    inner.addColorStop(1, "rgba(10,10,12,0.0)");
    g.save();
    g.beginPath();
    g.moveTo(tx, vy + th * 0.38);
    g.lineTo(tx, ty + th * 0.5);
    g.ellipse(cx, ty + th * 0.5, tw / 2, th * 0.5, 0, Math.PI, 0);
    g.lineTo(tx + tw, vy + th * 0.38);
    g.closePath();
    g.fillStyle = "#0d0c0b";
    g.fill();
    g.clip();
    g.fillStyle = inner;
    g.fillRect(tx, ty, tw, th * 1.4);
    // luzes do teto do túnel a passar
    for (let i = 0; i < 18; i++) {
      const p = ((i / 18 + t * 1.5) % 1) ** 2;
      const y = vy - (vy - ty) * p * 0.95;
      const half = tw * 0.05 + tw * 0.4 * p;
      g.fillStyle = `rgba(255,236,200,${0.15 + p * 0.5})`;
      g.fillRect(cx - half, y, half * 0.25, 2 + p * 6);
      g.fillRect(cx + half * 0.75, y, half * 0.25, 2 + p * 6);
    }
    g.restore();
    // aro do portal
    g.strokeStyle = "rgba(160,163,168,0.35)";
    g.lineWidth = 3 + t * 8;
    g.beginPath();
    g.moveTo(tx, vy + th * 0.38);
    g.lineTo(tx, ty + th * 0.5);
    g.ellipse(cx, ty + th * 0.5, tw / 2, th * 0.5, 0, Math.PI, 0);
    g.lineTo(tx + tw, vy + th * 0.38);
    g.stroke();

    // ---- carro ----
    // separação final entre faróis = 0.36 * W (ver HEADLIGHTS em src/config/intro.ts)
    const finalSep = W * 0.36;
    const finalY = H * 0.56;
    const k = ease(clamp(t / 0.86));
    const growth = Math.pow(k, 2.3);
    const sep = finalSep * (0.07 + 0.93 * growth);
    const carW = sep / 0.72;
    const carH = carW * 0.42;
    const ly = vy + (finalY - vy) * growth + carH * 0.05 * (1 - growth);
    const bodyTop = ly - carH * 0.55;

    // sombra
    g.fillStyle = "rgba(0,0,0,0.65)";
    g.beginPath();
    g.ellipse(cx, ly + carH * 0.42, carW * 0.62, carH * 0.12, 0, 0, Math.PI * 2);
    g.fill();

    // carroçaria
    const body = g.createLinearGradient(0, bodyTop, 0, ly + carH * 0.4);
    body.addColorStop(0, "#1d1e21");
    body.addColorStop(0.45, "#0c0c0e");
    body.addColorStop(1, "#050505");
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(cx - carW * 0.5, ly + carH * 0.38);
    g.bezierCurveTo(cx - carW * 0.53, ly - carH * 0.1, cx - carW * 0.46, ly - carH * 0.25, cx - carW * 0.36, ly - carH * 0.3);
    g.bezierCurveTo(cx - carW * 0.26, bodyTop - carH * 0.25, cx + carW * 0.26, bodyTop - carH * 0.25, cx + carW * 0.36, ly - carH * 0.3);
    g.bezierCurveTo(cx + carW * 0.46, ly - carH * 0.25, cx + carW * 0.53, ly - carH * 0.1, cx + carW * 0.5, ly + carH * 0.38);
    g.closePath();
    g.fill();
    // aresta prateada
    g.strokeStyle = "rgba(217,220,224,0.35)";
    g.lineWidth = Math.max(1, carW * 0.004);
    g.stroke();
    // para-brisas
    g.fillStyle = "rgba(60,64,70,0.55)";
    g.beginPath();
    g.moveTo(cx - carW * 0.27, ly - carH * 0.5);
    g.quadraticCurveTo(cx, bodyTop - carH * 0.2, cx + carW * 0.27, ly - carH * 0.5);
    g.lineTo(cx + carW * 0.2, bodyTop - carH * 0.1);
    g.quadraticCurveTo(cx, bodyTop - carH * 0.22, cx - carW * 0.2, bodyTop - carH * 0.1);
    g.closePath();
    g.fill();
    // entradas de ar
    g.fillStyle = "#020202";
    g.fillRect(cx - carW * 0.3, ly + carH * 0.12, carW * 0.6, carH * 0.14);

    // faróis
    const hlR = carW * 0.075;
    const glow = clamp((t - 0.68) / 0.3) ** 2;
    for (const s of [-1, 1]) {
      const hx = cx + s * sep / 2;
      const halo = g.createRadialGradient(hx, ly, 0, hx, ly, hlR * (2.5 + glow * 22));
      halo.addColorStop(0, `rgba(255,255,255,${0.9})`);
      halo.addColorStop(0.15, `rgba(230,240,255,${0.3 + glow * 0.6})`);
      halo.addColorStop(1, "rgba(200,220,255,0)");
      g.fillStyle = halo;
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(hx, ly, hlR, hlR * 0.85, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = hlR * 0.15;
      g.beginPath();
      g.ellipse(hx, ly, hlR * 1.25, hlR * 1.05, 0, 0, Math.PI * 2);
      g.stroke();
    }

    // branco final
    const white = clamp((t - 0.82) / 0.16) ** 1.6;
    if (white > 0) {
      g.fillStyle = `rgba(255,255,255,${white})`;
      g.fillRect(0, 0, W, H);
    }
    return c.toDataURL("image/png");
  };
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
await page.evaluate(drawScene);

mkdirSync(outDir, { recursive: true });
for (const v of variants) {
  const tmp = join(outDir, `png-${v.name}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  for (let i = 0; i < FRAMES; i++) {
    const t = i / (FRAMES - 1);
    const data = await page.evaluate(([W, H, t]) => window.drawFrame(W, H, t), [v.w, v.h, t]);
    writeFileSync(join(tmp, `f_${String(i).padStart(4, "0")}.png`), Buffer.from(data.split(",")[1], "base64"));
  }
  const mp4 = join(outDir, `intro-${v.name}.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(tmp, "f_%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", mp4]);
  rmSync(tmp, { recursive: true, force: true });
  console.log("✓", mp4);
}
await browser.close();
