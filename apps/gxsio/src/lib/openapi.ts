import { readFile } from "node:fs/promises";
import { createOpenAPI } from "fumadocs-openapi/server";

const gxsioSchemaPath = "./public/openapi/gxsio.json";
export const gxsioServerURL = "https://api.graphxserver.io/";
const openAPIMethods = ["get", "put", "post", "delete", "patch"] as const;

export const openapi = createOpenAPI({
  input: {
    [gxsioSchemaPath]: async () => {
      const document = JSON.parse(await readFile(gxsioSchemaPath, "utf8"));
      // Apply schema corrections here so the
      // playground sends requests to the right host with the right header.
      if (!document.servers?.length) {
        document.servers = [
          { url: gxsioServerURL, description: "Production" },
        ];
      }
      // The v2 operations require a `bearer` scheme the schema never defines.
      document.components.securitySchemes ??= {};
      document.components.securitySchemes.bearer ??= {
        type: "http",
        scheme: "bearer",
        description:
          "An organization API key (GXS_O-...) created in GraphxServer.io settings.",
      };
      // Every operation except the health probes and the deprecated legacy
      // token endpoint answers 401 without a bearer token, but the V1
      // controllers do not declare it.
      for (const [path, item] of Object.entries<Record<string, unknown>>(
        document.paths,
      )) {
        if (
          path.startsWith("/health") ||
          path === "/api/Security/GetGraphXServerAPIToken"
        ) {
          continue;
        }
        for (const method of openAPIMethods) {
          const operation = item[method] as
            | { security?: unknown[] }
            | undefined;
          if (operation && !operation.security?.length) {
            operation.security = [{ bearer: [] }];
          }
        }
      }
      return document;
    },
  },
});
