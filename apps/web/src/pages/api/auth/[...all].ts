import { toNodeHandler } from "better-auth/node";

import { initAuth } from "@kan/auth";
import { createDrizzleClient } from "@kan/db/client";

export const config = { api: { bodyParser: false } };

const auth = initAuth(createDrizzleClient());

export default toNodeHandler(auth.handler);

// export const runtime = "edge";
// export const preferredRegion = "lhr1";
// export const dynamic = "force-dynamic";
