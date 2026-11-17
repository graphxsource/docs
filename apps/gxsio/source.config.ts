import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // Keep MCP content for its return, but exclude it from all public routes and indexes.
    files: ["**/*.{md,mdx}", "!mcp/**"],
    schema: pageSchema.extend({
      _openapi: z
        .object({
          preload: z.array(z.string()),
          operations: z.array(
            z.object({
              path: z.string(),
              method: z.enum([
                "get",
                "put",
                "post",
                "delete",
                "options",
                "head",
                "patch",
                "trace",
              ]),
            }),
          ),
        })
        .catchall(z.unknown())
        .optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    files: ["**/meta.json", "!mcp/**"],
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
