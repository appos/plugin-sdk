import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateId, simpleHash } from "../ids.js";

describe("generateId", () => {
  it("returns an 8-character hex string", () => {
    const id = generateId();
    assert.equal(id.length, 8);
    assert.match(id, /^[0-9a-f]{8}$/);
  });

  it("produces unique values across calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    assert.equal(ids.size, 100, "100 IDs should all be unique");
  });

  it("always returns lowercase hex", () => {
    for (let i = 0; i < 20; i++) {
      const id = generateId();
      assert.equal(id, id.toLowerCase());
    }
  });
});

describe("simpleHash", () => {
  it("is deterministic (same input, same output)", () => {
    assert.equal(simpleHash("hello"), simpleHash("hello"));
  });

  it("produces different outputs for different inputs", () => {
    assert.notEqual(simpleHash("hello"), simpleHash("world"));
  });

  it("returns a hex string", () => {
    assert.match(simpleHash("test"), /^[0-9a-f]+$/);
  });

  it("handles empty string", () => {
    const hash = simpleHash("");
    assert.match(hash, /^[0-9a-f]+$/);
    assert.equal(simpleHash(""), simpleHash(""));
  });

  it("handles special characters", () => {
    const hash = simpleHash("!@#$%^&*()");
    assert.match(hash, /^[0-9a-f]+$/);
  });
});
