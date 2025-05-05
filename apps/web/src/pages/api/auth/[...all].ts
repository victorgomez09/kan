import { toNodeHandler } from "better-auth/node";

import { auth } from "@kan/auth";

export const config = { api: { bodyParser: false } };
export default toNodeHandler(auth.handler);

// export const runtime = "edge";
// export const preferredRegion = "lhr1";
// export const dynamic = "force-dynamic";
