import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.graphxserver.io'),
  title: 'GraphxServer.io documentation',
  description:
    'API keys, API reference, and MCP tools for GraphxServer.io integrations.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    siteName: 'GraphxServer.io documentation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
