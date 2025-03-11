-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  client_id UUID,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  notes TEXT,
  total DECIMAL(10, 2) NOT NULL
);

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

-- Add foreign key constraint to invoices table
ALTER TABLE invoices ADD CONSTRAINT fk_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Create line_items table
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL
);

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
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX idx_recurring_invoices_client_id ON recurring_invoices(client_id);
CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_date);
CREATE INDEX idx_recurring_line_items_invoice_id ON recurring_line_items(recurring_invoice_id);
CREATE INDEX idx_payment_links_invoice_id ON payment_links(invoice_id);
CREATE INDEX idx_payment_links_token ON payment_links(token);

-- Create RLS policies
-- Note: In a real app, you would set up proper RLS policies based on user authentication
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations for simplicity
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on line_items" ON line_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on recurring_invoices" ON recurring_invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on recurring_line_items" ON recurring_line_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_links" ON payment_links FOR ALL USING (true);

-- Sample data (optional)
-- Add sample clients
INSERT INTO clients (user_id, name, business_name, email, phone, address, city, state, zip, country)
VALUES 
  ('anonymous', 'John Smith', 'Acme Corp', 'john@acmecorp.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA'),
  ('anonymous', 'Jane Doe', 'Globex Inc', 'jane@globex.com', '555-987-6543', '456 Park Ave', 'San Francisco', 'CA', '94107', 'USA'),
  ('anonymous', 'Tony Stark', 'Stark Industries', 'tony@stark.com', '555-111-2222', '789 Tech Blvd', 'Malibu', 'CA', '90265', 'USA');

-- Update sample invoices to reference clients
UPDATE invoices SET client_id = (SELECT id FROM clients WHERE business_name = 'Acme Corp') WHERE invoice_number = 'INV-001';
UPDATE invoices SET client_id = (SELECT id FROM clients WHERE business_name = 'Globex Inc') WHERE invoice_number = 'INV-002';
UPDATE invoices SET client_id = (SELECT id FROM clients WHERE business_name = 'Stark Industries') WHERE invoice_number = 'INV-003';

-- Add sample recurring invoices
INSERT INTO recurring_invoices (user_id, client_id, invoice_number_prefix, client_name, client_email, frequency, start_date, next_date, status, total)
VALUES 
  ('anonymous', (SELECT id FROM clients WHERE business_name = 'Acme Corp'), 'RINV-', 'Acme Corp', 'billing@acmecorp.com', 'monthly', '2023-06-01', '2023-07-01', 'active', 500.00),
  ('anonymous', (SELECT id FROM clients WHERE business_name = 'Globex Inc'), 'RINV-', 'Globex Inc', 'accounts@globex.com', 'quarterly', '2023-06-01', '2023-09-01', 'active', 1500.00);

-- Add sample recurring line items
INSERT INTO recurring_line_items (recurring_invoice_id, description, quantity, rate, amount)
VALUES 
  ((SELECT id FROM recurring_invoices WHERE client_name = 'Acme Corp'), 'Monthly Maintenance', 1, 500.00, 500.00),
  ((SELECT id FROM recurring_invoices WHERE client_name = 'Globex Inc'), 'Quarterly Consulting', 10, 150.00, 1500.00);

-- Add sample payment links
INSERT INTO payment_links (invoice_id, token, expires_at)
VALUES 
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-001'), 'pay_acme_123456', NOW() + INTERVAL '30 days'),
  ((SELECT id FROM invoices WHERE invoice_number = 'INV-002'), 'pay_globex_789012', NOW() + INTERVAL '30 days'); 