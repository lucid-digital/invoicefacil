import { NextRequest, NextResponse } from 'next/server';
import { setupSupabase } from '@/lib/supabase-setup';

export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const setupKey = process.env.SETUP_SECRET_KEY;
    
    // If a setup key is defined, require it
    if (setupKey && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== setupKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const success = await setupSupabase();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Supabase setup completed successfully' 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase setup failed. Check server logs for details.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in setup API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during setup' 
      },
      { status: 500 }
    );
  }
} 