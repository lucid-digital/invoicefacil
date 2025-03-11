'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define types for our invoice data
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  notes: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #EEEEEE',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3B82F6', // blue-600
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'column',
    width: '48%',
  },
  infoLabel: {
    fontSize: 10,
    color: '#6B7280', // gray-500
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    marginBottom: 5,
  },
  clientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937', // gray-800
  },
  table: {
    flexDirection: 'column',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // gray-100
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  tableCol1: {
    width: '40%',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '20%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '20%',
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4B5563', // gray-600
  },
  tableRowText: {
    fontSize: 10,
    color: '#1F2937', // gray-800
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 10,
    color: '#4B5563', // gray-600
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 4,
  },
  footer: {
    fontSize: 10,
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
});

// Create PDF Document component
const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  // Ensure data is valid and has default values
  const safeData = {
    invoiceNumber: data?.invoiceNumber || 'N/A',
    issueDate: data?.issueDate || new Date().toISOString(),
    dueDate: data?.dueDate || new Date().toISOString(),
    clientName: data?.clientName || 'Client',
    clientEmail: data?.clientEmail || '',
    lineItems: Array.isArray(data?.lineItems) ? data.lineItems : [],
    notes: data?.notes || ''
  };

  const calculateTotal = () => {
    return safeData.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const formatDate = (dateString: string) => {
    try {
      // Simple date formatting to avoid date-fns dependency issues
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>INVOICE NUMBER</Text>
            <Text style={styles.infoValue}>{safeData.invoiceNumber}</Text>
            
            <Text style={styles.infoLabel}>ISSUE DATE</Text>
            <Text style={styles.infoValue}>
              {formatDate(safeData.issueDate)}
            </Text>
            
            <Text style={styles.infoLabel}>DUE DATE</Text>
            <Text style={styles.infoValue}>
              {formatDate(safeData.dueDate)}
            </Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.infoValue}>{safeData.clientName}</Text>
            <Text style={styles.infoValue}>{safeData.clientEmail}</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCol1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol2]}>Quantity</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol3]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol4]}>Amount</Text>
          </View>
          
          {safeData.lineItems.length > 0 ? (
            safeData.lineItems.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableRowText, styles.tableCol1]}>{item.description || 'Item'}</Text>
                <Text style={[styles.tableRowText, styles.tableCol2]}>{item.quantity || 0}</Text>
                <Text style={[styles.tableRowText, styles.tableCol3]}>${(Number(item.rate) || 0).toFixed(2)}</Text>
                <Text style={[styles.tableRowText, styles.tableCol4]}>${(Number(item.amount) || 0).toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableRowText, styles.tableCol1]}>No items</Text>
              <Text style={[styles.tableRowText, styles.tableCol2]}>-</Text>
              <Text style={[styles.tableRowText, styles.tableCol3]}>-</Text>
              <Text style={[styles.tableRowText, styles.tableCol4]}>$0.00</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
        </View>

        {/* Notes */}
        {safeData.notes && (
          <View>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.notes}>{safeData.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 