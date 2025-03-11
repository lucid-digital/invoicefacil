'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GenerateRecurringInvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');

  const handleGenerateInvoices = async () => {
    if (!apiKey) {
      toast.error('Please enter the API key');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/cron/generate-recurring-invoices', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recurring invoices');
      }

      setResults(data);
      
      if (data.successful > 0) {
        toast.success(`Successfully generated ${data.successful} invoice(s)`);
      } else if (data.message === 'No recurring invoices due today') {
        toast.info('No recurring invoices are due today');
      } else {
        toast.warning('No invoices were successfully generated');
      }
    } catch (error) {
      console.error('Error generating recurring invoices:', error);
      toast.error('Failed to generate recurring invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Generate Recurring Invoices</h1>
          <Button variant="outline" asChild>
            <Link href="/recurring-invoices">Back to Recurring Invoices</Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manual Generation</CardTitle>
            <CardDescription>
              This page allows you to manually trigger the generation of recurring invoices that are due today.
              In production, this should be handled by a scheduled cron job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your CRON_API_KEY here"
                className="mb-4"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Note: The API key should match the CRON_API_KEY environment variable.
                If you don't have one set, you can add it to your .env.local file.
              </p>
            </div>
            <Button 
              onClick={handleGenerateInvoices} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Recurring Invoices'}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Generation Results</CardTitle>
            </CardHeader>
            <CardContent>
              {results.message ? (
                <p>{results.message}</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-lg font-medium">Processed</p>
                      <p className="text-3xl font-bold">{results.processed}</p>
                    </div>
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                      <p className="text-lg font-medium">Successful</p>
                      <p className="text-3xl font-bold">{results.successful}</p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-center">
                      <p className="text-lg font-medium">Failed</p>
                      <p className="text-3xl font-bold">{results.failed}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-medium mb-4">Details</h3>
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg mb-2 ${result.status === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      <p className="font-medium">
                        Invoice ID: {result.id}
                      </p>
                      <p>
                        Status: {result.status}
                      </p>
                      {result.status === 'success' && (
                        <>
                          <p>Created Invoice: {result.invoiceId}</p>
                          <p>Next Date: {result.nextDate}</p>
                        </>
                      )}
                      {result.status === 'error' && (
                        <p>Error: {result.error}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 