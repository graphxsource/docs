import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { openapiPlugin } from "fumadocs-openapi/server";
import { openapi } from "./openapi";
import { getOpenAPIText } from "./openapi-text.mjs";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

export async function getPageText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");
  const metadata = page.data._openapi;
  if (!metadata) return processed;
  const operations = metadata.operations;
  const schemaId = metadata.preload[0];
  if (!operations || !schemaId) {
    throw new Error(`Regenerate OpenAPI metadata for ${page.path}`);
  }
  const { bundled } = await openapi.getSchema(schemaId);
  return `${processed}\n\n${getOpenAPIText(bundled, operations)}`;
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await getPageText(page);

  return `# ${page.data.title} (${page.url})

${processed}`;
}
