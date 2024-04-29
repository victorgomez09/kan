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

  let next = "/error";

  if (token_hash && type) {
    const db = createNextClient(req, res);
    const { error, data } = await db.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    console.log({ error });

    if (data.user?.id) {
      const user = await db
        .from("user")
        .select()
        .eq("id", data.user.id)
        .limit(1)
        .maybeSingle();

      if (!user.data) {
        await db
          .from("user")
          .insert({ id: data.user.id, email: data.user.email ?? "" });
      }
    }

    if (error) {
      console.error(error);
    } else {
      next = stringOrFirstString(queryParams.next) ?? "/";
    }
  }

  res.redirect(next);
}

// export const runtime = "edge";
// export const preferredRegion = "lhr1";
// export const dynamic = "force-dynamic";
