'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InvoicePDF from '../../../components/InvoicePDF';

// This would be replaced with actual data fetching in a real app
const getMockInvoice = (id: string) => {
  return {
    invoiceNumber: id,
    issueDate: '2023-06-15',
    dueDate: '2023-07-15',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acmecorp.com',
    lineItems: [
      { id: '1', description: 'Web Development Services', quantity: 40, rate: 75, amount: 3000 },
      { id: '2', description: 'UI/UX Design', quantity: 20, rate: 85, amount: 1700 },
      { id: '3', description: 'Server Maintenance', quantity: 10, rate: 95, amount: 950 },
    ],
    notes: 'Payment is due within 30 days. Please make checks payable to Your Company Name or pay online at yourcompany.com/pay',
  };
};

export default function InvoicePDFPage() {
  const params = useParams();
  const invoiceId = typeof params.id === 'string' ? params.id : '';
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const data = getMockInvoice(invoiceId);
    setInvoiceData(data);
    setLoading(false);
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Invoice Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Link 
            href="/invoices" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Invoice PDF Preview</h1>
          <div className="flex space-x-4">
            <Link 
              href={`/invoices/${invoiceId}`} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Details
            </Link>
            <Link 
              href="/invoices" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to Invoices
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <InvoicePDF data={invoiceData} />
        </div>
      </div>
    </div>
  );
} 