'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { RecurringInvoice, RecurringLineItem, Invoice } from "@/lib/supabase";
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
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceData extends RecurringInvoice {
  lineItems: RecurringLineItem[];
}

export default function RecurringInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    async function fetchRecurringInvoice() {
      try {
        const response = await fetch(`/api/recurring-invoices/${invoiceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recurring invoice');
        }
        
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching recurring invoice:', err);
        setError('Failed to load recurring invoice details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecurringInvoice();
  }, [invoiceId]);

  useEffect(() => {
    async function fetchGeneratedInvoices() {
      if (!invoiceId) return;
      
      setLoadingInvoices(true);
      try {
        const response = await fetch(`/api/recurring-invoices/${invoiceId}/invoices`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch generated invoices');
        }
        
        const data = await response.json();
        setGeneratedInvoices(data);
      } catch (err) {
        console.error('Error fetching generated invoices:', err);
        // Don't show an error toast here, as this is not critical
      } finally {
        setLoadingInvoices(false);
      }
    }
    
    if (invoice) {
      fetchGeneratedInvoices();
    }
  }, [invoiceId, invoice]);

  const handleDeleteInvoice = async () => {
    if (!confirm('Are you sure you want to delete this recurring invoice?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/recurring-invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recurring invoice');
      }
      
      toast.success('Recurring invoice deleted successfully');
      router.push('/recurring-invoices');
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
      toast.error('Failed to delete recurring invoice. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleSendNotification = async () => {
    setIsSendingEmail(true);
    
    try {
      const response = await fetch(`/api/recurring-invoices/${invoiceId}/send`, {
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
        : `Notification email sent to ${invoice?.client_email || 'client'}`
      );
      setIsEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending notification email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Paused</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return frequency;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recurring invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error || 'Recurring invoice not found'}</p>
            <Button asChild>
              <Link href="/recurring-invoices">Back to Recurring Invoices</Link>
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
          <h1 className="text-3xl font-bold">Recurring Invoice Details</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/recurring-invoices">Back to Recurring Invoices</Link>
            </Button>
            
            {invoice && (
              <>
                <Button
                  onClick={() => setIsEmailDialogOpen(true)}
                >
                  Send Email Notification
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href={`/recurring-invoices/${invoiceId}/edit`}>Edit</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recurring Invoice Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prefix</p>
                    <p className="font-medium">{invoice.invoice_number_prefix}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{getStatusBadge(invoice.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-medium">{getFrequencyText(invoice.frequency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(invoice.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Invoice Date</p>
                    <p className="font-medium">{new Date(invoice.next_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{invoice.end_date ? new Date(invoice.end_date).toLocaleDateString() : 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems && invoice.lineItems.map((item, index) => (
                      <TableRow key={index}>
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
                  <p className="whitespace-pre-wrap">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generated Invoices</CardTitle>
                  <CardDescription>
                    Invoices created from this recurring schedule
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {generatedInvoices.length} {generatedInvoices.length === 1 ? 'Invoice' : 'Invoices'}
                </Badge>
              </CardHeader>
              <CardContent>
                {loadingInvoices ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : generatedInvoices.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No invoices have been generated yet.</p>
                    <p className="text-sm mt-2">
                      Invoices will appear here after they are generated from this recurring schedule.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedInvoices.map((genInvoice) => (
                      <div key={genInvoice.id} className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <p className="font-medium">{genInvoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(genInvoice.issue_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">${genInvoice.total.toFixed(2)}</p>
                          {getStatusBadge(genInvoice.status)}
                          <Button variant="ghost" size="sm" asChild className="ml-2">
                            <Link href={`/invoices/${genInvoice.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {generatedInvoices.length > 0 && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`/recurring-invoices/${invoiceId}/generate`, '_blank')}
                    className="ml-auto"
                  >
                    Generate New Invoice
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{invoice.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{invoice.client_email}</p>
                  </div>
                  {invoice.client_id && (
                    <div className="pt-4">
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/clients/${invoice.client_id}`}>View Client Profile</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice && (
                  <>
                    <Button asChild className="w-full">
                      <Link href={`/recurring-invoices/${invoiceId}/edit`}>Edit Recurring Invoice</Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsEmailDialogOpen(true)}
                    >
                      Send Email Notification
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleDeleteInvoice}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Recurring Invoice'}
                    </Button>
                    <Separator className="my-2" />
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/recurring-invoices/generate">Generate Invoices</Link>
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
            <DialogTitle>Send Email Notification</DialogTitle>
            <DialogDescription>
              Notify the client about this recurring invoice.
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
            <Button onClick={handleSendNotification} disabled={isSendingEmail || (isTestMode && !testEmail)}>
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 