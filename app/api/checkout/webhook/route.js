import { NextResponse } from 'next/server';
import { Resend } from 'resend'; // Automated Emails
import { createClient } from '@supabase/supabase-js'; // Database

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(req) {
  const event = await req.json();

  // CHECK: Did the payment succeed?
  if (event.type === 'checkout.session.completed') {
    const customerEmail = event.data.object.customer_details.email;
    
    // 1. Get an unsold account from DB
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('status', 'available')
      .limit(1)
      .single();

    if (account) {
      // 2. Mark as sold
      await supabase.from('accounts').update({ status: 'sold' }).eq('id', account.id);

      // 3. Email it to the customer
      await resend.emails.send({
        from: 'Shop <noreply@yourdomain.com>',
        to: customerEmail,
        subject: 'Your Instant Delivery 📦',
        html: `<p>Thank you! Here is your account:</p>
               <pre>${account.credentials}</pre>
               <p>Enjoy!</p>`
      });
    }
  }

  return NextResponse.json({ received: true });
}
