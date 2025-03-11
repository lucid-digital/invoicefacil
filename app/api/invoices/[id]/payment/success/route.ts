import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice } from '@/lib/supabase';
import { handleSuccessfulPayment } from '@/lib/stripe';

// POST /api/invoices/[id]/payment/success - Handle successful payment
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
    
    // Process the payment
    const { success, invoiceId, error } = await handleSuccessfulPayment(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to process payment' },
        { status: 500 }
      );
    }
    
    // Verify that the invoice ID matches
    if (invoiceId !== id) {
      return NextResponse.json(
        { error: 'Invoice ID mismatch' },
        { status: 400 }
      );
    }
    
    // Update the invoice status to paid
    const updateSuccess = await updateInvoice(id, { status: 'paid' }, []);
    
    if (!updateSuccess) {
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in POST /api/invoices/${params.id}/payment/success:`, error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}

// GET /api/invoices/[id]/payment/success - Verify payment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Process the payment
    const { success, invoiceId, error } = await handleSuccessfulPayment(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to process payment' },
        { status: 500 }
      );
    }
    
    // Verify that the invoice ID matches
    if (invoiceId !== id) {
      return NextResponse.json(
        { error: 'Invoice ID mismatch' },
        { status: 400 }
      );
    }
    
    // Update the invoice status to paid
    const updateSuccess = await updateInvoice(id, { status: 'paid' }, []);
    
    if (!updateSuccess) {
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in GET /api/invoices/${params.id}/payment/success:`, error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
} 