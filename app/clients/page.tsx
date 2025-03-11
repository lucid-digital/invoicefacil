'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/lib/supabase";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClients();
  }, []);

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will remove the client reference from all associated invoices.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      // Remove the deleted client from the state
      setClients(clients.filter(client => client.id !== id));
      toast.success('Client deleted successfully');
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
          <p className="text-muted-foreground">Loading clients...</p>
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <Button asChild>
            <Link href="/clients/new">Add New Client</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No clients found</p>
                <Button asChild>
                  <Link href="/clients/new">Add Your First Client</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell>{client.business_name || '-'}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        {client.city && client.state ? `${client.city}, ${client.state}` : (client.city || client.state || '-')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/clients/${client.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/clients/${client.id}/edit`}>Edit</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteClient(client.id)}
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