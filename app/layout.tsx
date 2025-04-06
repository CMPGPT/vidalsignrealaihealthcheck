import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './providers';
import { Raleway } from 'next/font/google';

// Load Raleway font
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Add weights as needed
  variable: '--font-raleway', // Optional: for CSS variable usage
});

export const metadata: Metadata = {
  title: 'Vidal Sign',
  description: 'Connect patients and healthcare providers seamlessly',
  icons: {
    icon: '/icon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={raleway.className} suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
