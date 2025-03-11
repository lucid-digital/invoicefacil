# Database Migrations

This directory contains SQL migration files for the Supabase database. Each migration file is designed to be idempotent, meaning it can be run multiple times without causing errors or duplicate data.

## Migration Files

- `001_add_clients_tables.sql`: Adds clients tables and relationships to existing invoices

## How to Run Migrations

1. Log in to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query" to create a new SQL query
5. Copy the contents of the migration file you want to run
6. Paste it into the SQL editor
7. Click "Run" to execute the SQL script

## Creating New Migrations

When creating new migrations, follow these guidelines:

1. Name the file with a sequential number prefix (e.g., `002_add_payment_methods.sql`)
2. Always use conditional checks to ensure the migration is idempotent:
   ```sql
   DO $$
   BEGIN
       IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'your_table') THEN
           -- Create table
       END IF;
   END
   $$;
   ```
3. For column additions:
   ```sql
   DO $$
   BEGIN
       IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'your_table')
          AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'your_table' AND column_name = 'your_column') THEN
           -- Add column
       END IF;
   END
   $$;
   ```
4. Always use explicit schema references (`public.table_name`)
5. Add comments explaining what each section does

## Migration Template

```sql
-- Migration: [Brief description]
-- [Detailed description of what this migration does]

-- [Table 1]
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'table_name') THEN
        -- Create table
        CREATE TABLE table_name (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          -- Add other columns
        );

        -- Create indexes
        CREATE INDEX idx_table_name_column ON table_name(column);

        -- Enable RLS
        ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy
        CREATE POLICY "Allow all operations on table_name" ON table_name FOR ALL USING (true);
        
        -- Add sample data if needed
        INSERT INTO table_name (column1, column2) VALUES ('value1', 'value2');
    END IF;
END
$$;

-- [Table 2 or Column Addition]
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'existing_table')
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'existing_table' AND column_name = 'new_column') THEN
        
        -- Add column
        ALTER TABLE existing_table ADD COLUMN new_column TYPE REFERENCES other_table(id);
        
        -- Create index
        CREATE INDEX idx_existing_table_new_column ON existing_table(new_column);
        
        -- Update existing data if needed
        UPDATE existing_table SET new_column = default_value WHERE condition;
    END IF;
END
$$;
``` 