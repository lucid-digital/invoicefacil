import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice } from '@/lib/supabase';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// POST /api/public/invoices/[id]/verify-payment - Verify a payment and update invoice status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Verifying payment for invoice ${id} with session ${sessionId}`);
    
    // Get the invoice
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      console.log(`Invoice not found: ${id}`);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Verify the payment with Stripe
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Check if the payment was successful
      if (session.payment_status !== 'paid') {
        console.log(`Payment not completed for session ${sessionId}`);
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
      
      // Check if the invoice ID in metadata matches
      if (session.metadata?.invoice_id !== id) {
        console.log(`Session ${sessionId} is for a different invoice`);
        return NextResponse.json(
          { error: 'Invalid session for this invoice' },
          { status: 400 }
        );
      }
      
      // Update the invoice status to paid
      const updateResult = await updateInvoice(id, {
        status: 'paid'
      });
      
      if (!updateResult) {
        console.log(`Failed to update invoice ${id} status to paid`);
        return NextResponse.json(
          { error: 'Failed to update invoice status' },
          { status: 500 }
        );
      }
      
      console.log(`Successfully marked invoice ${id} as paid`);
      return NextResponse.json({ success: true });
    } catch (stripeError) {
      console.error('Error verifying payment with Stripe:', stripeError);
      return NextResponse.json(
        { error: 'Failed to verify payment with Stripe' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in POST /api/public/invoices/${params.id}/verify-payment:`, error);
    return NextResponse.json(
      { error: 'Failed to verify payment: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 