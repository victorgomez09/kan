import type { CookieOptions } from "@supabase/ssr";
import type { NextApiRequest } from "next";
import type { NextRequest, NextResponse } from "next/server";
import { RequestCookies } from "@edge-runtime/cookies";
import { createServerClient, serialize } from "@supabase/ssr";

import type { Database } from "@kan/db/types/database.types";

export function createNextClient(req: NextRequest, res: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient<Database, "public">(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.headers.append("Set-Cookie", serialize(name, value, options));
        },
        remove(name: string, options: CookieOptions) {
          res.headers.append("Set-Cookie", serialize(name, "", options));
        },
      },
    },
  );

  return supabase;
}

export function createNextApiClient(req: NextApiRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const supabase = createServerClient<Database, "public">(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        persistSession: false,
        ...(accessToken && {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          access_token: accessToken,
        }),
      },
      cookies: {
        get: (_name: string) => "",
        set: (_name: string, _value: string, _options: CookieOptions) =>
          undefined,
        remove: (_name: string, _options: CookieOptions) => undefined,
      },
    },
  );

  return supabase;
}

export function createTRPCClient(req: Request, resHeaders: Headers) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient<Database, "public">(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          const cookies = new RequestCookies(req.headers);
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          resHeaders.set("Set-Cookie", serialize(name, value, options));
        },
        remove(name: string, options: CookieOptions) {
          resHeaders.set("Set-Cookie", serialize(name, "", options));
        },
      },
    },
  );

  return supabase;
}

export function createTRPCAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient<Database, "public">(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        get: (_name: string) => "",
        set: (_name: string, _value: string, _options: CookieOptions) =>
          undefined,
        remove: (_name: string, _options: CookieOptions) => undefined,
      },
    },
  );

  return supabase;
}
