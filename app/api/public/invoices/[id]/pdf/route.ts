import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, getInvoiceLineItems } from '@/lib/supabase';
import { generateInvoicePdf } from '@/lib/pdf-generator';

// GET /api/public/invoices/[id]/pdf - Get a PDF for a specific invoice (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Generating PDF for invoice: ${id}`);
    
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      console.log(`Invoice not found: ${id}`);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // For public access, we'll allow draft invoices too, just log it
    if (invoice.status === 'draft') {
      console.log(`Note: Generating PDF for draft invoice ${id}`);
    }
    
    // Get line items - either from the invoice or fetch separately
    let lineItems = [];
    if ('lineItems' in invoice && Array.isArray(invoice.lineItems)) {
      lineItems = invoice.lineItems;
    } else {
      const fetchedLineItems = await getInvoiceLineItems(id);
      if (fetchedLineItems) {
        lineItems = fetchedLineItems;
      }
    }
    
    console.log(`Found ${lineItems.length} line items for invoice ${id}`);
    
    // Format invoice data for PDF component
    const pdfData = {
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      lineItems: lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      })),
      notes: invoice.notes || ''
    };
    
    try {
      // Generate PDF using the utility function
      console.log('Rendering PDF...');
      const pdfBuffer = await generateInvoicePdf(pdfData);
      
      console.log('PDF generated successfully');
      
      // Return PDF as response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.pdf"`,
        },
      });
    } catch (renderError) {
      console.error('Error rendering PDF:', renderError);
      return NextResponse.json(
        { error: 'Failed to render PDF: ' + (renderError instanceof Error ? renderError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in GET /api/public/invoices/${params.id}/pdf:`, error);
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 