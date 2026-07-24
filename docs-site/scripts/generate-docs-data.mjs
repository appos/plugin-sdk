#!/usr/bin/env node
/**
 * generate-docs-data.mjs — generates the data-driven docs pages from the
 * SDK's machine-readable sources of truth, and maintains the drift-gate hash.
 *
 * Sources (this repo):
 *   schemas/plugin-v1.json                    → manifest field reference
 *   schemas/constraints.json                  → permission scopes, limits
 *   packages/plugin-types/src/permissions.ts  → scope grouping + legacy aliases
 *   packages/plugin-types/src/core.ts         → PluginContext namespace map
 *
 * Outputs (committed — regenerate whenever sources change):
 *   src/content/docs/reference/namespaces.md
 *   src/content/docs/manifest/reference.md
 *   src/content/docs/manifest/permission-scopes.md
 *   src/content/docs/manifest/limits.md
 *   src/content/docs/extension-points/index.md
 *   src/content/docs/extension-points/event-topics.md
 *   generated-docs.hash
 *
 * Usage:
 *   node scripts/generate-docs-data.mjs           # write outputs
 *   node scripts/generate-docs-data.mjs --check   # drift gate: exit 1 if
 *                                                 # committed outputs are stale
 *
 * Outputs are deterministic (no timestamps) so `--check` can byte-compare.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsSiteRoot = resolve(__dirname, "..");
const repoRoot = resolve(docsSiteRoot, "..");

const CHECK_MODE = process.argv.includes("--check");

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const INPUT_PATHS = [
  "schemas/plugin-v1.json",
  "schemas/constraints.json",
  "packages/plugin-types/src/permissions.ts",
  "packages/plugin-types/src/core.ts",
].map((p) => join(repoRoot, p));

const inputs = {};
for (const p of INPUT_PATHS) {
  if (!existsSync(p)) {
    console.error(`Missing generator input: ${p}`);
    process.exit(1);
  }
  inputs[relative(repoRoot, p)] = readFileSync(p, "utf-8");
}

const constraints = JSON.parse(inputs["schemas/constraints.json"]);
const manifestSchema = JSON.parse(inputs["schemas/plugin-v1.json"]);
const permissionsTs = inputs["packages/plugin-types/src/permissions.ts"];
const coreTs = inputs["packages/plugin-types/src/core.ts"];

const inputHash = createHash("sha256")
  .update(
    Object.keys(inputs)
      .sort()
      .map((k) => `${k}\n${inputs[k]}`)
      .join("\n---\n"),
  )
  .digest("hex");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GENERATED_BANNER = `<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->`;

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function frontmatter({ title, description, order }) {
  const lines = ["---", `title: ${JSON.stringify(title)}`];
  if (description) lines.push(`description: ${JSON.stringify(description)}`);
  if (order !== undefined) lines.push("sidebar:", `  order: ${order}`);
  lines.push("---", "");
  return lines.join("\n");
}

/**
 * Parses a TypeScript string-literal union type body into
 * [{ group, members: [string] }], using `// comment` lines as group labels.
 * Template-literal members (e.g. `oauth.${string}`) are captured separately.
 */
