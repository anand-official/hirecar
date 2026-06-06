import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
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
    default: "Hire Car Marketplace — Australia's Trusted Car Rental Platform",
    template: "%s | Hire Car Marketplace",
  },
  description:
    "Australia's trusted marketplace for verified car rental operators. Compare vehicles from independent fleet owners for your next journey. No booking fees, direct contact with vendors.",
  keywords: ["car rental", "car hire", "Australia", "Sydney", "Melbourne", "Brisbane", "Perth", "rental marketplace"],
  metadataBase: new URL("https://www.hirecar.com.au"),
  alternates: {
    canonical: "/",
  },
  // Removed duplicate blocks
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://www.hirecar.com.au",
    siteName: "Hire Car Marketplace",
    title: "Hire Car Marketplace — Australia's Trusted Car Rental Platform",
    description:
      "Compare vehicles from verified Australian rental operators. Transparent pricing, instant enquiries, zero hidden fees.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hire Car Marketplace — Premium Car Rental in Australia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire Car Marketplace — Australia's Trusted Car Rental Platform",
    description:
      "Compare vehicles from verified Australian rental operators. Transparent pricing, zero hidden fees.",
    images: ["/og-image.jpg"],
    creator: "@hirecarau",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
