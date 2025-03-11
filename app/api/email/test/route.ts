import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, subject } = data;
    
    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    const testEmailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Test Email from Invoice Generator</h2>
        <p>This is a test email to verify that your email service is configured correctly.</p>
        <p>If you're receiving this, your email configuration is working!</p>
        <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <p><strong>Email Service:</strong> Resend</p>
          <p><strong>Time Sent:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>You can now confidently send invoices and reminders to your clients.</p>
      </div>
    `;
    
    const testEmailText = `
      Test Email from Invoice Generator
      
      This is a test email to verify that your email service is configured correctly.
      If you're receiving this, your email configuration is working!
      
      Email Service: Resend
      Time Sent: ${new Date().toLocaleString()}
      
      You can now confidently send invoices and reminders to your clients.
    `;
    
    const result = await sendEmail({
      to: email,
      subject: subject || 'Test Email from Invoice Generator',
      html: testEmailHTML,
      text: testEmailText,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send test email', details: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 