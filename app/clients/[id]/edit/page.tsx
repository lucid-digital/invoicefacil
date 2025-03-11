'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Client } from "@/lib/supabase";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = typeof params.id === 'string' ? params.id : '';
  
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Client not found');
          } else {
            throw new Error('Failed to fetch client');
          }
          return;
        }
        
        const data: Client = await response.json();
        
        // Set form values
        setName(data.name);
        setBusinessName(data.business_name || '');
        setEmail(data.email);
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZip(data.zip || '');
        setCountry(data.country || '');
        setNotes(data.notes || '');
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          business_name: businessName,
          email,
          phone,
          address,
          city,
          state,
          zip,
          country,
          notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      toast.success('Client updated successfully!');
      
      // Redirect to the client detail page
      router.push(`/clients/${clientId}`);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Button asChild>
              <Link href="/clients">Back to Clients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Client</h1>
          <Button variant="outline" asChild>
            <Link href={`/clients/${clientId}`}>Back to Client</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
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
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this client..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/clients/${clientId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 