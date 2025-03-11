import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice',
  description: 'View and pay your invoice',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
} 