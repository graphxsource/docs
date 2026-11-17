# GraphxServer.io docs app

A Next.js and Fumadocs app for public GraphxServer.io documentation. Current topics cover organization API keys, the API reference, and MCP connections and tools.

## Run and check

From the repository root:

```bash
pnpm --filter gxsio dev
pnpm --filter gxsio types:check
pnpm --filter gxsio build
```

## Content and routes

- `content/docs`: Root documentation content, served at `/docs`.
- `content/docs/api-keys`: Key creation, rotation, revocation, and request authentication.
- `content/docs/api`: API overview and generated V1, V2, and health reference pages.
- `content/docs/mcp`: MCP connection instructions and tool examples. Keep this folder.
- `public/images/api-keys`: Images used by the key management guide.
- `public/openapi/gxsio.json`: Schema snapshot used to render the API reference.
- `src/app/(home)/page.tsx`: Landing page.

Models and contributors must update this README, the root README, the landing page, and the docs index as topics begin populating the docs and whenever coverage changes. Keep the home page's cards and starting points tied to existing public pages. Remove boilerplate examples and references to other microservices from imported content.

## Generate the API reference

```bash
# Regenerate pages from the checked-in schema.
pnpm --filter gxsio gxsio:openapi

# Download the development schema and regenerate pages.
pnpm --filter gxsio gxsio:openapi:refresh
```

The script writes pages to `content/docs/api`, preserving the root `/docs/api` URLs. Review refreshed schemas and generated content for public suitability before publishing. Commit the snapshot and generated pages together, and update the snapshot date in `content/docs/api/index.mdx`. Builds use the local snapshot.

`src/lib/openapi.ts` supplies the development base URL and Bearer authentication requirements omitted by the upstream schema. `src/components/openapi-page.tsx` provides the interactive reference renderer.

## English API documentation

The schema snapshot and generated reference use manually translated English summaries and descriptions. `scripts/gxsio-openapi.en.json` stores the reviewed translations by JSON Pointer. The refresh command applies them before saving the schema and generating pages. It stops if a translated field no longer exists, so review the upstream change and update the translation path before retrying.

When refreshing the schema, review new and changed prose for Spanish text and add English translations to that file. Keep API paths, operation IDs, parameter names, payload fields, and example values unchanged. Regenerate the reference after editing the snapshot so headings, anchors, and search metadata agree with the rendered pages.
