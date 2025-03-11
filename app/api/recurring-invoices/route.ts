import { NextResponse } from 'next/server';
import { getRecurringInvoices, createRecurringInvoice } from '@/lib/supabase';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  [key: string]: any; // Allow for any other properties that might be present
}

export async function GET() {
  try {
    const recurringInvoices = await getRecurringInvoices();
    return NextResponse.json(recurringInvoices);
  } catch (error) {
    console.error('Error in GET /api/recurring-invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Extract line items from the request
    const { lineItems, ...recurringInvoiceData } = data;
    
    // Set user_id (in a real app, this would come from authentication)
    recurringInvoiceData.user_id = 'anonymous';
    
    // Ensure line items don't have any id field that could cause conflicts
    const sanitizedLineItems = lineItems.map((item: LineItem) => {
      // Extract only the fields we need
      const { description, quantity, rate, amount } = item;
      return { description, quantity, rate, amount };
    });
    
    // Create the recurring invoice
    const recurringInvoice = await createRecurringInvoice(recurringInvoiceData, sanitizedLineItems);
    
    if (!recurringInvoice) {
      return NextResponse.json(
        { error: 'Failed to create recurring invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(recurringInvoice, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recurring-invoices:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring invoice' },
      { status: 500 }
    );
  }
} 