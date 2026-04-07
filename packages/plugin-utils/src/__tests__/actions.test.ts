import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createActionRouter } from "../actions.js";

describe("createActionRouter", () => {
  it("routes prefix:arg actions to correct handler", () => {
    const calls: string[] = [];
    const router = createActionRouter({
      open: (arg) => { calls.push(`open:${arg}`); },
    });
    router("open:/path/file.txt");
    assert.deepEqual(calls, ["open:/path/file.txt"]);
  });

  it("splits only on first separator occurrence", () => {
    const calls: string[] = [];
    const router = createActionRouter({
      open: (arg) => { calls.push(arg); },
    });
    router("open:file:///readme.md");
    assert.deepEqual(calls, ["file:///readme.md"]);
  });

  it("handles no-separator actions", () => {
    const calls: string[] = [];
    const router = createActionRouter({
      toggle: (arg) => { calls.push(`toggle[${arg}]`); },
    });
    router("toggle");
    assert.deepEqual(calls, ["toggle[]"]);
  });

  it("calls fallback for unmatched actions", () => {
    const fallbackCalls: string[] = [];
    const router = createActionRouter(
      { open: () => {} },
      { fallback: (a) => { fallbackCalls.push(a); } },
    );
    router("unknown:foo");
    assert.deepEqual(fallbackCalls, ["unknown:foo"]);
  });

  it("uses default fallback (console.warn) for unmatched actions", () => {
    const router = createActionRouter({ open: () => {} });
    // Should not throw
    router("nope:bar");
  });

  it("supports async handlers", async () => {
    let resolved = false;
    const router = createActionRouter({
      save: async () => { resolved = true; },
    });
    await router("save:data");
    assert.equal(resolved, true);
  });

  it("supports custom separator", () => {
    const calls: string[] = [];
    const router = createActionRouter(
      { cmd: (arg) => { calls.push(arg); } },
      { separator: "|" },
    );
    router("cmd|hello:world");
    assert.deepEqual(calls, ["hello:world"]);
  });

  it("calls fallback for no-separator unmatched action", () => {
    const fallbackCalls: string[] = [];
    const router = createActionRouter(
      { known: () => {} },
      { fallback: (a) => { fallbackCalls.push(a); } },
    );
    router("unknown");
    assert.deepEqual(fallbackCalls, ["unknown"]);
  });
});
