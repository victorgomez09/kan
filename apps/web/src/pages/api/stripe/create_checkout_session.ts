import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { z } from "zod";

import { createDrizzleClient } from "@kan/db/client";
import * as userRepo from "@kan/db/repository/user.repo";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { createNextClient } from "@kan/supabase/clients";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
});

const workspaceSlugSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/);

interface CheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
  slug: string;
  workspacePublicId: string;
  stripeCustomerId: string;
}

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = NextResponse.next();

    const supabaseClient = createNextClient(req, response);

    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = createDrizzleClient();

    const user = await userRepo.getById(db, data.user.id);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as CheckoutSessionRequest;
    const { successUrl, cancelUrl, slug, workspacePublicId } = body;

    if (!successUrl || !cancelUrl || !slug || !workspacePublicId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const slugResult = workspaceSlugSchema.safeParse(slug);

    if (!slugResult.success) {
      return new Response(JSON.stringify({ error: "Invalid workspace slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const workspace = await workspaceRepo.getAllByUserId(db, user.id);

    const isMemberOfWorkspace = workspace.some(
      ({ workspace }) => workspace.publicId === body.workspacePublicId,
    );

    if (!isMemberOfWorkspace) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1QcpmyDlDJBL8JHbeqhe1Ruq",
          quantity: 1,
        },
      ],
      success_url: `${process.env.WEBSITE_URL}${successUrl}`,
      cancel_url: `${process.env.WEBSITE_URL}${cancelUrl}`,
      customer: user.stripeCustomerId ?? undefined,
      metadata: {
        workspaceSlug: slug,
        workspacePublicId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error creating checkout session" }),
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
