import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import InvoicePDF from '@/app/components/InvoicePDF';

export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes: string;
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  try {
    // Use createElement instead of JSX
    const element = createElement(InvoicePDF, { data });
    
    // @ts-ignore - Ignore type checking for renderToBuffer
    const buffer = await renderToBuffer(element);
    return buffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
} 