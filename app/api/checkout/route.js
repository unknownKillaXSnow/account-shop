import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { productId } = await request.json();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Premium Account' }, // Dynamic based on ID in real app
          unit_amount: 1000, // $10.00
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
    metadata: { productId } // Important: Passes the ID to the webhook
  });

  return NextResponse.json({ url: session.url });
}
