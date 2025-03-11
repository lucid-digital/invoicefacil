import { NextRequest } from 'next/server';
import { getUserById, User } from '@/lib/auth';

/**
 * Gets the current user from the request
 * This uses the user ID stored in localStorage which is sent in the request headers
 */
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Get the user ID from the Authorization header
    // Format: "Bearer USER_ID"
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const userId = authHeader.replace('Bearer ', '');
    
    if (!userId) {
      return null;
    }
    
    // Get the user from the database
    const { success, user } = await getUserById(userId);
    
    if (!success || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
} 