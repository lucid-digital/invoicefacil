# FacilInvoice - Simple Invoicing Solution

A modern, easy-to-use invoicing application built with Next.js, Tailwind CSS, and Supabase.

## Features

- ✅ Create and manage invoices
- ✅ Add and organize clients
- ✅ Set up recurring invoices
- ✅ Send professional invoice emails
- ✅ Accept online payments with Stripe
- ✅ Generate PDF invoices
- ✅ Track payment status
- ✅ Dark mode support
- ✅ Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Custom auth with Supabase
- **Email**: Resend
- **Payments**: Stripe
- **PDF Generation**: @react-pdf/renderer
- **Deployment**: Vercel

## Deployment to Vercel

### Prerequisites

1. A Supabase account and project set up with the required database schema
2. A Stripe account for payment processing
3. A Resend account for email sending
4. A Vercel account

### Steps to Deploy

1. **Fork or Clone the Repository**

2. **Push Your Code to GitHub**
   - Make sure your code is in a GitHub repository

3. **Set Up Environment Variables in Vercel**
   - When connecting your repository to Vercel, you'll need to set the following environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `NEXT_PUBLIC_EMAIL_DOMAIN`
     - `NEXT_PUBLIC_EMAIL_FROM_NAME`
     - `NEXT_PUBLIC_APP_URL` (will be your Vercel deployment URL)
     - `CRON_API_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

4. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure build settings (should be auto-detected)
   - Add environment variables from the list above
   - Click "Deploy"

5. **Set Up Supabase RLS Policies**
   - After deployment, visit your application URL
   - The app should automatically set up RLS policies if needed
   - Or follow the instructions in the app if prompted

6. **Set Up Stripe Webhook (Optional for Production)**
   - In your Stripe Dashboard, set up a webhook pointing to:
   - `https://your-domain.vercel.app/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`

7. **Set Up a Cron Job for Recurring Invoices (Optional)**
   - Set up a cron job to hit the endpoint:
   - `https://your-domain.vercel.app/api/cron/generate-recurring-invoices`
   - Recommended frequency: Daily

## Local Development

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up local environment variables in `.env.local` (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a Supabase project
2. Run the database schema setup SQL (available in the project)
3. Set up RLS policies or disable them for development

### Testing Payments

1. Use Stripe test mode for development
2. Test cards: 
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.
