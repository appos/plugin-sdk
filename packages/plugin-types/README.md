# @appos.space/plugin-types

TypeScript type definitions for the **AppOS Plugin API**.

Declaration-only package — zero runtime, zero bundle impact. Gives you full
autocomplete and type checking for all 43 plugin namespaces and the full
`PermissionScope` union when authoring plugins for AppOS.

## Install

```bash
npm install --save-dev @appos.space/plugin-types
```

## Usage

Import the types you need (the main entry ships module exports only; the
ONE exception is the opt-in globals subpath — see
[Host-injected globals](#host-injected-globals-opt-in) below):

```ts
import type {
  PluginContext,
  PluginManifest,
  ViewDescriptor,
  PermissionScope,
} from "@appos.space/plugin-types";

export async function activate(ctx: PluginContext) {
  const dir = await ctx.fileOps.getActiveDirectory();
  ctx.ui.showNotification({ message: `Hello from ${dir}` });
}
```

## Host-injected globals (opt-in)

AppOS hosts inject a **Foundation-bridged `URL` constructor** into the
JavaScriptCore plugin runtime (targeted for host 1.1.0). The matching
ambient declaration ships as a SEPARATE opt-in subpath,
`@appos.space/plugin-types/globals`, so nothing global leaks into projects
that don't reference it. Opt in from your plugin entry file:

```ts
/// <reference types="@appos.space/plugin-types/globals" />
```

or in `tsconfig.json`:

```json
{ "compilerOptions": { "types": ["@appos.space/plugin-types/globals"] } }
```

The global is typed `URLConstructor | undefined` — older hosts, menu-bar
`JSContext` pools, and the `appos.jsc.urlGlobal.disabled` kill switch all
leave it undefined. ALWAYS guard before use. Pinning your manifest's
`minHostVersion` to an injecting host release removes only the older-host
reason for absence — it does not override the kill switch or the menu-bar
limitation, so unguarded use can still crash at runtime:

```ts
if (typeof URL === "function" && URL.canParse(raw)) {
  const u = new URL(raw);
  // u.hostname parses identically to the host's own security validators
}
```

Notes:

- **Foundation (RFC 3986) semantics, not a WHATWG polyfill.** The pinned
  divergences are documented in the subpath's docblock: default ports
  retained in `href`/`port`, empty path stays `""`, out-of-range ports
  accepted, `hostname` lowercased with IPv6 unbracketed (`host`/`origin`
  re-bracket). Pre-encoded query values round-trip verbatim on href
  (`%3A` stays `%3A`) — the `%3A` → `%253A` double-encode seen via
  Foundation's `URLComponents.queryItems` does not apply to this API.
- **`url.searchParams` is NOT in the v1 subset** — the type omits it and
  the runtime getter throws a `TypeError`; parse `url.search` manually.
  `URL.parse` is likewise absent, and all accessors are readonly.
- **Reference the subpath only from a DOM-free tsconfig** (e.g.
  `"lib": ["ES2020"]`) — never from webview code compiled against `lib.dom`,
  which already has its own `URL`. The two declarations conflict, but don't
  rely on that as a safeguard: with `skipLibCheck` enabled (the default in
  most scaffolds) TypeScript suppresses declaration-file conflicts and
  silently merges the interfaces, so browser-only members (`searchParams`,
  mutable accessors, unguarded construction) can type-check against the
  narrower JSC runtime. The DOM-free `lib` is the only reliable isolation.

## What's included

- **Core** — `PluginContext`, `PluginManifest`, activation lifecycle
- **Views** — `ViewDescriptor` union for declarative UI
- **Namespaces** — typed APIs for `fileOps`, `ui`, `shell`, `network`, `storage`, `actions`, and 37 more (the 22 host-core namespaces plus the 21 core-plugin namespaces)
- **Permissions** — `PermissionScope`: the 135 canonical permission scopes you can request in `plugin.json`, plus the dynamic `` oauth.${string} `` family for provider-specific OAuth scopes (e.g. `oauth.github`), plus 5 deprecated legacy aliases kept in the type union for compile-time compatibility only — of those, only `network.fetch` is recognized by the host (normalized to `network.outbound`); `network`, `smartFolders`, and `webview` have no host-side entry, and `shell.uncontained` is never declarable (the uncontained shell tier is inferred from `filesystem.readAll`)
- **Colors / Fonts / Icons** — design tokens matching the host app

## Version

Tracks the plugin API version — the package's `major.minor` matches the plugin API's `major.minor` (e.g. `3.0.x` of this package ↔ plugin API `3.0.x`).

## Related packages

- [`@appos.space/view-builders`](https://www.npmjs.com/package/@appos.space/view-builders) — ergonomic `vstack()` / `listItem()` / `section()` helpers for `ViewDescriptor`
- [`@appos.space/plugin-utils`](https://www.npmjs.com/package/@appos.space/plugin-utils) — shared pure utilities (path conversion, formatting, action routing)

## License

MIT © InstantlyEasy
