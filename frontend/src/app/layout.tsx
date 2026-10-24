import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteBar } from "@/components/layout/site-bar";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Communauté Le Revenu",
    template: "%s · Communauté Le Revenu",
  },
  description:
    "Posez vos questions d’argent, partagez vos expériences et échangez avec la rédaction du Revenu : Bourse, épargne, impôts, retraite, transmission.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#161618" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow-raised">
          Aller au contenu
        </a>
        <SiteBar />
        <Header />
        {/* Single skip-link target: Next keeps the previous page mounted (hidden) for
            instant back navigation, so ids inside pages would be duplicated. */}
        <div id="contenu" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
