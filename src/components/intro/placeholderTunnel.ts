/**
 * Intro PROVISÓRIA desenhada em canvas, usada enquanto não há frames em public/intro.
 *
 * Túnel escuro em perspetiva, com faixas e barras de LED no teto, e dois faróis
 * que nascem pequenos ao fundo e crescem até ficarem "colados" ao ecrã
 * (bloom + flash branco no fim). Tudo depende só de `f` (progresso do scroll):
 * para quando o scroll para e recua quando se faz scroll para cima.
 *
 * Projeção simples: x = cx + (X - camX) / d * F, y = cy + (Y - camY) / d * F
 * Como os objetos mais próximos se deslocam mais com a câmara, o parallax do
 * rato cria camadas a velocidades diferentes (LED do teto vs. fundo do túnel).
 */

type Point = { x: number; y: number };

export interface TunnelInput {
  /** progresso 0 → 1 */
  f: number;
  /** parallax da câmara (-1 → 1) */
  mx: number;
  my: number;
  /** posição final dos faróis, relativa ao ecrã (0–1) */
  lights: readonly Point[];
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function drawTunnel(ctx: CanvasRenderingContext2D, W: number, H: number, input: TunnelInput) {
  const { f, lights } = input;
  const cx = W / 2;
  const cy = H * 0.46;
  const F = Math.max(W, H * 0.9) * 0.58; // distância focal
  const camX = input.mx * 0.16;
  const camY = input.my * 0.08;
  const travel = f * 7; // a câmara avança pelo túnel (LED a passar)

  const TW = 1; // meia largura do túnel
  const TOP = -0.62; // teto
  const BOT = 0.5; // chão
  const D_NEAR = 0.22;
  const D_FAR = 34;

  const px = (X: number, d: number) => cx + ((X - camX) / d) * F;
  const py = (Y: number, d: number) => cy + ((Y - camY) / d) * F;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#030303";
  ctx.fillRect(0, 0, W, H);

  // ---- superfícies (paredes, teto, chão)
  const quad = (pts: [number, number][], fill: string | CanvasGradient) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const vx = px(0, D_FAR);
  const vy = py(0, D_FAR);

  const wallGrad = (x0: number) => {
    const g = ctx.createLinearGradient(x0 < cx ? Math.max(x0, 0) : Math.min(x0, W), 0, vx, 0);
    g.addColorStop(0, "#34363b");
    g.addColorStop(0.45, "#1a1b1e");
    g.addColorStop(0.85, "#08080a");
    g.addColorStop(1, "#030303");
    return g;
  };
  // parede esquerda / direita
  quad(
    [
      [px(-TW, D_NEAR), py(TOP, D_NEAR)],
      [px(-TW, D_FAR), py(TOP, D_FAR)],
      [px(-TW, D_FAR), py(BOT, D_FAR)],
      [px(-TW, D_NEAR), py(BOT, D_NEAR)],
    ],
    wallGrad(px(-TW, 1)),
  );
  quad(
    [
      [px(TW, D_NEAR), py(TOP, D_NEAR)],
      [px(TW, D_FAR), py(TOP, D_FAR)],
      [px(TW, D_FAR), py(BOT, D_FAR)],
      [px(TW, D_NEAR), py(BOT, D_NEAR)],
    ],
    wallGrad(px(TW, 1)),
  );
  // teto
  const ceilG = ctx.createLinearGradient(0, py(TOP, 1), 0, vy);
  ceilG.addColorStop(0, "#1e2023");
  ceilG.addColorStop(1, "#030303");
  quad(
    [
      [px(-TW, D_NEAR), py(TOP, D_NEAR)],
      [px(TW, D_NEAR), py(TOP, D_NEAR)],
      [px(TW, D_FAR), py(TOP, D_FAR)],
      [px(-TW, D_FAR), py(TOP, D_FAR)],
    ],
    ceilG,
  );
  // chão molhado
  const floorG = ctx.createLinearGradient(0, py(BOT, 1), 0, vy);
  floorG.addColorStop(0, "#26282c");
  floorG.addColorStop(0.55, "#101113");
  floorG.addColorStop(1, "#030303");
  quad(
    [
      [px(-TW, D_NEAR), py(BOT, D_NEAR)],
      [px(TW, D_NEAR), py(BOT, D_NEAR)],
      [px(TW, D_FAR), py(BOT, D_FAR)],
      [px(-TW, D_FAR), py(BOT, D_FAR)],
    ],
    floorG,
  );

  // luz ao fundo do túnel
  const endGlow = ctx.createRadialGradient(vx, vy, 0, vx, vy, F * 0.12);
  endGlow.addColorStop(0, "rgba(190,200,215,0.18)");
  endGlow.addColorStop(1, "rgba(190,200,215,0)");
  ctx.fillStyle = endGlow;
  ctx.fillRect(vx - F * 0.12, vy - F * 0.12, F * 0.24, F * 0.24);

  // ---- juntas dos painéis nas paredes e linhas da estrada (a passar com o scroll)
  const spacing = 1.6;
  const phase = travel % spacing;
  ctx.lineWidth = 1;
  for (let k = 0; k < 22; k++) {
    const d = k * spacing - phase + 0.6;
    if (d < D_NEAR || d > D_FAR) continue;
    const a = Math.min(0.22, 0.6 / d);
    ctx.strokeStyle = `rgba(200,205,212,${a * 0.6})`;
    for (const side of [-TW, TW]) {
      ctx.beginPath();
      ctx.moveTo(px(side, d), py(TOP, d));
      ctx.lineTo(px(side, d), py(BOT, d));
      ctx.stroke();
    }
    // tracejado central
    const d2 = d + 0.5;
    ctx.strokeStyle = `rgba(220,224,230,${a})`;
    ctx.lineWidth = Math.max(1, (0.025 / d) * F);
    ctx.beginPath();
    ctx.moveTo(px(0, d), py(BOT, d));
    ctx.lineTo(px(0, d2), py(BOT, d2));
    ctx.stroke();
    ctx.lineWidth = 1;
  }
  // linhas laterais contínuas da estrada
  ctx.strokeStyle = "rgba(220,224,230,0.18)";
  for (const lx of [-0.72, 0.72]) {
    ctx.beginPath();
    ctx.moveTo(px(lx, D_NEAR), py(BOT, D_NEAR));
    ctx.lineTo(px(lx, D_FAR), py(BOT, D_FAR));
    ctx.stroke();
  }

  // ---- LED do teto (camada mais próxima: mexe-se mais com o rato)
  ctx.globalCompositeOperation = "lighter";
  const ledStrip = (X: number) => {
    for (const [w, a] of [
      [26, 0.06],
      [9, 0.22],
      [3, 1],
    ] as const) {
      const g = ctx.createLinearGradient(px(X, 0.8), py(TOP, 0.8), vx, vy);
      g.addColorStop(0, `rgba(235,242,255,${a})`);
      g.addColorStop(0.75, `rgba(235,242,255,${a * 0.55})`);
      g.addColorStop(1, "rgba(235,242,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = (w * F) / 900;
      ctx.beginPath();
      ctx.moveTo(px(X, D_NEAR), py(TOP + 0.005, D_NEAR));
      ctx.lineTo(px(X, D_FAR), py(TOP + 0.005, D_FAR));
      ctx.stroke();
    }
  };
  ledStrip(-0.46);
  ledStrip(0.46);

  // barras transversais de LED a passar
  const ledSpacing = 2.4;
  const ledPhase = travel % ledSpacing;
  for (let k = 0; k < 16; k++) {
    const d = k * ledSpacing - ledPhase + 0.35;
    if (d < D_NEAR || d > D_FAR) continue;
    const depthFade = clamp01(1.4 - d / 24);
    const x0 = px(-0.32, d);
    const x1 = px(0.32, d);
    const y = py(TOP + 0.004, d);
    const thick = Math.max(1, (0.022 / d) * F);
    ctx.fillStyle = `rgba(240,245,255,${0.12 * depthFade})`;
    ctx.fillRect(x0 - thick * 2, y - thick * 2.5, x1 - x0 + thick * 4, thick * 6);
    ctx.fillStyle = `rgba(250,252,255,${0.9 * depthFade})`;
    ctx.fillRect(x0, y - thick / 2, x1 - x0, thick);
    // reflexo no chão molhado
    ctx.fillStyle = `rgba(220,230,245,${0.06 * depthFade})`;
    ctx.fillRect(x0, py(BOT, d) - thick, x1 - x0, thick * 2);
  }
  ctx.globalCompositeOperation = "source-over";

  // ---- carro e faróis
  const D_END = 0.9;
  const D_START = 30;
  const e = Math.pow(f, 2.35);
  const dc = 1 / (1 / D_START + (1 / D_END - 1 / D_START) * e);
  // posição mundial dos faróis para acabarem exatamente nas posições configuradas
  const world = lights.map((l) => ({ X: ((l.x * W - cx) / F) * D_END, Y: ((l.y * H - cy) / F) * D_END }));
  const hl = world.map((w) => ({ x: px(w.X + camX * (1 - smooth(0.7, 1, f)), dc), y: py(w.Y + camY * (1 - smooth(0.7, 1, f)), dc) }));
  const sep = Math.abs(world[1].X - world[0].X);
  const r = ((sep * 0.11) / dc) * F; // raio do farol no ecrã
  const midX = (hl[0].x + hl[1].x) / 2;
  const midY = (hl[0].y + hl[1].y) / 2;

  // carroçaria escura (oculta o túnel atrás)
  const bw = ((sep * 1.45) / dc) * F;
  const bh = ((sep * 0.62) / dc) * F;
  ctx.fillStyle = "#050506";
  ctx.beginPath();
  ctx.roundRect(midX - bw / 2, midY - bh * 0.55, bw, bh, bh * 0.35);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,205,212,0.18)";
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.ellipse(midX, midY - bh * 0.5, bw * 0.36, bh * 0.25, 0, Math.PI, 0);
  ctx.stroke();

  const glow = smooth(0.55, 1, f);
  ctx.globalCompositeOperation = "lighter";
  for (const h of hl) {
    // reflexo no chão molhado (faixa vertical)
    const floorY = py(BOT, dc);
    const refl = ctx.createLinearGradient(0, h.y, 0, Math.min(H, floorY + (floorY - h.y) * 3));
    refl.addColorStop(0, "rgba(230,238,255,0.0)");
    refl.addColorStop(0.3, `rgba(230,238,255,${0.22 + glow * 0.3})`);
    refl.addColorStop(1, "rgba(230,238,255,0)");
    ctx.fillStyle = refl;
    ctx.fillRect(h.x - r * 0.9, h.y, r * 1.8, H);
    // halo
    const haloR = r * (2.6 + glow * 6);
    const halo = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, haloR);
    halo.addColorStop(0, "rgba(255,255,255,0.95)");
    halo.addColorStop(0.18, `rgba(225,235,255,${0.35 + glow * 0.45})`);
    halo.addColorStop(1, "rgba(200,215,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(h.x - haloR, h.y - haloR, haloR * 2, haloR * 2);
  }
  ctx.globalCompositeOperation = "source-over";
  for (const h of hl) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, r * 1.32, r * 1.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ---- bloom final + flash branco
  const bloom = smooth(0.8, 1, f);
  if (bloom > 0) {
    ctx.globalCompositeOperation = "lighter";
    for (const h of hl) {
      const R = Math.max(W, H) * (0.25 + bloom * 0.9);
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, R);
      g.addColorStop(0, `rgba(255,255,255,${0.6 * bloom})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = "source-over";
  }
  const white = Math.pow(smooth(0.9, 1, f), 1.5);
  if (white > 0) {
    ctx.fillStyle = `rgba(255,255,255,${white})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
