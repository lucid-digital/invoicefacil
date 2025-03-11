import { NextResponse } from 'next/server';
import { 
  getRecurringInvoicesDueToday, 
  getRecurringInvoiceById, 
  updateRecurringInvoice 
} from '@/lib/supabase';
import { createInvoice } from '@/lib/supabase';
import { sendInvoiceEmail, sendRecurringInvoiceEmail } from '@/lib/email';

// This endpoint should be called by a cron job once per day
export async function GET(request: Request) {
  // Check API key for security
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.CRON_API_KEY;
  
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all recurring invoices due today
    const recurringInvoices = await getRecurringInvoicesDueToday();
    
    if (recurringInvoices.length === 0) {
      return NextResponse.json({ message: 'No recurring invoices due today' });
    }
    
    const results = [];
    
    // Process each recurring invoice
    for (const recurringInvoice of recurringInvoices) {
      try {
        // Get full recurring invoice details with line items
        const fullInvoice = await getRecurringInvoiceById(recurringInvoice.id);
        
        if (!fullInvoice) {
          results.push({
            id: recurringInvoice.id,
            status: 'error',
            error: 'Could not fetch full invoice details'
          });
          continue;
        }
        
        // Create a new invoice based on the recurring invoice template
        const invoice = await createInvoice(
          {
            client_id: fullInvoice.client_id,
            recurring_invoice_id: recurringInvoice.id,
            invoice_number: `${fullInvoice.invoice_number_prefix}${Date.now().toString().substring(7)}`,
            client_name: fullInvoice.client_name,
            client_email: fullInvoice.client_email,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'draft',
            notes: `Generated from recurring invoice. ${fullInvoice.notes || ''}`,
            user_id: fullInvoice.user_id,
            total: fullInvoice.total,
          }, 
          fullInvoice.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
          }))
        );
        
        if (!invoice) {
          results.push({
            id: recurringInvoice.id,
            status: 'error',
            error: 'Failed to create invoice'
          });
          continue;
        }
        
        // Calculate next date for the recurring invoice
        const nextDate = calculateNextDate(
          new Date(recurringInvoice.next_date), 
          recurringInvoice.frequency
        );
        
        // Check if recurring invoice has reached its end date
        let status = recurringInvoice.status;
        if (recurringInvoice.end_date && new Date(nextDate) > new Date(recurringInvoice.end_date)) {
          status = 'completed';
        }
        
        // Update the recurring invoice with the new next date and possibly status
        await updateRecurringInvoice(recurringInvoice.id, {
          next_date: nextDate.toISOString().split('T')[0],
          status
        });
        
        // Send email notification
        await sendRecurringInvoiceEmail(fullInvoice.client_email, {
          invoiceNumber: invoice.invoice_number,
          clientName: fullInvoice.client_name,
          amount: fullInvoice.total,
          dueDate: invoice.due_date,
          // Add PDF URL and payment link if available
          pdfUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pdf`,
          paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pay`
        });
        
        results.push({
          id: recurringInvoice.id,
          status: 'success',
          invoiceId: invoice.id,
          nextDate: nextDate.toISOString().split('T')[0]
        });
      } catch (error) {
        console.error(`Error processing recurring invoice ${recurringInvoice.id}:`, error);
        results.push({
          id: recurringInvoice.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Failed to process recurring invoices' },
      { status: 500 }
    );
  }
}

// Helper function to calculate the next date based on frequency
function calculateNextDate(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(currentDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(currentDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly if frequency is invalid
      nextDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return nextDate;
} 