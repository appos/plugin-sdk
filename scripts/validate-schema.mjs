#!/usr/bin/env node

/**
 * validate-schema.mjs
 *
 * Validates plugin.json manifests against schemas/plugin-v1.json.
 * Tests real community plugin manifests when available, falls back to
 * vendored fixtures for CI/contributor environments.
 *
 * Usage:
 *   node scripts/validate-schema.mjs [--plugins-dir <path>] [--ytdlp-dir <path>]
 */

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── CLI args ────────────────────────────────────────────────────────────────

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--plugins-dir" && args[i + 1]) {
      opts.pluginsDir = resolve(args[++i]);
    } else if (args[i] === "--ytdlp-dir" && args[i + 1]) {
      opts.ytdlpDir = resolve(args[++i]);
    }
  }
  return opts;
}

const cliOpts = parseArgs(process.argv.slice(2));

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PLUGINS_DIR = resolve(
  ROOT,
  "../community-plugins/plugins"
);
const DEFAULT_YTDLP_DIR = resolve(ROOT, "../appos-plugin-ytdlp");
const FIXTURES_DIR = join(ROOT, "schemas", "__fixtures__");

const pluginsDir = cliOpts.pluginsDir || DEFAULT_PLUGINS_DIR;
const ytdlpDir = cliOpts.ytdlpDir || DEFAULT_YTDLP_DIR;

// ── Schema setup ────────────────────────────────────────────────────────────

const schemaPath = join(ROOT, "schemas", "plugin-v1.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// ── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warnings = 0;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function check(label, filePath) {
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const valid = validate(data);
  if (valid) {
    console.log(`  ${GREEN}\u2713${RESET} ${label}`);
    passed++;
  } else {
    console.log(`  ${RED}\u2717${RESET} ${label}`);
    for (const err of validate.errors) {
      const location = err.instancePath || "(root)";
      console.log(
        `    ${DIM}${location}${RESET}: ${err.message}${err.params ? ` ${DIM}${JSON.stringify(err.params)}${RESET}` : ""}`
      );
    }
    failed++;
  }
  return valid;
}

function checkExpectedInvalid(label, filePath, expectedKeyword) {
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const valid = validate(data);
  if (!valid) {
    console.log(`  ${GREEN}\u2713${RESET} ${label} ${DIM}(correctly rejected)${RESET}`);
    for (const err of validate.errors) {
      const location = err.instancePath || "(root)";
      console.log(
        `    ${DIM}${location}: ${err.message}${RESET}`
      );
    }
    passed++;
  } else {
    console.log(
      `  ${RED}\u2717${RESET} ${label} ${DIM}(should have been rejected but passed)${RESET}`
    );
    failed++;
  }
}

// ── Community plugins ───────────────────────────────────────────────────────

console.log("\n\u250C\u2500 Plugin Schema Validation");
console.log("\u2502");

let hasExternalPlugins = false;

if (existsSync(pluginsDir)) {
  hasExternalPlugins = true;
  console.log(`\u251C\u2500 Community plugins ${DIM}(${pluginsDir})${RESET}`);

  const dirs = readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    const manifest = join(pluginsDir, dir, "plugin.json");
    if (existsSync(manifest)) {
      check(dir, manifest);
    }
  }
} else {
  console.log(
    `\u251C\u2500 ${YELLOW}\u26A0${RESET} community-plugins not found at ${pluginsDir}, skipping external validation`
  );
  warnings++;
}

// ── yt-dlp plugin ───────────────────────────────────────────────────────────

console.log("\u2502");

if (existsSync(join(ytdlpDir, "plugin.json"))) {
  hasExternalPlugins = true;
  console.log(`\u251C\u2500 yt-dlp plugin ${DIM}(${ytdlpDir})${RESET}`);
  check("appos-plugin-ytdlp", join(ytdlpDir, "plugin.json"));
} else {
  console.log(
    `\u251C\u2500 ${YELLOW}\u26A0${RESET} appos-plugin-ytdlp not found at ${ytdlpDir}, skipping`
  );
  warnings++;
}

// ── Vendored fixtures ───────────────────────────────────────────────────────

console.log("\u2502");
console.log(`\u251C\u2500 Vendored fixtures ${DIM}(${FIXTURES_DIR})${RESET}`);

check("valid-minimal", join(FIXTURES_DIR, "valid-minimal.json"));
checkExpectedInvalid(
  "invalid-unknown-field",
  join(FIXTURES_DIR, "invalid-unknown-field.json"),
  "additionalProperties"
);
checkExpectedInvalid(
  "invalid-missing-id",
  join(FIXTURES_DIR, "invalid-missing-id.json"),
  "required"
);

// ── Summary ─────────────────────────────────────────────────────────────────

console.log("\u2502");
console.log(
  `\u2514\u2500 ${passed} passed, ${failed} failed${warnings ? `, ${warnings} skipped` : ""}\n`
);

if (failed > 0) {
  process.exit(1);
}
