import { calculateSold, formatSoldValue } from "./calculations.js";
import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";

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

const buildTotalsRows = (sheet) => [
  [
    "Total Lobster sold (amount brought minus leftover)",
    formatSoldValue(calculateSold(sheet?.startLobster, sheet?.endLobster)),
  ],
  [
    "Total Rolls sold (amount brought minus leftover)",
    formatSoldValue(calculateSold(sheet?.startBuns, sheet?.endBuns)),
  ],
  [
    "Total Oysters sold (amount brought minus leftover)",
    formatSoldValue(calculateSold(sheet?.startOysters, sheet?.endOysters)),
  ],
];

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

const createFilename = (sheets) => {
  if (sheets.length === 1) {
    return `inventory-sheet-${getSheetFilename(sheets[0])}.pdf`;
  }

  return `inventory-sheets-${new Date().toISOString().slice(0, 10)}.pdf`;
};

export const downloadSheetsPdf = async (sheets) => {
  const safeSheets = Array.isArray(sheets)
    ? sheets.filter((sheet) => sheet && typeof sheet === "object")
    : [];

  if (safeSheets.length === 0) {
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

  safeSheets.forEach((sheet, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const marginX = 42;
    const headerY = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("BEGINNING + END OF DAY INVENTORY SHEET", marginX, headerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`NAME: ${sheet?.name ?? ""}`, marginX, headerY + 22);

    const locationParts = [sheet?.location, sheet?.date]
      .filter(Boolean)
      .map((part) => String(part).trim());
    doc.text(
      `LOCATION + DATE: ${locationParts.join(" • ")}`,
      marginX,
      headerY + 38
    );

    const tableMargin = { left: marginX, right: marginX };
    let currentY = headerY + 54;

    autoTable(doc, {
      head: [["At the start of the day", "Totals"]],
      body: buildSectionRows(startOfDayRows, sheet),
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
      body: buildSectionRows(endOfDayRows, sheet),
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
      body: buildTotalsRows(sheet),
      startY: currentY,
      theme: "grid",
      margin: tableMargin,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [191, 219, 254], textColor: 25, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" } },
    });
  });

  doc.save(createFilename(safeSheets));
};

