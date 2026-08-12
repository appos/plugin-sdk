/**
 * Fixture: a webview tsconfig (lib.dom) that imports the package MAIN entry
 * and does NOT reference the globals subpath. lib.dom's own `URL` must be
 * fully intact — mutable `href`, `searchParams` present — proving the
 * package neither leaks nor narrows the browser's URL for webview code.
 *
 * MUST COMPILE CLEANLY.
 */
import type { PluginContext } from "@appos.space/plugin-types";

declare const ctx: PluginContext;
void ctx;

const u = new URL("https://example.com/?a=1");

// lib.dom's URL has searchParams — ours (deliberately) does not.
export const a: string | null = u.searchParams.get("a");

// lib.dom's URL accessors are mutable — ours are readonly.
u.href = "https://example.org/";

// No optional typing here either: lib.dom's `URL` is not `| undefined`.
export const direct: string = new URL("https://example.net/").hostname;
