import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, getInvoiceLineItems } from '@/lib/supabase';
import { LineItem } from '@/lib/supabase';

// Extended invoice type that includes lineItems
interface InvoiceWithLineItems {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  total: number;
  lineItems?: LineItem[];
  [key: string]: any; // Allow for other properties
}

// GET /api/public/invoices/[id] - Get a specific invoice (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Log the request for debugging
    console.log(`Public invoice request for ID: ${id}`);
    
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      console.log(`Invoice not found: ${id}`);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // For public access, we'll allow draft invoices too, just log it
    if (invoice.status === 'draft') {
      console.log(`Note: Serving draft invoice ${id} to public`);
    }
    
    // Create an extended invoice object with lineItems
    const invoiceWithLineItems: InvoiceWithLineItems = {
      ...invoice,
      lineItems: []
    };
    
    // Check if the invoice already has lineItems (from the database query)
    if ('lineItems' in invoice && Array.isArray(invoice.lineItems)) {
      invoiceWithLineItems.lineItems = invoice.lineItems;
    } else {
      // Try to fetch line items separately
      const lineItems = await getInvoiceLineItems(id);
      if (lineItems) {
        invoiceWithLineItems.lineItems = lineItems;
      }
    }
    
    return NextResponse.json(invoiceWithLineItems);
  } catch (error) {
    console.error(`Error in GET /api/public/invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
} 