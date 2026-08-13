/**
 * Fixture: the SAME JSC-runtime tsconfig as `jsc-with-globals`, but WITHOUT
 * the globals reference line. It still imports the package MAIN entry —
 * proving the main entry drags no ambient `URL` into scope.
 *
 * MUST FAIL to compile, and every diagnostic must be TS2304
 * ("Cannot find name 'URL'").
 */
import type { PluginContext } from "@appos.space/plugin-types";

declare const ctx: PluginContext;
void ctx;

export const leaked = new URL("https://example.com/");
