import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { urlToPath, pathToUrl, fileExtension, isTextFile } from "../paths.js";

describe("urlToPath", () => {
  it("converts standard file URL to path", () => {
    assert.equal(urlToPath("file:///Users/foo/bar.txt"), "/Users/foo/bar.txt");
  });

  it("returns non-file-URL strings unchanged", () => {
    assert.equal(urlToPath("/already/a/path"), "/already/a/path");
  });

  it("decodes percent-encoded spaces", () => {
    assert.equal(urlToPath("file:///Users/foo/my%20file.txt"), "/Users/foo/my file.txt");
  });

  it("decodes percent-encoded special characters", () => {
    assert.equal(urlToPath("file:///tmp/%E4%B8%AD%E6%96%87.txt"), "/tmp/\u4E2D\u6587.txt");
  });

  it("strips query string before decoding", () => {
    assert.equal(urlToPath("file:///path/file.txt?v=2"), "/path/file.txt");
  });

  it("strips fragment before decoding", () => {
    assert.equal(urlToPath("file:///path/file.txt#section"), "/path/file.txt");
  });

  it("handles file://localhost/path authority form", () => {
    assert.equal(urlToPath("file://localhost/Users/foo"), "/Users/foo");
  });

  it("handles file://host with no trailing slash", () => {
    assert.equal(urlToPath("file://host"), "/");
  });
});

describe("pathToUrl", () => {
  it("converts standard path to file URL", () => {
    assert.equal(pathToUrl("/Users/foo/bar.txt"), "file:///Users/foo/bar.txt");
  });

  it("returns already-encoded file URLs unchanged", () => {
    assert.equal(pathToUrl("file:///already/url"), "file:///already/url");
  });

  it("encodes spaces in path", () => {
    assert.equal(pathToUrl("/Users/foo/my file.txt"), "file:///Users/foo/my%20file.txt");
  });

  it("encodes special characters", () => {
    const url = pathToUrl("/tmp/\u4E2D\u6587.txt");
    assert.equal(url, "file:///tmp/%E4%B8%AD%E6%96%87.txt");
  });
});

describe("fileExtension", () => {
  it("extracts .md extension", () => {
    assert.equal(fileExtension("/path/readme.md"), "md");
  });

  it("extracts compound extension (returns last part)", () => {
    assert.equal(fileExtension("/path/archive.tar.gz"), "gz");
  });

  it("returns null for dotfiles", () => {
    assert.equal(fileExtension("/path/.gitignore"), null);
  });

  it("returns null for no extension", () => {
    assert.equal(fileExtension("/path/Makefile"), null);
  });

  it("strips query string from URLs", () => {
    assert.equal(fileExtension("https://example.com/file.js?v=1"), "js");
  });

  it("strips fragment from URLs", () => {
    assert.equal(fileExtension("https://example.com/file.css#hash"), "css");
  });

  it("lowercases the extension", () => {
    assert.equal(fileExtension("/path/IMAGE.PNG"), "png");
  });

  it("returns null for trailing dot", () => {
    assert.equal(fileExtension("/path/file."), null);
  });

  it("handles percent-encoded names", () => {
    assert.equal(fileExtension("/path/file.%74xt"), "txt");
  });

  it("returns null for empty string", () => {
    assert.equal(fileExtension(""), null);
  });
});

describe("isTextFile", () => {
  it("identifies known text extensions", () => {
    assert.equal(isTextFile("/path/app.ts"), true);
    assert.equal(isTextFile("/path/readme.md"), true);
    assert.equal(isTextFile("/path/config.json"), true);
  });

  it("rejects binary extensions", () => {
    assert.equal(isTextFile("/path/image.png"), false);
    assert.equal(isTextFile("/path/video.mp4"), false);
    assert.equal(isTextFile("/path/archive.zip"), false);
  });

  it("returns false for dotfiles", () => {
    assert.equal(isTextFile("/path/.hidden"), false);
  });

  it("returns false for no extension", () => {
    assert.equal(isTextFile("/path/noext"), false);
  });

  it("handles URLs with query strings", () => {
    assert.equal(isTextFile("https://example.com/script.js?v=2"), true);
  });
});
