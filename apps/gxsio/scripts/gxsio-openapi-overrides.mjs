import mockupSchemas from "./gxsio-openapi.mockups.json" with { type: "json" };

// Swagger does not discover bodies read through the custom LegacyBody decorator.
// These models come from the backend DTO Swagger metadata at 3619363b.
const mockupBodies = {
  GetProductMockupRequestExternal: "GetProductMockupRequestExternalDto",
  CreateMockupOrderForMultipleViews: "CreateMockupOrderForMultipleViewsDto",
};

export function applyMockupBodies(document) {
  for (const [endpoint, model] of Object.entries(mockupBodies)) {
    const operation =
      document.paths[`/api/ProductMockupRequest/${endpoint}`]?.post;
    if (!operation)
      throw new Error(`Review missing mockup operation ${endpoint}`);
    // Prefer a future upstream body definition over this correction.
    if (operation.requestBody) continue;
    document.components ??= {};
    document.components.schemas ??= {};
    for (const [name, schema] of Object.entries(mockupSchemas)) {
      document.components.schemas[name] ??= structuredClone(schema);
    }
    operation.requestBody = {
      required: true,
      description:
        "Send the request payload inside the legacy tObject envelope.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["tObject"],
            properties: { tObject: { $ref: `#/components/schemas/${model}` } },
          },
        },
      },
    };
  }
  return document;
}
