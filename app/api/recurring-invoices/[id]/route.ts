import { NextResponse } from 'next/server';
import { getRecurringInvoiceById, updateRecurringInvoice, deleteRecurringInvoice } from '@/lib/supabase';

interface Params {
  params: {
    id: string;
  };
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  [key: string]: any; // Allow for any other properties that might be present
}

export async function GET(request: Request, { params }: Params) {
  try {
    const recurringInvoice = await getRecurringInvoiceById(params.id);
    
    if (!recurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(recurringInvoice);
  } catch (error) {
    console.error(`Error in GET /api/recurring-invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const data = await request.json();
    
    // Extract line items from the request
    const { lineItems, ...recurringInvoiceData } = data;
    
    // Ensure line items don't have any id field that could cause conflicts
    const sanitizedLineItems = lineItems.map((item: LineItem) => {
      // Extract only the fields we need
      const { description, quantity, rate, amount } = item;
      return { description, quantity, rate, amount };
    });
    
    // Update the recurring invoice
    const success = await updateRecurringInvoice(params.id, recurringInvoiceData, sanitizedLineItems);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update recurring invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in PUT /api/recurring-invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update recurring invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const success = await deleteRecurringInvoice(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete recurring invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/recurring-invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete recurring invoice' },
      { status: 500 }
    );
  }
} 