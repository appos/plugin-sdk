import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { menuAction, menuDivider, encodeMenuActions } from "../menus.js";

describe("menuAction", () => {
  it("produces correct structure with required fields", () => {
    assert.deepStrictEqual(menuAction("Open", { action: "open" }), {
      title: "Open",
      action: "open",
    });
  });

  it("includes all optional properties", () => {
    const result = menuAction("Delete", {
      action: "delete",
      icon: "trash" as any,
      destructive: true,
    });
    assert.deepStrictEqual(result, {
      title: "Delete",
      action: "delete",
      icon: "trash",
      destructive: true,
    });
  });

  it("omits undefined optional properties", () => {
    const result = menuAction("Copy", { action: "copy", icon: undefined as any });
    assert.equal("icon" in result, false);
  });
});

describe("menuDivider", () => {
  it("produces correct structure", () => {
    assert.deepStrictEqual(menuDivider(), { title: "---" });
  });

  it("has only a title key", () => {
    const keys = Object.keys(menuDivider());
    assert.deepStrictEqual(keys, ["title"]);
  });
});

describe("encodeMenuActions", () => {
  it("encodes array to valid JSON string", () => {
    const actions = [
      menuAction("Open", { action: "open" }),
      menuDivider(),
      menuAction("Delete", { action: "delete", destructive: true }),
    ];
    const encoded = encodeMenuActions(actions);
    assert.equal(typeof encoded, "string");

    // Must be valid JSON and parse back to same structure
    const parsed = JSON.parse(encoded);
    assert.deepStrictEqual(parsed, actions);
  });

  it("encodes empty array", () => {
    assert.equal(encodeMenuActions([]), "[]");
  });

  it("produces string usable as listItem menuActions", () => {
    const actions = [menuAction("Run", { action: "run" })];
    const encoded = encodeMenuActions(actions);
    // Ensure it's a string that can be assigned to menuActions
    assert.equal(typeof encoded, "string");
    assert.ok(encoded.startsWith("["));
    assert.ok(encoded.endsWith("]"));
  });
});
