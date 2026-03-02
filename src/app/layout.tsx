import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google"; // Using Outfit for modern feel
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // For "App-like" feel
};

import { getPlatformSettings } from "@/lib/platform-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();

  return {
    title: settings.metaTitle || "Bized - All-in-one Business Platform",
    description: settings.metaDescription || "The ultimate platform for managing your business, POS, and storefront.",
    applicationName: "Bized",
    authors: [{ name: "Bized Team" }],
    keywords: ["digital identity", "mini storefront", "whatsapp business automation", "google maps sync", "omnichannel business", "bized"],
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      type: "website",
      locale: "en_US",
      siteName: "Bized",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.metaTitle,
      description: settings.metaDescription,
    }
  };
}


import { Providers } from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPlatformSettings();
  const primaryColor = settings.primaryColor || "#4f46e5";
  const secondaryColor = settings.secondaryColor || "#06b6d4";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --color-primary: ${primaryColor};
            --color-secondary: ${secondaryColor};
          }
        `}} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
