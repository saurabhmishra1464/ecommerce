import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); // Temporary logging for debugging

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Request body:', req.body); // Log the request body for debugging

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100, // Convert price to cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/canceled`,
      });

      console.log('Stripe session created:', session);

      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error('Error creating Stripe session:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
