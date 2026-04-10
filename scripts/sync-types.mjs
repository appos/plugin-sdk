#!/usr/bin/env node
/**
 * Sync types from the upstream AppOS plugin-api.d.ts source of truth.
 *
 * Usage:
 *   node scripts/sync-types.mjs <path-to-plugin-api.d.ts>
 *   APPOS_PLUGIN_API_SOURCE=/path/to/plugin-api.d.ts node scripts/sync-types.mjs
 *
 * The canonical plugin-api.d.ts lives in the AppOS host repo (private).
 * This script copies it into the repo root as plugin-api.d.ts.reference
 * for diffing, then prints a version summary. The typed packages in
 * packages/plugin-types/ are manually curated — this script helps
 * identify what's changed upstream so you can update them.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const sourceArg = process.argv[2] || process.env.APPOS_PLUGIN_API_SOURCE;
if (!sourceArg) {
  console.error("Usage: node scripts/sync-types.mjs <path-to-plugin-api.d.ts>");
  console.error("   or: set APPOS_PLUGIN_API_SOURCE=/path/to/plugin-api.d.ts");
  process.exit(1);
}

const source = resolve(sourceArg);
const dest = resolve(repoRoot, "plugin-api.d.ts.reference");

if (!existsSync(source)) {
  console.error(`Source not found: ${source}`);
  process.exit(1);
}

const content = readFileSync(source, "utf-8");
const existing = existsSync(dest) ? readFileSync(dest, "utf-8") : "";

if (content === existing) {
  console.log("✅ plugin-api.d.ts.reference is already up to date.");
  process.exit(0);
}

writeFileSync(dest, content);

// Extract version from source (supports both "@version X.Y.Z" and "Version: X.Y.Z")
const versionMatch = content.match(/@version\s+([\d.]+[-\w]*)/) ||
  content.match(/Version:\s*([\d.]+[-\w]*)/);
const version = versionMatch ? versionMatch[1] : "unknown";

const lines = content.split("\n").length;
console.log(`📦 Synced plugin-api.d.ts (${version}, ${lines} lines)`);
console.log(`   Source: ${source}`);
console.log(`   Dest:   ${dest}`);
console.log("");
console.log("Next: review changes and update packages/plugin-types/src/ as needed.");
