import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion, // Use the latest API version
});

export interface CreatePaymentSessionParams {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout session for an invoice payment
 */
export async function createPaymentSession({
  invoiceId,
  invoiceNumber,
  amount,
  customerName,
  customerEmail,
  description,
  successUrl,
  cancelUrl,
}: CreatePaymentSessionParams) {
  try {
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice #${invoiceNumber}`,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId,
        invoiceNumber,
      },
      customer_email: customerEmail,
      client_reference_id: invoiceId,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return { success: false, error: 'Failed to create payment session' };
  }
}

/**
 * Retrieves a Stripe Checkout session by ID
 */
export async function getPaymentSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    return { success: true, session };
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    return { success: false, error: 'Failed to retrieve payment session' };
  }
}

/**
 * Updates an invoice status after successful payment
 */
export async function handleSuccessfulPayment(sessionId: string) {
  try {
    const { success, session, error } = await getPaymentSession(sessionId);
    
    if (!success || !session) {
      return { success: false, error: error || 'Session not found' };
    }
    
    const invoiceId = session.client_reference_id;
    
    if (!invoiceId) {
      return { success: false, error: 'Invoice ID not found in session' };
    }
    
    // Here you would update your database to mark the invoice as paid
    // This will be implemented in the API route
    
    return { 
      success: true, 
      invoiceId,
      paymentIntent: session.payment_intent,
      amount: session.amount_total ? session.amount_total / 100 : 0,
    };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    return { success: false, error: 'Failed to process payment confirmation' };
  }
} 