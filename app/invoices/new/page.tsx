'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('client');
  
  const [invoiceNumber, setInvoiceNumber] = useState('INV-' + Math.floor(1000 + Math.random() * 9000));
  const [clientId, setClientId] = useState<string | null>(clientIdParam);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data);
        
        // If a client ID was provided in the URL, set the client details
        if (clientIdParam) {
          const selectedClient = data.find((c: Client) => c.id === clientIdParam);
          if (selectedClient) {
            setClientName(selectedClient.name);
            setClientEmail(selectedClient.email);
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        toast.error('Failed to load clients. You can still create an invoice with manual client details.');
      } finally {
        setLoadingClients(false);
      }
    }
    
    fetchClients();
  }, [clientIdParam]);

  const handleClientChange = (value: string) => {
    setClientId(value === 'manual' ? null : value);
    if (value !== 'manual') {
      const selectedClient = clients.find(c => c.id === value);
      if (selectedClient) {
        setClientName(selectedClient.name);
        setClientEmail(selectedClient.email);
      }
    } else {
      // Clear client fields if "Enter client manually" is selected
      setClientName('');
      setClientEmail('');
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
      // Calculate the total amount from line items
      const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
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
          status: 'draft',
          notes,
          total, // Include the calculated total
          lineItems,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const data = await response.json();
      
      toast.success('Invoice created successfully!');
      
      // Redirect to the invoice detail page
      router.push(`/invoices/${data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
          <Button variant="outline" asChild>
            <Link href="/invoices">Back to Invoices</Link>
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
                    value={clientId || ''}
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
              <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
              <Separator className="mb-4" />
              
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-4">
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.amount}
                      className="bg-muted"
                      readOnly
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="h-8 w-8 text-destructive"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="mt-2"
              >
                + Add Line Item
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, notes, etc."
                    rows={3}
                  />
                </div>
                <div className="flex flex-col items-end justify-end">
                  <div className="text-sm font-medium mb-1">Total</div>
                  <div className="text-2xl font-bold">
                    ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/invoices">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 