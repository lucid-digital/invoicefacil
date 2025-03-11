'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { RecurringInvoice } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function GenerateInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  
  const [invoice, setInvoice] = useState<RecurringInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState('');
  const [useCustomInvoiceNumber, setUseCustomInvoiceNumber] = useState(false);

  useEffect(() => {
    async function fetchRecurringInvoice() {
      try {
        const response = await fetch(`/api/recurring-invoices/${invoiceId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Recurring invoice not found');
          } else {
            throw new Error('Failed to fetch recurring invoice');
          }
          return;
        }
        
        const data = await response.json();
        setInvoice(data);
        
        // Generate a default invoice number
        const prefix = data.invoice_number_prefix || 'INV-';
        const suffix = new Date().toISOString().split('T')[0].replace(/-/g, '');
        setCustomInvoiceNumber(`${prefix}${suffix}`);
      } catch (err) {
        console.error('Error fetching recurring invoice:', err);
        setError('Failed to load recurring invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (invoiceId) {
      fetchRecurringInvoice();
    }
  }, [invoiceId]);

  const handleGenerateInvoice = async () => {
    if (!invoice) return;
    
    setGenerating(true);
    
    try {
      // Call a special endpoint to generate a single invoice from this recurring invoice
      const response = await fetch(`/api/recurring-invoices/${invoiceId}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sendEmail,
          customInvoiceNumber: useCustomInvoiceNumber ? customInvoiceNumber : undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }
      
      const data = await response.json();
      
      toast.success('Invoice generated successfully!');
      
      // Redirect to the new invoice
      router.push(`/invoices/${data.invoiceId}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recurring invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error || 'Recurring invoice not found'}</p>
            <Button asChild>
              <Link href="/recurring-invoices">Back to Recurring Invoices</Link>
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
          <h1 className="text-3xl font-bold">Generate Invoice</h1>
          <Button variant="outline" asChild>
            <Link href={`/recurring-invoices/${invoiceId}`}>Back to Recurring Invoice</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Generate New Invoice</CardTitle>
                <CardDescription>
                  Create a new invoice based on this recurring template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Recurring Invoice Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{invoice.client_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">${invoice.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-medium">{invoice.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Date</p>
                      <p className="font-medium">{new Date(invoice.next_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useCustomInvoiceNumber" 
                      checked={useCustomInvoiceNumber}
                      onCheckedChange={(checked) => setUseCustomInvoiceNumber(!!checked)}
                    />
                    <Label htmlFor="useCustomInvoiceNumber">Use custom invoice number</Label>
                  </div>
                  
                  {useCustomInvoiceNumber && (
                    <div className="space-y-2">
                      <Label htmlFor="customInvoiceNumber">Invoice Number</Label>
                      <Input
                        id="customInvoiceNumber"
                        value={customInvoiceNumber}
                        onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                        placeholder="Enter custom invoice number"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendEmail" 
                      checked={sendEmail}
                      onCheckedChange={(checked) => setSendEmail(!!checked)}
                    />
                    <Label htmlFor="sendEmail">Send email notification to client</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/recurring-invoices/${invoiceId}`)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Invoice Now'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>About Manual Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  This will create a new invoice based on the recurring template. The invoice will be created with today's date.
                </p>
                <p>
                  The recurring schedule will <strong>not</strong> be affected by this manual generation. The next scheduled invoice will still be generated on the next due date.
                </p>
                <p>
                  Use this feature when you need to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Generate an invoice ahead of schedule</li>
                  <li>Create a one-time additional invoice</li>
                  <li>Replace a failed automatic generation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 