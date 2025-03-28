import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './providers';

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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
