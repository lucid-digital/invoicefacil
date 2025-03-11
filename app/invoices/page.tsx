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
import { Invoice } from "@/lib/supabase";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch('/api/invoices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvoices();
  }, []);

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

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      // Remove the deleted invoice from the state
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          <Button asChild>
            <Link href="/invoices/new">Create New Invoice</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No invoices found</p>
                <Button asChild>
                  <Link href="/invoices/new">Create Your First Invoice</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.recurring_invoice_id ? (
                          <Badge variant="outline" className="text-primary border-primary">
                            Recurring
                          </Badge>
                        ) : (
                          <Badge variant="outline">One-time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>Edit</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/invoices/${invoice.id}/pdf`}>PDF</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteInvoice(invoice.id)}
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