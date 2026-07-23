---
title: "Permission scopes"
description: "The full catalog of permission scopes accepted in plugin.json."
sidebar:
  order: 3
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

Generated from
[`packages/plugin-types/src/permissions.ts`](https://github.com/appos/plugin-sdk/blob/main/packages/plugin-types/src/permissions.ts)
and
[`schemas/constraints.json`](https://github.com/appos/plugin-sdk/blob/main/schemas/constraints.json).
The host-side ground truth is `PermissionScope.allKnown` in the AppOS host repo.

**135 canonical scopes** are recognized, plus the dynamic
`oauth.<provider>` family and 5 legacy aliases.

## Canonical scopes

### UI

- `ui.sidebar`
- `ui.statusBar`
- `ui.toolbar`
- `ui.contextMenu`
- `ui.notifications`
- `ui.sheets`
- `ui.shortcuts`
- `ui.themes`
- `ui.preview`
- `ui.aiChat`
- `ui.webPanel`
- `ui.settings`

### Filesystem

- `filesystem.read`
- `filesystem.write`
- `filesystem.watch`
- `filesystem.readAll`
- `filesystem.writeAll`

### Shell

- `shell.execute`

### Clipboard (plain pasteboard)

- `clipboard.read`
- `clipboard.write`

### Clipboard — fn-91 Core Clipboard

- `clipboard.history.read`
- `clipboard.history.subscribe`
- `clipboard.history.write`
- `clipboard.bundles`
- `clipboard.contentType.register`
- `clipboard.source.register`
- `clipboard.transform.register`
- `clipboard.destination.register`
- `clipboard.rule.register`
- `clipboard.retention.predicate.register`

### Network

- `network.outbound`
- `network.unrestricted`

### Keychain

- `keychain.plugin`

### Inter-plugin (legacy broker)

- `interPlugin.declare`
- `interPlugin.contribute`
- `interPlugin.query`
- `interPlugin.emit`

### Feature namespaces

- `workspaces`
- `cache`
- `feedback`
- `feedback.confirm`
- `oauth`
- `menubar`
- `menubar.globalShortcut`

### Typed event bus — fn-70

- `events.topic.declare`
- `events.emit`
- `events.subscribe`
- `events.replay`
- `events.inspect`
- `events.serializer.register`
- `events.sink.register`

### Store — fn-71

- `store.namespace.own`
- `store.namespace.declare`
- `store.namespace.shared.read`
- `store.namespace.enumerate`
- `store.backend.register`
- `store.migrator.register`
- `store.indexer.register`

### Vault — fn-72

- `vault.store`
- `vault.read`
- `vault.list`
- `vault.share`
- `vault.audit`
- `vault.type.register`
- `vault.bridge.register`
- `vault.rotator.register`
- `vault.policy.contribute`

### Public Action Fabric — fn-89

- `actions.register`
- `actions.invoke`
- `actions.invoke.agent`
- `actions.list`
- `palette.contribute.scope`
- `palette.history`

### Scheduler — fn-90

- `scheduler.job.own`
- `scheduler.job.enumerate`
- `scheduler.trigger.register`
- `scheduler.condition.register`
- `scheduler.action.register`

### Context / Resource / Token Graph — fn-92

- `resources.provider.register`
- `resources.read`
- `resources.watch`
- `tokens.provider.register`
- `context.compose`

### Entity / Field Registry — fn-93

- `entities.type.register`
- `entities.read`
- `entities.write`
- `entities.field.attach.own`
- `entities.field.attach.shared`
- `entities.computedField.provide`

### Execution / Approval Ledger — fn-94

- `ledger.read.own`
- `ledger.read.shared`

### Views / Surfaces — fn-95

- `views.register`
- `views.read`
- `views.layoutRenderer.register`
- `surfaces.contribute.sidebar.top`
- `surfaces.contribute.sidebar.bottom`
- `surfaces.contribute.pane.dashboard`
- `surfaces.contribute.status.left`

### Protocol Sidecars — fn-96

- `sidecars.definition.register`
- `sidecars.instance.start`
- `sidecars.instance.stop`
- `sidecars.protocol.wrap`

### Notifications (outbound) — fn-97

- `notifications.emit`
- `notifications.channel.register`
- `notifications.filter.register`
- `notifications.action.register`
- `notifications.log.read`

### Input Channels (inbound) — fn-98

- `input.subscribe.messages`
- `input.subscribe.intents`
- `input.reply`
- `input.channel.register`
- `input.parser.register`
- `input.intent.register`
- `input.auth.register`

### Webhook Gateway — fn-99 (+ webhook.tunnel.read from fn-118)

- `webhook.route.register`
- `webhook.route.register.unsigned`
- `webhook.outbound.send`
- `webhook.log.read`
- `webhook.tunnel.read`
- `webhook.tunnel.register`
- `webhook.signer.register`

### LLM Provider — fn-100

- `llm.complete`
- `llm.stream`
- `llm.embed`
- `llm.vision`
- `llm.agent`
- `llm.ledger.read`
- `llm.provider.register`
- `llm.preprocessor.register`
- `llm.postprocessor.register`
- `llm.router.register`

### Recipes / Sequences — fn-101

- `recipes.register`
- `recipes.run`
- `sequences.register`
- `sequences.run`

## Dynamic scope families

- `oauth.*` — Dynamic OAuth provider scopes (e.g., oauth.github, oauth.google) (pattern: `^oauth\.[A-Za-z0-9._-]+$`)

Declared in the TypeScript union as: `oauth.${string}`

## Legacy aliases (deprecated)

Accepted for backward compatibility but **not** part of the host's canonical
set. New plugins should use canonical scopes only.

- `network`
- `network.fetch`
- `shell.uncontained`
- `smartFolders`
- `webview`

Notes from the type definitions:

- `network.fetch` is normalized to `network.outbound` at manifest parse time.
- `network`, `smartFolders`, and `webview` are historical SDK-only names
  with no host-side entry.
- `shell.uncontained` is **not** a declarable scope — the uncontained shell
  tier is inferred from `filesystem.readAll`, never declared.
