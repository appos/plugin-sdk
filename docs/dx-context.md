# Plugin SDK — Review Context

> Progressive disclosure: start here, follow links as needed.

---

## 1. What is this?

An npm workspaces monorepo that extracts the 2Panez/AppOS plugin API into developer-facing packages. Three packages plus schemas:

| Package | Lines | What it does |
|---------|-------|-------------|
| `@appos.space/plugin-types` | 894 | TypeScript `.d.ts` declarations for the full plugin API |
| `@appos.space/view-builders` | 182 | Typed helper functions that produce ViewDescriptor JSON |
| `@appos.space/plugin-utils` | 190 | Shared utilities replacing copy-pasted code across plugins |
| `schemas/` | 216 | JSON Schema for plugin.json + machine-readable constraints |

Total: ~1,500 lines of authored code. No runtime dependencies.

---

## 2. Why does this exist?

A 28KB DX assessment identified 12 limitations in the plugin developer experience. The three P0 items — all addressed here — are:

1. **No shared type imports.** Every plugin copy-pastes its own incomplete `PluginContext` interface. 9 different copies exist across 12 community plugins, each with different subsets of the API. There is no compile-time safety.

2. **ViewDescriptor trees are untyped.** Plugin UI is built from JSON objects with 17 widget types. A typo like `"lisItem"` compiles fine but fails silently at runtime. No autocomplete, no validation.

3. **No JSON Schema for plugin.json.** Manifest validation is prose-only. Editors can't autocomplete. AI agents can't self-validate.

**Full report:** `~/Documents/GitHub/AppOS/community-plugins/PLUGIN-DX-REPORT.md`

---

## 3. The source of truth

Every type in this SDK must match:

```
~/Documents/GitHub/_90-percent-done/2Panes/Bifocal/Sources/TwoPanez/Services/Plugins/plugin-api.d.ts
```

This is a 2,778-line TypeScript definition file (v2.3.0-fn48) that the JavaScriptCore host runtime implements. It defines 22 API namespaces, 33 permission scopes, 17 ViewDescriptor widget types, and all method signatures.

The SDK does NOT vendor this file. It restructures the types into importable modules with stricter typing (discriminated unions, string literal types, template literal types for hex colors and oauth scopes).

---

## 4. Architecture decisions

### Why declaration-only for plugin-types?

Plugin code runs in JavaScriptCore, not Node. The host injects the API at runtime via `PluginContext`. There is no JS module to import — only types. Making plugin-types `.d.ts`-only means zero bundle size impact on plugins, no risk of runtime code leaking into the JSC sandbox, and `/// <reference types="@appos.space/plugin-types" />` is all plugins need.

### Why separate view-builders from plugin-types?

View builders have runtime code (the functions that construct JSON objects). Keeping them separate means plugins that only need types don't pull in helpers, the builders are tree-shakeable (esbuild eliminates unused ones), and the builders can evolve independently.

### Why plugin-utils has no dependency on plugin-types?

Utilities like `urlToPath()` and `formatSize()` are pure functions with no plugin API coupling. Keeping them standalone means they're usable outside the plugin context (build scripts, CLI tools, tests) with no version coupling.

### Why `@appos` not `@twopanez`?

The plugin system's manifest format, permission model, and Plugin Store protocol are platform-level concerns. A future mobile AppOS app would share these. The 2Panez-specific API surface (dual panes, shell tiers, NSStatusItem menubar) is host-level, but the types are currently combined in one package since there's only one host. If a second host emerges, `@appos.space/plugin-types` splits into shared + host-specific.

---

## 5. The plugin runtime model

Understanding the runtime helps evaluate whether the types are correct.

```
┌─────────────────────────────────────────────────────┐
│  2Panez Host App (Swift/SwiftUI)                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  PluginManager                                │   │
│  │  - Loads plugin.json manifests                │   │
│  │  - Creates per-plugin JSContext               │   │
│  │  - Injects PluginContext as JS global          │   │
│  │  - Evaluates dist/main.js (IIFE bundle)       │   │
│  │  - Calls globalThis.activate(context)         │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌───────────────┐  ┌───────────────┐              │
│  │ Plugin A       │  │ Plugin B       │              │
│  │ JSContext       │  │ JSContext       │              │
│  │ Serial Queue    │  │ Serial Queue    │              │
│  │ Own storage     │  │ Own storage     │              │
│  └───────────────┘  └───────────────┘              │
└─────────────────────────────────────────────────────┘
```

Key constraints this imposes on the SDK:

