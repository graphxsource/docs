import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { Document } from "flexsearch";
import { getOpenAPIText } from "../src/lib/openapi-text.mjs";
import { applyMockupBodies } from "./gxsio-openapi-overrides.mjs";

const schema = JSON.parse(
  await readFile(
    new URL("../public/openapi/gxsio.json", import.meta.url),
    "utf8",
  ),
);
const single = "/api/ProductMockupRequest/GetProductMockupRequestExternal";
const multi = "/api/ProductMockupRequest/CreateMockupOrderForMultipleViews";

function upstreamWithoutBodies() {
  const document = structuredClone(schema);
  delete document.paths[single].post.requestBody;
  delete document.paths[multi].post.requestBody;
  document.components.schemas = {};
  return document;
}

test("missing creation bodies receive the tObject envelope and distinct DTO contracts", () => {
  const document = applyMockupBodies(upstreamWithoutBodies());
  for (const path of [single, multi]) {
    const body = document.paths[path].post.requestBody;
    assert.equal(body.required, true);
    assert.deepEqual(body.content["application/json"].schema.required, [
      "tObject",
    ]);
  }
  const models = document.components.schemas;
  assert.ok(
    models.GetProductMockupRequestExternalDto.required.includes("CompanyName"),
  );
  assert.ok(
    models.CreateMockupOrderForMultipleViewsDto.required.includes(
      "companyName",
    ),
  );
  assert.equal(
    models.GetProductMockupRequestExternalDto.properties
      .mockupRequestOrderProduct.type,
    "array",
  );
  assert.ok(
    models.CreateMockupOrderForMultipleViewsDto.properties.mockupOrderProduct
      .$ref,
  );
  assert.equal(
    models.MockupRequestOrderProductDto.properties.supplierId.type,
    "string",
  );
  assert.equal(
    models.MultiViewMockupOrderProductDto.properties.supplierID.type,
    "number",
  );
  assert.ok(
    models.MockupRequestOrderProductLocationDto.required.includes(
      "LocationName",
    ),
  );
  assert.ok(
    models.MultiViewProductViewLocationDto.required.includes("locationName"),
  );
  assert.deepEqual(
    document.paths[single].post.responses,
    schema.paths[single].post.responses,
  );
  assert.deepEqual(applyMockupBodies(structuredClone(document)), document);
});

test("future upstream request bodies and models are preserved", () => {
  const document = upstreamWithoutBodies();
  document.paths[single].post.requestBody = {
    content: {},
    description: "Upstream body",
  };
  document.components.schemas.GetProductMockupRequestExternalDto = {
    type: "object",
    description: "Upstream model",
  };
  applyMockupBodies(document);
  assert.equal(
    document.paths[single].post.requestBody.description,
    "Upstream body",
  );
  assert.equal(
    document.components.schemas.GetProductMockupRequestExternalDto.description,
    "Upstream model",
  );
});

test("removed upstream operations require review", () => {
  const document = upstreamWithoutBodies();
  delete document.paths[multi];
  assert.throws(
    () => applyMockupBodies(document),
    /Review missing mockup operation/,
  );
});

test("API text contains selected endpoints, parameter names, bodies and nested schemas", () => {
  const text = getOpenAPIText(schema, [{ path: single, method: "post" }]);
  assert.ok(text.includes(`POST ${single}`));
  for (const field of [
    "tObject",
    "CompanyName",
    "supplierId",
    "LocationName",
    "artURL",
  ]) {
    assert.ok(text.includes(`"${field}"`), field);
  }
  assert.ok(!text.includes(`POST ${multi}`));
  const parameters = getOpenAPIText(schema, [
    { path: "/api/ProductMockupRequest/GetProductPartDetails", method: "get" },
  ]);
  assert.ok(parameters.includes('"name": "ProductPartId"'));
});

test("referenced definitions are resolved with escaped pointers and recursion terminates", () => {
  const recursive = {
    paths: {
      "/tree": {
        post: {
          requestBody: { $ref: "#/components/requestBodies/tree~1node" },
        },
      },
    },
    components: {
      requestBodies: {
        "tree/node": {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Node" },
            },
          },
        },
      },
      schemas: {
        Node: { properties: { child: { $ref: "#/components/schemas/Node" } } },
      },
    },
  };
  const text = getOpenAPIText(recursive, [{ path: "/tree", method: "post" }]);
  assert.equal(text.split("### #/components/schemas/Node").length, 2);
  assert.ok(text.includes('"child"'));
  assert.throws(
    () => getOpenAPIText(recursive, [{ path: "/gone", method: "post" }]),
    /Missing OpenAPI operation/,
  );
});

test("chat's FlexSearch index can retrieve an endpoint found only in generated API text", async () => {
  const search = new Document({
    document: {
      id: "url",
      index: ["title", "description", "content"],
      store: true,
    },
  });
  const doc = {
    url: "/docs/api/v1/product-mockup-requests",
    title: "Product mockup requests",
    description: "",
    content: "",
  };
  search.add(doc);
  assert.equal(
    (
      await search.searchAsync("GetProductMockupRequestExternal", {
        merge: true,
        enrich: true,
      })
    ).length,
    0,
  );
  search.update({
    ...doc,
    content: getOpenAPIText(schema, [{ path: single, method: "post" }]),
  });
  assert.ok(
    (
      await search.searchAsync("GetProductMockupRequestExternal", {
        merge: true,
        enrich: true,
      })
    ).length > 0,
  );
  assert.ok(
    (await search.searchAsync("artURL", { merge: true, enrich: true })).length >
      0,
  );
});

test("each generated page exports exactly the operations rendered by its layout", async () => {
  for (const page of [
    "health",
    "v1/location-aliases",
    "v2/location-aliases",
    "v1/product-lines",
    "v1/product-mockup-requests",
    "v1/security",
    "v2/lifestyle",
  ]) {
    const mdx = await readFile(
      new URL(`../content/docs/api/${page}.mdx`, import.meta.url),
      "utf8",
    );
    const rendered = JSON.parse(mdx.match(/operations=\{(\[.*?\])\}/)[1]);
    const selectors = Array.from(
      mdx.matchAll(/^ {4}- path: (.+)\n {6}method: (.+)$/gm),
      ([, path, method]) => ({ path, method }),
    );
    assert.deepEqual(selectors, rendered, page);
    const text = getOpenAPIText(schema, selectors);
    for (const { path, method } of rendered)
      assert.ok(text.includes(`${method.toUpperCase()} ${path}`));
    if (page === "v1/location-aliases") assert.ok(!text.includes("/v2/"));
    if (page === "v2/location-aliases") assert.ok(!text.includes("/api/"));
  }
});
