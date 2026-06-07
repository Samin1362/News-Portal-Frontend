import type { Metadata, Viewport } from "next";
import { Inter, Kalam, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers/Providers";
import { WebVitals } from "@/components/analytics/WebVitals";

// Cloudinary serves every article image; preconnecting shaves the TLS/DNS
// round-trip off the first image fetch (Phase 6 — Performance). The API
// origin is the next hop for client-side data, so we warm its DNS too.
const CLOUDINARY_ORIGIN = "https://res.cloudinary.com";
const API_ORIGIN = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_BASE_URL ??
        "https://news-portal-backend-kxsj.onrender.com",
    ).origin;
  } catch {
    return null;
  }
})();

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-serif-google",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans-google",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-hand-google",
});

export const metadata: Metadata = {
  title: {
    default: "Deligo · Daily News",
    template: "%s · Deligo",
  },
  description:
    "Deligo — modern news portal: breaking news, in-depth reporting, multimedia stories, and editorial commentary.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  openGraph: {
    siteName: "Deligo",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${kalam.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href={CLOUDINARY_ORIGIN} crossOrigin="" />
        <link rel="dns-prefetch" href={CLOUDINARY_ORIGIN} />
        {API_ORIGIN ? (
          <>
            <link rel="preconnect" href={API_ORIGIN} />
            <link rel="dns-prefetch" href={API_ORIGIN} />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <WebVitals />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
