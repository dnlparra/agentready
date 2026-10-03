import Stripe from "stripe";

/** Optional: returns a Stripe Checkout URL for a booking deposit, or null if Stripe isn't configured. */
export async function createDepositLink(opts: {
  businessName: string; confirmationCode: string; amountMxn: number;
}): Promise<string | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || opts.amountMxn <= 0) return null;
  const stripe = new Stripe(key);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "mxn",
        unit_amount: Math.round(opts.amountMxn * 100),
        product_data: { name: `Deposit · ${opts.businessName} · ${opts.confirmationCode}` },
      },
    }],
    metadata: { confirmation_code: opts.confirmationCode },
    success_url: `${appUrl}/?paid=${opts.confirmationCode}`,
    cancel_url: `${appUrl}/`,
  });
  return session.url;
}
