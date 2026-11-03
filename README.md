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
public/
  logo.svg                   logótipo vetorial (redesenhado a partir de brand/logo-original.jpg)
  brand/logo-original.jpg    logótipo original
  intro/desktop|mobile/      frames WebP da intro (frame_0001.webp …)
  cars/<slug>/01..04.webp    fotos das viaturas (PROVISÓRIAS)
scripts/
  convert-intro.sh               vídeo → frames WebP (ffmpeg)
  generate-placeholder-intro.mjs gera uma intro provisória (túnel + faróis)
  generate-car-placeholders.mjs  gera fotos provisórias das viaturas
  build-brand-icons.mjs          extrai logótipos de marcas do simple-icons
src/
  app/                       página inicial, /carro/[slug], /api/leads
  components/intro/          canvas, carregamento, título, transição dos faróis
  components/stand/          barra de marcas, filtros, painel móvel, grelha
  components/car/            cartão, galeria, contactos, favoritos
  components/sections/       Porquê, Financiamento, Vender, marquee
  components/layout/         header, footer, smooth scroll (Lenis + GSAP)
  config/intro.ts            nº de frames, posição dos faróis, tempos
  config/site.ts             contactos, horário, redes sociais, WhatsApp
  data/cars.ts               viaturas de exemplo
  lib/cars-repository.ts     camada de dados (trocar aqui por uma API ou base de dados)
  lib/filters.ts             filtros ↔ URL, ordenação, contagens
```

## Usar os vídeos reais da intro

1. Coloque `intro-desktop.mp4` (16:9) e `intro-mobile.mp4` (9:16) na raiz do projeto.
2. Corra `npm run intro:frames`. O script gera 150 frames por omissão: desktop a 1920 px, mobile a 1080 px, WebP q80. Pode mudar com `FRAMES=180 QUALITY=80 npm run intro:frames`.
3. Em `src/config/intro.ts`:
   - `frameCount` tem de ser igual ao número de frames gerados;
   - `headlights`: posição de cada farol (0–1, relativa ao frame) no momento em que a imagem fica branca. É daí que nascem as duas máscaras circulares da transição;
   - `posterFrame`: o frame mostrado a quem tem "reduzir movimento" ativo.

Os frames que estão agora em `public/intro` são **provisórios**. Foram gerados por `npm run intro:placeholder` porque os vídeos ainda não estavam no repositório.

## Fotos das viaturas

As fotos em `public/cars/` são silhuetas provisórias, marcadas como "FOTO ILUSTRATIVA". Há duas formas de as trocar:
- substituir os ficheiros, mantendo o nome (`01.webp` é a foto principal);
- ou alterar o array `photos` de cada carro em `src/data/cars.ts`. Aceita caminhos locais, ou URLs de um CDN (neste caso, configure `images.remotePatterns` em `next.config.ts`).

## Ligar a um painel de administração / base de dados

O site só lê os dados através de `src/lib/cars-repository.ts` (`getCars`, `getCarBySlug`, `getSimilarCars`, `getAllSlugs`). Para passar a uma base de dados ou CMS, basta reescrever estas funções. O tipo `Car` (`src/types/car.ts`) corresponde a uma tabela.

Os formulários ("Pedir informações" e "Vendemos o seu carro") fazem `POST /api/leads` (`src/app/api/leads/route.ts`). Por agora o pedido é validado e registado no log do servidor. É aí que se liga o envio de email ou um CRM.

## Filtros no URL

Exemplo: `/?marca=bmw&combustivel=eletrico,gasolina&ano=2020-2023&preco=20000-60000&km=0-50000&caixa=automatica&tipo=suv,sedan&q=m340&ordem=preco-asc#stand`
