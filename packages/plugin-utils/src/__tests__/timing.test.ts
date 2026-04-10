import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { debounce, throttle } from "../timing.js";

/** Promise-based delay. */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe("debounce", () => {
  it("fires only once after rapid calls", async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn(); fn(); fn(); fn(); fn();
    assert.equal(count, 0, "should not fire immediately");
    await delay(80);
    assert.equal(count, 1, "should fire exactly once");
  });

  it("resets timer on each call", async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn();
    await delay(30);
    fn(); // reset
    await delay(30);
    assert.equal(count, 0, "should not have fired yet");
    await delay(40);
    assert.equal(count, 1, "should fire once after final delay");
  });

  it("passes arguments to the underlying function", async () => {
    let captured: unknown[] = [];
    const fn = debounce((...args: unknown[]) => { captured = args; }, 30);
    fn("a", "b");
    await delay(60);
    assert.deepEqual(captured, ["a", "b"]);
  });
});

describe("throttle", () => {
  it("fires immediately on first call", () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    assert.equal(count, 1);
  });

  it("suppresses rapid calls within interval", async () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 80);
    fn(); // fires immediately
    fn(); // scheduled as trailing
    fn(); // replaces trailing
    assert.equal(count, 1, "only first should fire immediately");
    await delay(120);
    assert.equal(count, 2, "trailing call should fire");
  });

  it("allows new calls after interval expires", async () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 50);
    fn(); // fires immediately
    await delay(80);
    fn(); // should fire immediately (interval elapsed)
    assert.equal(count, 2);
  });

  it("passes arguments to the underlying function", async () => {
    let captured: unknown[] = [];
    const fn = throttle((...args: unknown[]) => { captured = args; }, 50);
    fn("x", "y");
    assert.deepEqual(captured, ["x", "y"]);
  });
});
