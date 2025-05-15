import { toNodeHandler } from "better-auth/node";

import { initAuth } from "@kan/auth";
import { createDrizzleClient } from "@kan/db/client";

export const config = { api: { bodyParser: false } };

const auth = initAuth(createDrizzleClient());

export default toNodeHandler(auth.handler);
