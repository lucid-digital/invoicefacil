import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';

// GET /api/clients/[id] - Get a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the client, ensuring it belongs to this user
    const client = await getClientById(id, userId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(client);
  } catch (error) {
    console.error(`Error in GET /api/clients/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a specific client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Update the client, ensuring it belongs to this user
    const success = await updateClient(id, body, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update client or client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in PUT /api/clients/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a specific client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the current user ID
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete the client, ensuring it belongs to this user
    const success = await deleteClient(id, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete client or client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/clients/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 