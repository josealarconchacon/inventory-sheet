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

import { isBlank, isSheetComplete } from "./sheetUtils.js";

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

describe("isSheetComplete", () => {
  const mockSheet = {
    startLobster: 1,
    startBuns: 2,
    startOysters: 3,
    startCaviar: 4,
    startCash: 200,

    endLobster: 1,
    endBuns: 2,
    endOysters: 3,
    endCaviar: 4,
    endCash: 300,
  };

  test("returns false for non-object values", () => {
    expect(isSheetComplete(null)).toBe(false);
    expect(isSheetComplete(undefined)).toBe(false);
    expect(isSheetComplete("abc")).toBe(false);
    expect(isSheetComplete(123)).toBe(false);
  });

  test("returns true when all editable fields are present & valid", () => {
    expect(isSheetComplete(mockSheet)).toBe(true);
  });

  test("returns false when a field is blank string", () => {
    const sheet = { ...mockSheet, startLobster: "" };
    expect(isSheetComplete(sheet)).toBe(false);
  });

  test("returns false when a field is undefined", () => {
    const sheet = { ...mockSheet, endOysters: undefined };
    expect(isSheetComplete(sheet)).toBe(false);
  });

  test("returns false when a field is NaN", () => {
    const sheet = { ...mockSheet, endCash: NaN };
    expect(isSheetComplete(sheet)).toBe(false);
  });

  test("returns false when a required field is missing entirely", () => {
    const sheet = { ...mockSheet };
    delete sheet.startBuns;
    expect(isSheetComplete(sheet)).toBe(false);
  });
});
