import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import * as memberRepo from "@kan/db/repository/member.repo";
import * as userRepo from "@kan/db/repository/user.repo";
import { createNextClient } from "@kan/supabase/clients";

export default async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return new NextResponse(null, {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  if (!req.url) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  const url = new URL(req.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  const tokenHash = queryParams.token_hash;
  const type = queryParams.type;
  const code = queryParams.code;
  const memberPublicId = queryParams.memberPublicId;

  let next = "/error";

  let authRes;

  const response = NextResponse.next();

  if ((tokenHash && type) ?? code) {
    const db = createNextClient(req, response);

    if (tokenHash && type) {
      authRes = await db.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash: tokenHash,
      });
    }

    if (code) {
      authRes = await db.auth.exchangeCodeForSession(code);
    }

    const user = authRes?.data.user;

    if (user?.id && user.email) {
      const existingUser = await userRepo.getById(db, user.id);

      if (!existingUser) {
        await userRepo.create(db, {
          id: user.id,
          email: user.email,
        });
      }
    }

    if (memberPublicId) {
      const member = await memberRepo.getByPublicId(db, memberPublicId);

      if (member?.id) {
        await memberRepo.acceptInvite(db, member.id);
      }
    }

    if (authRes?.error) {
      console.error(authRes.error);
    } else {
      next = queryParams.next ?? "/";
    }
  }

  const redirectResponse = NextResponse.redirect(new URL(next, req.url));

  response.headers.getSetCookie().forEach((cookie) => {
    redirectResponse.headers.append("Set-Cookie", cookie);
  });

  return redirectResponse;
}

export const runtime = "edge";
export const preferredRegion = "lhr1";
export const dynamic = "force-dynamic";