- **No ES module imports at runtime.** Plugins are IIFE bundles. `@appos.space/plugin-types` is compile-time only.
- **No shared state.** Each plugin gets its own JSContext. Inter-plugin communication uses `dataContracts`, `extensionPoints`, and `interPluginEvents` namespaces.
- **Serial execution.** Each plugin's queue is serial. Async methods return Promises that resolve when the host's actor-isolated services complete.
- **No DOM.** UI is ViewDescriptor JSON, not HTML. The exception is WebView panels (fn-48) which get a WKWebView with a bridge API.

---

## 6. What to look for in a review

### Type fidelity

The highest-risk area. Every interface in `packages/plugin-types/src/namespaces.d.ts` must match the method signatures in the source `plugin-api.d.ts`. Drift means plugins compile but fail at runtime. Key areas:

- **Return types:** Some methods return `void`, others return `string` (registration tokens), others return `Promise<T>`. The distinction matters — calling `.then()` on a void return crashes.
- **Optional vs required:** Properties like `WebPanelOptions.icon` are optional in the source. If we mark them required, plugins break.
- **Overloaded semantics:** `ui.registerPanel()` behaves differently with `target: "sidebar"` vs `target: "pane"`. The types should reflect this, or at least not prevent valid usage.

### ViewDescriptor accuracy

The discriminated union in `views.d.ts` should match the host's `ViewDescriptorRenderer.swift`. Each widget type has specific required and optional properties. The host silently ignores unknown properties but crashes on missing required ones. Key questions:

- Does every container type accept `children`?
- Are fn-48 additions (`textField`, `progress`, `remoteImage`, `grid`) correctly typed?
- Is `menuActions` correctly typed as `string` (JSON-encoded), not `MenuAction[]`?

### JSON Schema strictness

The schema at `schemas/plugin-v1.json` uses `additionalProperties: false`. This is intentionally strict — it catches typos in manifest keys. But it means the schema must include every valid field, including `$schema` (self-reference), `shellDeniedPatterns` (fn-46), `menubar` (fn-41), and `oauth` (fn-41). Missing a field means valid plugin manifests fail validation.

### Builder correctness

View builders in `packages/view-builders/` must produce JSON that the host's `ViewDescriptorRenderer` accepts. Key concerns:

- **No undefined keys.** `{ type: "text", properties: { content: "hi", font: undefined } }` may cause issues. Builders should omit unset properties, not set them to `undefined`.
- **Correct nesting.** `section(title, opts, children)` puts title in `properties.title`, not as a top-level key.
- **menuActions encoding.** `encodeMenuActions()` must produce the exact format the host parses — `JSON.stringify` of `MenuAction[]`.

### Utility correctness

`packages/plugin-utils/src/paths.ts` is the highest-risk utility. File URL encoding has historically caused bugs across community plugins. The DX report found at least 3 different implementations with subtle differences (`encodeURIComponent` vs `encodeURI`, double-encoding, missing percent-decode).

---

## 7. File map

### Package: plugin-types

```
packages/plugin-types/src/
├── index.d.ts       — Re-exports all type modules
├── core.d.ts        — PluginContext, PluginManifest, PluginFileDescriptor, SettingDefinition
├── views.d.ts       — ViewDescriptor discriminated union (17 widget types)
├── namespaces.d.ts  — All 22 API namespace interfaces (CommandsAPI, FileOpsAPI, UIAPI, etc.)
├── colors.d.ts      — PluginColor: SystemColor | SemanticColor | DesignTokenColor | HexColor
├── fonts.d.ts       — PluginFont: 11 SwiftUI Font values
├── permissions.d.ts — PermissionScope: 33+ scopes as string literal union
└── icons.d.ts       — SFSymbolName: curated subset with string fallback
```

### Package: view-builders

```
packages/view-builders/src/
├── index.ts         — Re-exports all builder functions
├── containers.ts    — vstack(), hstack(), scroll(), list(), grid(), section()
├── content.ts       — text(), label(), image(), badge(), button(), listItem()
├── primitives.ts    — divider(), spacer(), textField(), progress(), remoteImage()
└── menus.ts         — menuAction(), menuDivider(), encodeMenuActions()
```

### Package: plugin-utils

```
packages/plugin-utils/src/
├── index.ts         — Re-exports all utilities
├── paths.ts         — urlToPath(), pathToUrl(), fileExtension(), isTextFile()
├── format.ts        — formatSize(), formatDate(), truncate()
├── ids.ts           — generateId(), simpleHash()
├── actions.ts       — createActionRouter()
└── timing.ts        — debounce(), throttle()
```

### Schemas

```
schemas/
├── plugin-v1.json       — JSON Schema 2020-12 for plugin.json validation
└── constraints.json     — Machine-readable limits, valid values, build config
```

---

## 8. Cross-repo references

These files in other repos contain relevant context. Read them when the review question touches their domain.

