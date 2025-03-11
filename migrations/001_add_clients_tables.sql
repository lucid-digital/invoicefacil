-- Migration: Add clients tables and relationships
-- This migration adds the clients table and updates the invoices table to reference clients

-- Check if clients table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
        -- Create clients table
        CREATE TABLE clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          business_name TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip TEXT,
          country TEXT,
          notes TEXT
        );

        -- Create indexes for clients
        CREATE INDEX idx_clients_user_id ON clients(user_id);
        CREATE INDEX idx_clients_email ON clients(email);

        -- Enable RLS on clients table
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy for clients
        CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
        
        -- Add sample clients
        INSERT INTO clients (user_id, name, business_name, email, phone, address, city, state, zip, country)
        VALUES 
          ('anonymous', 'John Smith', 'Acme Corp', 'john@acmecorp.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA'),
          ('anonymous', 'Jane Doe', 'Globex Inc', 'jane@globex.com', '555-987-6543', '456 Park Ave', 'San Francisco', 'CA', '94107', 'USA'),
          ('anonymous', 'Tony Stark', 'Stark Industries', 'tony@stark.com', '555-111-2222', '789 Tech Blvd', 'Malibu', 'CA', '90265', 'USA');
    END IF;
END
$$;

-- Check if invoices table exists and if client_id column doesn't exist, add it
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        
        -- Add client_id column to invoices table
        ALTER TABLE invoices ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
        
        -- Create index for client_id
        CREATE INDEX idx_invoices_client_id ON invoices(client_id);
        
        -- Update existing invoices to reference clients based on client_name
        UPDATE invoices SET client_id = (SELECT id FROM clients WHERE business_name = client_name LIMIT 1)
        WHERE client_name IN (SELECT business_name FROM clients);
    END IF;
END
$$;

-- Check if recurring_invoices table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_invoices') THEN
        -- Create recurring_invoices table
        CREATE TABLE recurring_invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id TEXT NOT NULL,
          client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
          invoice_number_prefix TEXT NOT NULL,
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
          start_date DATE NOT NULL,
          end_date DATE,
          next_date DATE NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
          notes TEXT,
          total DECIMAL(10, 2) NOT NULL
        );

        -- Create recurring_line_items table
        CREATE TABLE recurring_line_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          recurring_invoice_id UUID NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          rate DECIMAL(10, 2) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL
        );

        -- Create indexes
        CREATE INDEX idx_recurring_invoices_user_id ON recurring_invoices(user_id);
        CREATE INDEX idx_recurring_invoices_client_id ON recurring_invoices(client_id);
        CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_date);
        CREATE INDEX idx_recurring_line_items_invoice_id ON recurring_line_items(recurring_invoice_id);

        -- Enable RLS
        ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
        ALTER TABLE recurring_line_items ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Allow all operations on recurring_invoices" ON recurring_invoices FOR ALL USING (true);
        CREATE POLICY "Allow all operations on recurring_line_items" ON recurring_line_items FOR ALL USING (true);

        -- Add sample recurring invoices
        INSERT INTO recurring_invoices (user_id, client_id, invoice_number_prefix, client_name, client_email, frequency, start_date, next_date, status, total)
        VALUES 
          ('anonymous', (SELECT id FROM clients WHERE business_name = 'Acme Corp' LIMIT 1), 'RINV-', 'Acme Corp', 'billing@acmecorp.com', 'monthly', '2023-06-01', '2023-07-01', 'active', 500.00),
          ('anonymous', (SELECT id FROM clients WHERE business_name = 'Globex Inc' LIMIT 1), 'RINV-', 'Globex Inc', 'accounts@globex.com', 'quarterly', '2023-06-01', '2023-09-01', 'active', 1500.00);

        -- Add sample recurring line items
        INSERT INTO recurring_line_items (recurring_invoice_id, description, quantity, rate, amount)
        VALUES 
          ((SELECT id FROM recurring_invoices WHERE client_name = 'Acme Corp' LIMIT 1), 'Monthly Maintenance', 1, 500.00, 500.00),
          ((SELECT id FROM recurring_invoices WHERE client_name = 'Globex Inc' LIMIT 1), 'Quarterly Consulting', 10, 150.00, 1500.00);
    END IF;
END
$$;

-- Check if payment_links table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_links') THEN
        -- Create payment_links table
        CREATE TABLE payment_links (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT TRUE
        );

        -- Create indexes
        CREATE INDEX idx_payment_links_invoice_id ON payment_links(invoice_id);
        CREATE INDEX idx_payment_links_token ON payment_links(token);

        -- Enable RLS
        ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        CREATE POLICY "Allow all operations on payment_links" ON payment_links FOR ALL USING (true);

        -- Add sample payment links
        INSERT INTO payment_links (invoice_id, token, expires_at)
        VALUES 
          ((SELECT id FROM invoices ORDER BY created_at DESC LIMIT 1), 'pay_acme_123456', NOW() + INTERVAL '30 days'),
          ((SELECT id FROM invoices ORDER BY created_at DESC LIMIT 1 OFFSET 1), 'pay_globex_789012', NOW() + INTERVAL '30 days');
    END IF;
END
$$; 