import { generateOpenApiDocument } from "trpc-to-openapi";

import { appRouter } from "~/server/api/root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Kan API",
  description: "OpenAPI compliant REST API",
  version: "1.0.0",
  baseUrl: `${process.env.WEBSITE_URL}/api/v1`,
  docsUrl: "",
  tags: ["auth", "users", "posts"],
});
