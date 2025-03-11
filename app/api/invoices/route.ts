import { NextRequest, NextResponse } from 'next/server';
import { getInvoices, addInvoice } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';

// GET /api/invoices - Get all invoices for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get invoices for this user
    const invoices = await getInvoices(userId);
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Extract line items from the request body
    const { lineItems, ...invoiceData } = body;
    
    // Ensure total is included and is a number
    if (typeof invoiceData.total !== 'number' || isNaN(invoiceData.total)) {
      // Calculate total from line items if not provided or invalid
      invoiceData.total = lineItems?.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
    }
    
    // First create the invoice
    try {
      const invoice = await addInvoice(invoiceData, userId);
      
      // Then add line items if needed
      if (lineItems && lineItems.length > 0) {
        // This would be handled in a separate function to add line items
        // For now, we'll just return the invoice
      }
      
      return NextResponse.json(invoice);
    } catch (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: invoiceError instanceof Error ? invoiceError.message : 'Failed to create invoice' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/invoices:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 