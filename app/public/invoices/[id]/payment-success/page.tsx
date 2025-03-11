'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyPayment() {
      try {
        if (!sessionId) {
          setError('Invalid payment session');
          setLoading(false);
          return;
        }

        // Call API to verify payment and update invoice status
        const response = await fetch(`/api/public/invoices/${invoiceId}/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const data = await response.json();
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

  const handleViewInvoice = () => {
    if (typeof window !== 'undefined' && invoiceId) {
      window.location.href = `/public/invoices/${invoiceId}`;
    }
  };

  const handleViewPdf = () => {
    if (typeof window !== 'undefined' && invoiceId) {
      window.open(`/public/invoices/${invoiceId}/view-pdf`, '_blank');
    }
  };

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">{error}</p>
            <Button onClick={handleViewInvoice}>Return to Invoice</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Thank you for your payment. Your invoice has been marked as paid.
          </p>
          <div className="flex flex-col space-y-3">
            <Button onClick={handleViewInvoice}>
              View Invoice
            </Button>
            <Button variant="outline" onClick={handleViewPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 