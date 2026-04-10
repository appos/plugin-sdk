#!/usr/bin/env node

/**
 * integration-test-ytdlp.mjs
 *
 * Integration test: Verifies that the yt-dlp plugin can import from SDK
 * packages and build successfully with esbuild.
 *
 * This test:
 * 1. Checks that the yt-dlp plugin repo exists at the expected sibling path
 * 2. Verifies SDK packages are linked as dependencies
 * 3. Runs `npm run build` (esbuild) in the yt-dlp plugin
 * 4. Verifies dist/main.js contains SDK utility functions (bundled)
 * 5. Verifies no inline PluginContext definition remains in src/
 *
 * Usage:
 *   node scripts/integration-test-ytdlp.mjs
 *   node scripts/integration-test-ytdlp.mjs --ytdlp-dir /path/to/appos-plugin-ytdlp
 *
 * External repo handling:
 *   If the yt-dlp repo is absent, prints a warning and exits 0 (not a failure).
 *   Contributors can clone it to ~/Documents/GitHub/AppOS/appos-plugin-ytdlp/
 *   to run the full integration test locally.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sdkRoot = resolve(__dirname, "..");

// Parse --ytdlp-dir flag or use default sibling path
const ytdlpDirFlag = process.argv.indexOf("--ytdlp-dir");
const ytdlpDir =
  ytdlpDirFlag !== -1
    ? resolve(process.argv[ytdlpDirFlag + 1])
    : resolve(sdkRoot, "..", "appos-plugin-ytdlp");

let passed = 0;
let failed = 0;

function pass(msg) {
  passed++;
  console.log(`  PASS: ${msg}`);
}

function fail(msg) {
  failed++;
  console.log(`  FAIL: ${msg}`);
}

// ── Check yt-dlp repo exists ──────────────────────────────────
console.log(`\nIntegration test: yt-dlp plugin imports from SDK`);
console.log(`  yt-dlp path: ${ytdlpDir}`);

if (!existsSync(ytdlpDir)) {
  console.log(
    `\n  WARNING: yt-dlp plugin repo not found at ${ytdlpDir}`
  );
  console.log(
    `  Clone it to ~/Documents/GitHub/AppOS/appos-plugin-ytdlp/ to run this test.`
  );
  console.log(`  Skipping integration test (exit 0).\n`);
  process.exit(0);
}

if (!existsSync(resolve(ytdlpDir, "package.json"))) {
  console.log(`\n  WARNING: No package.json found in ${ytdlpDir}. Skipping.\n`);
  process.exit(0);
}

// ── Check package.json has SDK dependencies ───────────────────
console.log(`\nChecking dependencies...`);
const pkg = JSON.parse(readFileSync(resolve(ytdlpDir, "package.json"), "utf8"));

if (pkg.devDependencies?.["@appos.space/plugin-types"]) {
  pass("@appos.space/plugin-types in devDependencies");
} else {
  fail("@appos.space/plugin-types NOT in devDependencies");
}

if (pkg.dependencies?.["@appos.space/plugin-types"]) {
  fail("@appos.space/plugin-types should be in devDependencies, not dependencies");
}

if (pkg.dependencies?.["@appos.space/plugin-utils"]) {
  pass("@appos.space/plugin-utils in dependencies");
} else {
  fail("@appos.space/plugin-utils NOT in dependencies");
}

if (pkg.dependencies?.["@appos.space/view-builders"]) {
  pass("@appos.space/view-builders in dependencies");
} else {
  fail("@appos.space/view-builders NOT in dependencies");
}

// ── Check source files use SDK imports ────────────────────────
console.log(`\nChecking source imports...`);

const srcDir = resolve(ytdlpDir, "src");
const filesToCheck = [
  "main.ts",
  "core/dependency-checker.ts",
  "services/downloader.ts",
  "panels/download-form.ts",
  "panels/queue-dashboard.ts",
  "panels/library-browser.ts",
  "smart-folders/filters.ts",
];

let hasPluginTypesImport = false;
let hasPluginUtilsImport = false;
let hasViewBuildersImport = false;
let hasInlinePluginContext = false;

for (const file of filesToCheck) {
  const filePath = resolve(srcDir, file);
  if (!existsSync(filePath)) continue;
  const content = readFileSync(filePath, "utf8");

  if (content.includes("from '@appos.space/plugin-types'") || content.includes('from "@appos.space/plugin-types"')) {
    hasPluginTypesImport = true;
  }
  if (content.includes("from '@appos.space/plugin-utils'") || content.includes('from "@appos.space/plugin-utils"')) {
    hasPluginUtilsImport = true;
  }
  if (content.includes("from '@appos.space/view-builders'") || content.includes('from "@appos.space/view-builders"')) {
    hasViewBuildersImport = true;
  }
  // Check for inline PluginContext interface definition (not an import)
  if (content.match(/^\s*export\s+interface\s+PluginContext\s*\{/m)) {
    hasInlinePluginContext = true;
  }
}

hasPluginTypesImport
  ? pass("At least one file uses import from @appos.space/plugin-types")
  : fail("No file uses import from @appos.space/plugin-types");

hasPluginUtilsImport
  ? pass("At least one file uses import from @appos.space/plugin-utils")
  : fail("No file uses import from @appos.space/plugin-utils");

hasViewBuildersImport
  ? pass("At least one file uses import from @appos.space/view-builders")
  : fail("No file uses import from @appos.space/view-builders");

hasInlinePluginContext
  ? fail("Inline PluginContext interface definition found in src/")
  : pass("No inline PluginContext interface in src/");

// ── Install & Build ───────────────────────────────────────────
console.log(`\nBuilding yt-dlp plugin...`);

try {
  execFileSync("npm", ["install"], { cwd: ytdlpDir, stdio: "pipe" });
  pass("npm install succeeded");
} catch (e) {
  fail(`npm install failed: ${e.message}`);
}

try {
  execFileSync("npm", ["run", "build"], { cwd: ytdlpDir, stdio: "pipe" });
  pass("npm run build (esbuild) succeeded");
} catch (e) {
  fail(`npm run build failed: ${e.stderr?.toString() || e.message}`);
}

// ── Verify bundle contains SDK code ───────────────────────────
console.log(`\nChecking bundled output...`);
const distPath = resolve(ytdlpDir, "dist/main.js");

if (existsSync(distPath)) {
  const bundle = readFileSync(distPath, "utf8");

  bundle.includes("fileExtension")
    ? pass("Bundle contains fileExtension from @appos.space/plugin-utils")
    : fail("Bundle missing fileExtension -- plugin-utils not bundled");

  bundle.includes("createActionRouter")
    ? pass("Bundle contains createActionRouter from @appos.space/plugin-utils")
    : fail("Bundle missing createActionRouter -- plugin-utils not bundled");

  bundle.includes("vstack")
    ? pass("Bundle contains vstack from @appos.space/view-builders")
    : fail("Bundle missing vstack -- view-builders not bundled");

  bundle.includes("stripUndefined")
    ? pass("Bundle contains stripUndefined (view-builders internal)")
    : fail("Bundle missing stripUndefined -- view-builders not fully bundled");
} else {
  fail("dist/main.js not found after build");
}

// ── Summary ───────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(
  `Results: ${passed} passed, ${failed} failed, ${passed + failed} total`
);

if (failed > 0) {
  console.log(`\nIntegration test FAILED\n`);
  process.exit(1);
} else {
  console.log(`\nIntegration test PASSED\n`);
  process.exit(0);
}
