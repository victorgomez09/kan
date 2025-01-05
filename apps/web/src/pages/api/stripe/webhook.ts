import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { createNextClient } from "@kan/supabase/clients";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const webCrypto = Stripe.createSubtleCryptoProvider();

const stripe: Stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
    });
  }

  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response(JSON.stringify({ message: "No signature found" }), {
      status: 400,
    });
  }

  try {
    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
      undefined,
      webCrypto,
    );

    const response = NextResponse.next();

    const db = createNextClient(req, response);

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object;

        const metaData = checkoutSession.metadata;

        if (metaData?.workspacePublicId && metaData.username) {
          await workspaceRepo.update(db, metaData.workspacePublicId, {
            slug: metaData.username,
            plan: "pro",
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ message: "Webhook handler failed" }), {
      status: 400,
    });
  }
}

export const runtime = "edge";
export const preferredRegion = "lhr1";
export const dynamic = "force-dynamic";
