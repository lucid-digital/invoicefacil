'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, BusinessProfile, loginUser, registerUser, getUserById, getBusinessProfileByUserId } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  businessProfile: BusinessProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshBusinessProfile: () => Promise<void>;
  getAuthHeader: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Only override fetch on the client side
if (typeof window !== 'undefined') {
  // Override the fetch function to include the Authorization header
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    // Only add the header for API requests to our own domain
    if (typeof input === 'string' && input.startsWith('/api/')) {
      // Skip adding auth header for auth routes
      if (!input.startsWith('/api/auth/') && !input.startsWith('/api/setup')) {
        try {
          const user = localStorage.getItem('user');
          if (user) {
            const parsedUser = JSON.parse(user) as User;
            const headers = new Headers(init?.headers || {});
            headers.set('Authorization', `Bearer ${parsedUser.id}`);
            
            init = {
              ...init,
              headers
            };
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          // Continue without adding the header if parsing fails
        }
      }
    }
    
    return originalFetch(input, init);
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          
          // Verify the user still exists in the database
          const { success, user: fetchedUser } = await getUserById(parsedUser.id);
          
          if (success && fetchedUser) {
            setUser(fetchedUser);
            
            // Fetch business profile
            const { success: profileSuccess, profile } = await getBusinessProfileByUserId(fetchedUser.id);
            if (profileSuccess && profile) {
              setBusinessProfile(profile);
            }
          } else {
            // User no longer exists, clear session
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Fetch business profile
        const { success, profile } = await getBusinessProfileByUserId(result.user.id);
        if (success && profile) {
          setBusinessProfile(profile);
        }
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Error in login:', error);
      return { success: false, error: 'Failed to login' };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const result = await registerUser(email, password, firstName, lastName);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Try to fetch business profile if it exists
        try {
          const { success, profile } = await getBusinessProfileByUserId(result.user.id);
          if (success && profile) {
            setBusinessProfile(profile);
          }
        } catch (profileError) {
          console.error('Error fetching business profile after registration:', profileError);
          // Continue even if profile fetch fails
        }
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Error in register:', error);
      return { success: false, error: 'Failed to register' };
    }
  };

  const logout = () => {
    setUser(null);
    setBusinessProfile(null);
    localStorage.removeItem('user');
  };

  const refreshBusinessProfile = async () => {
    if (!user) return;
    
    try {
      const { success, profile } = await getBusinessProfileByUserId(user.id);
      if (success && profile) {
        setBusinessProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing business profile:', error);
    }
  };

  const getAuthHeader = (): HeadersInit => {
    if (!user) return {};
    return {
      'Authorization': `Bearer ${user.id}`
    };
  };

  const value = {
    user,
    businessProfile,
    isLoading,
    login,
    register,
    logout,
    refreshBusinessProfile,
    getAuthHeader
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 