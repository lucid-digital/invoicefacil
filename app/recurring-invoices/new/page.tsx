'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from "@/components/ui/checkbox";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function NewRecurringInvoicePage() {
  const router = useRouter();
  
  // State variables
  const [invoiceNumberPrefix, setInvoiceNumberPrefix] = useState('RINV-');
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Calculate next date based on start date and frequency
  const [nextDate, setNextDate] = useState('');
  
  useEffect(() => {
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
        toast.error('Failed to load clients. You can still create a recurring invoice with manual client details.');
      } finally {
        setLoadingClients(false);
      }
    }
    
    fetchClients();
  }, []);
  
  // Calculate next date when start date or frequency changes
  useEffect(() => {
    if (!startDate) return;
    
    const start = new Date(startDate);
    const next = new Date(start);
    
    switch (frequency) {
      case 'weekly':
        next.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(start.getFullYear() + 1);
        break;
    }
    
    setNextDate(next.toISOString().split('T')[0]);
  }, [startDate, frequency]);

  const handleClientChange = (value: string) => {
    if (value === 'manual') {
      setClientId(null);
      setClientName('');
      setClientEmail('');
      return;
    }
    
    setClientId(value);
    const selectedClient = clients.find(c => c.id === value);
    if (selectedClient) {
      setClientName(selectedClient.name);
      setClientEmail(selectedClient.email);
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
      // Prepare line items by removing the temporary id field
      const lineItemsForSubmission = lineItems.map(({ id, ...item }) => item);
      
      const response = await fetch('/api/recurring-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          invoice_number_prefix: invoiceNumberPrefix,
          client_name: clientName,
          client_email: clientEmail,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          next_date: nextDate,
          status: 'active',
          notes,
          total: calculateTotal(),
          lineItems: lineItemsForSubmission,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create recurring invoice');
      }
      
      const data = await response.json();
      
      toast.success('Recurring invoice created successfully!');
      
      // Send email notification if requested
      if (sendEmail) {
        setSendingEmail(true);
        try {
          const emailResponse = await fetch(`/api/recurring-invoices/${data.id}/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // No test mode, send to actual client
            }),
          });
          
          if (emailResponse.ok) {
            toast.success('Email notification sent to client');
          } else {
            toast.error('Invoice was created but failed to send email notification');
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          toast.error('Invoice was created but failed to send email notification');
        } finally {
          setSendingEmail(false);
        }
      }
      
      // Redirect to the recurring invoices list
      router.push('/recurring-invoices');
    } catch (error) {
      console.error('Error creating recurring invoice:', error);
      toast.error('Failed to create recurring invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create Recurring Invoice</h1>
          <Button variant="outline" asChild>
            <Link href="/recurring-invoices">Back to Recurring Invoices</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recurring Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumberPrefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoiceNumberPrefix"
                    value={invoiceNumberPrefix}
                    onChange={(e) => setInvoiceNumberPrefix(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={frequency}
                    onValueChange={(value) => setFrequency(value as any)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                  <Label htmlFor="nextDate">Next Invoice Date</Label>
                  <Input
                    id="nextDate"
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
              <div className="grid grid-cols-12 gap-2 mb-2 font-medium">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
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
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                    >
                      <span className="text-red-500">×</span>
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="mt-2"
              >
                Add Line Item
              </Button>
              
              <div className="flex justify-end mt-6">
                <div className="w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or terms..."
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 items-stretch sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sendEmail" 
                  checked={sendEmail} 
                  onCheckedChange={(checked) => setSendEmail(checked === true)}
                />
                <Label htmlFor="sendEmail" className="cursor-pointer">
                  Send notification email to client
                </Label>
              </div>
              <div className="flex space-x-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/recurring-invoices')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || sendingEmail}
                >
                  {isSubmitting ? 'Creating...' : sendingEmail ? 'Sending Email...' : 'Create Recurring Invoice'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 