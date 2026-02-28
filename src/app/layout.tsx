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

export const metadata: Metadata = {
  title: "Bized.app - Get Discovered Online. Unified Chat. Total Control.",
  description: "The Hybrid Commerce OS for small businesses. Sell products and book services across WhatsApp, Instagram, and Google with one link.",
  applicationName: "Bized",
  authors: [{ name: "Bized Team" }],
  keywords: ["Hybrid Commerce", "WhatsApp Business API", "Online Store", "Appointment Scheduling", "Unified Inbox", "Small Business OS", "Discovery", "Click-to-chat"],
  openGraph: {
    title: "Bized.app - Get Discovered Online.",
    description: "The Hybrid Commerce OS for small businesses.",
    type: "website",
    locale: "en_US",
    siteName: "Bized",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bized.app",
    description: "The Hybrid Commerce OS for small businesses.",
  },
  other: {
    "google-play-app": "app-id=com.bized.app", // Example for future PWA/Native link
  },
};


import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
