-- This script will assign all existing data to a specific user
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID of the user you want to assign data to

-- First, make sure the user exists
DO $$
DECLARE
    user_id UUID := 'YOUR_USER_ID_HERE';
    user_exists BOOLEAN;
BEGIN
    -- Check if the user exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'User with ID % does not exist', user_id;
    END IF;
    
    -- Update all invoices
    UPDATE public.invoices
    SET user_id = user_id
    WHERE user_id IS NULL;
    
    -- Update all clients
    UPDATE public.clients
    SET user_id = user_id
    WHERE user_id IS NULL;
    
    -- Update all recurring invoices
    UPDATE public.recurring_invoices
    SET user_id = user_id
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Successfully assigned all existing data to user %', user_id;
END $$; 