import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { jsPDF } from 'jspdf';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  notes: string;
}

/**
 * Generate a PDF buffer for an invoice using jsPDF
 * This approach avoids using React components in the server context
 */
export async function generatePDFBuffer(data: InvoiceData): Promise<Buffer> {
  // Ensure data is valid
  const safeData = {
    invoiceNumber: data?.invoiceNumber || 'N/A',
    issueDate: formatDate(data?.issueDate || new Date().toISOString()),
    dueDate: formatDate(data?.dueDate || new Date().toISOString()),
    clientName: data?.clientName || 'Client',
    clientEmail: data?.clientEmail || '',
    lineItems: Array.isArray(data?.lineItems) ? data.lineItems : [],
    notes: data?.notes || ''
  };

  // Calculate total
  const total = safeData.lineItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0), 
    0
  );

  // Create a new jsPDF instance
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Set font
  doc.setFont('helvetica', 'normal');
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('INVOICE', margin, y);
  y += 15;
  
  // Line below title
  doc.setDrawColor(238, 238, 238);
  doc.line(margin, y, 190, y);
  y += 15;
  
  // Invoice Info
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray
  doc.text('INVOICE NUMBER', margin, y);
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(safeData.invoiceNumber, margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('ISSUE DATE', margin, y);
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(safeData.issueDate, margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('DUE DATE', margin, y);
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(safeData.dueDate, margin, y);
  
  // Client Info
  const rightColumn = 120;
  y = 50; // Reset Y for right column
  
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Bill To:', rightColumn, y);
  y += 7;
  doc.setFontSize(12);
  doc.text(safeData.clientName, rightColumn, y);
  y += 7;
  doc.text(safeData.clientEmail, rightColumn, y);
  
  // Items table
  y = 100;
  const tableTop = y;
  const colWidths = [80, 30, 30, 30];
  const colStarts = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
  
  // Table header
  doc.setFillColor(243, 244, 246); // Light gray
  doc.rect(margin, y, 170, 10, 'F');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('Description', colStarts[0] + 2, y + 7);
  doc.text('Quantity', colStarts[1] + 2, y + 7);
  doc.text('Rate', colStarts[2] + 2, y + 7);
  doc.text('Amount', colStarts[3] + 2, y + 7);
  y += 10;
  
  // Table rows
  doc.setTextColor(31, 41, 55);
  if (safeData.lineItems.length > 0) {
    safeData.lineItems.forEach(item => {
      doc.text(item.description || 'Item', colStarts[0] + 2, y + 7);
      doc.text(String(item.quantity || 0), colStarts[1] + 2, y + 7);
      doc.text(`$${(Number(item.rate) || 0).toFixed(2)}`, colStarts[2] + 2, y + 7);
      doc.text(`$${(Number(item.amount) || 0).toFixed(2)}`, colStarts[3] + 2, y + 7);
      y += 10;
      
      // Draw bottom border
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, 190, y);
    });
  } else {
    doc.text('No items', colStarts[0] + 2, y + 7);
    doc.text('-', colStarts[1] + 2, y + 7);
    doc.text('-', colStarts[2] + 2, y + 7);
    doc.text('$0.00', colStarts[3] + 2, y + 7);
    y += 10;
  }
  
  // Table border
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, tableTop, 170, y - tableTop);
  
  // Total
  y += 20;
  doc.setFontSize(12);
  doc.text('Total:', 150, y);
  doc.setFontSize(12);
  doc.text(`$${total.toFixed(2)}`, 170, y);
  
  // Notes
  if (safeData.notes) {
    y += 20;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Notes:', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(safeData.notes, margin, y);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  
  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 