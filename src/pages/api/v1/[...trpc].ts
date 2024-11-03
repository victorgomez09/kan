import { type NextApiRequest, type NextApiResponse } from "next";
import cors from "nextjs-cors";

import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/root";
import { createRESTContext } from "~/server/api/trpc";
import { createOpenApiNextHandler } from "trpc-to-openapi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const openApiHandler = createOpenApiNextHandler({
    router: appRouter,
    createContext: createRESTContext,
    responseMeta: () => ({ headers: {} }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

  return await openApiHandler(req, res);
}
