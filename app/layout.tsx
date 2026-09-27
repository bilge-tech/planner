import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aesthetic Life Dashboard & Planner",
  description: "Minimalist, aesthetic single-page life planner and daily dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-[#F4F8F9] text-[#243336] min-h-screen antialiased selection:bg-[#BCE2E6]/60 selection:text-[#1D4A50]">
        {children}
      </body>
    </html>
  );
}
