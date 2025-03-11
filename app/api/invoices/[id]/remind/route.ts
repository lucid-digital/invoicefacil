import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/invoices/[id]/remind - Send a payment reminder email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const testMode = body.testMode;
    const message = body.message || '';
    
    // Get the invoice details
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Get the app URL from environment or request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      request.headers.get('origin') || 
      'http://localhost:3000';
    
    // Create the public invoice link
    const publicInvoiceLink = `${appUrl}/public/invoices/${id}`;
    
    // Create the payment link
    const paymentLink = `${publicInvoiceLink}#payment`;
    
    // Determine recipient email
    const recipientEmail = testMode ? testMode.email : invoice.client_email;
    
    // Calculate days overdue if applicable
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_EMAIL_FROM_NAME || 'Invoice Generator'} <${process.env.NEXT_PUBLIC_EMAIL_FROM || `noreply@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'example.com'}`}>`,
      to: recipientEmail,
      subject: `Payment Reminder: Invoice #${invoice.invoice_number}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Payment Reminder</h1>
          <p>Dear ${invoice.client_name},</p>
          
          <p>This is a friendly reminder that payment for invoice #${invoice.invoice_number} in the amount of $${invoice.total.toFixed(2)} is ${daysOverdue > 0 ? `overdue by ${daysOverdue} days` : 'due soon'}.</p>
          
          <p>Due date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
          
          ${message ? `<p><strong>Message from sender:</strong> ${message}</p>` : ''}
          
          <div style="margin: 30px 0;">
            <a href="${publicInvoiceLink}" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Invoice
            </a>
            
            <a href="${paymentLink}" style="background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-left: 10px;">
              Pay Now
            </a>
          </div>
          
          <p>You can view your invoice and make a payment online at: <a href="${publicInvoiceLink}">${publicInvoiceLink}</a></p>
          
          <p>If you have already made this payment, please disregard this reminder.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Thank you for your business!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent by Your Company Name<br />
            123 Business Street, City, Country
          </p>
        </div>
      `,
    });
    
    if (error) {
      console.error('Error sending reminder email:', error);
      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error(`Error in POST /api/invoices/${params.id}/remind:`, error);
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    );
  }
} 