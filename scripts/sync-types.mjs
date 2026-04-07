#!/usr/bin/env node
/**
 * Sync types from the 2Panez source-of-truth plugin-api.d.ts.
 *
 * Usage:
 *   node scripts/sync-types.mjs [path-to-plugin-api.d.ts]
 *
 * Default source: ../../_90-percent-done/2Panes/Bifocal/Sources/TwoPanez/Services/Plugins/plugin-api.d.ts
 *
 * This script copies the canonical plugin-api.d.ts into the repo root
 * for reference, then prints a diff summary. The typed packages in
 * packages/plugin-types/ are manually curated — this script helps
 * identify what's changed upstream so you can update them.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const defaultSource = resolve(
  repoRoot,
  "../../_90-percent-done/2Panes/Bifocal/Sources/TwoPanez/Services/Plugins/plugin-api.d.ts",
);

const source = process.argv[2] ? resolve(process.argv[2]) : defaultSource;
const dest = resolve(repoRoot, "plugin-api.d.ts.reference");

if (!existsSync(source)) {
  console.error(`Source not found: ${source}`);
  console.error("Pass the path to plugin-api.d.ts as an argument.");
  process.exit(1);
}

const content = readFileSync(source, "utf-8");
const existing = existsSync(dest) ? readFileSync(dest, "utf-8") : "";

if (content === existing) {
  console.log("✅ plugin-api.d.ts.reference is already up to date.");
  process.exit(0);
}

writeFileSync(dest, content);

// Extract version from source
const versionMatch = content.match(/Version:\s*([\d.]+[-\w]*)/);
const version = versionMatch ? versionMatch[1] : "unknown";

const lines = content.split("\n").length;
console.log(`📦 Synced plugin-api.d.ts (${version}, ${lines} lines)`);
console.log(`   Source: ${source}`);
console.log(`   Dest:   ${dest}`);
console.log("");
console.log("Next: review changes and update packages/plugin-types/src/ as needed.");
