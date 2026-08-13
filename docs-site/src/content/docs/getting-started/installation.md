---
title: Installation
description: Install the AppOS Plugin SDK packages and set up a plugin project.
sidebar:
  order: 1
---

The SDK is published as three npm packages:

| Package | Purpose | Runtime |
|---------|---------|---------|
| `@appos.space/plugin-types` | TypeScript definitions for the full Plugin API (43 namespaces, 135 canonical permission scopes). | declaration-only |
| `@appos.space/view-builders` | Typed builders for `ViewDescriptor` — `vstack()`, `section()`, `listItem()`, etc. | plain object literals (tree-shakeable) |
| `@appos.space/plugin-utils` | Pure utility functions — path conversion, formatting, action routing, debounce. | pure functions |

## Install

```bash
npm install --save-dev @appos.space/plugin-types esbuild
npm install @appos.space/view-builders @appos.space/plugin-utils
```

`plugin-types` is declaration-only (zero runtime, zero bundle impact) and
esbuild is only needed at build time, so both belong in `devDependencies`. The
other two packages ship tiny pure functions that esbuild tree-shakes into your
bundle.

## Build constraints

AppOS plugins are bundled JavaScript executed in the host's JavaScriptCore
runtime. The host expects:

- **Format**: IIFE bundle targeting ES2020 (`esbuild --format=iife --target=es2020`)
- **Entrypoint**: `dist/main.js` (declared as `entrypoint` in `plugin.json`)
- **No external runtime dependencies** — everything must be bundled
- **Exports**: your bundle must define both `globalThis.activate` and
  `globalThis.deactivate` — a no-op `deactivate` is fine if you have nothing to
  clean up. (The host currently tolerates a missing `deactivate` at runtime, but
  the published contract in `schemas/constraints.json` lists both under
  `requiredExports`, and validation tooling built on it will flag a bundle that
  omits one — see [Limits & constraints](/manifest/limits/).)

A minimal build script:

```bash
npx esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=dist/main.js
```

`npx` runs the esbuild binary installed above. Inside a `package.json`
`"scripts"` entry (e.g. `"build": "esbuild src/main.ts ..."`), the prefix is
unnecessary — npm puts `node_modules/.bin` on the PATH for you.

## TypeScript setup

Import the types you need:

```ts
import type { PluginContext, ViewDescriptor } from "@appos.space/plugin-types";
```

The main entry exposes module exports only — importing it declares nothing
global, so these types are always imported by name. `import type` is erased at
compile time, so this adds nothing to your bundle.

### Opt-in globals subpath

There is ONE opt-in exception: `@appos.space/plugin-types/globals` declares
the host-injected `URL` global (a Foundation-bridged constructor, targeted
for host 1.1.0 — typed `URLConstructor | undefined`, so ALWAYS guard before
use: older hosts, menu-bar contexts, and a user kill switch can each leave
it undefined regardless of `minHostVersion`). It applies only to
compilations that reference it. Opt in from your plugin entry file:

```ts
/// <reference types="@appos.space/plugin-types/globals" />

if (typeof URL === "function" && URL.canParse(raw)) {
  const host = new URL(raw).hostname;
}
```

(or add `"types": ["@appos.space/plugin-types/globals"]` to your tsconfig's
`compilerOptions`.)

Only reference the subpath from plugin-runtime (JavaScriptCore) tsconfigs,
and that tsconfig MUST use a DOM-free `lib` (e.g. `"lib": ["ES2020"]`).
Never reference it from webview code compiled against `lib.dom` — the
browser already has its own `URL`. Don't count on the compiler to catch
that mistake: the two declarations do conflict, but with `skipLibCheck`
enabled (the default in most scaffolds, including `tsc --init`) TypeScript
suppresses declaration-file conflicts and silently merges the interfaces
instead — browser-only members like `searchParams`, mutable accessors, and
unguarded `new URL(...)` can then type-check even though the JSC runtime
has the narrower optional contract. The DOM-free `lib` is the only
reliable isolation. The subpath's docblock documents the runtime's
Foundation-vs-WHATWG divergences and the v1 subset (`url.searchParams` is
absent and throws at runtime — parse `url.search` manually).

Next: [write your first plugin](/getting-started/first-plugin/).
