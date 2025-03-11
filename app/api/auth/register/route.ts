import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called');
    
    const { email, password, first_name, last_name } = await request.json();
    console.log('Registration data received:', { email, first_name, last_name });
    
    // Basic validation
    if (!email || !password || !first_name || !last_name) {
      console.log('Registration validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking existing user:', existingUserError);
      return NextResponse.json(
        { error: 'Failed to check if user exists' },
        { status: 500 }
      );
    }
      
    if (existingUser) {
      console.log('Registration failed: Email already in use');
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert the user into the database
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name,
        last_name
      })
      .select('id, email, first_name, last_name, created_at, updated_at')
      .single();
      
    if (error) {
      console.error('Error registering user:', error);
      return NextResponse.json(
        { error: 'Failed to register user: ' + error.message },
        { status: 500 }
      );
    }
    
    console.log('User registered successfully:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in registration API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 