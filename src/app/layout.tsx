import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Carhire Marketplace",
    template: "%s | Carhire Marketplace",
  },
  description:
    "A secure Australian car rental lead marketplace for verified rental operators and fleet businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 text-slate-950 font-sans tracking-tight">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
