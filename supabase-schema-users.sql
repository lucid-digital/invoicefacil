-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add user_id to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Add user_id to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Add user_id to recurring_invoices table
ALTER TABLE public.recurring_invoices 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON public.recurring_invoices(user_id);

-- Create RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON public.users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY users_update_own ON public.users
    FOR UPDATE
    USING (id = auth.uid());

-- Create RLS policies for business_profiles table
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_profiles_select_own ON public.business_profiles
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY business_profiles_insert_own ON public.business_profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY business_profiles_update_own ON public.business_profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- Create RLS policies for invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoices_select_own ON public.invoices
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY invoices_insert_own ON public.invoices
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY invoices_update_own ON public.invoices
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY invoices_delete_own ON public.invoices
    FOR DELETE
    USING (user_id = auth.uid());

-- Create RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_select_own ON public.clients
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY clients_insert_own ON public.clients
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY clients_update_own ON public.clients
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY clients_delete_own ON public.clients
    FOR DELETE
    USING (user_id = auth.uid());

-- Create RLS policies for recurring_invoices table
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY recurring_invoices_select_own ON public.recurring_invoices
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY recurring_invoices_insert_own ON public.recurring_invoices
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY recurring_invoices_update_own ON public.recurring_invoices
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY recurring_invoices_delete_own ON public.recurring_invoices
    FOR DELETE
    USING (user_id = auth.uid()); 