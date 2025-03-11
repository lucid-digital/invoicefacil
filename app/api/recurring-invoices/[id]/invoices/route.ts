import { NextResponse } from 'next/server';
import { getInvoicesFromRecurringInvoice } from '@/lib/supabase';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const recurringInvoiceId = params.id;
    
    // Get all invoices generated from this recurring invoice
    const invoices = await getInvoicesFromRecurringInvoice(recurringInvoiceId);
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error(`Error in GET /api/recurring-invoices/${params.id}/invoices:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices from recurring invoice' },
      { status: 500 }
    );
  }
} 