import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);
    
    // Basic validation
    if (!email || !password) {
      console.log('Login validation failed: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get the user from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, created_at, updated_at')
      .eq('email', email)
      .single();
      
    if (error) {
      console.error('Error fetching user during login:', error);
      
      // Don't expose whether the user exists or not for security
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('Login failed: Password mismatch for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Remove password_hash from the returned user object
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', userWithoutPassword.id);
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 