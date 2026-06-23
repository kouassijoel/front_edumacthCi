import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CookieBanner from "./component/cookie-banner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduMatch CI — Cours particuliers en Côte d'Ivoire",
  description: "Trouvez votre répétiteur idéal parmi 500+ professeurs qualifiés à Abidjan et partout en Côte d'Ivoire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${jakarta.className}`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
