import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const schemaPath = "./public/openapi/gxsio.json";
const schemaURL = "https://api.graphxserver.io/api-json";

// Upstream tag names mix "Legacy V1 -", "V1 ·" and "v2 ·" prefixes. A version
// prefix puts the group in a `v1/` or `v2/` folder; tags without one, such as
// Health, stay at the top of the API section.
const versionedTag = /^(?:legacy\s+)?v(\d+)\s*[-·]\s*(.+)$/i;

// Sentence-case titles for the current groups. A new upstream tag without an
// entry here still gets a page titled after its name.
const titles = {
  "Product Mockup Request": "Product mockup requests",
  "Product Line": "Product lines",
  "Location aliases (compat)": "Location aliases",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pageFor(tag) {
  const match = versionedTag.exec(tag);
  const name = match ? match[2].trim() : tag;
  const title = titles[name] ?? name;
  const slug = slugify(title);
  return { path: match ? `v${match[1]}/${slug}.mdx` : `${slug}.mdx`, title };
}

if (process.argv.includes("--refresh")) {
  const response = await fetch(schemaURL, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`Schema download failed: ${response.status}`);
  const schema = await response.json();
  if (!schema.openapi?.startsWith("3.") || !schema.paths?.["/health"]) {
    throw new Error("The GXSIO API did not return its OpenAPI schema");
  }
  // Keep manually reviewed English prose when refreshing the upstream schema.
  const translations = JSON.parse(
    await readFile(new URL("./gxsio-openapi.en.json", import.meta.url), "utf8"),
  );
  for (const [pointer, translation] of Object.entries(translations)) {
    const keys = pointer
      .slice(1)
      .split("/")
      .map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));
    let target = schema;
    for (const key of keys.slice(0, -1)) target = target?.[key];
    const field = keys.at(-1);
    if (!target || typeof target[field] !== "string") {
      throw new Error(
        `Review the English translation for changed schema field ${pointer}`,
      );
    }
    target[field] = translation;
  }
  // Public docs describe API-key authentication only.
  for (const scheme of Object.values(
    schema.components?.securitySchemes ?? {},
  )) {
    if (scheme.type === "http" && scheme.scheme === "bearer") {
      scheme.description =
        "An organization API key (GXS_O-...) sent as Authorization: Bearer GXS_O-...";
    }
  }
  await mkdir("./public/openapi", { recursive: true });
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
}

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
await generateFiles({
  input: createOpenAPI({ input: [schemaPath] }),
  output: "./content/docs/api",
  per: "custom",
  toPages(builder) {
    const groups = new Map();
    for (const operation of builder.extract().operations) {
      for (const tag of operation.tags?.length ? operation.tags : ["Default"]) {
        const operations = groups.get(tag) ?? [];
        operations.push(operation);
        groups.set(tag, operations);
      }
    }
    for (const [tag, operations] of groups) {
      const { path, title } = pageFor(tag);
      builder.create({
        type: "page",
        schemaId: builder.id,
        path,
        info: { title },
        operations,
        webhooks: [],
      });
    }
  },
  // These files are generated from the schema, including endpoint descriptions.
  includeDescription: false,
  frontmatter: (title) => ({ title }),
});

console.log(
  `Generated GXSIO API pages from ${Object.keys(schema.paths).length} paths`,
);