function parseUnionWithGroups(source, typeName) {
  const re = new RegExp(`export type ${typeName} =([\\s\\S]*?);`);
  const m = source.match(re);
  if (!m) throw new Error(`Could not find type ${typeName} in permissions.ts`);
  const body = m[1];
  const groups = [];
  let current = { group: "General", members: [] };
  const templates = [];
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    const comment = line.match(/^\/\/\s*(.+)$/);
    if (comment) {
      if (current.members.length) groups.push(current);
      current = { group: comment[1].trim(), members: [] };
      continue;
    }
    const lit = line.match(/^\|\s*"([^"]+)"/);
    if (lit) {
      current.members.push(lit[1]);
      continue;
    }
    const tpl = line.match(/^\|\s*`([^`]+)`/);
    if (tpl) templates.push(tpl[1]);
  }
  if (current.members.length) groups.push(current);
  return { groups, templates };
}

/** Extracts `readonly name: TypeAPI;` entries (with doc comments) from PluginContext. */
function parsePluginContext(source) {
  const start = source.indexOf("export interface PluginContext {");
  if (start === -1) throw new Error("Could not find PluginContext in core.ts");
  const rest = source.slice(start);
  const end = rest.indexOf("\n}");
  const body = rest.slice(0, end);
  const entries = [];
  const entryRe = /\/\*\*([\s\S]*?)\*\/\s*readonly (\w+): (\w+);/g;
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    const doc = m[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const [, , name, type] = m;
    if (!type.endsWith("API")) continue; // skip pluginId/pluginVersion/hostVersion
    entries.push({ name, type, doc });
  }
  return entries;
}

/** Renders a compact type label for a JSON-Schema property. */
function schemaTypeLabel(prop) {
  if (prop.enum) return prop.enum.map((v) => `\`${v}\``).join(" \\| ");
  if (prop.const !== undefined) return `\`${prop.const}\``;
  if (prop.type === "array") {
    const items = prop.items ?? {};
    if (items.anyOf) return "array";
    if (items.enum) return `array of ${items.enum.map((v) => `\`${v}\``).join(" \\| ")}`;
    if (items.type) return `array of ${items.type}`;
    return "array";
  }
  if (prop.anyOf) return "mixed";
  if (prop.type) return String(prop.type);
  return "any";
}

/** Renders a properties table + nested subsections for a JSON-Schema object node. */
function renderSchemaObject(node, requiredList, headingLevel, path) {
  const out = [];
  const props = node.properties ?? {};
  const required = new Set(requiredList ?? node.required ?? []);
  out.push("| Field | Type | Required | Description |");
  out.push("|-------|------|----------|-------------|");
  const nested = [];
  for (const [key, prop] of Object.entries(props)) {
    const desc = prop.description ?? "";
    const extra = [];
    if (prop.pattern) extra.push(`Pattern: \`${prop.pattern}\``);
    if (prop.default !== undefined) extra.push(`Default: \`${JSON.stringify(prop.default)}\``);
    if (prop.maxLength) extra.push(`Max length: ${prop.maxLength}`);
    out.push(
      `| \`${key}\` | ${schemaTypeLabel(prop)} | ${required.has(key) ? "yes" : "no"} | ${mdEscape([desc, ...extra].filter(Boolean).join(" — "))} |`,
    );
    // Recurse into object-shaped fields (skip the huge permissions enum —
    // that gets its own page).
    const childPath = path ? `${path}.${key}` : key;
    if (childPath === "permissions") continue;
    const childObject =
      prop.type === "object" && prop.properties
        ? prop
        : prop.type === "array" && prop.items?.type === "object" && prop.items.properties
          ? prop.items
          : null;
    if (childObject && headingLevel <= 4) {
      nested.push({ key: childPath, node: childObject, isArray: prop.type === "array" });
    }
  }
  for (const child of nested) {
    const h = "#".repeat(Math.min(headingLevel + 1, 5));
    out.push("");
    out.push(`${h} \`${child.key}\`${child.isArray ? " (array items)" : ""}`);
    out.push("");
    out.push(renderSchemaObject(child.node, child.node.required, headingLevel + 1, child.key));
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Page: reference/namespaces.md
// ---------------------------------------------------------------------------

function pageNamespaces() {
  const entries = parsePluginContext(coreTs);
  const legacyBoundary = "store"; // first core-plugin namespace in source order
  const legacy = [];
  const core = [];
  let inCore = false;
  for (const e of entries) {
    if (e.name === legacyBoundary) inCore = true;
    (inCore ? core : legacy).push(e);
  }
  const table = (rows) =>
    [
      "| Namespace | Interface | Description |",
      "|-----------|-----------|-------------|",
      ...rows.map(
        (e) => `| \`context.${e.name}\` | \`${e.type}\` | ${mdEscape(e.doc)} |`,
      ),
    ].join("\n");

  return `${frontmatter({
    title: "API namespaces",
    description: "Every context.* namespace on PluginContext, mapped to its typed interface.",
    order: 1,
  })}${GENERATED_BANNER}

The \`context\` object passed to \`activate(context)\` exposes **${entries.length} API
namespaces**. Each maps to a typed interface documented in the generated
[API Reference](/api/) (source of truth:
[\`packages/plugin-types\`](https://github.com/appos/plugin-sdk/tree/main/packages/plugin-types)).

Bracketed notes in each interface's method docs name the
[permission scope](/manifest/permission-scopes/) required for that call.

## Legacy tier

Namespaces available since the pre-fn-70 plugin runtime.

${table(legacy)}

## Core-plugin tier (fn-70 … fn-101)

Namespaces backed by AppOS core plugins.

${table(core)}
`;
}

// ---------------------------------------------------------------------------
// Page: manifest/reference.md
// ---------------------------------------------------------------------------

function pageManifestReference() {
  const requiredList = manifestSchema.required ?? [];
  const conditional = `Plugins with \`"runtime": "javascript"\` must also declare \`entrypoint\`.`;
  return `${frontmatter({
    title: "Manifest field reference",
    description: "Every plugin.json field, generated from schemas/plugin-v1.json.",
    order: 2,
  })}${GENERATED_BANNER}

Generated from
[\`schemas/plugin-v1.json\`](https://github.com/appos/plugin-sdk/blob/main/schemas/plugin-v1.json)
(\`$id: ${manifestSchema.$id}\`). Unknown top-level fields are rejected
(\`additionalProperties: false\`).

**Always required:** ${requiredList.map((f) => `\`${f}\``).join(", ")}. ${conditional}

