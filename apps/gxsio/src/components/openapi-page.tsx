"use client";

import "fumadocs-openapi/css/preset.css";

import { createCodeUsageGeneratorRegistry } from "fumadocs-openapi/requests/generators";
import { registerDefault } from "fumadocs-openapi/requests/generators/all";
import { createOpenAPIPage } from "fumadocs-openapi/ui";

export const OpenAPIPage = createOpenAPIPage({
  codeUsages: registerDefault(createCodeUsageGeneratorRegistry()),
});
