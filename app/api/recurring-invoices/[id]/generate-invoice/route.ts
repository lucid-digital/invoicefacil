import { NextResponse } from 'next/server';
import { getRecurringInvoiceById, createInvoice } from '@/lib/supabase';
import { sendInvoiceEmail } from '@/lib/email';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const recurringInvoiceId = params.id;
    const { sendEmail, customInvoiceNumber } = await request.json();
    
    // Fetch the recurring invoice with its line items
    const recurringInvoice = await getRecurringInvoiceById(recurringInvoiceId);
    
    if (!recurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      );
    }
    
    // Generate invoice number if not provided
    const invoiceNumber = customInvoiceNumber || 
      `${recurringInvoice.invoice_number_prefix}${Date.now().toString().substring(7)}`;
    
    // Create a new invoice based on the recurring invoice template
    const invoice = await createInvoice({
      client_id: recurringInvoice.client_id,
      recurring_invoice_id: recurringInvoiceId,
      invoice_number: invoiceNumber,
      client_name: recurringInvoice.client_name,
      client_email: recurringInvoice.client_email,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      notes: `Generated from recurring invoice. ${recurringInvoice.notes || ''}`,
      user_id: recurringInvoice.user_id,
      total: recurringInvoice.total,
    }, recurringInvoice.lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    })));
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }
    
    // Send email notification if requested
    if (sendEmail) {
      const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      await sendInvoiceEmail(recurringInvoice.client_email, {
        invoiceNumber: invoice.invoice_number,
        clientName: recurringInvoice.client_name,
        amount: recurringInvoice.total,
        dueDate: invoice.due_date,
        pdfUrl: `${domain}/invoices/${invoice.id}/pdf`,
        paymentLink: `${domain}/invoices/${invoice.id}`
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice generated successfully',
      invoiceId: invoice.id
    });
  } catch (error) {
    console.error(`Error in POST /api/recurring-invoices/${params.id}/generate-invoice:`, error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
} 