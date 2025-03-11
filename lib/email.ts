import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface InvoiceEmailData {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  pdfUrl?: string;
  paymentLink?: string;
  isReminder?: boolean;
  customMessage?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set. Email will not be sent.');
    return { success: false, error: 'RESEND_API_KEY is not set' };
  }

  const { from, to, subject, html, text, replyTo, cc, bcc } = options;

  try {
    const result = await resend.emails.send({
      from: from || `Invoice Generator <no-reply@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'example.com'}>`,
      to,
      subject,
      html,
      text,
      reply_to: replyTo,
      cc,
      bcc,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send invoice email to client
 */
export async function sendInvoiceEmail(email: string, data: InvoiceEmailData) {
  const { invoiceNumber, clientName, amount, dueDate, pdfUrl, paymentLink, isReminder, customMessage } = data;

  // Format the amount as currency
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);

  // Format the due date
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine subject line based on whether this is a reminder
  const subject = isReminder
    ? `REMINDER: Invoice ${invoiceNumber} from Your Company Name`
    : `Invoice ${invoiceNumber} from Your Company Name`;

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${isReminder ? 'REMINDER: ' : ''}Invoice ${invoiceNumber}</h2>
      <p>Hello ${clientName},</p>
      ${isReminder 
        ? `<p>This is a friendly reminder about your outstanding invoice with the details below:</p>` 
        : `<p>We hope this email finds you well. Please find attached your invoice with the details below:</p>`
      }
      
      ${customMessage || ''}
      
      <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount:</strong> ${formattedAmount}</p>
        <p><strong>Due Date:</strong> ${formattedDueDate}</p>
      </div>
      
      ${pdfUrl ? `<p><a href="${pdfUrl}" style="background-color: #4C51BF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">View Invoice</a></p>` : ''}
      
      ${paymentLink ? `<p><a href="${paymentLink}" style="background-color: #48BB78; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Pay Now</a></p>` : ''}
      
      <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
      
      <p>Thank you for your business!</p>
      
      <p>Best regards,<br>Your Company Name</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>This is an automated email. Please do not reply directly to this message.</p>
      </div>
    </div>
  `;

  let text = `
    ${isReminder ? 'REMINDER: ' : ''}Invoice ${invoiceNumber}
    
    Hello ${clientName},
    
    ${isReminder 
      ? 'This is a friendly reminder about your outstanding invoice with the details below:' 
      : 'We hope this email finds you well. Please find below your invoice details:'
    }
    
    ${customMessage ? customMessage.replace(/<[^>]*>/g, '') : ''}
    
    Invoice Number: ${invoiceNumber}
    Amount: ${formattedAmount}
    Due Date: ${formattedDueDate}
    
    ${pdfUrl ? `View Invoice: ${pdfUrl}` : ''}
    ${paymentLink ? `Pay Now: ${paymentLink}` : ''}
    
    If you have any questions regarding this invoice, please don't hesitate to contact us.
    
    Thank you for your business!
    
    Best regards,
    Your Company Name
    
    This is an automated email. Please do not reply directly to this message.
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send recurring invoice notification
 */
export async function sendRecurringInvoiceEmail(email: string, data: InvoiceEmailData) {
  const { invoiceNumber, clientName, amount, dueDate, pdfUrl, paymentLink } = data;

  // Format the amount as currency
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);

  // Format the due date
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recurring Invoice ${invoiceNumber}</h2>
      <p>Hello ${clientName},</p>
      <p>We hope this email finds you well. Your recurring invoice has been generated with the details below:</p>
      
      <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount:</strong> ${formattedAmount}</p>
        <p><strong>Due Date:</strong> ${formattedDueDate}</p>
      </div>
      
      ${pdfUrl ? `<p><a href="${pdfUrl}" style="background-color: #4C51BF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">View Invoice</a></p>` : ''}
      
      ${paymentLink ? `<p><a href="${paymentLink}" style="background-color: #48BB78; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Pay Now</a></p>` : ''}
      
      <p>This is an automated invoice generated based on your recurring billing schedule.</p>
      
      <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
      
      <p>Thank you for your business!</p>
      
      <p>Best regards,<br>Your Company Name</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>This is an automated email. Please do not reply directly to this message.</p>
      </div>
    </div>
  `;

  const text = `
    Recurring Invoice ${invoiceNumber}
    
    Hello ${clientName},
    
    We hope this email finds you well. Your recurring invoice has been generated with the details below:
    
    Invoice Number: ${invoiceNumber}
    Amount: ${formattedAmount}
    Due Date: ${formattedDueDate}
    
    ${pdfUrl ? `View Invoice: ${pdfUrl}` : ''}
    ${paymentLink ? `Pay Now: ${paymentLink}` : ''}
    
    This is an automated invoice generated based on your recurring billing schedule.
    
    If you have any questions regarding this invoice, please don't hesitate to contact us.
    
    Thank you for your business!
    
    Best regards,
    Your Company Name
    
    This is an automated email. Please do not reply directly to this message.
  `;

  return sendEmail({
    to: email,
    subject: `Recurring Invoice ${invoiceNumber} from Your Company Name`,
    html,
    text,
  });
} 