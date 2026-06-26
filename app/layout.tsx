import type { Metadata } from "next";
import { Sora, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { getActiveTheme } from "@/lib/ecommerce-data";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ToyVerse — Premium Toys for Curious Kids",
    template: "%s | ToyVerse",
  },
  description:
    "Shop ToyVerse for premium, lab-safe toys kids love — educational kits, building sets, RC toys and more. Fast 48-hour dispatch, easy 30-day returns, and free shipping over $50.",
  applicationName: "ToyVerse",
  keywords: [
    "toys",
    "kids toys",
    "educational toys",
    "building sets",
    "RC toys",
    "toy store",
    "premium toys",
    "gifts for kids",
    "STEM toys",
  ],
  authors: [{ name: "ToyVerse" }],
  creator: "ToyVerse",
  publisher: "ToyVerse",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "ToyVerse",
    title: "ToyVerse — Premium Toys for Curious Kids",
    description:
      "Premium, lab-safe toys kids love. Fast dispatch, easy returns, free shipping over $50.",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/images/banner-img.png",
        width: 1200,
        height: 630,
        alt: "ToyVerse — premium toys collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToyVerse — Premium Toys for Curious Kids",
    description:
      "Premium, lab-safe toys kids love. Fast dispatch, easy returns, free shipping over $50.",
    images: ["/images/banner-img.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getActiveTheme();

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${sora.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
