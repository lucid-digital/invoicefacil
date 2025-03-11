'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PDFViewer } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Dynamically import the InvoicePDF component with no SSR
const InvoicePDF = dynamic(() => import('@/app/components/InvoicePDF'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-2rem)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

interface LineItem {
  id: string;
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

export default function InvoicePDFViewerPage() {
  const { id: invoiceId } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching invoice for PDF view: ${invoiceId}`);
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
        console.log('Invoice data received for PDF view');
        
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
        console.error('Error fetching invoice for PDF view:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

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

  // Format invoice data for PDF component
  const pdfData = {
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    clientName: invoice.client_name,
    clientEmail: invoice.client_email,
    lineItems: invoice.lineItems,
    notes: invoice.notes || ''
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <PDFViewer style={{ width: '100%', height: 'calc(100vh - 2rem)' }}>
        <InvoicePDF data={pdfData} />
      </PDFViewer>
    </div>
  );
} 