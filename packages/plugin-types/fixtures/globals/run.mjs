#!/usr/bin/env node
/**
 * Consumer-fixture gate for the opt-in globals subpath
 * (`@appos.space/plugin-types/globals`).
 *
 * Runs `tsc` against four standalone consumer tsconfigs that resolve the
 * package BY NAME through the workspace `node_modules` symlink (i.e. through
 * the published `exports` map and the built `dist/` output — not through
 * `src/`):
 *
 *   1. jsc-with-globals    — JSC tsconfig + the reference line → MUST pass
 *                            (guarded `new URL(...)` typechecks; the
 *                            `@ts-expect-error` lines are self-checking).
 *   2. jsc-types-array     — same opt-in via the tsconfig `types` array
 *                            instead of the reference line → MUST pass.
 *   3. jsc-without-globals — same tsconfig, no reference, main entry
 *                            imported → MUST fail, and every diagnostic must
 *                            be TS2304 "Cannot find name 'URL'" (proves no
 *                            global leaks from the main entry).
 *   4. webview-dom         — lib.dom tsconfig, no reference → MUST pass
 *                            (lib.dom's URL untouched: mutable href +
 *                            searchParams still typecheck).
 *
 * Expectations are exact: pass-cases must exit 0; the fail-case must exit
 * non-zero AND produce only the expected error code, so a broken fixture
 * config cannot read as a false green.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "..", "..");
const require = createRequire(import.meta.url);
const tscBin = require.resolve("typescript/bin/tsc", { paths: [packageRoot] });

const distGlobals = join(packageRoot, "dist", "globals.d.ts");
const distIndex = join(packageRoot, "dist", "index.d.ts");
if (!existsSync(distGlobals) || !existsSync(distIndex)) {
  console.error(
    "fixtures/globals: dist/ output missing (need dist/index.d.ts + dist/globals.d.ts).\n" +
      "Run `npm run build` first — the fixtures resolve the package through its built dist/ via the exports map.",
  );
  process.exit(1);
}

const cases = [
  { dir: "jsc-with-globals", expect: "pass" },
  { dir: "jsc-types-array", expect: "pass" },
  {
    dir: "jsc-without-globals",
    expect: "fail",
    onlyErrorCode: "TS2304",
    mustMention: "'URL'",
  },
  { dir: "webview-dom", expect: "pass" },
];

let failed = false;

for (const c of cases) {
  const proj = join(here, c.dir);
  const res = spawnSync(process.execPath, [tscBin, "-p", proj, "--pretty", "false"], {
    encoding: "utf-8",
  });
  const out = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  const errorLines = out.split("\n").filter((l) => /error TS\d+/.test(l));

  if (c.expect === "pass") {
    if (res.status === 0 && errorLines.length === 0) {
      console.log(`PASS  ${c.dir} (compiled cleanly, as expected)`);
    } else {
      failed = true;
      console.error(`FAIL  ${c.dir} — expected a clean compile, got exit ${res.status}:\n${out}`);
    }
    continue;
  }

  // expect === "fail"
  const nonMatching = errorLines.filter((l) => !l.includes(`error ${c.onlyErrorCode}`));
  const mentions = errorLines.some((l) => l.includes(c.mustMention));
  if (res.status !== 0 && errorLines.length > 0 && nonMatching.length === 0 && mentions) {
    console.log(
      `PASS  ${c.dir} (failed with only ${c.onlyErrorCode} mentioning ${c.mustMention}, as expected)`,
    );
  } else {
    failed = true;
    console.error(
      `FAIL  ${c.dir} — expected exit != 0 with ONLY ${c.onlyErrorCode} diagnostics mentioning ${c.mustMention}.\n` +
        `exit=${res.status}, errorLines=${errorLines.length}, unexpected=${nonMatching.length}\n${out}`,
    );
  }
}

if (failed) {
  process.exit(1);
}
console.log(`fixtures/globals: all ${cases.length} consumer fixtures behaved as expected.`);
