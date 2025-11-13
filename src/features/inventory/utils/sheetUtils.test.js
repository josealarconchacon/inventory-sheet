import { describe, test, expect, vi } from "vitest";

vi.mock("../constants/tableSections.js", () => ({
  startOfDayRows: [
    { key: "startLobster" },
    { key: "startBuns" },
    { key: "startOysters" },
    { key: "startCaviar" },
    { key: "startCash" },
  ],
  endOfDayRows: [
    { key: "endLobster" },
    { key: "endBuns" },
    { key: "endOysters" },
    { key: "endCaviar" },
    { key: "endCash" },
  ],
}));

import { isBlank } from "./sheetUtils.js";

describe("isBlank", () => {
  test("undefined → true", () => {
    expect(isBlank(undefined)).toBe(true);
  });

  test("null → true", () => {
    expect(isBlank(null)).toBe(true);
  });

  test("empty string → true", () => {
    expect(isBlank("")).toBe(true);
  });

  test("whitespace → true", () => {
    expect(isBlank("   ")).toBe(true);
  });

  test("NaN → true", () => {
    expect(isBlank(NaN)).toBe(true);
  });

  test("valid number → false", () => {
    expect(isBlank(10)).toBe(false);
  });

  test("valid string → false", () => {
    expect(isBlank("hello")).toBe(false);
  });

  test("boolean values → false", () => {
    expect(isBlank(false)).toBe(false);
    expect(isBlank(true)).toBe(false);
  });
});
