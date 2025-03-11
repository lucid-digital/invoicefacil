import { NextResponse } from 'next/server';
import { getRecurringInvoiceById } from '@/lib/supabase';
import { sendRecurringInvoiceEmail } from '@/lib/email';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const invoiceId = params.id;
    const { testMode } = await request.json();
    
    // Fetch the recurring invoice with its line items
    const invoice = await getRecurringInvoiceById(invoiceId);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      );
    }
    
    // Create the payment/view link
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const viewLink = `${domain}/recurring-invoices/${invoiceId}`;
    
    // If it's a test, send to the sender instead of the client
    const recipientEmail = testMode ? testMode.email : invoice.client_email;
    
    // Send the email
    const result = await sendRecurringInvoiceEmail(recipientEmail, {
      invoiceNumber: `${invoice.invoice_number_prefix}${new Date().getMonth() + 1}${new Date().getFullYear()}`,
      clientName: invoice.client_name,
      amount: invoice.total,
      dueDate: invoice.next_date,
      pdfUrl: undefined, // No PDF yet as it hasn't been generated
      paymentLink: viewLink
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send recurring invoice email', details: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: testMode ? 'Test email sent successfully' : 'Recurring invoice notification sent successfully',
      sentTo: recipientEmail 
    });
  } catch (error) {
    console.error('Error sending recurring invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send recurring invoice email' },
      { status: 500 }
    );
  }
} 