import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatSize, formatDate, truncate } from "../format.js";

describe("formatSize", () => {
  it("formats 0 bytes", () => {
    assert.equal(formatSize(0), "0 B");
  });

  it("formats bytes below 1 KB", () => {
    assert.equal(formatSize(512), "512 B");
  });

  it("formats exactly 1 KB", () => {
    assert.equal(formatSize(1024), "1 KB");
  });

  it("formats fractional KB", () => {
    assert.equal(formatSize(1536), "1.5 KB");
  });

  it("formats exactly 1 MB", () => {
    assert.equal(formatSize(1048576), "1 MB");
  });

  it("formats exactly 1 GB", () => {
    assert.equal(formatSize(1073741824), "1 GB");
  });

  it("formats terabytes", () => {
    assert.equal(formatSize(1099511627776), "1 TB");
  });

  it("rounds large KB values", () => {
    // 15360 = 15 KB exactly
    assert.equal(formatSize(15360), "15 KB");
  });
});

describe("formatDate", () => {
  it("returns em-dash for null", () => {
    assert.equal(formatDate(null), "\u2014");
  });

  it("returns 'Just now' for recent timestamps", () => {
    const now = new Date().toISOString();
    assert.equal(formatDate(now), "Just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    assert.equal(formatDate(fiveMinAgo), "5m ago");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
    assert.equal(formatDate(threeHoursAgo), "3h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400_000).toISOString();
    assert.equal(formatDate(twoDaysAgo), "2d ago");
  });

  it("returns weeks ago", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400_000).toISOString();
    assert.equal(formatDate(twoWeeksAgo), "2w ago");
  });

  it("returns month-day for older same-year dates", () => {
    // Use a date far enough in the past (>30 days) but same year
    const now = new Date();
    // Use Jan 1 of current year if we're far enough into the year
    if (now.getMonth() >= 2) {
      const jan1 = new Date(now.getFullYear(), 0, 1).toISOString();
      const result = formatDate(jan1);
      assert.match(result, /^Jan 1/);
    }
  });

  it("returns month-day-year for different year", () => {
    const oldDate = new Date("2020-06-15T12:00:00Z").toISOString();
    const result = formatDate(oldDate);
    assert.match(result, /Jun 15, 2020/);
  });
});

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    assert.equal(truncate("hello", 10), "hello");
  });

  it("returns string at exact max unchanged", () => {
    assert.equal(truncate("12345", 5), "12345");
  });

  it("truncates with ellipsis when over max", () => {
    const result = truncate("hello world", 6);
    assert.equal(result, "hello\u2026");
    assert.equal(result.length, 6);
  });

  it("handles empty string", () => {
    assert.equal(truncate("", 5), "");
  });

  it("truncates to single char + ellipsis", () => {
    const result = truncate("abcdef", 2);
    assert.equal(result, "a\u2026");
  });
});
