import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice } from '@/lib/supabase';
import { createPaymentSession } from '@/lib/stripe';

// POST /api/invoices/[id]/payment - Create a payment session for an invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    
    // Get the invoice details
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Don't allow payment for already paid invoices
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }
    
    // Create a payment session
    const { success, sessionId, url, error } = await createPaymentSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
      customerName: invoice.client_name,
      customerEmail: invoice.client_email,
      description: `Payment for Invoice #${invoice.invoice_number}`,
      successUrl: `${origin}/invoices/${id}/payment/success`,
      cancelUrl: `${origin}/invoices/${id}`,
    });
    
    if (!success || !url) {
      return NextResponse.json(
        { error: error || 'Failed to create payment session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, sessionId, url });
  } catch (error) {
    console.error(`Error in POST /api/invoices/${params.id}/payment:`, error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
} 