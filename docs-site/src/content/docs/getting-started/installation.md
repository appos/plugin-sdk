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
npm install --save-dev @appos.space/plugin-types
npm install @appos.space/view-builders @appos.space/plugin-utils
```

`plugin-types` is declaration-only (zero runtime, zero bundle impact), so it
belongs in `devDependencies`. The other two ship tiny pure functions that
esbuild tree-shakes into your bundle.

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
esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=dist/main.js
```

## TypeScript setup

Reference the types globally:

```ts
/// <reference types="@appos.space/plugin-types" />
```

Or import what you need:

```ts
import type { PluginContext, ViewDescriptor } from "@appos.space/plugin-types";
```

Next: [write your first plugin](/getting-started/first-plugin/).
