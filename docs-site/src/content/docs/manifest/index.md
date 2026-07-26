---
title: Manifest overview
description: The plugin.json manifest — identity, activation, permissions, and dependencies.
sidebar:
  order: 1
---

Every AppOS plugin ships a `plugin.json` manifest at its root. The manifest
declares the plugin's identity, when it activates, which permissions it needs,
and any system or plugin dependencies.

The manifest is validated against the JSON Schema at
[`schemas/plugin-v1.json`](https://github.com/appos/plugin-sdk/blob/main/schemas/plugin-v1.json).
Add a `$schema` reference for editor autocomplete:

```json title="plugin.json"
{
  "$schema": "https://appos.space/schemas/plugin-v1.json",
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "runtime": "javascript",
  "entrypoint": "dist/main.js"
}
```

## Required fields

`id`, `name`, `version`, and `runtime` are always required. Plugins with
`"runtime": "javascript"` (all third-party plugins) must also declare
`entrypoint`. `"core-swift"` is reserved for host-bundled core plugins.

## Key sections

- **[Field reference](/manifest/reference/)** — every manifest field, generated
  from the JSON Schema.
- **[Permission scopes](/manifest/permission-scopes/)** — the full catalog of
  scopes accepted in `permissions`, generated from the SDK's machine-readable
  constraints.
- **[Limits](/manifest/limits/)** — host-enforced runtime quotas (storage,
  shell, network, and more).
- **[Extension points](/extension-points/)** — the `extensions[]` array for
  contributing to core-plugin extension points.

## Catalog bundle layout

A dev tree keeps `plugin.json` at the plugin root — that is what local and
sideload installs load. Bundles published to the AppOS catalog use **AppOS
Catalog Bundle Layout v1**, which carries TWO manifests because the catalog's
submit validation and the desktop installer read different schemas:

- `manifest.json` at the **zip root** — the catalog `manifest-v1` document
  (`schema`, `slug`, `kind`, `version`, `title`, `license`, `capabilities`,
  `permissions`, `compatibility`, `entry`; unknown keys rejected). Validated at
  publish time.
- `appos/runtime/plugin.json` — the AppOS runtime manifest (the schema
  documented on these pages). Read by the desktop app at install time.

```text
space-appos-myplugin-1.0.0.zip
├── manifest.json            # catalog manifest-v1
├── appos/
│   └── runtime/
│       └── plugin.json      # AppOS runtime manifest (this schema)
├── dist/
│   └── main.js              # runtime payload at the zip root
└── webview/  assets/  README.md  LICENSE  ...
```

Rules:

- **Installer resolution is root-first.** A root `plugin.json` always wins;
  otherwise the desktop installer consults the single well-known fallback
  `appos/runtime/plugin.json` and copies it to the bundle root at install time
  ("normalize-at-install"); neither present fails the install with
  `manifestMissing`. There is no globbing — the fallback is one constant path.
- **Verification precedes manifest resolution.** SHA-256 (and, on the catalog
  install path, Ed25519 signature verification) runs over the exact zip bytes
  before extraction — always before any manifest is read.
- **Exactly one catalog-manifest candidate.** Nothing named `plugin.json` or
  `manifest.json` may exist at the zip root or one level deep except the single
  catalog manifest — the submit scan rejects zero candidates (`no_manifest`)
  and more than one (`ambiguous_bundle_root`). Depth 2 keeps the runtime
  manifest invisible to that scan.
- **Runtime-manifest paths are relative to the ZIP ROOT**, not to
  `appos/runtime/` — e.g. `"entrypoint": "dist/main.js"`.
- A dev-layout bundle (root `plugin.json`, no `manifest.json`) installs locally
  but is NOT publishable to the catalog: its root `plugin.json` would be
  selected as the catalog-manifest candidate and fail `manifest-v1` validation
  (`manifest_invalid`).

## Validation

This repo ships a validator you can run locally against any manifest:

```bash
node scripts/validate-schema.mjs path/to/plugin.json
```
