-- Migration: Add recurring invoice tracking
-- This migration adds a recurring_invoice_id column to the invoices table to track which invoices were generated from recurring invoices

-- Add recurring_invoice_id column to invoices table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices')
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'recurring_invoice_id') THEN
        
        -- Add recurring_invoice_id column to invoices table
        ALTER TABLE invoices ADD COLUMN recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE SET NULL;
        
        -- Create index for recurring_invoice_id
        CREATE INDEX idx_invoices_recurring_invoice_id ON invoices(recurring_invoice_id);
    END IF;
END
$$; 