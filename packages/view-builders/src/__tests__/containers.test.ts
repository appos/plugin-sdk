import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { vstack, hstack, scroll, list, grid, section } from "../containers.js";
import { text } from "../content.js";

describe("vstack", () => {
  it("produces correct structure with empty children", () => {
    assert.deepStrictEqual(vstack([]), { type: "vstack", children: [] });
  });

  it("includes spacing in properties when provided", () => {
    const child = text("hi");
    const result = vstack([child], { spacing: 8 });
    assert.deepStrictEqual(result, {
      type: "vstack",
      children: [child],
      properties: { spacing: 8 },
    });
  });

  it("omits properties key when opts not provided", () => {
    const result = vstack([text("a")]);
    assert.equal("properties" in result, false);
  });
});

describe("hstack", () => {
  it("produces correct structure with empty children", () => {
    assert.deepStrictEqual(hstack([]), { type: "hstack", children: [] });
  });

  it("includes spacing in properties when provided", () => {
    const result = hstack([text("a")], { spacing: 4 });
    assert.equal(result.properties!.spacing, 4);
  });

  it("omits properties key when no opts", () => {
    assert.equal("properties" in hstack([]), false);
  });
});

describe("scroll", () => {
  it("produces correct structure with empty children", () => {
    assert.deepStrictEqual(scroll([]), { type: "scroll", children: [] });
  });

  it("includes axes property", () => {
    const result = scroll([], { axes: "horizontal" });
    assert.deepStrictEqual(result, {
      type: "scroll",
      children: [],
      properties: { axes: "horizontal" },
    });
  });
});

describe("list", () => {
  it("produces correct structure with empty children", () => {
    assert.deepStrictEqual(list([]), { type: "list", children: [] });
  });

  it("includes children", () => {
    const child = text("item");
    assert.deepStrictEqual(list([child]), { type: "list", children: [child] });
  });
});

describe("grid", () => {
  it("produces correct structure with empty children", () => {
    assert.deepStrictEqual(grid([]), { type: "grid", children: [] });
  });

  it("includes columns property", () => {
    const result = grid([], { columns: 3 });
    assert.deepStrictEqual(result, {
      type: "grid",
      children: [],
      properties: { columns: 3 },
    });
  });

  it("includes both columns and spacing", () => {
    const result = grid([], { columns: 2, spacing: 4 });
    assert.deepStrictEqual(result.properties, { columns: 2, spacing: 4 });
  });
});

describe("section", () => {
  it("produces correct structure with title only", () => {
    assert.deepStrictEqual(section("Title"), {
      type: "section",
      children: [],
      properties: { title: "Title" },
    });
  });

  it("includes icon and children", () => {
    const child = text("x");
    const result = section("Title", { icon: "doc" as any }, [child]);
    assert.deepStrictEqual(result, {
      type: "section",
      children: [child],
      properties: { title: "Title", icon: "doc" },
    });
  });

  it("includes badge and isExpanded", () => {
    const result = section("S", { badge: "3", isExpanded: true });
    assert.equal(result.properties.badge, "3");
    assert.equal(result.properties.isExpanded, true);
  });

  it("does not include undefined optional properties", () => {
    const result = section("T", { icon: undefined as any });
    const json = JSON.stringify(result);
    assert.equal(json.includes("undefined"), false);
    assert.equal("icon" in result.properties, false);
  });
});
