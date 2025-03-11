# Deploying to Vercel

This guide will help you deploy your FacilInvoice application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase account](https://app.supabase.com/) with your project set up
3. A [Stripe account](https://dashboard.stripe.com/register) for payment processing

## Step 1: Prepare Your Supabase Project

1. **Create Storage Bucket**:
   - Go to your Supabase dashboard
   - Navigate to "Storage" in the left sidebar
   - Click "New Bucket"
   - Name it `business-logos`
   - Enable "Public bucket" option
   - Click "Create bucket"

2. **Set Up RLS Policies**:
   - Go to "Table Editor" > "business_profiles"
   - Click "Authentication" in the sidebar
   - Create a policy that allows users to access their own profiles:
     - Policy name: "Users can view their own profiles"
     - Policy definition: `(user_id = auth.uid())`
     - Operations: SELECT, INSERT, UPDATE, DELETE
   - Click "Save"
   - Repeat for other tables as needed (invoices, clients, etc.)

## Step 2: Prepare Your Environment Variables

Collect the following information:

1. **Supabase Credentials**:
   - Project URL (from Supabase dashboard > Settings > API)
   - Anon Key (from Supabase dashboard > Settings > API)
   - Service Role Key (from Supabase dashboard > Settings > API)

2. **Stripe Credentials**:
   - Publishable Key (from Stripe dashboard > Developers > API keys)
   - Secret Key (from Stripe dashboard > Developers > API keys)

## Step 3: Deploy to Vercel

1. **Connect Your Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Select the repository containing your FacilInvoice app

2. **Configure Project**:
   - Project Name: Choose a name for your deployment
   - Framework Preset: Next.js
   - Root Directory: `my-app` (if your app is in a subdirectory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**:
   - Click "Environment Variables" and add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     NEXT_PUBLIC_APP_URL=your_vercel_deployment_url
     STRIPE_SECRET_KEY=your_stripe_secret_key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Step 4: Post-Deployment Configuration

1. **Update App URL**:
   - After deployment, go back to your Vercel project settings
   - Update the `NEXT_PUBLIC_APP_URL` environment variable with your actual deployment URL
   - Redeploy the application

2. **Configure Stripe Webhooks** (if needed):
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add a new endpoint with your Vercel URL + `/api/webhooks/stripe`
   - Select the events you want to listen for (e.g., `payment_intent.succeeded`)

3. **Test Your Deployment**:
   - Register a new account
   - Create a client
   - Create an invoice
   - Test the payment flow

## Troubleshooting

If you encounter issues during deployment:

1. **Check Build Logs**:
   - Go to your Vercel project
   - Click on the latest deployment
   - Check the build logs for errors

2. **Common Issues**:
   - **Environment Variables**: Make sure all required environment variables are set
   - **API Routes**: Ensure API routes are properly configured
   - **Database Connection**: Verify that your app can connect to Supabase
   - **PDF Generation**: If PDF generation fails, check the server logs

3. **Debugging**:
   - Enable development mode in Vercel to see detailed error messages
   - Check the browser console for client-side errors
   - Use `console.log` statements in your API routes to debug server-side issues

## Maintenance

1. **Monitoring**:
   - Set up Vercel Analytics to monitor your application
   - Configure alerts for deployment failures

2. **Updates**:
   - When updating your application, Vercel will automatically deploy new changes
   - Test changes locally before pushing to your repository

3. **Scaling**:
   - Upgrade your Vercel plan if you need more resources
   - Consider upgrading your Supabase plan for higher limits 