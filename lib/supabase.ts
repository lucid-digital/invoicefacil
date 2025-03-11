import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export type Client = {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  business_name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
};

export type Invoice = {
  id: string;
  created_at: string;
  user_id: string;
  client_id?: string;
  recurring_invoice_id?: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  total: number;
};

export type LineItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type RecurringInvoice = {
  id: string;
  created_at: string;
  user_id: string;
  client_id?: string;
  invoice_number_prefix: string;
  client_name: string;
  client_email: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_date: string;
  status: 'active' | 'paused' | 'completed';
  notes?: string;
  total: number;
};

export type RecurringLineItem = {
  id: string;
  recurring_invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

// Client functions
export async function getClients(userId: string): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

export async function getClientById(id: string, userId: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    return null;
  }
}

export async function getClientInvoices(clientId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching client invoices:', error);
    return [];
  }
  
  return data as Invoice[];
}

export async function addClient(clientData: Partial<Client>, userId: string): Promise<Client | null> {
  try {
    // Add the user_id to the client data
    const dataWithUserId = {
      ...clientData,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert([dataWithUserId])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding client:', error);
    return null;
  }
}

export async function updateClient(id: string, clientData: Partial<Client>, userId: string): Promise<boolean> {
  try {
    // First check if the client belongs to this user
    const existingClient = await getClientById(id, userId);
    if (!existingClient) return false;
    
    const { error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    return false;
  }
}

export async function deleteClient(id: string, userId: string): Promise<boolean> {
  try {
    // First check if the client belongs to this user
    const existingClient = await getClientById(id, userId);
    if (!existingClient) return false;
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    return false;
  }
}

// Invoice functions
export async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function getInvoiceById(id: string, userId?: string): Promise<Invoice | null> {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        lineItems:line_items(*)
      `)
      .eq('id', id);
      
    // If userId is provided, filter by it (for authenticated requests)
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    return null;
  }
}

export async function addInvoice(invoiceData: Partial<Invoice>, userId: string): Promise<Invoice | null> {
  try {
    // Add user_id to the invoice data
    const data = {
      ...invoiceData,
      user_id: userId
    };
    
    // Ensure total is included and is a number
    if (typeof data.total !== 'number' || isNaN(data.total)) {
      data.total = 0; // Default to 0 if not provided or invalid
    }
    
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding invoice:', error);
      throw new Error(`Failed to add invoice: ${error.message}`);
    }
    
    return invoice;
  } catch (error) {
    console.error('Error in addInvoice:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
}

export async function updateInvoice(
  id: string,
  invoice: Partial<Omit<Invoice, 'id' | 'created_at'>>,
  lineItems?: Omit<LineItem, 'invoice_id'>[]
) {
  // Update the invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id);
  
  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
    return false;
  }
  
  // If line items are provided, update them
  if (lineItems) {
    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('line_items')
      .delete()
      .eq('invoice_id', id);
    
    if (deleteError) {
      console.error('Error deleting existing line items:', deleteError);
      return false;
    }
    
    // Insert new line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: id
    }));
    
    const { error: insertError } = await supabase
      .from('line_items')
      .insert(lineItemsWithInvoiceId);
    
    if (insertError) {
      console.error('Error inserting new line items:', insertError);
      return false;
    }
  }
  
  return true;
}

export async function deleteInvoice(id: string) {
  // Line items will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
  
  return true;
}

// Recurring Invoice functions
export async function getRecurringInvoices() {
  const { data, error } = await supabase
    .from('recurring_invoices')
    .select('*')
    .order('next_date');
  
  if (error) {
    console.error('Error fetching recurring invoices:', error);
    return [];
  }
  
  return data as RecurringInvoice[];
}

export async function getRecurringInvoiceById(id: string) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching recurring invoice:', invoiceError);
    return null;
  }
  
  const { data: lineItems, error: lineItemsError } = await supabase
    .from('recurring_line_items')
    .select('*')
    .eq('recurring_invoice_id', id);
  
  if (lineItemsError) {
    console.error('Error fetching recurring line items:', lineItemsError);
    return null;
  }
  
  return {
    ...invoice,
    lineItems: lineItems
  } as RecurringInvoice & { lineItems: RecurringLineItem[] };
}

export async function createRecurringInvoice(
  recurringInvoice: Omit<RecurringInvoice, 'id' | 'created_at'>,
  lineItems: Omit<RecurringLineItem, 'id' | 'recurring_invoice_id'>[]
) {
  // Insert the recurring invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('recurring_invoices')
    .insert([recurringInvoice])
    .select()
    .single();
  
  if (invoiceError) {
    console.error('Error creating recurring invoice:', invoiceError);
    return null;
  }
  
  // Insert the line items
  const lineItemsWithInvoiceId = lineItems.map(item => ({
    ...item,
    recurring_invoice_id: invoice.id
  }));
  
  const { error: lineItemsError } = await supabase
    .from('recurring_line_items')
    .insert(lineItemsWithInvoiceId);
  
  if (lineItemsError) {
    console.error('Error creating recurring line items:', lineItemsError);
    // Delete the invoice if line items failed
    await supabase.from('recurring_invoices').delete().eq('id', invoice.id);
    return null;
  }
  
  return invoice as RecurringInvoice;
}

export async function updateRecurringInvoice(
  id: string,
  recurringInvoice: Partial<Omit<RecurringInvoice, 'id' | 'created_at'>>,
  lineItems?: Omit<RecurringLineItem, 'recurring_invoice_id'>[]
) {
  // Update the recurring invoice
  const { error: invoiceError } = await supabase
    .from('recurring_invoices')
    .update(recurringInvoice)
    .eq('id', id);
  
  if (invoiceError) {
    console.error('Error updating recurring invoice:', invoiceError);
    return false;
  }
  
  // If line items are provided, update them
  if (lineItems) {
    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('recurring_line_items')
      .delete()
      .eq('recurring_invoice_id', id);
    
    if (deleteError) {
      console.error('Error deleting existing line items:', deleteError);
      return false;
    }
    
    // Insert new line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      recurring_invoice_id: id
    }));
    
    const { error: insertError } = await supabase
      .from('recurring_line_items')
      .insert(lineItemsWithInvoiceId);
    
    if (insertError) {
      console.error('Error inserting new line items:', insertError);
      return false;
    }
  }
  
  return true;
}

export async function deleteRecurringInvoice(id: string) {
  // Line items will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('recurring_invoices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting recurring invoice:', error);
    return false;
  }
  
  return true;
}

export async function getRecurringInvoicesDueToday() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('status', 'active')
    .lte('next_date', today);
  
  if (error) {
    console.error('Error fetching due recurring invoices:', error);
    return [];
  }
  
  return data as RecurringInvoice[];
}

/**
 * Get all invoices generated from a recurring invoice
 */
export async function getInvoicesFromRecurringInvoice(recurringInvoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('recurring_invoice_id', recurringInvoiceId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invoices from recurring invoice:', error);
    return [];
  }
  
  return data as Invoice[];
}

// Add a function to get the current user ID from a request
export async function getCurrentUserId(req: Request): Promise<string | null> {
  try {
    // Get the user from the session (this will depend on how you store the user in the session)
    // For example, if you're using cookies or localStorage
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    
    // Extract the user ID from the auth header
    // This is a simple example - you should implement proper JWT validation
    const userId = authHeader.replace('Bearer ', '');
    return userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

export async function getInvoiceLineItems(invoiceId: string): Promise<LineItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('line_items')
      .select('*')
      .eq('invoice_id', invoiceId);
      
    if (error) {
      console.error(`Error fetching line items for invoice ${invoiceId}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getInvoiceLineItems for invoice ${invoiceId}:`, error);
    return null;
  }
}

// Add a new function to add a line item
export async function addLineItem(itemData: Partial<LineItem>, userId: string): Promise<LineItem | null> {
  try {
    const { data, error } = await supabase
      .from('line_items')
      .insert({
        ...itemData,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding line item:', error);
      return null;
    }
    
    return data as LineItem;
  } catch (error) {
    console.error('Error in addLineItem:', error);
    return null;
  }
}

// Properly implement createInvoice to handle both invoice data and line items
export async function createInvoice(
  invoiceData: Partial<Invoice>, 
  lineItems: Partial<LineItem>[]
): Promise<Invoice | null> {
  try {
    // Add the invoice first
    const invoice = await addInvoice(invoiceData, invoiceData.user_id as string);
    
    if (!invoice) {
      console.error('Failed to create invoice');
      return null;
    }
    
    // Now add all the line items for this invoice
    for (const item of lineItems) {
      await addLineItem({
        ...item,
        invoice_id: invoice.id
      }, invoice.user_id);
    }
    
    // Return the created invoice
    return invoice;
  } catch (error) {
    console.error('Error in createInvoice:', error);
    return null;
  }
} 