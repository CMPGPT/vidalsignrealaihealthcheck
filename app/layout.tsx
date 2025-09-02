import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AppProviders from './providers';
import './suppress-warnings';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VidalSigns - Understand Your Lab Results",
  description: "Stop guessing what your health reports mean. Upload your file securely and get instant, easy-to-understand insights from our AI.",
  keywords: "lab results, health reports, medical analysis, AI health assistant, HIPAA compliant",
  icons: {
    icon: '/icon.ico',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-inter text-gray-800 antialiased bg-gray-50`}
      >
        <AppProviders>
          {children}
          <Toaster richColors position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}
