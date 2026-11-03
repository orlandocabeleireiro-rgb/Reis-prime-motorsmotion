import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/config/site";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Stand de automóveis usados premium. Viaturas selecionadas e inspecionadas, garantia até 18 meses, financiamento à medida e retoma do seu carro.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: SITE.name,
    images: ["/brand/logo-original.jpg"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${unbounded.variable} ${inter.variable}`}>
      <body>
        <a
          href="#conteudo"
          className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink transition-transform focus:translate-y-0"
        >
          Saltar para o conteúdo
        </a>
        <SmoothScroll>
          <Header />
          <main id="conteudo">{children}</main>
          <Suspense>
            <Footer />
          </Suspense>
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