## Fields

${renderSchemaObject(manifestSchema, requiredList, 2, "")}

## Permissions

The \`permissions\` array accepts bare scope strings or \`{ scope, reason }\`
objects (the optional \`reason\`, max 120 chars, is shown in the approval
sheet). The full scope catalog is on the
[permission scopes page](/manifest/permission-scopes/).
`;
}

// ---------------------------------------------------------------------------
// Page: manifest/permission-scopes.md
// ---------------------------------------------------------------------------

function pagePermissionScopes() {
  const { groups, templates } = parseUnionWithGroups(permissionsTs, "CanonicalPermissionScope");
  const legacyParsed = parseUnionWithGroups(permissionsTs, "LegacyPermissionScope");
  const canonicalFromTs = groups.flatMap((g) => g.members);
  const fixedScopes = constraints.permissions?.fixedScopes ?? [];
  const legacyAliases = constraints.permissions?.legacyAliasScopes ?? [];
  const dynamicFamilies = constraints.permissions?.dynamicFamilies ?? [];

  // Cross-check the two in-repo sources of truth; surface drift in the page.
  const tsSet = new Set(canonicalFromTs);
  const jsonSet = new Set(fixedScopes);
  const onlyTs = canonicalFromTs.filter((s) => !jsonSet.has(s));
  const onlyJson = fixedScopes.filter((s) => !tsSet.has(s));
  let driftNote = "";
  if (onlyTs.length || onlyJson.length) {
    driftNote = `
:::caution[Source drift detected]
The two in-repo scope catalogs disagree. Fix the sources, then regenerate.
${onlyTs.length ? `- In \`permissions.ts\` only: ${onlyTs.map((s) => `\`${s}\``).join(", ")}` : ""}
${onlyJson.length ? `- In \`constraints.json\` only: ${onlyJson.map((s) => `\`${s}\``).join(", ")}` : ""}
:::
`;
  }

  const groupSections = groups
    .map(
      (g) => `### ${g.group}

${g.members.map((s) => `- \`${s}\``).join("\n")}`,
    )
    .join("\n\n");

  return `${frontmatter({
    title: "Permission scopes",
    description: "The full catalog of permission scopes accepted in plugin.json.",
    order: 3,
  })}${GENERATED_BANNER}

Generated from
[\`packages/plugin-types/src/permissions.ts\`](https://github.com/appos/plugin-sdk/blob/main/packages/plugin-types/src/permissions.ts)
and
[\`schemas/constraints.json\`](https://github.com/appos/plugin-sdk/blob/main/schemas/constraints.json).
The host-side ground truth is \`PermissionScope.allKnown\` in the AppOS host repo.

**${fixedScopes.length} canonical scopes** are recognized, plus the dynamic
\`oauth.<provider>\` family and ${legacyAliases.length} legacy aliases.
${driftNote}
## Canonical scopes

${groupSections}

## Dynamic scope families

${dynamicFamilies
  .map(
    (f) => `- \`${f.prefix}*\` — ${mdEscape(f.description ?? "")} (pattern: \`${f.validationPattern}\`)`,
  )
  .join("\n")}
${templates.length ? `\nDeclared in the TypeScript union as: ${templates.map((t) => `\`${t}\``).join(", ")}\n` : ""}
## Legacy aliases (deprecated)

Accepted for backward compatibility but **not** part of the host's canonical
set. New plugins should use canonical scopes only.

${legacyAliases.map((s) => `- \`${s}\``).join("\n")}

Notes from the type definitions:

- \`network.fetch\` is normalized to \`network.outbound\` at manifest parse time.
- \`network\`, \`smartFolders\`, and \`webview\` are historical SDK-only names
  with no host-side entry.
- \`shell.uncontained\` is **not** a declarable scope — the uncontained shell
  tier is inferred from \`filesystem.readAll\`, never declared.
${
  legacyParsed.groups.length
    ? ""
    : "" /* legacy union parsed for cross-check only */
}`;
}

