'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecurringInvoice } from "@/lib/supabase";
import { toast } from "sonner";

export default function RecurringInvoicesPage() {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecurringInvoices() {
      try {
        const response = await fetch('/api/recurring-invoices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recurring invoices');
        }
        
        const data = await response.json();
        setRecurringInvoices(data);
      } catch (err) {
        console.error('Error fetching recurring invoices:', err);
        setError('Failed to load recurring invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecurringInvoices();
  }, []);

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

  const handleDeleteRecurringInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring invoice?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recurring invoice');
      }
      
      // Remove the deleted recurring invoice from the state
      setRecurringInvoices(recurringInvoices.filter(invoice => invoice.id !== id));
      toast.success('Recurring invoice deleted successfully');
    } catch (err) {
      console.error('Error deleting recurring invoice:', err);
      toast.error('Failed to delete recurring invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recurring invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Button onClick={() => typeof window !== 'undefined' && window.location.reload()}>
              Try Again
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
          <h1 className="text-3xl font-bold">Recurring Invoices</h1>
          <Button asChild>
            <Link href="/recurring-invoices/new">Create New Recurring Invoice</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Recurring Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recurringInvoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No recurring invoices found</p>
                <Button asChild>
                  <Link href="/recurring-invoices/new">Create Your First Recurring Invoice</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/recurring-invoices/${invoice.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {invoice.client_name}
                        </Link>
                      </TableCell>
                      <TableCell>{getFrequencyText(invoice.frequency)}</TableCell>
                      <TableCell>{new Date(invoice.next_date).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/recurring-invoices/${invoice.id}/edit`}>Edit</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteRecurringInvoice(invoice.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 