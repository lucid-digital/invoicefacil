-- Migration: Add dummy data for recurring invoice tracking
-- This migration adds sample recurring invoices and regular invoices with tracking relationships

-- First, ensure we have some sample recurring invoices
DO $$
DECLARE
    acme_recurring_id UUID;
    globex_recurring_id UUID;
    acme_client_id UUID;
    globex_client_id UUID;
BEGIN
    -- Get client IDs (or create them if they don't exist)
    SELECT id INTO acme_client_id FROM clients WHERE business_name = 'Acme Corp' LIMIT 1;
    SELECT id INTO globex_client_id FROM clients WHERE business_name = 'Globex Inc' LIMIT 1;
    
    IF acme_client_id IS NULL THEN
        INSERT INTO clients (user_id, name, business_name, email, phone, address, city, state, zip, country)
        VALUES ('anonymous', 'John Smith', 'Acme Corp', 'john@acmecorp.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA')
        RETURNING id INTO acme_client_id;
    END IF;
    
    IF globex_client_id IS NULL THEN
        INSERT INTO clients (user_id, name, business_name, email, phone, address, city, state, zip, country)
        VALUES ('anonymous', 'Jane Doe', 'Globex Inc', 'jane@globex.com', '555-987-6543', '456 Park Ave', 'San Francisco', 'CA', '94107', 'USA')
        RETURNING id INTO globex_client_id;
    END IF;

    -- Check if we already have recurring invoices for these clients
    SELECT id INTO acme_recurring_id FROM recurring_invoices WHERE client_name = 'Acme Corp' LIMIT 1;
    SELECT id INTO globex_recurring_id FROM recurring_invoices WHERE client_name = 'Globex Inc' LIMIT 1;
    
    -- Create recurring invoices if they don't exist
    IF acme_recurring_id IS NULL THEN
        INSERT INTO recurring_invoices (
            user_id, client_id, invoice_number_prefix, client_name, client_email, 
            frequency, start_date, next_date, status, notes, total
        )
        VALUES (
            'anonymous', acme_client_id, 'ACME-', 'Acme Corp', 'billing@acmecorp.com',
            'monthly', '2023-01-01'::DATE, '2023-07-01'::DATE, 'active', 'Monthly maintenance services', 500.00
        )
        RETURNING id INTO acme_recurring_id;
        
        -- Add line items for Acme recurring invoice
        INSERT INTO recurring_line_items (recurring_invoice_id, description, quantity, rate, amount)
        VALUES 
            (acme_recurring_id, 'Website Maintenance', 1, 300.00, 300.00),
            (acme_recurring_id, 'SEO Services', 1, 200.00, 200.00);
    END IF;
    
    IF globex_recurring_id IS NULL THEN
        INSERT INTO recurring_invoices (
            user_id, client_id, invoice_number_prefix, client_name, client_email, 
            frequency, start_date, next_date, status, notes, total
        )
        VALUES (
            'anonymous', globex_client_id, 'GLOBEX-', 'Globex Inc', 'accounts@globex.com',
            'quarterly', '2023-01-01'::DATE, '2023-10-01'::DATE, 'active', 'Quarterly consulting services', 1500.00
        )
        RETURNING id INTO globex_recurring_id;
        
        -- Add line items for Globex recurring invoice
        INSERT INTO recurring_line_items (recurring_invoice_id, description, quantity, rate, amount)
        VALUES 
            (globex_recurring_id, 'Strategic Consulting', 10, 150.00, 1500.00);
    END IF;
    
    -- Now create some regular invoices linked to these recurring invoices
    -- For Acme Corp (monthly, so we'll create several past invoices)
    FOR i IN 1..6 LOOP
        INSERT INTO invoices (
            user_id, client_id, recurring_invoice_id, invoice_number, client_name, client_email,
            issue_date, due_date, status, notes, total
        )
        VALUES (
            'anonymous', acme_client_id, acme_recurring_id, 
            'ACME-' || (2023 * 100 + i), -- Creates invoice numbers like ACME-202301, ACME-202302, etc.
            'Acme Corp', 'billing@acmecorp.com',
            (DATE '2023-01-01' + ((i-1) || ' month')::INTERVAL), -- Issue date
            (DATE '2023-01-01' + ((i-1) || ' month')::INTERVAL + '15 days'::INTERVAL), -- Due date 15 days later
            CASE 
                WHEN i < 5 THEN 'paid'
                WHEN i = 5 THEN 'sent'
                ELSE 'draft'
            END,
            'Monthly maintenance services for ' || TO_CHAR(DATE '2023-01-01' + ((i-1) || ' month')::INTERVAL, 'Month YYYY'),
            500.00
        );
    END LOOP;
    
    -- For Globex Inc (quarterly, so fewer invoices)
    FOR i IN 1..2 LOOP
        INSERT INTO invoices (
            user_id, client_id, recurring_invoice_id, invoice_number, client_name, client_email,
            issue_date, due_date, status, notes, total
        )
        VALUES (
            'anonymous', globex_client_id, globex_recurring_id, 
            'GLOBEX-' || (2023 * 100 + i * 3), -- Creates invoice numbers like GLOBEX-202303, GLOBEX-202306
            'Globex Inc', 'accounts@globex.com',
            (DATE '2023-01-01' + ((i*3-3) || ' month')::INTERVAL), -- Issue date (Q1, Q2)
            (DATE '2023-01-01' + ((i*3-3) || ' month')::INTERVAL + '30 days'::INTERVAL), -- Due date 30 days later
            CASE 
                WHEN i = 1 THEN 'paid'
                ELSE 'sent'
            END,
            'Quarterly consulting services for Q' || i || ' 2023',
            1500.00
        );
    END LOOP;
    
    -- Add line items for each invoice (simplified approach - just copying from recurring template)
    -- For Acme invoices
    FOR i IN 1..6 LOOP
        WITH invoice_id AS (
            SELECT id FROM invoices WHERE invoice_number = 'ACME-' || (2023 * 100 + i) LIMIT 1
        )
        INSERT INTO line_items (invoice_id, description, quantity, rate, amount)
        SELECT 
            (SELECT id FROM invoice_id),
            description,
            quantity,
            rate,
            amount
        FROM recurring_line_items
        WHERE recurring_invoice_id = acme_recurring_id;
    END LOOP;
    
    -- For Globex invoices
    FOR i IN 1..2 LOOP
        WITH invoice_id AS (
            SELECT id FROM invoices WHERE invoice_number = 'GLOBEX-' || (2023 * 100 + i * 3) LIMIT 1
        )
        INSERT INTO line_items (invoice_id, description, quantity, rate, amount)
        SELECT 
            (SELECT id FROM invoice_id),
            description,
            quantity,
            rate,
            amount
        FROM recurring_line_items
        WHERE recurring_invoice_id = globex_recurring_id;
    END LOOP;
    
END
$$; 