// ---------------------------------------------------------------------------
// Page: manifest/limits.md
// ---------------------------------------------------------------------------

function pageLimits() {
  const limits = constraints.limits ?? {};
  const build = constraints.build ?? {};
  const code = constraints.code ?? {};
  const limitRows = Object.entries(limits)
    .map(([k, v]) => `| \`${k}\` | \`${v}\` |`)
    .join("\n");
  return `${frontmatter({
    title: "Runtime limits & build constraints",
    description: "Host-enforced quotas and required build configuration, generated from schemas/constraints.json.",
    order: 4,
  })}${GENERATED_BANNER}

Generated from
[\`schemas/constraints.json\`](https://github.com/appos/plugin-sdk/blob/main/schemas/constraints.json)
— the machine-readable constraints file intended for AI agents and validation
tools.

## Build constraints

| Setting | Value |
|---------|-------|
${Object.entries(build)
  .map(([k, v]) => `| \`${k}\` | \`${v}\` |`)
  .join("\n")}

## Code requirements

| Requirement | Value |
|-------------|-------|
${Object.entries(code)
  .map(([k, v]) => `| \`${k}\` | \`${Array.isArray(v) ? v.join("`, `") : v}\` |`)
  .join("\n")}

## Runtime limits

| Limit | Value |
|-------|-------|
${limitRows}

## View descriptor tokens

- **View types**: ${(constraints.viewDescriptor?.types ?? []).map((t) => `\`${t}\``).join(", ")}
- **Fonts**: ${(constraints.viewDescriptor?.fonts ?? []).map((t) => `\`${t}\``).join(", ")}
- **System colors**: ${(constraints.viewDescriptor?.systemColors ?? []).map((t) => `\`${t}\``).join(", ")}
- **Semantic colors**: ${(constraints.viewDescriptor?.semanticColors ?? []).map((t) => `\`${t}\``).join(", ")}
- **Design-token colors**: ${(constraints.viewDescriptor?.designTokenColors ?? []).map((t) => `\`${t}\``).join(", ")}
- **Hex colors**: pattern \`${constraints.viewDescriptor?.hexColorPattern ?? ""}\`
`;
}

// ---------------------------------------------------------------------------
// Page: extension-points/index.md
// ---------------------------------------------------------------------------

function pageExtensionPoints() {
  const extensionsProp = manifestSchema.properties?.extensions ?? {};
  // The schema's description enumerates the known extension-point families.
  const description = extensionsProp.description ?? "";

  // Derive contribution surfaces from contributor-shaped permission scopes —
  // the only machine-readable signal for extension points in this repo.
  const fixedScopes = constraints.permissions?.fixedScopes ?? [];
  // Match the contributor verb as a whole segment — final (`actions.register`)
  // or nested (`palette.contribute.scope`, `surfaces.contribute.sidebar.top`,
  // `webhook.route.register.unsigned`).
  const contributorScopes = fixedScopes.filter((s) =>
    /\.(register|provide|contribute)(\.|$)/.test(s),
  );
  const byFamily = new Map();
  for (const scope of contributorScopes) {
    const family = scope.split(".")[0];
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(scope);
  }
  const familyTable = [...byFamily.entries()]
    .map(
      ([family, scopes]) =>
        `| \`${family}\` | ${scopes.map((s) => `\`${s}\``).join(", ")} |`,
    )
    .join("\n");

  return `${frontmatter({
    title: "Extension points",
    description: "Contributing to core-plugin extension points via the manifest extensions[] array.",
    order: 1,
  })}${GENERATED_BANNER}

Core plugins expose **extension points** that third-party plugins contribute
to declaratively through the manifest's \`extensions[]\` array. Each entry
names a qualified extension point id and carries the contribution payload:

