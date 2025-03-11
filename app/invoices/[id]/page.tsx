'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Link2, Copy, Check } from "lucide-react";

interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  total: number;
  lineItems: LineItem[];
  recurring_invoice_id?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  const [isPublicLinkDialogOpen, setIsPublicLinkDialogOpen] = useState(false);
  const [publicLink, setPublicLink] = useState('');

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invoice not found');
          } else {
            throw new Error('Failed to fetch invoice');
          }
          return;
        }
        
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'sent':
      case 'draft':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteInvoice = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      toast.success('Invoice deleted successfully');
      router.push('/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast.error('Failed to delete invoice. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendInvoice = async () => {
    setIsSendingEmail(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: isTestMode ? { email: testEmail } : undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      toast.success(isTestMode 
        ? `Test email sent to ${testEmail}`
        : `Invoice email sent to ${invoice?.client_email || 'client'}`
      );
      setIsEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendReminder = async () => {
    setIsSendingEmail(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: isTestMode ? { email: testEmail } : undefined,
          message: reminderMessage
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder email');
      }
      
      toast.success(isTestMode 
        ? `Test reminder email sent to ${testEmail}`
        : `Reminder email sent to ${invoice?.client_email || 'client'}`
      );
      setIsReminderDialogOpen(false);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      toast.error('Failed to send reminder email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePayNow = async () => {
    if (invoice?.status === 'paid') {
      toast.info('This invoice has already been paid.');
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }
      
      // Redirect to Stripe Checkout
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      } else if (!data.url) {
        throw new Error('No payment URL returned');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGenerateInvoiceLink = () => {
    // Create the public link - ensure we're on the client side
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const link = `${origin}/public/invoices/${invoiceId}`;
      setPublicLink(link);
      setIsPublicLinkDialogOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setPublicLinkCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setPublicLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              {error || "The invoice you're looking for doesn't exist or has been deleted."}
            </p>
            <Button asChild>
              <Link href="/invoices">Back to Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Invoice {invoice?.invoice_number || 'Details'}
            </h1>
            {invoice?.recurring_invoice_id && (
              <div className="mt-2 flex items-center">
                <Badge className="bg-primary text-primary-foreground mr-2">
                  Recurring
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Generated from a recurring template
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/invoices">Back to Invoices</Link>
            </Button>
            
            {invoice && (
              <>
                <Button
                  onClick={() => setIsEmailDialogOpen(true)}
                >
                  Send Email
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsReminderDialogOpen(true)}
                >
                  Send Reminder
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <div className="mb-4">{getStatusBadge(invoice.status)}</div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Issue Date</h3>
                  <p className="mb-4">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                  <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Bill To</h3>
                  <p className="font-medium">{invoice.client_name}</p>
                  <p className="text-muted-foreground">{invoice.client_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
                {invoice.status !== 'paid' ? (
                  <Button 
                    className="w-full mt-4" 
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </span>
                    )}
                  </Button>
                ) : (
                  <Badge className="w-full flex justify-center py-2 mt-4 bg-green-500">
                    Paid
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {invoice.notes}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice && (
                  <>
                    <Button asChild className="w-full">
                      <Link href={`/invoices/${invoiceId}/pdf`}>View PDF</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/invoices/${invoiceId}/edit`}>Edit Invoice</Link>
                    </Button>
                    
                    <Button 
                      className="w-full"
                      onClick={() => setIsEmailDialogOpen(true)}
                    >
                      Send Invoice Email
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsReminderDialogOpen(true)}
                    >
                      Send Payment Reminder
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGenerateInvoiceLink}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Generate Invoice Link
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleDeleteInvoice}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Invoice'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice Email</DialogTitle>
            <DialogDescription>
              Send this invoice to the client via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="testMode"
                checked={isTestMode}
                onCheckedChange={(checked) => setIsTestMode(!!checked)} 
              />
              <Label htmlFor="testMode">Send as test email</Label>
            </div>
            
            {isTestMode && (
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                />
              </div>
            )}
            
            {!isTestMode && invoice && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">Recipient Details</p>
                <p className="text-sm">Name: {invoice.client_name}</p>
                <p className="text-sm">Email: {invoice.client_email}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvoice} disabled={isSendingEmail || (isTestMode && !testEmail)}>
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder to the client about this invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminderTestMode"
                checked={isTestMode}
                onCheckedChange={(checked) => setIsTestMode(!!checked)} 
              />
              <Label htmlFor="reminderTestMode">Send as test email</Label>
            </div>
            
            {isTestMode && (
              <div className="space-y-2">
                <Label htmlFor="reminderTestEmail">Test Email Address</Label>
                <Input
                  id="reminderTestEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                />
              </div>
            )}
            
            {!isTestMode && invoice && (
              <div className="rounded-md bg-muted p-4 mb-4">
                <p className="text-sm font-medium">Recipient Details</p>
                <p className="text-sm">Name: {invoice.client_name}</p>
                <p className="text-sm">Email: {invoice.client_email}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reminderMessage">Additional Message (Optional)</Label>
              <Textarea
                id="reminderMessage"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Add a personal message to the reminder email"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder} disabled={isSendingEmail || (isTestMode && !testEmail)}>
              {isSendingEmail ? 'Sending...' : 'Send Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPublicLinkDialogOpen} onOpenChange={setIsPublicLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Invoice Link</DialogTitle>
            <DialogDescription>
              This link can be shared with your client to view and pay the invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                value={publicLink}
                readOnly
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleCopyLink}
                variant="outline"
              >
                {publicLinkCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Note:</strong> This link is publicly accessible. Anyone with this link can view the invoice details.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPublicLinkDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 