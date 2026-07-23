---
title: "Event topics"
description: "The typed event bus — topic declaration, delivery modes, and the host topic catalog."
sidebar:
  order: 2
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

Plugins communicate through the **typed event bus** (fn-70): topics are
declared with a schema, retention policy, and delivery mode, then emitted and
subscribed via `context.events`:

- `declareTopic(spec)` — requires `events.topic.declare`
- `emitTopic(name, payload)` — requires `events.emit`
- `subscribeTopic(name, handler)` — requires `events.subscribe`
- `replay(name, opts)` — requires `events.replay`
- `listTopics()` — requires `events.inspect`

Delivery modes: `atMostOnce`, `atLeastOnce` (retry/backoff/dead-letter),
and `ordered` (partitioned). See `EventsAPI`, `TopicSpec`, and
`EventEnvelope` in the [API Reference](/api/).

Topic naming: public core-plugin topics use the owning plugin's prefix
(e.g. `actions.receipt.written`, `scheduler.job.cancelled`,
`notifications.delivered`). Topics prefixed `_host.*` are host-internal —
third-party plugins cannot subscribe to them.

:::note[TODO — host topic catalog]
The authoritative catalog of core-plugin event topics (300+ topics across the
fn-70 … fn-101 core plugins, with per-topic payload schemas and retention
policies) lives in the AppOS host repo and is **not machine-readable from
this SDK repo yet**. This page will grow a generated topic table once the
host exports its topic registry. Until then, use
`context.events.listTopics()` at runtime to enumerate topics visible to
your plugin.
:::
