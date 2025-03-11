import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SupabaseSetup from '@/components/supabase-setup';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FacilInvoice - Simple Invoicing Solution",
  description: "Create and manage invoices with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SupabaseSetup />
            <Navbar />
            <Toaster position="top-right" />
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <main>
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
