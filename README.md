# Reis Prime Motors

Site do stand Reis Prime Motors: uma intro cinematográfica controlada pelo scroll e um stand com filtros.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Framer Motion

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## Estrutura

```
intro-desktop.mp4            vídeo da intro (16:9) — fonte dos frames
public/
  logo.svg                   logótipo vetorial (redesenhado a partir de brand/logo-original.jpg)
  intro/desktop|mobile/      frames WebP da intro (frame_0001.webp …) — gerados pelo script
  cars/<slug>/01..04.webp    fotos das viaturas (PROVISÓRIAS)
scripts/
  convert-intro.sh               vídeo → frames WebP (ffmpeg)
  generate-car-placeholders.mjs  gera fotos provisórias das viaturas
  build-brand-icons.mjs          extrai logótipos de marcas do simple-icons
src/
  app/                       página inicial, /carro/[slug], /api/leads
  components/intro/          canvas, carregamento, título, túnel provisório, transição dos faróis
  components/stand/          barra de marcas, filtros, painel móvel, grelha
  components/car/            cartão (tilt 3D), galeria, contactos, favoritos
  components/sections/       Porquê, Financiamento, Vender, marquee
  components/layout/         header, footer, smooth scroll (Lenis + GSAP), brilho do cursor
  config/intro.ts            posição dos faróis, tempos e intensidade dos efeitos
  config/site.ts             contactos, horário, redes sociais, WhatsApp
  data/cars.ts               viaturas de exemplo
  lib/intro-manifest.ts      conta os frames que existem em public/intro
  lib/cars-repository.ts     camada de dados (trocar aqui por uma API ou base de dados)
  lib/filters.ts             filtros ↔ URL, ordenação, contagens
```

## Intro: vídeo → frames

A intro é uma sequência de imagens desenhada num `<canvas>` e controlada **só pelo scroll**: o carro para quando o utilizador para e recua quando faz scroll para cima.

### Quando tiver (ou mudar) os vídeos

1. Coloque os vídeos na **raiz do projeto** com estes nomes:
   - `intro-desktop.mp4`: horizontal, 16:9 (obrigatório);
   - `intro-mobile.mp4`: vertical, 9:16 (opcional; sem ele, o telemóvel usa os frames desktop recortados ao centro).
2. Precisa do **ffmpeg** instalado (`brew install ffmpeg` no Mac, `sudo apt install ffmpeg` no Linux, ou `winget install ffmpeg` no Windows).
3. Na raiz do projeto, corra:
   ```bash
   npm run intro:frames
   ```
   O script gera `public/intro/desktop/frame_0001.webp …`, e `public/intro/mobile/…` se houver vídeo vertical:
   - desktop até 1920 px de largura e telemóvel até 1080 px (não aumenta vídeos mais pequenos, porque isso só criava ficheiros maiores sem mais detalhe);
   - WebP com qualidade 80;
   - todos os frames do vídeo se forem 120–180; se forem mais, reduz para 150.

   Opções: `FRAMES=150 QUALITY=80 UPSCALE=1 npm run intro:frames`.
4. Reinicie `npm run dev`, ou faça novo build/deploy. **Não é preciso mudar código**: o site conta os frames de cada pasta e a intro real substitui automaticamente a provisória.
5. Se o novo vídeo tiver os faróis noutro sítio, ajuste `headlights` em `src/config/intro.ts`. É a posição (0–1) de cada farol no último frame, e é daí que nascem as duas máscaras circulares que revelam o stand.

### Sem frames → intro provisória

Se `public/intro/desktop` e `public/intro/mobile` estiverem vazias, aparece uma intro provisória desenhada em canvas, com o mesmo scroll e a mesma transição: um túnel em perspetiva com LED no teto e dois faróis que crescem até ao flash branco. Para a ver mesmo com frames, abra `/?intro=provisoria`.

### Efeitos interativos

- **Rato ou inclinação do telemóvel:** parallax e ligeira rotação 3D da imagem; o canvas e o título mexem-se a velocidades diferentes. No iPhone, a inclinação só fica ativa depois do primeiro toque.
- **Velocidade do scroll:** quanto mais rápido, mais motion blur e aberração cromática nas bordas; ao parar, a imagem fica nítida.
- **Cursor:** um brilho de luz segue o rato, e o reflexo prateado de "REIS PRIME MOTORS" acompanha-o.
- Para ajustar intensidades, use `INTRO.fx` em `src/config/intro.ts`. Com "reduzir movimento" ativo, tudo isto fica desligado.

## Fotos das viaturas

As fotos em `public/cars/` são silhuetas provisórias, marcadas como "FOTO ILUSTRATIVA". Há duas formas de as trocar:
- substituir os ficheiros, mantendo o nome (`01.webp` é a foto principal);
- ou alterar o array `photos` de cada carro em `src/data/cars.ts`. Aceita caminhos locais, ou URLs de um CDN (neste caso, configure `images.remotePatterns` em `next.config.ts`).

## Ligar a um painel de administração / base de dados

O site só lê os dados através de `src/lib/cars-repository.ts` (`getCars`, `getCarBySlug`, `getSimilarCars`, `getAllSlugs`). Para passar a uma base de dados ou CMS, basta reescrever estas funções. O tipo `Car` (`src/types/car.ts`) corresponde a uma tabela.

Os formulários ("Pedir informações" e "Vendemos o seu carro") fazem `POST /api/leads` (`src/app/api/leads/route.ts`). Por agora o pedido é validado e registado no log do servidor. É aí que se liga o envio de email ou um CRM.

## Filtros no URL

Exemplo: `/?marca=bmw&combustivel=eletrico,gasolina&ano=2020-2023&preco=20000-60000&km=0-50000&caixa=automatica&tipo=suv,sedan&q=m340&ordem=preco-asc#stand`
