# GraphxServer.io public documentation

This repository contains the public docs app in `apps/gxsio`. It covers organization API keys and the GraphxServer.io API. MCP documentation is preserved but hidden until it is updated.

## Development

- `pnpm install`: Install workspace dependencies.
- `pnpm --filter gxsio dev`: Start the docs app at http://localhost:3000.
- `pnpm run build`: Build all applications.
- `pnpm --filter gxsio types:check`: Generate documentation and route types, then check TypeScript.

See [the app README](apps/gxsio/README.md) for content paths and API reference generation.

## Instructions for models and contributors

When topics begin populating the docs, update this README, the app README, the landing page at `apps/gxsio/src/app/(home)/page.tsx`, and the docs index at `apps/gxsio/content/docs/index.mdx` to reflect the available content. Keep descriptions, starting points, and navigation links in sync whenever you add, remove, or rename a topic. Link only to pages that exist.

Keep docs directly under `apps/gxsio/content/docs`. Their public URLs begin at `/docs`, without a `/gxsio` section. Preserve the `mcp` folder for connection and tool documentation. Remove template examples rather than presenting them as product documentation.

This app is public. Include only GraphxServer.io documentation and public integration details. When importing material, remove references and links to other microservices, internal repositories, private architecture, and unfinished internal guides. Copy required images and schemas, fix paths, and check the resulting navigation.
