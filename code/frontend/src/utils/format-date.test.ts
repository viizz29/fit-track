import { describe, it, expect } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats a known date correctly", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("includes the weekday name", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
  });

  it("does not contain a comma after the weekday", () => {
    const date = new Date("2026-07-04T12:00:00Z");
    const result = formatDate(date);
    expect(result).toMatch(/^Saturday [A-Z]/);
  });

  it("formats a different month correctly", () => {
    const date = new Date("2026-12-25T12:00:00Z");
    const result = formatDate(date);
    expect(result).toContain("Dec");
    expect(result).toContain("25");
  });

  it("returns a string", () => {
    const result = formatDate(new Date());
    expect(typeof result).toBe("string");
  });
});
