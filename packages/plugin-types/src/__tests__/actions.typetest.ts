/**
 * Compile-time type tests for the fn-89 ActionsAPI exec-context handler
 * signature (`ActionExecutionContext` / `InvocationSource`).
 *
 * This file is NOT executed — it only needs to compile (or fail to compile)
 * to verify type correctness. Lines marked @ts-expect-error MUST produce
 * a type error; if they don't, the build will fail.
 *
 * Imports resolve through the package public entrypoint (`../index`) on
 * purpose: this proves the types are exported from the public surface of
 * `@appos.space/plugin-types`, not merely declared in an internal module.
 */

import type {
  ActionsAPI,
  ActionExecutionContext,
  InvocationSource,
  AnyJSONValue,
} from "../index";

declare const actions: ActionsAPI;

// ── (a) ytdlp's pattern compiles ──
// Mirrors appos-plugin-ytdlp src/actions/register-actions.ts:215-216:
//   async (exec) => { const input = exec.input as DownloadUrlInput; ... }
// with a def carrying `displayName` / `risk` / `tags` extras (admitted by
// ActionDefinition's index signature).
//
// NOTE (probed 2026-07-25, TS 5.9): `SomeShape` here MUST be a `type` alias.
// An `interface` target fails the `exec.input as SomeShape` assertion with
// TS2352, because interfaces get no implicit index signature and therefore
// are not comparable to `AnyJSONValue`'s object arm
// (`{ [key: string]: AnyJSONValue }`). ytdlp's real `DownloadUrlInput` is
// declared as an interface, so its unmodified source still needs either
// `interface` → `type` or `as unknown as` when it adopts this package —
// recorded in fn-176.1's Done summary and flagged to fn-176.3 (release).

type DownloadUrlInput = {
  url: string;
  format?: string;
  quality?: string;
};

void actions.register(
  {
    id: "downloadUrl",
    displayName: "Download URL",
    risk: "external",
    tags: ["yt-dlp", "download", "media"],
    inputSchema: { type: "object" },
  },
  async (exec) => {
    const input = exec.input as DownloadUrlInput;
    const url = input.url.trim();
    const enqueuedIds: string[] = [url];
    return { enqueuedIds };
  },
);

// ── (b) exec-context field reads compile with the right types ──

declare const exec: ActionExecutionContext;

const _invocationId: string = exec.invocationId;
const _source: InvocationSource = exec.source;
const _sourceId: string | undefined = exec.sourceId;
const _input: AnyJSONValue = exec.input;

// ── (c) undeclared property access is a type error (no index signature) ──

// @ts-expect-error `url` is not a declared property of ActionExecutionContext
const _url = exec.url;

// ── (d) handler with an incompatible parameter type is rejected ──

void actions.register(
  { id: "badHandler" },
  // @ts-expect-error a `string` parameter is not compatible with ActionExecutionContext
  (input: string) => input,
);

// ── (e) comparing `source` against a non-member literal is a type error ──

// @ts-expect-error "webhook" is not a member of InvocationSource
const _cmp: boolean = exec.source === "webhook";

// ── (f) legacy-compatibility probe — DROPPED (probed 2026-07-25, TS 5.9) ──
// Epic R5/R10 hoped a legacy-style handler `(input: AnyJSONValue) =>
// AnyJSONValue` would still assign to `register`'s handler parameter via the
// contravariant check (`ActionExecutionContext` assignable to
// `AnyJSONValue`'s object arm). It does NOT: TS2345 — "Index signature for
// type 'string' is missing in type 'ActionExecutionContext'" (interfaces get
// no implicit index signature). Per the task's fallback rule the executable
// case is dropped; outcome recorded in fn-176.1's Done summary and flagged
// to fn-176.3 so the changelog language reads
// "source-breaking-but-runtime-correcting" for explicitly-typed legacy
// handlers. (Untyped legacy handlers `(input) => ...` contextually infer the
// new context parameter, so the registration itself keeps compiling — though
// bodies that read raw-input fields off the parameter will now error until
// switched to `exec.input`. Handlers that explicitly annotated the parameter
// as `AnyJSONValue` fail at the `register` call site.)
