import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bized | All-in-One Business Operating System",
  description: "Bized empowers businesses to build their online presence, manage operations, and handle finances in one unified platform.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
