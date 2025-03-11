'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is logged in, don't show the navbar
  if (user) {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-primary">
                FacilInvoice
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden sm:flex sm:items-center sm:space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/login"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:bg-gray-50 hover:border-primary hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:bg-gray-50 hover:border-primary hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 