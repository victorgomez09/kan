import type { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";

import { createNextApiContext } from "@kan/api/trpc";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { createStripeClient } from "@kan/stripe";

export const webCrypto = Stripe.createSubtleCryptoProvider();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const stripe = createStripeClient();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ message: "No signature found" });
  }

  try {
    const body = req.body;

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

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).json({ message: "Webhook handler failed" });
  }
}
