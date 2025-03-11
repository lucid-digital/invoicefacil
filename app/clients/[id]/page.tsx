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
} from "@/components/ui/table";
import { toast } from "sonner";
import { Client, Invoice } from "@/lib/supabase";

interface ClientWithInvoices extends Client {
  invoices: Invoice[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = typeof params.id === 'string' ? params.id : '';
  const [client, setClient] = useState<ClientWithInvoices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Client not found');
          } else {
            throw new Error('Failed to fetch client');
          }
          return;
        }
        
        const data = await response.json();
        setClient(data);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

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

  const handleDeleteClient = async () => {
    if (!confirm('Are you sure you want to delete this client? This will remove the client reference from all associated invoices.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      toast.success('Client deleted successfully');
      router.push('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Client Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              {error || "The client you're looking for doesn't exist or has been deleted."}
            </p>
            <Button asChild>
              <Link href="/clients">Back to Clients</Link>
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
          <h1 className="text-3xl font-bold">
            {client.business_name ? `${client.name} (${client.business_name})` : client.name}
          </h1>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href={`/clients/${clientId}/edit`}>Edit Client</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/clients">Back to Clients</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p className="mb-4">{client.email}</p>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                  <p>{client.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                  {client.address ? (
                    <div>
                      <p>{client.address}</p>
                      <p>
                        {[
                          client.city,
                          client.state,
                          client.zip
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p>{client.country}</p>
                    </div>
                  ) : (
                    <p>No address provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Client Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span>{client.invoices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span>
                    ${client.invoices
                      .filter(inv => inv.status !== 'paid')
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Billed</span>
                  <span>
                    ${client.invoices
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <Button className="w-full mt-4" asChild>
                  <Link href={`/invoices/new?client=${clientId}`}>Create New Invoice</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {client.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {client.notes}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {client.invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No invoices found for this client</p>
                <Button asChild>
                  <Link href={`/invoices/new?client=${clientId}`}>Create First Invoice</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/invoices/${invoice.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/invoices/${invoice.id}/pdf`}>PDF</Link>
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

        <div className="flex justify-end">
          <Button 
            variant="outline"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleDeleteClient}
          >
            Delete Client
          </Button>
        </div>
      </div>
    </div>
  );
} 