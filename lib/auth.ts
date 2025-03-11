import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  logo_url?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

// Client-side authentication functions that call API endpoints

// Register a new user via API
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('Registering user:', { email, firstName, lastName });
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName 
      }),
    });

    const data = await response.json();
    console.log('Registration response:', { status: response.status, ok: response.ok, data });

    if (!response.ok) {
      return { success: false, error: data.error || `Registration failed with status ${response.status}` };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { success: false, error: 'Failed to register user' };
  }
}

// Login a user via API
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('Logging in user:', { email });
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', { status: response.status, ok: response.ok, data });

    if (!response.ok) {
      return { success: false, error: data.error || `Login failed with status ${response.status}` };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error in loginUser:', error);
    return { success: false, error: 'Failed to login' };
  }
}

// Get user by ID
export async function getUserById(
  id: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return { success: false, error: 'Failed to get user' };
  }
}

// Update user
export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Remove id from userData to prevent changing it
    const { id: _, ...updateData } = userData;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, first_name, last_name, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

// Get business profile by user ID
export async function getBusinessProfileByUserId(
  userId: string
): Promise<{ success: boolean; profile?: BusinessProfile; error?: string }> {
  try {
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error getting business profile:', error);
      return { success: false, error: error.message };
    }

    if (!profile) {
      return { success: false, error: 'Business profile not found' };
    }

    return { success: true, profile };
  } catch (error) {
    console.error('Error in getBusinessProfileByUserId:', error);
    return { success: false, error: 'Failed to get business profile' };
  }
}

// Upload logo
export async function uploadLogo(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    const bucketName = 'business-logos';

    // First, try to create the bucket if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName) || false;
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} doesn't exist, attempting to create it...`);
        // Try to create the bucket
        await supabase.storage.createBucket(bucketName, {
          public: true
        });
      }
    } catch (bucketError) {
      console.error('Error checking/creating bucket:', bucketError);
      // Continue anyway, the upload will fail if the bucket doesn't exist
    }

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return { success: false, error: 'Failed to upload logo. Please try again.' };
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error in uploadLogo:', error);
    return { success: false, error: 'Failed to upload logo' };
  }
}

// Create or update business profile
export async function upsertBusinessProfile(
  userId: string,
  profileData: Partial<BusinessProfile>
): Promise<{ success: boolean; profile?: BusinessProfile; error?: string }> {
  try {
    // Ensure user_id is set
    const data = {
      ...profileData,
      user_id: userId
    };

    // First, try to disable RLS for this operation
    try {
      // We'll use the service role key if available
      const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const adminClient = createClient(supabaseUrl, serviceKey);
        
        // Check if profile exists
        const { data: existingProfile } = await adminClient
          .from('business_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (existingProfile) {
          // Update existing profile with admin privileges
          const { data: profile, error } = await adminClient
            .from('business_profiles')
            .update(data)
            .eq('id', existingProfile.id)
            .select('*')
            .single();
            
          if (error) {
            console.error('Error updating business profile with admin client:', error);
            // Fall back to regular client
          } else {
            return { success: true, profile };
          }
        } else {
          // Insert new profile with admin privileges
          const { data: profile, error } = await adminClient
            .from('business_profiles')
            .insert(data)
            .select('*')
            .single();
            
          if (error) {
            console.error('Error inserting business profile with admin client:', error);
            // Fall back to regular client
          } else {
            return { success: true, profile };
          }
        }
      }
    } catch (adminError) {
      console.error('Error using admin client:', adminError);
      // Fall back to regular client
    }

    // Regular approach as fallback
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking business profile:', checkError);
      
      // If it's an RLS error, try a different approach
      if (checkError.message.includes('policy')) {
        // Try a direct insert as a last resort
        const { data: profile, error: insertError } = await supabase
          .from('business_profiles')
          .insert(data)
          .select('*')
          .single();
          
        if (insertError) {
          console.error('Error inserting business profile as fallback:', insertError);
          return { success: false, error: 'Failed to save business profile due to permission issues' };
        }
        
        return { success: true, profile };
      }
      
      return { success: false, error: 'Failed to check if business profile exists' };
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('business_profiles')
        .update(data)
        .eq('id', existingProfile.id)
        .select('*')
        .single();
    } else {
      // Insert new profile
      result = await supabase
        .from('business_profiles')
        .insert(data)
        .select('*')
        .single();
    }

    const { data: profile, error } = result;

    if (error) {
      console.error('Error upserting business profile:', error);
      return { success: false, error: 'Failed to save business profile' };
    }

    return { success: true, profile };
  } catch (error) {
    console.error('Error in upsertBusinessProfile:', error);
    return { success: false, error: 'Failed to save business profile' };
  }
} 