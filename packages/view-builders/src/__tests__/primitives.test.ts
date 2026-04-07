import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { divider, spacer, textField, progress, remoteImage } from "../primitives.js";

describe("divider", () => {
  it("produces correct structure", () => {
    assert.deepStrictEqual(divider(), { type: "divider" });
  });

  it("has no properties or children keys", () => {
    const result = divider();
    assert.equal("properties" in result, false);
    assert.equal("children" in result, false);
  });
});

describe("spacer", () => {
  it("produces minimal structure with no arguments", () => {
    const result = spacer();
    assert.deepStrictEqual(result, { type: "spacer" });
  });

  it("has no properties key when no minLength", () => {
    assert.equal("properties" in spacer(), false);
  });

  it("includes minLength in properties when provided", () => {
    assert.deepStrictEqual(spacer(8), {
      type: "spacer",
      properties: { minLength: 8 },
    });
  });

  it("includes minLength of 0", () => {
    assert.deepStrictEqual(spacer(0), {
      type: "spacer",
      properties: { minLength: 0 },
    });
  });
});

describe("textField", () => {
  it("produces correct minimal structure", () => {
    assert.deepStrictEqual(textField(), {
      type: "textField",
      properties: {},
    });
  });

  it("includes all optional properties", () => {
    const result = textField({ placeholder: "Search...", text: "query", action: "search" });
    assert.deepStrictEqual(result, {
      type: "textField",
      properties: { placeholder: "Search...", text: "query", action: "search" },
    });
  });

  it("omits undefined optional properties", () => {
    const result = textField({ placeholder: "Go", text: undefined });
    assert.equal("text" in result.properties, false);
    assert.equal(result.properties.placeholder, "Go");
  });
});

describe("progress", () => {
  it("produces indeterminate progress with no arguments", () => {
    const result = progress();
    assert.deepStrictEqual(result, { type: "progress" });
  });

  it("has no properties key when indeterminate", () => {
    assert.equal("properties" in progress(), false);
  });

  it("produces determinate progress with value", () => {
    assert.deepStrictEqual(progress({ value: 0.5 }), {
      type: "progress",
      properties: { value: 0.5 },
    });
  });

  it("includes label and style", () => {
    const result = progress({ value: 0.8, label: "Loading", style: "circular" });
    assert.deepStrictEqual(result, {
      type: "progress",
      properties: { value: 0.8, label: "Loading", style: "circular" },
    });
  });
});

describe("remoteImage", () => {
  it("produces correct minimal structure", () => {
    assert.deepStrictEqual(remoteImage("https://x.com/img.png"), {
      type: "remoteImage",
      properties: { url: "https://x.com/img.png" },
    });
  });

  it("includes all dimension options", () => {
    const result = remoteImage("https://x.com/img.png", {
      width: 100,
      height: 200,
      cornerRadius: 8,
      maxDimension: 300,
    });
    assert.deepStrictEqual(result, {
      type: "remoteImage",
      properties: {
        url: "https://x.com/img.png",
        width: 100,
        height: 200,
        cornerRadius: 8,
        maxDimension: 300,
      },
    });
  });

  it("omits undefined optional properties", () => {
    const result = remoteImage("https://x.com/img.png", { width: 100, height: undefined });
    assert.equal("height" in result.properties, false);
    assert.equal(result.properties.width, 100);
  });
});
