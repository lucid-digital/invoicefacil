import { NextRequest, NextResponse } from 'next/server';
import { getClients, addClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';

// GET /api/clients - Get all clients for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get clients for this user
    const clients = await getClients(userId);
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Create the client with the user ID
    const client = await addClient(body, userId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 