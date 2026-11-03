#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Converte os vídeos da intro em sequências de frames WebP para o <canvas>.
#
#   intro-desktop.mp4 (16:9)  →  public/intro/desktop/frame_0001.webp …
#   intro-mobile.mp4  (9:16)  →  public/intro/mobile/frame_0001.webp …   (opcional)
#
# Uso (na raiz do projeto):
#   npm run intro:frames
#   ./scripts/convert-intro.sh [video-desktop.mp4] [video-mobile.mp4]
#
# Variáveis opcionais:
#   FRAMES=150    nº de frames por sequência. Por omissão usa todos os frames do vídeo
#                 se forem 120–180; se forem mais, reduz para 150.
#   QUALITY=80    qualidade WebP (0–100)
#   DESKTOP_WIDTH=1920  MOBILE_WIDTH=1080   largura máxima
#   UPSCALE=1     permite aumentar vídeos mais pequenos que a largura máxima
#                 (por omissão não aumenta: só cria ficheiros maiores, sem mais detalhe)
#
# Não é preciso mudar código: o site conta os frames que estão em cada pasta.
# Se não houver vídeo de telemóvel, o telemóvel usa os frames desktop (recortados ao centro).
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP_IN="${1:-$ROOT/intro-desktop.mp4}"
MOBILE_IN="${2:-$ROOT/intro-mobile.mp4}"
QUALITY="${QUALITY:-80}"
DESKTOP_WIDTH="${DESKTOP_WIDTH:-1920}"
MOBILE_WIDTH="${MOBILE_WIDTH:-1080}"

command -v ffmpeg >/dev/null || { echo "✗ ffmpeg não encontrado. Instale com: brew install ffmpeg  |  sudo apt install ffmpeg"; exit 1; }

convert() {
  local input="$1" out="$2" max_width="$3"

  local src_w src_frames duration
  src_w="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$input")"
  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$input")"
  src_frames="$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$input")"

  # nº de frames: todos (120–180), ou reduzir para 150 se o vídeo tiver muitos
  local frames="${FRAMES:-}"
  if [ -z "$frames" ]; then
    if [ "$src_frames" -gt 180 ]; then frames=150; else frames="$src_frames"; fi
  fi
  [ "$frames" -lt 120 ] && echo "  ⚠ só $frames frames (recomendado 120–180). Funciona, mas o scroll fica menos fluido."

  # largura: não aumentar acima do original (salvo UPSCALE=1)
  local width="$max_width"
  if [ "${UPSCALE:-0}" != "1" ] && [ "$src_w" -lt "$max_width" ]; then width="$src_w"; fi

  local vf
  if [ "$frames" -ge "$src_frames" ]; then
    vf="scale=${width}:-2:flags=lanczos"
  else
    local fps
    fps="$(awk -v f="$frames" -v d="$duration" 'BEGIN { printf "%.6f", f / d }')"
    vf="fps=${fps},scale=${width}:-2:flags=lanczos"
  fi

  rm -rf "$out" && mkdir -p "$out"
  echo "→ $(basename "$input")  ${src_w}px · ${src_frames} frames · ${duration}s"
  echo "  a gerar ${frames} frames WebP a ${width}px (q${QUALITY}) em ${out#$ROOT/}"
  ffmpeg -v error -i "$input" -vf "$vf" -frames:v "$frames" -an \
    -c:v libwebp -quality "$QUALITY" -compression_level 6 -preset picture \
    "$out/frame_%04d.webp"
  echo "  ✓ $(ls "$out" | wc -l | tr -d ' ') frames, $(du -sh "$out" | cut -f1)"
}

found=0
if [ -f "$DESKTOP_IN" ]; then
  convert "$DESKTOP_IN" "$ROOT/public/intro/desktop" "$DESKTOP_WIDTH"; found=1
else
  echo "• Sem vídeo desktop ($DESKTOP_IN) — a pasta public/intro/desktop não foi alterada."
fi

if [ -f "$MOBILE_IN" ]; then
  convert "$MOBILE_IN" "$ROOT/public/intro/mobile" "$MOBILE_WIDTH"; found=1
else
  echo "• Sem vídeo de telemóvel ($(basename "$MOBILE_IN")) — o telemóvel vai usar os frames desktop."
fi

[ "$found" = 1 ] || { echo "✗ Nenhum vídeo encontrado. Coloque intro-desktop.mp4 (e opcionalmente intro-mobile.mp4) na raiz."; exit 1; }
echo
echo "Concluído. Reinicie 'npm run dev' (ou faça novo build/deploy) — a intro real substitui a provisória automaticamente."
