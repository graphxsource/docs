/**
 * The API renderer lives in an MDX export, which processed Markdown omits.
 * Use explicit operation selectors written by the generator, never all paths.
 *
 * @param {import("fumadocs-openapi").Document} document
 * @param {import("fumadocs-openapi").OperationItem[]} operations
 */
export function getOpenAPIText(document, operations) {
  const sections = [];
  const references = new Set();
  const schemas = [];
  const json = (value) => {
    const text = JSON.stringify(value, null, 2);
    for (const match of text.matchAll(/"\$ref":\s*"(#[^"]+)"/g)) {
      references.add(match[1]);
    }
    return `\n\n\`\`\`json\n${text}\n\`\`\``;
  };

  if (document.servers?.length) {
    sections.push(`## API servers${json(document.servers)}`);
  }
  for (const { path, method } of operations) {
    const item = document.paths?.[path];
    const operation = item?.[method];
    if (!operation)
      throw new Error(`Missing OpenAPI operation ${method} ${path}`);
    sections.push(`## ${operation.summary ?? operation.operationId ?? path}`);
    sections.push(`\`${method.toUpperCase()} ${path}\``);
    if (operation.description) sections.push(operation.description);
    const security = operation.security ?? document.security;
    if (security?.length) sections.push(`### Authentication${json(security)}`);
    const parameters = [
      ...(item.parameters ?? []),
      ...(operation.parameters ?? []),
    ];
    if (parameters.length) sections.push(`### Parameters${json(parameters)}`);
    if (operation.requestBody) {
      sections.push(`### Request body${json(operation.requestBody)}`);
    }
    if (operation.responses) {
      sections.push(`### Responses${json(operation.responses)}`);
    }
  }

  // Include only referenced definitions, keeping recursive references finite.
  for (const reference of references) {
    const keys = reference
      .slice(2)
      .split("/")
      .map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));
    let value = document;
    for (const key of keys) value = value?.[key];
    if (!value) throw new Error(`Missing OpenAPI reference ${reference}`);
    schemas.push(`### ${reference}${json(value)}`);
  }
  if (schemas.length) sections.push("## Referenced schemas", ...schemas);
  if (document.components?.securitySchemes) {
    sections.push(
      `## Security schemes${json(document.components.securitySchemes)}`,
    );
  }
  return sections.join("\n\n");
}
