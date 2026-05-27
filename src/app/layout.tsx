import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 text-slate-950 font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
