import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik, Noto_Sans } from "next/font/google";
// Deploy Trigger: 2026-01-12T19:21
// Force rebuild check
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Bized | All-in-One Business Operating System",
  description: "Bized empowers businesses to build their online presence, manage operations, and handle finances in one unified platform.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Bized",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${notoSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <LanguageProvider>
              {children}
            </LanguageProvider>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      }, function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      });
                    });
                  }
                `,
              }}
            />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
