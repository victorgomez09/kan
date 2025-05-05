import type { NextRequest } from "next/server";

import { createNextApiContext } from "@kan/api/trpc";
import { createStripeClient } from "@kan/stripe";

export default async function handler(req: NextRequest) {
  const stripe = createStripeClient();

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { user } = await createNextApiContext(req);

    if (!user?.stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: "No billing account found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.WEBSITE_URL}/settings`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error creating portal session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export const runtime = "edge";
export const preferredRegion = "lhr1";
export const dynamic = "force-dynamic";
