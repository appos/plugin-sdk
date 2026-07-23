---
title: "API namespaces"
description: "Every context.* namespace on PluginContext, mapped to its typed interface."
sidebar:
  order: 1
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

The `context` object passed to `activate(context)` exposes **43 API
namespaces**. Each maps to a typed interface documented in the generated
[API Reference](/api/) (source of truth:
[`packages/plugin-types`](https://github.com/appos/plugin-sdk/tree/main/packages/plugin-types)).

Bracketed notes in each interface's method docs name the
[permission scope](/manifest/permission-scopes/) required for that call.

## Legacy tier

Namespaces available since the pre-fn-70 plugin runtime.

| Namespace | Interface | Description |
|-----------|-----------|-------------|
| `context.lifecycle` | `LifecycleAPI` | Lifecycle hooks (dependency notifications). |
| `context.commands` | `CommandsAPI` | Command registration and execution. |
| `context.fileOps` | `FileOpsAPI` | File system operations. |
| `context.ui` | `UIAPI` | UI contribution methods. |
| `context.storage` | `StorageAPI` | Scoped key-value storage. |
| `context.settings` | `SettingsAPI` | Plugin settings from manifest. |
| `context.extensionPoints` | `ExtensionPointsAPI` | Extension point declaration and contribution. |
| `context.dataContracts` | `DataContractsAPI` | Data contract exposure and querying. |
| `context.interPluginEvents` | `InterPluginEventsAPI` | Inter-plugin event channels. |
| `context.smartFolders` | `SmartFoldersAPI` | Smart folder filter type registration and evaluation. |
| `context.preview` | `PreviewAPI` | File preview registry queries and programmatic preview triggering. |
| `context.events` | `EventsAPI` | Host event subscriptions. |
| `context.network` | `NetworkAPI` | Network fetch and download. Requires `network.outbound` or `network.unrestricted`. |
| `context.shell` | `ShellAPI` | Shell command execution. Requires `shell.execute`. |
| `context.clipboard` | `ClipboardAPI` | System clipboard read/write. Requires `clipboard.read` / `clipboard.write`. |
| `context.shortcuts` | `ShortcutsAPI` | Keyboard shortcut registration. Requires `ui.shortcuts`. |
| `context.themes` | `ThemesAPI` | Theme registration and activation. Requires `ui.themes` for mutations. |
| `context.workspaces` | `WorkspacesAPI` | Workspace template management (fn-40). Requires `workspaces`. |
| `context.cache` | `CacheAPI` | Plugin cache with memory + disk tiers and TTL (fn-41). Requires `cache`. |
| `context.feedback` | `FeedbackAPI` | Toast, HUD, confirmation, and progress feedback (fn-41). Requires `feedback`. |
| `context.oauth` | `OAuthAPI` | OAuth 2.0 + PKCE authorization (fn-41). Requires `oauth`. |
| `context.menubar` | `MenubarAPI` | Menu bar NSStatusItem management (fn-41). Requires `menubar`. |

## Core-plugin tier (fn-70 … fn-101)

Namespaces backed by AppOS core plugins.

| Namespace | Interface | Description |
|-----------|-----------|-------------|
| `context.store` | `StoreAPI` | Durable Promise-shaped document/KV store (fn-71). Requires `store.*`. |
| `context.vault` | `VaultAPI` | Credential vault (fn-72). Requires `vault.*`. |
| `context.actions` | `ActionsAPI` | Public Action Fabric (fn-89). Requires `actions.*`. |
| `context.palette` | `PaletteAPI` | Command palette integration for public actions (fn-89). |
| `context.scheduler` | `SchedulerAPI` | Job scheduling engine (fn-90). Requires `scheduler.job.own`. |
| `context.resources` | `ResourcesAPI` | URI-addressable resource read plane (fn-92). Requires `resources.*`. |
| `context.tokens` | `TokensAPI` | Dotted-path token providers + template resolution (fn-92). |
| `context.bundles` | `BundlesAPI` | ContextBundle composition (fn-92). Requires `context.compose`. NOTE: distinct from `clipboard.bundles` (fn-91). |
| `context.entities` | `EntitiesAPI` | Entity resolution plane (fn-93). Requires `entities.*`. |
| `context.fields` | `FieldsAPI` | Plugin-attached entity fields (fn-93). Requires `entities.*`. |
| `context.ledger` | `LedgerAPI` | Execution / approval ledger reads (fn-94). Requires `ledger.read.*`. |
| `context.views` | `ViewsAPI` | Host-rendered Saved Views (fn-95). Requires `views.*`. |
| `context.surfaces` | `SurfacesAPI` | Surface contributions (fn-95). Runtime methods reject in v1 — use manifest `extensions[]`. |
| `context.protocols` | `ProtocolsAPI` | Protocol sidecar subprocesses (fn-96). Requires `sidecars.*`. |
| `context.notifications` | `NotificationsAPI` | Outbound notifications (fn-97). Requires `notifications.*`. |
| `context.input` | `InputAPI` | Inbound input channels (fn-98). Requires `input.*`. |
| `context.webhook` | `WebhookAPI` | Bidirectional webhook gateway (fn-99/fn-118). Requires `webhook.*`. |
| `context.llm` | `LLMAPI` | LLM provider verbs + contributor registries (fn-100). Requires `llm.*`. |
| `context.recipes` | `RecipesAPI` | Recipe definitions + runs (fn-101). Requires `recipes.*`. |
| `context.sequences` | `SequencesAPI` | Sequence definitions + runs (fn-101). Requires `sequences.*`. |
| `context.fileSystem` | `FileSystemAPI` | Filesystem/transfer-strategy provider stub — core-swift only; throws for JS plugins. |
