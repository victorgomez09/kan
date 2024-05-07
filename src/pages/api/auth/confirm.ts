import { type EmailOtpType } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

import { createNextClient } from "~/utils/supabase/api";

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.status(405).appendHeader("Allow", "GET").end();
    return;
  }

  const queryParams = req.query;
  const token_hash = stringOrFirstString(queryParams.token_hash);
  const type = stringOrFirstString(queryParams.type);
  const code = stringOrFirstString(queryParams.code);

  let next = "/error";

  let authRes;

  if ((token_hash && type) ?? code) {
    const db = createNextClient(req, res);

    if (token_hash && type) {
      authRes = await db.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash,
      });
    }

    if (code) {
      authRes = await db.auth.exchangeCodeForSession(code);
    }

    const user = authRes?.data.user;

    if (user?.id) {
      const existingUser = await db
        .from("user")
        .select()
        .eq("id", user.id)
        .limit(1)
        .maybeSingle();

      if (!existingUser.data) {
        await db.from("user").insert({ id: user.id, email: user.email ?? "" });
      }
    }

    if (authRes?.error) {
      console.error(authRes.error);
    } else {
      next = stringOrFirstString(queryParams.next) ?? "/";
    }
  }

  res.redirect(next);
}

// export const runtime = "edge";
// export const preferredRegion = "lhr1";
// export const dynamic = "force-dynamic";
