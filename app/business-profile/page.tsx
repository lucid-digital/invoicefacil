'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { upsertBusinessProfile, uploadLogo } from '@/lib/auth';
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

export default function BusinessProfilePage() {
  const router = useRouter();
  const { user, businessProfile, isLoading, refreshBusinessProfile } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Load existing business profile data
  useEffect(() => {
    if (businessProfile) {
      setBusinessName(businessProfile.business_name || '');
      setEmail(businessProfile.email || '');
      setPhone(businessProfile.phone || '');
      setAddressLine1(businessProfile.address_line1 || '');
      setAddressLine2(businessProfile.address_line2 || '');
      setCity(businessProfile.city || '');
      setState(businessProfile.state || '');
      setPostalCode(businessProfile.postal_code || '');
      setCountry(businessProfile.country || '');
      setWebsite(businessProfile.website || '');
      setLogoUrl(businessProfile.logo_url || '');
    }
  }, [businessProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName || !user) {
      setError(!businessName ? 'Business name is required' : 'User not authenticated');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let updatedLogoUrl = logoUrl;
      
      // Upload logo if a new one was selected
      if (logoFile) {
        try {
          const uploadResult = await uploadLogo(user.id, logoFile);
          if (uploadResult.success && uploadResult.url) {
            updatedLogoUrl = uploadResult.url;
          } else {
            console.error('Logo upload failed:', uploadResult.error);
            // Continue with saving the profile even if logo upload fails
          }
        } catch (logoError) {
          console.error('Error during logo upload:', logoError);
          // Continue with saving the profile even if logo upload fails
        }
      }
      
      // Save business profile
      const profileData = {
        business_name: businessName,
        email,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        website,
        logo_url: updatedLogoUrl
      };
      
      const result = await upsertBusinessProfile(user.id, profileData);
      
      if (result.success) {
        toast.success('Business profile saved successfully!');
        await refreshBusinessProfile();
        router.push('/dashboard');
      } else {
        throw new Error(result.error || 'Failed to save business profile');
      }
    } catch (err) {
      console.error('Error saving business profile:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Business Profile</h1>
        <p className="text-muted-foreground">
          Add your business details to customize your invoices
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Business Profile</CardTitle>
          <CardDescription>
            Set up your business information to appear on invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                    {(logoPreview || logoUrl) ? (
                      <>
                        <Image
                          src={logoPreview || logoUrl}
                          alt="Business Logo"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-1 right-1 bg-background rounded-full p-1 shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      ref={fileInputRef}
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview || logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended size: 200x200px. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Business Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 