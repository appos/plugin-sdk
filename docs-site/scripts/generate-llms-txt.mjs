#!/usr/bin/env node
/**
 * generate-llms-txt.mjs — emits llms.txt (index) and llms-full.txt (full
 * corpus) into the built site for AI consumption, following the llms.txt
 * convention (https://llmstxt.org).
 *
 * Runs AFTER `astro build` so the TypeDoc-generated API pages (written into
 * src/content/docs/api/ at build time) are included.
 *
 * Corpus = every docs page (raw markdown) + the SDK's TypeScript type
 * sources + the plugin.json schema files.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsSiteRoot = resolve(__dirname, "..");
const repoRoot = resolve(docsSiteRoot, "..");
const contentRoot = join(docsSiteRoot, "src/content/docs");
const distRoot = join(docsSiteRoot, "dist");

const SITE = "https://docs.appos.space";

if (!existsSync(distRoot)) {
  console.error("dist/ not found — run `astro build` before generate-llms-txt.mjs");
  process.exit(1);
}

function walk(dir, exts, acc = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      walk(p, exts, acc);
    } else if (exts.some((e) => name.endsWith(e))) {
      acc.push(p);
    }
  }
  return acc;
}

function pageUrl(file) {
  let slug = relative(contentRoot, file).replace(/\.(md|mdx)$/, "");
  if (slug.endsWith("/index") || slug === "index") slug = slug.replace(/index$/, "");
  return `${SITE}/${slug}${slug && !slug.endsWith("/") ? "/" : ""}`;
}

function pageTitle(raw) {
  const m = raw.match(/^title:\s*(.+)$/m);
  if (!m) return "(untitled)";
  let t = m[1].trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  return t;
}

const pages = walk(contentRoot, [".md", ".mdx"]).map((file) => {
  const raw = readFileSync(file, "utf-8");
  return { file, raw, url: pageUrl(file), title: pageTitle(raw) };
});

// ---------------------------------------------------------------------------
// llms.txt — index
// ---------------------------------------------------------------------------

const grouped = new Map();
for (const p of pages) {
  const section = relative(contentRoot, p.file).split("/")[0].replace(/\.(md|mdx)$/, "");
  const label =
    {
      "index": "Overview",
      "getting-started": "Getting Started",
      "reference": "API Reference",
      "api": "Generated API Reference (TypeDoc)",
      "manifest": "Manifest & Permissions",
      "extension-points": "Extension Points",
    }[section] ?? section;
  if (!grouped.has(label)) grouped.set(label, []);
  grouped.get(label).push(p);
}

const indexLines = [
  "# AppOS Plugin SDK",
  "",
  "> Developer documentation for the AppOS Plugin SDK: TypeScript types for the",
  "> full plugin API (43 context.* namespaces), ViewDescriptor UI builders, pure",
  "> plugin utilities, the plugin.json manifest schema, and the permission-scope",
  "> catalog. AppOS is a composable macOS desktop automation platform; plugins",
  "> are bundled ES2020 JavaScript executed in the host's JavaScriptCore runtime.",
  "",
  `The full text of every page is available at ${SITE}/llms-full.txt`,
  "",
];
for (const [label, sectionPages] of grouped) {
  indexLines.push(`## ${label}`, "");
  for (const p of sectionPages) indexLines.push(`- [${p.title}](${p.url})`);
  indexLines.push("");
}

writeFileSync(join(distRoot, "llms.txt"), indexLines.join("\n"));

// ---------------------------------------------------------------------------
// llms-full.txt — full corpus
// ---------------------------------------------------------------------------

const fullParts = [
  indexLines.join("\n"),
  "",
  "=".repeat(78),
  "FULL PAGE CONTENT",
  "=".repeat(78),
];

for (const p of pages) {
  fullParts.push("", "-".repeat(78), `PAGE: ${p.title}`, `URL: ${p.url}`, "-".repeat(78), "", p.raw);
}

fullParts.push("", "=".repeat(78), "SDK TYPE SOURCES (packages/*/src)", "=".repeat(78));
for (const pkg of ["plugin-types", "view-builders", "plugin-utils"]) {
  const srcDir = join(repoRoot, "packages", pkg, "src");
  if (!existsSync(srcDir)) continue;
  for (const file of walk(srcDir, [".ts"])) {
    fullParts.push(
      "",
      "-".repeat(78),
      `FILE: ${relative(repoRoot, file)}`,
      "-".repeat(78),
      "",
      readFileSync(file, "utf-8"),
    );
  }
}

fullParts.push("", "=".repeat(78), "MANIFEST SCHEMAS (schemas/)", "=".repeat(78));
for (const schema of ["plugin-v1.json", "constraints.json"]) {
  const p = join(repoRoot, "schemas", schema);
  if (!existsSync(p)) continue;
  fullParts.push("", "-".repeat(78), `FILE: schemas/${schema}`, "-".repeat(78), "", readFileSync(p, "utf-8"));
}

const full = fullParts.join("\n");
writeFileSync(join(distRoot, "llms-full.txt"), full);

console.log(
  `Wrote dist/llms.txt (${pages.length} pages indexed) and dist/llms-full.txt (${(full.length / 1024).toFixed(0)} KB).`,
);