| File | When to read it |
|------|----------------|
| `_90-percent-done/2Panes/Bifocal/.../plugin-api.d.ts` | Any type fidelity question — this is the canonical source (2,778 lines) |
| `AppOS/community-plugins/PLUGIN-DX-REPORT.md` | Understanding *why* a design decision was made — the motivation document |
| `AppOS/community-plugins/plugins/*/plugin.json` | JSON Schema validation — these 12 manifests must all pass |
| `AppOS/appos-plugin-ytdlp/plugin.json` | Integration test target — the flagship plugin that imports from this SDK |
| `AppOS/appos-plugin-ytdlp/src/types.ts` | What inline types look like today — what the SDK replaces |
| `AppOS/appos-claude-code-plugin/.../extension-api.md` | Human-readable API docs — should be consistent with types here |

All paths relative to `~/Documents/GitHub/`.

Full paths for programmatic access:

```
# Source of truth (types must match this)
~/Documents/GitHub/_90-percent-done/2Panes/Bifocal/Sources/TwoPanez/Services/Plugins/plugin-api.d.ts

# DX report (motivation for this repo)
~/Documents/GitHub/AppOS/community-plugins/PLUGIN-DX-REPORT.md

# Community plugin manifests (schema validation targets)
~/Documents/GitHub/AppOS/community-plugins/plugins/ai-code-review/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/bookmarks/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/collection-manager/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/dev-console/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/duplicate-finder/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/git-gutter/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/markdown-workspace/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/quick-notes/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/scaffolder/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/theme-pack/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/word-stats/plugin.json
~/Documents/GitHub/AppOS/community-plugins/plugins/workspace-snapshot/plugin.json

# yt-dlp flagship plugin (integration test target)
~/Documents/GitHub/AppOS/appos-plugin-ytdlp/plugin.json
~/Documents/GitHub/AppOS/appos-plugin-ytdlp/src/types.ts

# Human-readable API docs
~/Documents/GitHub/AppOS/appos-claude-code-plugin/skills/twopanez-plugin-dev/reference/extension-api.md
```

---

## 9. The 22 API namespaces

Quick reference for what each namespace does. The full signatures are in `packages/plugin-types/src/namespaces.d.ts`.

| # | Namespace | Purpose | Key methods | Permission |
|---|-----------|---------|-------------|------------|
| 1 | `commands` | Command registration + palette | `register`, `execute`, `getRegistered` | — |
| 2 | `fileOps` | File system read/write/watch/hooks | `listDirectory`, `copy`, `move`, `delete`, `batch`, `watchDirectory` | `filesystem.*` |
| 3 | `ui` | Panels, tabs, viewers, status bar, context menus, web panels | `registerPanel`, `openInPane`, `registerWebPanel`, `postToWebPanel` | `ui.*` |
| 4 | `storage` | Key-value storage + Keychain | `get`, `set`, `getSecure`, `setSecure` | `keychain.plugin` |
| 5 | `settings` | User-configurable settings from manifest | `get`, `set`, `getAll`, `onChange` | — |
| 6 | `events` | Host application event subscription | `subscribe`, `unsubscribe` | varies |
| 7 | `shell` | Shell command execution (tiered) | `execute` (with optional `onData` streaming) | `shell.execute` |
| 8 | `clipboard` | System clipboard read/write | `read`, `write` | `clipboard.*` |
| 9 | `network` | HTTP fetch + file download | `fetch`, `download` | `network.*` |
| 10 | `shortcuts` | Keyboard shortcut registration | `register`, `unregister`, `getAll` | `ui.shortcuts` |
| 11 | `themes` | Color theme registration | `registerTheme`, `setActiveTheme` | `ui.themes` |
| 12 | `smartFolders` | Custom smart folder filter types | `registerFilterType`, `evaluateFilter` | `filesystem.read` |
| 13 | `preview` | File preview queries + triggering | `canPreview`, `showPreview` | `filesystem.read` |
| 14 | `extensionPoints` | Plugin-to-plugin extension points | `declare`, `contribute`, `discover` | `interPlugin.*` |
| 15 | `dataContracts` | Queryable data exposed to other plugins | `expose`, `query`, `unexpose` | `interPlugin.*` |
| 16 | `interPluginEvents` | Pub/sub event channels between plugins | `declareEvent`, `emit`, `subscribe` | `interPlugin.*` |
| 17 | `lifecycle` | Dependency availability notifications | `onDependencyAvailable`, `onDependencyUnavailable` | — |
| 18 | `workspaces` | Workspace template management (fn-40) | `register`, `apply`, `list`, `getActive` | `workspaces` |
| 19 | `cache` | Hybrid memory + SQLite cache (fn-41) | `get`, `set`, `remove`, `clear`, `has`, `keys` | `cache` |
| 20 | `feedback` | Toast, HUD, alert, notifications (fn-41) | `toast`, `hud`, `alert`, `systemNotification` | `feedback` |
| 21 | `oauth` | OAuth 2.0 + PKCE authorization (fn-41) | `authorize`, `getToken`, `revoke` | `oauth` |
| 22 | `menubar` | NSStatusItem management (fn-41) | `register`, `setBadge`, `setContent` | `menubar` |

