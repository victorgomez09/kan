import type { NextRequest } from "next/server";
import { Stripe } from "stripe";

import { createNextApiContext } from "@kan/api/trpc";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { createStripeClient } from "@kan/stripe";

export const webCrypto = Stripe.createSubtleCryptoProvider();

export default async function handler(req: NextRequest) {
  const stripe = createStripeClient();

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

    const { db } = await createNextApiContext(req);

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object;

        const metaData = checkoutSession.metadata;

        if (metaData?.workspacePublicId && metaData.workspaceSlug) {
          await workspaceRepo.update(db, metaData.workspacePublicId, {
            slug: metaData.workspaceSlug,
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
