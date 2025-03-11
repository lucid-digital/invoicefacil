'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setError('No payment session found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invoices/${invoiceId}/payment/success?session_id=${sessionId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }
        
        setSuccess(true);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    }
    
    verifyPayment();
  }, [invoiceId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-center text-destructive">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href={`/invoices/${invoiceId}`}>Return to Invoice</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-green-500">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Thank you for your payment. Your invoice has been marked as paid.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
            <Link href={`/invoices/${invoiceId}`}>View Invoice</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/invoices">All Invoices</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 