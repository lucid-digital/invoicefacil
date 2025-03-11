'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from Invoice Generator');
  const [loading, setLoading] = useState(false);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      toast.success('Test email sent successfully! Please check your inbox.');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email. Please check your email configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test Email Configuration</h1>
          <Button variant="outline" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Use this form to test your email configuration. This will send a test email to the address you provide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Email Configuration Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Resend Setup</h3>
              <p className="text-muted-foreground mb-2">
                To use email functionality, you need to set up Resend in your .env.local file:
              </p>
              <div className="bg-muted p-4 rounded-md">
                <code className="text-sm">
                  RESEND_API_KEY=re_your_api_key_here<br/>
                  NEXT_PUBLIC_EMAIL_DOMAIN=yourdomain.com<br/>
                  NEXT_PUBLIC_EMAIL_FROM_NAME=Your Company Name
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Troubleshooting</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Make sure your Resend API key is valid</li>
                <li>Verify that your domain is configured correctly in Resend</li>
                <li>Check that your .env.local file has the correct values</li>
                <li>Look for any error messages in the console</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 