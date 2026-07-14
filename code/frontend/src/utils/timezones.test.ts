import { describe, it, expect } from "vitest";
import { getTimezones } from "./timezones";

describe("getTimezones", () => {
  it("returns a non-empty array", () => {
    const timezones = getTimezones();
    expect(Array.isArray(timezones)).toBe(true);
    expect(timezones.length).toBeGreaterThan(0);
  });

  it("includes common timezones", () => {
    const timezones = getTimezones();
    expect(timezones).toContain("America/New_York");
  });

  it("returns all string entries", () => {
    const timezones = getTimezones();
    timezones.forEach((tz) => {
      expect(typeof tz).toBe("string");
    });
  });

  it("contains no duplicates", () => {
    const timezones = getTimezones();
    const unique = new Set(timezones);
    expect(unique.size).toBe(timezones.length);
  });
});
