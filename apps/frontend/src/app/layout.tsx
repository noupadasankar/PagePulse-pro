import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PagePulse Pro — Instant Technical SEO Audit Tool',
  description: 'Audit your website technical SEO health in seconds. Free, instant, and no signup required.',
  openGraph: {
    title: 'PagePulse Pro — Instant Technical SEO Audit Tool',
    description: 'Audit your website technical SEO health in seconds. Free, instant, and no signup required.',
    url: 'https://pagepulsepro.com',
    siteName: 'PagePulse Pro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PagePulse Pro — Instant Technical SEO Audit Tool',
    description: 'Audit your website technical SEO health in seconds. Free, instant, and no signup required.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
