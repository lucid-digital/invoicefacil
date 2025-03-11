-- This script assigns all existing data to a specific user
-- Replace 'YOUR_USER_ID' with the actual UUID of your first user

-- Update invoices
UPDATE public.invoices
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL;

-- Update clients
UPDATE public.clients
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL;

-- Update recurring_invoices
UPDATE public.recurring_invoices
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL; 