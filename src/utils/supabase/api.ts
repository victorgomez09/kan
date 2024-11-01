import {
  createServerClient,
  type CookieOptions,
  serialize,
} from "@supabase/ssr";
import { RequestCookies } from "@edge-runtime/cookies";
import { type Database } from "~/types/database.types";

import { type NextApiRequest, type NextApiResponse } from "next";
import { type NextRequest, type NextResponse } from "next/server";

export function createNextClient(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_API_KEY!,
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

export function createNextApiClient(
  _req: NextApiRequest,
  _res: NextApiResponse,
) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_API_KEY!,
    {
      cookies: {
        get(_name: string) {
          // return req.cookies.get(name)?.value;
          return "";
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // res.headers.append("Set-Cookie", serialize(name, value, options));
        },
        remove(_name: string, _options: CookieOptions) {
          // res.headers.append("Set-Cookie", serialize(name, "", options));
        },
      },
    },
  );

  return supabase;
}

export function createTRPCClient(req: Request, resHeaders: Headers) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = new RequestCookies(req.headers);
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          resHeaders.set("Set-Cookie", serialize(name, value, options));
        },
        remove(name: string, options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          resHeaders.set("Set-Cookie", serialize(name, "", options));
        },
      },
    },
  );

  return supabase;
}

export function createTRPCAdminClient() {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_API_KEY!,
    { cookies: {} },
  );

  return supabase;
}
