import {
  calculateSold,
  formatSoldValue,
  calculateSoldTotals,
  generateSheetId,
} from "./calculations.js";

describe("calculateSold", () => {
  test("calculates correctly with numbers", () => {
    expect(calculateSold(10, 3)).toBe(7);
  });

  test("calculates correctly with numeric strings", () => {
    expect(calculateSold("10", "3")).toBe(7);
  });

  test("handles non-numeric values safely", () => {
    expect(calculateSold("x", "3")).toBe(-3);
    expect(calculateSold("5", "x")).toBe(5);
    expect(calculateSold("x", "x")).toBe(0);
  });

  test("handles undefined or null values", () => {
    expect(calculateSold(undefined, 5)).toBe(-5);
    expect(calculateSold(10, null)).toBe(10);
  });
});

describe("formatSoldValue", () => {
  test("formats values with 2 decimals", () => {
    expect(formatSoldValue(3)).toBe("3.00");
    expect(formatSoldValue("3.1")).toBe("3.10");
  });

  test("formats invalid values as 0.00", () => {
    expect(formatSoldValue("x")).toBe("0.00");
    expect(formatSoldValue(undefined)).toBe("0.00");
  });
});

describe("calculateSoldTotals", () => {
  test("maps fields correctly from sheet", () => {
    const sheet = {
      startLobster: 10,
      endLobster: 2,
      startBuns: 6,
      endBuns: 1,
      startOysters: 8,
      endOysters: 3,
    };

    expect(calculateSoldTotals(sheet)).toEqual({
      lobster: 8,
      buns: 5,
      oysters: 5,
    });
  });

  test("handles missing or undefined sheet values", () => {
    expect(calculateSoldTotals({})).toEqual({
      lobster: 0,
      buns: 0,
      oysters: 0,
    });
  });

  test("handles undefined sheet object", () => {
    expect(calculateSoldTotals(undefined)).toEqual({
      lobster: 0,
      buns: 0,
      oysters: 0,
    });
  });
});

describe("generateSheetId", () => {
  test("uses crypto.randomUUID when available", () => {
    const mockRandomUUID = vi.fn(() => "mock-uuid-123");
    const cryptoGetSpy = vi
      .spyOn(globalThis, "crypto", "get")
      .mockReturnValue({ randomUUID: mockRandomUUID });

    expect(generateSheetId()).toBe("mock-uuid-123");
    expect(mockRandomUUID).toHaveBeenCalled();
    cryptoGetSpy.mockRestore();
  });

  test("falls back to Date.now when crypto is unavailable", () => {
    const cryptoGetSpy = vi
      .spyOn(globalThis, "crypto", "get")
      .mockReturnValue(undefined);
    const mockNow = vi.spyOn(Date, "now").mockReturnValue(123456789);

    expect(generateSheetId()).toBe("123456789");

    mockNow.mockRestore();
    cryptoGetSpy.mockRestore();
  });
});
