import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { text, label, image, badge, button, listItem } from "../content.js";

describe("text", () => {
  it("produces correct minimal structure", () => {
    assert.deepStrictEqual(text("hello"), {
      type: "text",
      properties: { content: "hello" },
    });
  });

  it("includes all optional properties when provided", () => {
    const result = text("hi", { font: "headline" as any, mono: true, align: "center", width: 200, tooltip: "tip" });
    assert.deepStrictEqual(result, {
      type: "text",
      properties: { content: "hi", font: "headline", mono: true, align: "center", width: 200, tooltip: "tip" },
    });
  });

  it("omits undefined optional properties", () => {
    const result = text("x", { font: undefined as any });
    assert.equal("font" in result.properties, false);
    assert.equal(result.properties.content, "x");
  });
});

describe("label", () => {
  it("produces correct minimal structure", () => {
    assert.deepStrictEqual(label("Files"), {
      type: "label",
      properties: { title: "Files" },
    });
  });

  it("includes icon and font", () => {
    const result = label("Files", { icon: "folder" as any, font: "subheadline" as any });
    assert.equal(result.properties.icon, "folder");
    assert.equal(result.properties.font, "subheadline");
  });
});

describe("image", () => {
  it("produces correct structure", () => {
    assert.deepStrictEqual(image("doc" as any), {
      type: "image",
      properties: { systemName: "doc" },
    });
  });

  it("always has properties key", () => {
    assert.equal("properties" in image("star" as any), true);
  });
});

describe("badge", () => {
  it("produces correct minimal structure", () => {
    assert.deepStrictEqual(badge("3"), {
      type: "badge",
      properties: { text: "3" },
    });
  });

  it("includes color in properties", () => {
    const result = badge("3", { color: "systemRed" as any });
    assert.deepStrictEqual(result, {
      type: "badge",
      properties: { text: "3", color: "systemRed" },
    });
  });

  it("omits undefined color", () => {
    const result = badge("5", { color: undefined as any });
    assert.equal("color" in result.properties, false);
  });
});

describe("button", () => {
  it("produces correct structure with required action", () => {
    assert.deepStrictEqual(button("Go", { action: "run" }), {
      type: "button",
      properties: { title: "Go", action: "run" },
    });
  });

  it("includes optional tooltip and width", () => {
    const result = button("Save", { action: "save", tooltip: "Save file", width: 100 });
    assert.deepStrictEqual(result, {
      type: "button",
      properties: { title: "Save", action: "save", tooltip: "Save file", width: 100 },
    });
  });

  it("omits undefined optional properties", () => {
    const result = button("X", { action: "x", tooltip: undefined });
    assert.equal("tooltip" in result.properties, false);
  });
});

describe("listItem", () => {
  it("produces correct minimal structure", () => {
    const result = listItem("file.ts");
    assert.deepStrictEqual(result, {
      type: "listItem",
      properties: { title: "file.ts" },
    });
  });

  it("includes all options", () => {
    const result = listItem("file.ts", {
      icon: "doc" as any,
      subtitle: "TypeScript",
      iconColor: "systemBlue" as any,
      action: "open",
      trailing: "2KB",
      menuActions: "[]",
    });
    assert.equal(result.properties.icon, "doc");
    assert.equal(result.properties.subtitle, "TypeScript");
    assert.equal(result.properties.menuActions, "[]");
  });

  it("includes children when provided", () => {
    const trailing = { type: "text" as const, properties: { content: "trailing" } };
    const result = listItem("file.ts", {}, [trailing as any]);
    assert.deepStrictEqual(result.children, [trailing]);
  });

  it("omits children key when not provided", () => {
    const result = listItem("file.ts");
    assert.equal("children" in result, false);
  });

  it("does not include undefined values in JSON output", () => {
    const result = listItem("x", { subtitle: undefined });
    const json = JSON.stringify(result);
    assert.equal(json.includes("undefined"), false);
    assert.equal("subtitle" in result.properties, false);
  });
});
