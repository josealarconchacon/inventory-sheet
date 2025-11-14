import {
  startOfDayRows,
  endOfDayRows,
  productTotalsRows,
} from "./tableSections.js";

describe("tableSection config tests", () => {
  describe("startOfDayRows", () => {
    test("has correct number of rows", () => {
      expect(startOfDayRows.length).toBe(5);
    });

    test("every row has key and label", () => {
      startOfDayRows.forEach((item) => {
        expect(typeof item.key).toBe("string");
        expect(typeof item.label).toBe("string");
      });
    });

    test("startCash row has required fields", () => {
      const startCash = startOfDayRows.find((row) => row.key === "startCash");

      expect(startCash).toBeDefined();
      expect(startCash.type).toBe("number");
      expect(startCash.step).toBe(1);
      expect(startCash.min).toBe(0);
      expect(startCash.placeholder).toBe("200");
      expect(startCash.prefix).toBe("$");
    });

    test("snapshot: startOfDayRows stays consistent", () => {
      expect(startOfDayRows).toMatchSnapshot();
    });
  });

  describe("endOfDayRows", () => {
    test("has correct number of rows", () => {
      expect(endOfDayRows.length).toBe(5);
    });

    test("endBuns row has valid note fields", () => {
      const row = endOfDayRows.find((r) => r.key === "endBuns");

      const requiredFields = [
        "noteField",
        "noteButtonLabel",
        "noteEditLabel",
        "noteCollapseLabel",
        "notePlaceholder",
        "noteHint",
        "noteExportLabel",
        "notePopupTitle",
        "noteDoneLabel",
      ];

      requiredFields.forEach((field) => {
        expect(row[field]).toBeDefined();
        expect(typeof row[field]).toBe("string");
      });
    });

    test("endOysters row has valid note fields", () => {
      const row = endOfDayRows.find((r) => r.key === "endOysters");

      const requiredFields = [
        "noteField",
        "noteButtonLabel",
        "noteEditLabel",
        "noteCollapseLabel",
        "notePlaceholder",
        "noteHint",
        "noteExportLabel",
        "notePopupTitle",
        "noteDoneLabel",
      ];

      requiredFields.forEach((field) => {
        expect(row[field]).toBeDefined();
        expect(typeof row[field]).toBe("string");
      });
    });

    test("snapshot: endOfDayRows stays consistent", () => {
      expect(endOfDayRows).toMatchSnapshot();
    });
  });

  describe("productTotalsRows", () => {
    test("has correct number of rows", () => {
      // Expected 3 rows: Subtotal, Tax, and Total
      const EXPECTED_PRODUCT_TOTALS_COUNT = 3;
      expect(productTotalsRows.length).toBe(EXPECTED_PRODUCT_TOTALS_COUNT);
    });

    test("each row has key and label", () => {
      productTotalsRows.forEach((item) => {
        expect(typeof item.key).toBe("string");
        expect(typeof item.label).toBe("string");
      });
    });

    test("snapshot: productTotalsRows stays consistent", () => {
      expect(productTotalsRows).toMatchSnapshot();
    });
  });
});
