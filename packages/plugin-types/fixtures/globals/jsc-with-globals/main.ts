/// <reference types="@appos.space/plugin-types/globals" />
/**
 * Fixture: a JSC-runtime plugin tsconfig (lib ES2020, no DOM) that OPTS IN
 * to the globals subpath via the triple-slash reference line above.
 *
 * MUST COMPILE CLEANLY. Every `@ts-expect-error` line below is
 * self-checking: if the expected error stops firing, the compile fails
 * with "Unused '@ts-expect-error' directive".
 */
import type { PluginContext } from "@appos.space/plugin-types";

export function hostOf(ctx: PluginContext, raw: string): string | null {
  void ctx;
  // Canonical guard: typeof narrowing removes `undefined`.
  if (typeof URL !== "function") return null;
  const ok: boolean = URL.canParse(raw);
  if (!ok) return null;
  const u = new URL(raw);
  // Base form — both string and URL bases are accepted.
  const resolved = new URL("/path?q=1#frag", u);
  const alsoResolved = new URL("/other", raw);
  void alsoResolved;
  // The full v1 accessor subset typechecks as strings.
  const parts: string[] = [
    u.href,
    u.protocol,
    u.hostname,
    u.host,
    u.port,
    u.pathname,
    u.search,
    u.hash,
    u.origin,
    u.username,
    u.password,
    u.toString(),
    u.toJSON(),
    resolved.href,
  ];
  void parts;
  return u.hostname;
}

export function truthinessGuard(raw: string): string | null {
  // Truthiness narrowing works too.
  if (URL) {
    return new URL(raw).href;
  }
  return null;
}

declare const unguardedInput: string;

// @ts-expect-error — URL is optionally typed; unguarded `new URL(...)` must not compile.
export const unguarded = new URL(unguardedInput);

declare const someUrl: URL;

// @ts-expect-error — searchParams is deliberately OUT of the v1 subset (runtime getter throws TypeError).
void someUrl.searchParams;

// @ts-expect-error — accessors are readonly; assignment must not compile.
someUrl.hostname = "example.com";
