'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Client } from "@/lib/supabase";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  invoice_id?: string;
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
  client_id?: string;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Fill form with invoice data
        setInvoiceNumber(data.invoice_number);
        setClientId(data.client_id || null);
        setClientName(data.client_name);
        setClientEmail(data.client_email);
        setIssueDate(data.issue_date.split('T')[0]);
        setDueDate(data.due_date.split('T')[0]);
        setNotes(data.notes || '');
        setLineItems(data.lineItems || [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
        toast.error('Failed to load clients. You can still edit the invoice with manual client details.');
      } finally {
        setLoadingClients(false);
      }
    }
    
    if (invoiceId) {
      fetchInvoice();
      fetchClients();
    }
  }, [invoiceId]);

  const handleClientChange = (value: string) => {
    setClientId(value === 'manual' ? null : value);
    if (value !== 'manual') {
      const selectedClient = clients.find(c => c.id === value);
      if (selectedClient) {
        setClientName(selectedClient.name);
        setClientEmail(selectedClient.email);
      }
    } else {
      // Keep existing values if "Enter client manually" is selected
      if (invoice) {
        setClientName(invoice.client_name);
        setClientEmail(invoice.client_email);
      }
    }
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!clientName || !clientEmail || lineItems.some(item => !item.description)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          invoice_number: invoiceNumber,
          client_name: clientName,
          client_email: clientEmail,
          issue_date: issueDate,
          due_date: dueDate,
          status: invoice?.status || 'draft',
          notes,
          lineItems,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }
      
      toast.success('Invoice updated successfully!');
      
      // Redirect to the invoice detail page
      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              {error || "The invoice you're trying to edit doesn't exist or has been deleted."}
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
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoiceId}`}>Back to Invoice</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={clientId || 'manual'}
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client or enter details below" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Enter client manually</SelectItem>
                      {clients.map((client) => (
                        client.id ? (
                          <SelectItem key={client.id} value={client.id}>
                            {client.business_name ? `${client.name} (${client.business_name})` : client.name}
                          </SelectItem>
                        ) : null
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-6 md:col-span-5">
                      <Label htmlFor={`item-${item.id}-description`}>Description</Label>
                      <Input
                        id={`item-${item.id}-description`}
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-${item.id}-quantity`}>Qty</Label>
                      <Input
                        id={`item-${item.id}-quantity`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-${item.id}-rate`}>Rate</Label>
                      <Input
                        id={`item-${item.id}-rate`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <Label htmlFor={`item-${item.id}-amount`}>Amount</Label>
                      <div className="text-right p-2 border rounded-md bg-muted">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" onClick={addLineItem}>
                  Add Line Item
                </Button>
                
                <div className="flex justify-end text-lg font-medium pt-4">
                  <span className="mr-4">Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, instructions, or additional information..."
                  className="h-32"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" type="button" asChild>
                <Link href={`/invoices/${invoiceId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Invoice'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 