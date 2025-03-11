import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/lib/supabase';

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error(`Error in GET /api/invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update a specific invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Calculate total from line items
    const total = body.lineItems.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.rate),
      0
    );
    
    // Prepare invoice data
    const invoiceData = {
      invoice_number: body.invoice_number,
      client_name: body.client_name,
      client_email: body.client_email,
      issue_date: body.issue_date,
      due_date: body.due_date,
      status: body.status,
      notes: body.notes,
      total
    };
    
    // Prepare line items
    const lineItems = body.lineItems.map((item: any) => ({
      id: item.id, // Keep existing ID if it exists
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate
    }));
    
    const success = await updateInvoice(id, invoiceData, lineItems);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in PUT /api/invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete a specific invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await deleteInvoice(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/invoices/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
} 