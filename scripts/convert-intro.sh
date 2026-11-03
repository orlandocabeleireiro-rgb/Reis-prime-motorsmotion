#!/usr/bin/env bash
# Converte os vídeos da intro em sequências de frames WebP para o canvas.
#
# Uso:
#   ./scripts/convert-intro.sh                      # usa ./intro-desktop.mp4 e ./intro-mobile.mp4
#   ./scripts/convert-intro.sh desktop.mp4 mobile.mp4
#
# Variáveis opcionais:
#   FRAMES=150   número de frames por sequência (120–180 recomendado)
#   QUALITY=80   qualidade WebP (0–100)
#
# No fim, atualize FRAME_COUNT em src/config/intro.ts se mudar FRAMES.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP_IN="${1:-$ROOT/intro-desktop.mp4}"
MOBILE_IN="${2:-$ROOT/intro-mobile.mp4}"
FRAMES="${FRAMES:-150}"
QUALITY="${QUALITY:-80}"

command -v ffmpeg >/dev/null || { echo "ffmpeg não encontrado"; exit 1; }

convert() {
  local input="$1" out="$2" width="$3"
  [ -f "$input" ] || { echo "Vídeo não encontrado: $input"; exit 1; }
  local duration
  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$input")"
  # fps necessário para obter exatamente $FRAMES frames ao longo do vídeo
  local fps
  fps="$(awk -v f="$FRAMES" -v d="$duration" 'BEGIN { printf "%.6f", f / d }')"
  rm -rf "$out" && mkdir -p "$out"
  echo "→ $input  (${duration}s)  →  $out  [$FRAMES frames, ${width}px, q$QUALITY]"
  ffmpeg -v error -stats -i "$input" \
    -vf "fps=$fps,scale=${width}:-2:flags=lanczos" \
    -frames:v "$FRAMES" \
    -c:v libwebp -quality "$QUALITY" -compression_level 6 -preset picture \
    "$out/frame_%04d.webp"
  echo "  $(ls "$out" | wc -l) frames, $(du -sh "$out" | cut -f1)"
}

convert "$DESKTOP_IN" "$ROOT/public/intro/desktop" 1920
convert "$MOBILE_IN"  "$ROOT/public/intro/mobile"  1080
echo "Concluído."
