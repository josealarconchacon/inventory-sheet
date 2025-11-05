import { calculateSoldTotals, formatSoldValue } from "./calculations.js";
import {
  endOfDayRows,
  startOfDayRows,
  productTotalsRows,
} from "../constants/tableSections.js";

const sanitizeFilenamePart = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatCellValue = (value, prefix) => {
  if (value === undefined || value === null) {
    return "—";
  }

  const stringValue = String(value).trim();

  if (stringValue === "") {
    return "—";
  }

  return prefix ? `${prefix}${stringValue}` : stringValue;
};

const buildSectionRows = (rows, sheet) =>
  rows.map((row) => [row.label, formatCellValue(sheet?.[row.key], row.prefix)]);

const buildTotalsRows = (totals) =>
  productTotalsRows.map(({ key, label }) => [
    label,
    formatSoldValue(totals?.[key]),
  ]);

const getSheetFilename = (sheet) => {
  const parts = [sheet?.date, sheet?.location, sheet?.name]
    .map(sanitizeFilenamePart)
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join("-");
  }

  if (sheet?.id) {
    return sanitizeFilenamePart(sheet.id);
  }

  return "export";
};

const createFilename = (sheet) =>
  `inventory-sheet-${getSheetFilename(sheet)}.pdf`;

export const downloadSheetPdf = async (sheet) => {
  const safeSheet = sheet && typeof sheet === "object" ? sheet : null;

  if (!safeSheet) {
    return;
  }

  const [jsPdfModule, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const JsPdfConstructor = jsPdfModule.jsPDF ?? jsPdfModule.default;
  const autoTable =
    autoTableModule.default ?? autoTableModule.autoTable ?? autoTableModule.jsPDF;

  if (typeof JsPdfConstructor !== "function" || typeof autoTable !== "function") {
    throw new Error("PDF export libraries failed to load");
  }

  const doc = new JsPdfConstructor({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const marginX = 42;
  const headerY = 56;
  const tableMargin = { left: marginX, right: marginX };
  const soldTotals = calculateSoldTotals(safeSheet);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("BEGINNING + END OF DAY INVENTORY SHEET", marginX, headerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`NAME: ${safeSheet?.name ?? ""}`, marginX, headerY + 22);

  const locationParts = [safeSheet?.location, safeSheet?.date]
    .filter(Boolean)
    .map((part) => String(part).trim());
  doc.text(
    `LOCATION + DATE: ${locationParts.join(" • ")}`,
    marginX,
    headerY + 38
  );

  let currentY = headerY + 54;

  autoTable(doc, {
    head: [["At the start of the day", "Totals"]],
    body: buildSectionRows(startOfDayRows, safeSheet),
    startY: currentY,
    theme: "grid",
    margin: tableMargin,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [219, 234, 254], textColor: 32, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 18 : currentY;

  autoTable(doc, {
    head: [["At the end of the day", "Totals"]],
    body: buildSectionRows(endOfDayRows, safeSheet),
    startY: currentY,
    theme: "grid",
    margin: tableMargin,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [226, 232, 240], textColor: 32, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 18 : currentY;

  autoTable(doc, {
    head: [["Product totals", ""]],
    body: buildTotalsRows(soldTotals),
    startY: currentY,
    theme: "grid",
    margin: tableMargin,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [191, 219, 254], textColor: 25, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  doc.save(createFilename(safeSheet));
};

