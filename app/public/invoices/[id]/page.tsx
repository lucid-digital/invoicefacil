'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { CreditCard, FileText, AlertCircle } from "lucide-react";

interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  total: number;
  lineItems: LineItem[];
}

export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching public invoice: ${invoiceId}`);
        const response = await fetch(`/api/public/invoices/${invoiceId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error response: ${response.status}`, errorData);
          
          if (response.status === 404) {
            setError('Invoice not found');
          } else {
            setError(errorData.error || 'Failed to fetch invoice');
          }
          return;
        }
        
        const data = await response.json();
        console.log('Invoice data received:', data);
        
        if (!data || !data.id) {
          setError('Invalid invoice data received');
          return;
        }
        
        // Ensure lineItems is always an array
        if (!data.lineItems) {
          data.lineItems = [];
        }
        
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">
          Sent
        </Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">
          Draft
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePayNow = async () => {
    if (invoice?.status === 'paid') {
      alert('This invoice has already been paid.');
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      const response = await fetch(`/api/public/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }
      
      // Redirect to Stripe Checkout
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      } else if (!data.url) {
        throw new Error('No payment URL returned');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleViewPdf = () => {
    if (typeof window !== 'undefined' && invoiceId) {
      try {
        // Use the dedicated PDF viewer page instead of the API
        const pdfViewerUrl = `/public/invoices/${invoiceId}/view-pdf`;
        console.log('Opening PDF viewer:', pdfViewerUrl);
        window.open(pdfViewerUrl, '_blank');
      } catch (error) {
        console.error('Error opening PDF viewer:', error);
        alert('Failed to open PDF viewer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-center">Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              {error || "The invoice you're looking for doesn't exist or has been deleted."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Small branding header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div className="flex items-center">
            <div className="font-bold text-xl text-primary mr-2">Invoice Generator</div>
            <div className="text-sm text-muted-foreground">Powered by Lucid</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Invoice {invoice?.invoice_number}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <div className="mb-4">{getStatusBadge(invoice.status)}</div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Issue Date</h3>
                  <p className="mb-4">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                  <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Bill To</h3>
                  <p className="font-medium">{invoice.client_name}</p>
                  <p className="text-muted-foreground">{invoice.client_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
                {invoice.status !== 'paid' ? (
                  <Button 
                    className="w-full mt-4" 
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </span>
                    )}
                  </Button>
                ) : (
                  <Badge className="w-full flex justify-center py-2 mt-4 bg-green-500">
                    Paid
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleViewPdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {invoice.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 