# Invoice Generator

A modern web application for generating professional PDF invoices and online payment links.

## Features

- Create and manage invoices with customizable fields
- Generate professional PDF invoices
- Create shareable payment links for online payments
- Track payment status and send reminders
- Responsive design for desktop and mobile

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: @react-pdf/renderer
- **Date Handling**: date-fns
- **Form Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Supabase account (free tier works fine)

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-schema.sql` to set up your database tables
4. Get your Supabase URL and anon key from the API settings page

### Environment Setup

1. Copy the `.env.local` file and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/invoice-generator.git
   cd invoice-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app` - Next.js app directory
  - `/api` - API routes for data handling
  - `/components` - Reusable UI components
  - `/invoices` - Invoice-related pages
    - `/[id]` - Individual invoice pages
    - `/new` - Create new invoice page
- `/lib` - Utility functions and database client

## API Endpoints

- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create a new invoice
- `GET /api/invoices/[id]` - Get a specific invoice
- `PUT /api/invoices/[id]` - Update a specific invoice
- `DELETE /api/invoices/[id]` - Delete a specific invoice

## Deployment

This application can be easily deployed to Vercel:

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- shadcn/ui for the beautiful component library
- Supabase for the powerful backend services
- React PDF for the PDF generation capabilities

## Stripe Integration

This application includes Stripe integration for processing invoice payments. To set up Stripe:

1. Create a [Stripe account](https://stripe.com) if you don't have one
2. Get your API keys from the Stripe Dashboard:
   - Go to Developers > API keys
   - Copy your "Secret key" and "Publishable key"
3. Add these keys to your `.env.local` file:
   ```
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```
4. For testing, you can use Stripe's test cards:
   - Card number: `4242 4242 4242 4242`
   - Expiration date: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

When a client clicks the "Pay Now" button on an invoice, they'll be redirected to a Stripe Checkout page where they can securely enter their payment information. After successful payment, the invoice will be automatically marked as paid.
