/**
 * Gera fotos PROVISÓRIAS (silhuetas em estúdio) para cada viatura de src/data/cars.ts
 * em /public/cars/<slug>/01.webp … 04.webp.
 *
 * Para usar as fotos reais: substitua os ficheiros mantendo o nome, ou altere `photos` em cars.ts.
 * Uso:  node scripts/generate-car-placeholders.mjs        (Node ≥ 22.18, importa o .ts diretamente)
 */
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { CARS } from "../src/data/cars.ts";
import { BRAND_NAME } from "../src/data/brands.ts";

const W = 1600;
const H = 1000;
const OUT = new URL("../public/cars/", import.meta.url).pathname;

const PAINT = {
  preto: "#26282d", cinzento: "#4a4e55", azul: "#1f3f7a", branco: "#e8e9eb", prata: "#a7abb1",
  verde: "#1f4a37", vermelho: "#8f1a1d", laranja: "#c4561c", amarelo: "#d9a520",
};
const paintFor = (color) => {
  const key = Object.keys(PAINT).find((k) => color.toLowerCase().startsWith(k));
  return PAINT[key] ?? "#5a5e66";
};

function setup() {
  window.drawCar = ({ W, H, paint, body, shot, label }) => {
    const c = document.getElementById("c");
    c.width = W; c.height = H;
    const g = c.getContext("2d");

    // perfis simplificados por tipo de carroçaria [alturaTejadilho, inícioCabine, fimCabine, alturaCapô, comprimento]
    const P = {
      citadino: [0.62, 0.3, 0.82, 0.38, 0.66], utilitario: [0.56, 0.3, 0.85, 0.36, 0.74],
      sedan: [0.5, 0.33, 0.76, 0.34, 0.86], carrinha: [0.52, 0.31, 0.92, 0.34, 0.88],
      suv: [0.66, 0.3, 0.88, 0.44, 0.84], coupe: [0.42, 0.38, 0.8, 0.3, 0.82],
      descapotavel: [0.4, 0.4, 0.62, 0.34, 0.7],
    }[body];
    const [roof, cs, ce, hood, len] = P;

    // estúdio
    const lightX = [0.5, 0.25, 0.7, 0.5][shot];
    const bg = g.createRadialGradient(W * lightX, H * 0.25, 0, W * lightX, H * 0.4, W * 0.9);
    bg.addColorStop(0, shot === 1 ? "#3a3c40" : "#2b2d31");
    bg.addColorStop(0.55, "#141517");
    bg.addColorStop(1, "#08080a");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // chão
    const floorY = H * 0.74;
    const fl = g.createLinearGradient(0, floorY, 0, H);
    fl.addColorStop(0, "#1b1c1f"); fl.addColorStop(1, "#060607");
    g.fillStyle = fl; g.fillRect(0, floorY, W, H - floorY);
    // linhas de luz no teto (softbox)
    g.fillStyle = "rgba(255,255,255,0.05)";
    g.fillRect(W * 0.15, H * 0.06, W * 0.7, H * 0.012);

    // enquadramento por foto: 0 perfil, 1 perfil espelhado, 2 detalhe dianteiro, 3 detalhe traseiro
    const zoom = [1, 1, 1.9, 1.9][shot];
    const focus = [0.5, 0.5, 0.22, 0.8][shot];
    g.save();
    g.translate(W / 2, floorY);
    g.scale(zoom, zoom);
    g.translate(-W * focus, 0);
    if (shot === 1) { g.translate(W, 0); g.scale(-1, 1); }

    const L = W * len, x0 = (W - L) / 2, x1 = x0 + L;
    const groundY = 0, wheelR = L * 0.085;
    const baseY = -wheelR * 0.55;
    const unit = L * 0.33; // altura de referência
    const yRoof = baseY - unit * roof * 1.32;
    const yHood = baseY - unit * hood;
    const xCs = x0 + L * cs, xCe = x0 + L * ce;
    const xw1 = x0 + L * 0.19, xw2 = x0 + L * 0.81;

    // sombra
    const sh = g.createRadialGradient(W / 2, groundY, 0, W / 2, groundY, L * 0.6);
    sh.addColorStop(0, "rgba(0,0,0,0.85)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = sh; g.beginPath(); g.ellipse(W / 2, groundY, L * 0.6, L * 0.05, 0, 0, Math.PI * 2); g.fill();

    // carroçaria
    const bodyPath = new Path2D();
    bodyPath.moveTo(x0 + L * 0.01, baseY);
    bodyPath.bezierCurveTo(x0 - L * 0.01, baseY - unit * 0.2, x0, yHood + unit * 0.05, x0 + L * 0.06, yHood);
    bodyPath.lineTo(xCs - L * 0.04, yHood - unit * 0.05);
    bodyPath.bezierCurveTo(xCs + L * 0.06, yRoof + unit * 0.05, xCs + L * 0.08, yRoof, xCs + L * 0.16, yRoof);
    bodyPath.lineTo(xCe - L * 0.1, yRoof);
    bodyPath.bezierCurveTo(xCe - L * 0.02, yRoof, xCe, yHood - unit * 0.12, xCe + L * 0.04, yHood - unit * 0.08);
    bodyPath.bezierCurveTo(x1 - L * 0.01, yHood, x1 + L * 0.01, baseY - unit * 0.15, x1 - L * 0.01, baseY);
    bodyPath.closePath();
    const paintG = g.createLinearGradient(0, yRoof, 0, baseY);
    paintG.addColorStop(0, paint); paintG.addColorStop(0.35, "#ffffff"); paintG.addColorStop(0.37, paint);
    paintG.addColorStop(0.75, paint); paintG.addColorStop(1, "#050505");
    g.fillStyle = paint; g.fill(bodyPath);
    g.globalAlpha = 0.35; g.fillStyle = paintG; g.fill(bodyPath); g.globalAlpha = 1;
    // sombra inferior
    const lower = g.createLinearGradient(0, baseY - unit * 0.3, 0, baseY);
    lower.addColorStop(0, "rgba(0,0,0,0)"); lower.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = lower; g.fill(bodyPath);
    // vidros
    g.fillStyle = "rgba(12,14,18,0.92)";
    g.beginPath();
    g.moveTo(xCs, yHood - unit * 0.07);
    g.bezierCurveTo(xCs + L * 0.07, yRoof + unit * 0.1, xCs + L * 0.09, yRoof + unit * 0.06, xCs + L * 0.16, yRoof + unit * 0.06);
    g.lineTo(xCe - L * 0.11, yRoof + unit * 0.06);
    g.bezierCurveTo(xCe - L * 0.05, yRoof + unit * 0.06, xCe - L * 0.03, yHood - unit * 0.1, xCe, yHood - unit * 0.1);
    g.closePath(); g.fill();
    // reflexo prateado na linha de cintura
    g.strokeStyle = "rgba(230,232,236,0.55)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 + L * 0.07, yHood + 4); g.lineTo(x1 - L * 0.06, yHood - unit * 0.04); g.stroke();
    // farol / farolim
    g.fillStyle = "#f2f6ff"; g.beginPath(); g.ellipse(x0 + L * 0.035, yHood + unit * 0.07, L * 0.022, unit * 0.035, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c21b22"; g.fillRect(x1 - L * 0.03, yHood - unit * 0.04, L * 0.022, unit * 0.06);
    // rodas
    for (const wx of [xw1, xw2]) {
      g.fillStyle = "#050505"; g.beginPath(); g.arc(wx, groundY - wheelR, wheelR * 1.12, Math.PI, 0); g.fill();
      g.fillStyle = "#0b0b0c"; g.beginPath(); g.arc(wx, groundY - wheelR, wheelR, 0, Math.PI * 2); g.fill();
      const rim = g.createRadialGradient(wx - wheelR * 0.2, groundY - wheelR * 1.2, 0, wx, groundY - wheelR, wheelR * 0.7);
      rim.addColorStop(0, "#e9ebee"); rim.addColorStop(0.6, "#8a8d91"); rim.addColorStop(1, "#2a2b2e");
      g.fillStyle = rim; g.beginPath(); g.arc(wx, groundY - wheelR, wheelR * 0.68, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#151517"; g.lineWidth = wheelR * 0.09;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        g.beginPath(); g.moveTo(wx, groundY - wheelR);
        g.lineTo(wx + Math.cos(a) * wheelR * 0.66, groundY - wheelR + Math.sin(a) * wheelR * 0.66); g.stroke();
      }
      g.fillStyle = "#1a1a1c"; g.beginPath(); g.arc(wx, groundY - wheelR, wheelR * 0.14, 0, Math.PI * 2); g.fill();
    }
    // reflexo no chão
    g.save(); g.scale(1, -0.25); g.globalAlpha = 0.12; g.fillStyle = paint; g.fill(bodyPath); g.restore();
    g.restore();

    // vinheta
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.7)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // legenda
    g.font = "600 22px system-ui, sans-serif";
    g.fillStyle = "rgba(245,245,245,0.38)";
    g.fillText(label.toUpperCase(), 48, H - 52);
    g.font = "500 16px system-ui, sans-serif";
    g.fillStyle = "rgba(245,245,245,0.22)";
    g.fillText("FOTO ILUSTRATIVA", W - 220, H - 52);
    return c.toDataURL("image/png");
  };
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
await page.evaluate(setup);

for (const car of CARS) {
  const dir = join(OUT, car.slug);
  mkdirSync(dir, { recursive: true });
  for (let shot = 0; shot < car.photos.length; shot++) {
    const data = await page.evaluate((o) => window.drawCar(o), {
      W, H, paint: paintFor(car.color), body: car.body, shot,
      label: `${BRAND_NAME[car.brand]} ${car.model} · ${car.version}`,
    });
    await sharp(Buffer.from(data.split(",")[1], "base64"))
      .webp({ quality: 78 })
      .toFile(join(dir, `${String(shot + 1).padStart(2, "0")}.webp`));
  }
  console.log("✓", car.slug);
}
await browser.close();
