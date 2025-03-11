import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice } from '@/lib/supabase';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// POST /api/public/invoices/[id]/payment - Create a payment session for a public invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Creating payment session for invoice: ${id}`);
    
    // Get the invoice
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      console.log(`Invoice not found: ${id}`);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Don't allow payment for already paid invoices
    if (invoice.status === 'paid') {
      console.log(`Invoice ${id} is already paid`);
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }
    
    // Get line items - either from the invoice or fetch separately
    let lineItems = [];
    if ('lineItems' in invoice && Array.isArray(invoice.lineItems)) {
      lineItems = invoice.lineItems;
    }
    
    // Create a Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice #${invoice.invoice_number}`,
              description: `Payment for invoice #${invoice.invoice_number}`,
            },
            unit_amount: Math.round(invoice.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/public/invoices/${id}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/public/invoices/${id}`,
      metadata: {
        invoice_id: id,
      },
    });
    
    console.log(`Created Stripe session: ${session.id} for invoice: ${id}`);
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(`Error in POST /api/public/invoices/${params.id}/payment:`, error);
    return NextResponse.json(
      { error: 'Failed to create payment session: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 