---

## 10. Recent API additions (fn-40 through fn-48)

These are the newest parts of the API and the most likely to have type drift. The SDK must cover all of them.

### fn-40: Workspaces
Plugin-registered workspace templates. Ephemeral (only exist while plugin is loaded). `workspaces.register()` accepts a layout descriptor with left/right pane tab configurations.

### fn-41: Cache, Feedback, OAuth, Menubar
Four new namespaces added in a single batch. Cache is hybrid memory + SQLite with TTL and persistence options. Feedback provides toast/HUD/alert/system notification with adaptive routing. OAuth is PKCE-only with Keychain token storage and background refresh. Menubar is one NSStatusItem per plugin with popover rendering.

### fn-46: Shell Tiers
Replaced binary shell permission with T0 (none) / T1 (contained, CWD restricted to pane roots) / T2 (uncontained). Tier is inferred from permissions, not declared. Added `shellDeniedPatterns` manifest field. New `shell.uncontained` permission scope.

### fn-47: Streaming Shell Output
Added `onData` callback to `shell.execute()` options. `ShellDataChunk` interface: `{ stream: "stdout" | "stderr", data: string, bytesTotal: number }`. The callback fires as data arrives; the final result still contains full stdout/stderr.

### fn-48: WebView Panels
WKWebView instances embedded in pane tabs. 5 new methods on the `ui` namespace: `registerWebPanel`, `postToWebPanel`, `onWebPanelMessage`, `onWebPanelRequest`, `pipeShellToWebPanel`. Bidirectional message bridge via `window.twopanez`. 16 CSS custom properties injected for theme matching. Limit: 2 panels per plugin, 6 global. Also added 4 new ViewDescriptor widget types: `textField`, `progress`, `remoteImage`, `grid`.

---

## 11. Known gaps and open questions

These are things a reviewer should flag opinions on:

1. **`namespaces.d.ts` completeness.** This was authored from the source .d.ts but not mechanically diffed. Some method signatures may have subtle mismatches (optional parameter marked required, `Promise<void>` that should be `Promise<true>`). A line-by-line diff against the source would be the most valuable review artifact.

2. **`icons.d.ts` coverage.** The curated SF Symbol list (~40 icons) provides autocomplete but the `(string & {})` fallback allows any string. Should this be stricter? The trade-off is autocomplete quality vs flexibility.

3. **ViewDescriptor property exhaustiveness.** The per-widget interfaces were authored from the extension-api.md documentation. The host's `ViewDescriptorRenderer.swift` may accept additional undocumented properties. Should the interfaces use `[key: string]: unknown` as an escape hatch, or stay strict?

4. **`plugin-utils` scope.** Includes `createActionRouter` (DX report item 7) and `debounce/throttle` beyond the 8 duplicated helpers. Is the action router too opinionated for a utils package, or does it belong here?

5. **Schema `additionalProperties: false`.** Catches typos but requires schema updates for every new manifest field. Right trade-off, or should it be `true` with specific field validation only?

6. **No tests yet.** Tasks 14-17 cover tests. The scaffold is code-complete but unverified. A reviewer should flag any obvious bugs visible from reading the implementations, especially in `paths.ts` encoding logic and `format.ts` date math.

7. **`workspace:*` dependency links.** The monorepo uses `"@appos.space/plugin-types": "workspace:*"` in view-builders' package.json. This works in npm workspaces but may need adjustment for consumers who install from a registry vs file path.

---

## 12. Dependency graph

```
                    ┌─────────────────────┐
                    │  @appos.space/plugin-types │  (declaration-only)
                    └──────────┬──────────┘
                               │ types only
                    ┌──────────▼──────────┐
                    │ @appos.space/view-builders │  (runtime: builder fns)
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │  @appos.space/plugin-utils │  (standalone, no deps)
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │  schemas/            │  (JSON files, no deps)
                    └─────────────────────┘
```

A plugin's typical dependency graph:

```
my-plugin
├── @appos.space/plugin-types     (devDependency — types only)
├── @appos.space/view-builders    (dependency — runtime helpers)
└── @appos.space/plugin-utils     (dependency — runtime utilities)
```

All three are tree-shakeable. A minimal plugin that only uses `text()` and `urlToPath()` should see near-zero bundle size increase after esbuild dead-code elimination.
