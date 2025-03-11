# Supabase Setup Instructions

This application uses Supabase for database and storage. To enable automatic setup of Supabase resources (storage buckets and RLS policies), you need to add your Supabase service role key to your environment variables.

## Getting Your Supabase Service Role Key

1. Go to your [Supabase dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to "Project Settings" (gear icon in the sidebar)
4. Click on "API" in the sidebar
5. Scroll down to the "Project API keys" section
6. Copy the "service_role" key (Note: This is different from the "anon" key)

## Adding the Key to Your Environment Variables

Add the following line to your `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace `your_service_role_key_here` with the service role key you copied from the Supabase dashboard.

## Security Warning

The service role key has admin privileges and can bypass Row Level Security. Never expose this key to the client or include it in your frontend code. It should only be used in secure server-side contexts.

## What This Enables

With the service role key configured, the application will automatically:

1. Create the necessary storage buckets (like `business-logos`)
2. Set up Row Level Security (RLS) policies for your database tables
3. Configure permissions so users can only access their own data

This eliminates the need for manual setup in the Supabase dashboard.

## Troubleshooting

If you see a setup error when starting the application, check that:

1. Your `SUPABASE_SERVICE_ROLE_KEY` is correctly set in `.env.local`
2. Your Supabase project is running and accessible
3. The service role key has not been revoked or changed

You can manually trigger the setup process by visiting `/api/setup` in your browser or by refreshing the page. 