\`\`\`json title="plugin.json (excerpt)"
{
  "extensions": [
    {
      "extensionPoint": "space.appos.core.notifications:channel",
      "...": "contribution payload fields (schema owned by the core plugin)"
    }
  ]
}
\`\`\`

From the manifest schema (\`schemas/plugin-v1.json\`):

> ${mdEscape(description)}

Only \`extensionPoint\` is required per entry; the remaining fields are
validated by the owning core plugin at replay time. Contributions are
re-ingested on plugin activation, so manifest-declarative contributions
behave identically to runtime-registered ones once bound.

Plugins can also declare their **own** extension points (\`extensionPoints\`
manifest field + \`context.extensionPoints\` API) for other plugins to
contribute to — see \`ExtensionPointsAPI\` in the [API Reference](/api/).

## Contribution surfaces

Contributing to an extension point requires the matching contributor
permission scope. The scope catalog is the machine-readable signal for which
contribution surfaces exist, grouped here by family:

| Family | Contributor scopes |
|--------|--------------------|
${familyTable}

:::note[TODO — canonical extension-point catalog]
The authoritative extension-point catalog — qualified ids
(\`<corePluginId>:<point>\`), per-contribution payload schemas, and validation
rules — is owned by the core plugins in the AppOS host repo and is **not
machine-readable from this SDK repo yet**. The table above is derived from
contributor permission scopes; per-point payload documentation will be
generated once the host exports a machine-readable extension-point catalog.
:::
`;
}

// ---------------------------------------------------------------------------
// Page: extension-points/event-topics.md
// ---------------------------------------------------------------------------

function pageEventTopics() {
  return `${frontmatter({
    title: "Event topics",
    description: "The typed event bus — topic declaration, delivery modes, and the host topic catalog.",
    order: 2,
  })}${GENERATED_BANNER}

Plugins communicate through the **typed event bus** (fn-70): topics are
declared with a schema, retention policy, and delivery mode, then emitted and
subscribed via \`context.events\`:

- \`declareTopic(spec)\` — requires \`events.topic.declare\`
- \`emitTopic(name, payload)\` — requires \`events.emit\`
- \`subscribeTopic(name, handler)\` — requires \`events.subscribe\`
- \`replay(name, opts)\` — requires \`events.replay\`
- \`listTopics()\` — requires \`events.inspect\`

Delivery modes: \`atMostOnce\`, \`atLeastOnce\` (retry/backoff/dead-letter),
and \`ordered\` (partitioned). See \`EventsAPI\`, \`TopicSpec\`, and
\`EventEnvelope\` in the [API Reference](/api/).

Topic naming: public core-plugin topics use the owning plugin's prefix
(e.g. \`actions.receipt.written\`, \`scheduler.job.cancelled\`,
\`notifications.delivered\`). Topics prefixed \`_host.*\` are host-internal —
third-party plugins cannot subscribe to them.

:::note[TODO — host topic catalog]
The authoritative catalog of core-plugin event topics (300+ topics across the
fn-70 … fn-101 core plugins, with per-topic payload schemas and retention
policies) lives in the AppOS host repo and is **not machine-readable from
this SDK repo yet**. This page will grow a generated topic table once the
host exports its topic registry. Until then, use
\`context.events.listTopics()\` at runtime to enumerate topics visible to
your plugin.
:::
`;
}

// ---------------------------------------------------------------------------
// Emit / check
// ---------------------------------------------------------------------------

const outputs = {
  "src/content/docs/reference/namespaces.md": pageNamespaces(),
  "src/content/docs/manifest/reference.md": pageManifestReference(),
  "src/content/docs/manifest/permission-scopes.md": pagePermissionScopes(),
  "src/content/docs/manifest/limits.md": pageLimits(),
  "src/content/docs/extension-points/index.md": pageExtensionPoints(),
  "src/content/docs/extension-points/event-topics.md": pageEventTopics(),
  "generated-docs.hash": `# SHA-256 over generator inputs (schemas/ + plugin-types sources).\n# Regenerate: cd docs-site && npm run generate\n${inputHash}\n`,
};

let stale = [];
for (const [rel, content] of Object.entries(outputs)) {
  const abs = join(docsSiteRoot, rel);
  if (CHECK_MODE) {
    const existing = existsSync(abs) ? readFileSync(abs, "utf-8") : null;
    if (existing !== content) stale.push(rel);
  } else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    console.log(`  wrote docs-site/${rel}`);
  }
}

if (CHECK_MODE) {
  if (stale.length) {
    console.error("Drift gate FAILED — committed generated docs are stale:");
    for (const rel of stale) console.error(`  docs-site/${rel}`);
    console.error("\nFix: cd docs-site && npm run generate, then commit the result.");
    process.exit(1);
  }
  console.log(`Drift gate OK — generated docs match sources (input hash ${inputHash.slice(0, 12)}…).`);
} else {
  console.log(`Generated ${Object.keys(outputs).length} files (input hash ${inputHash.slice(0, 12)}…).`);
}
