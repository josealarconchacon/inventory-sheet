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

const containsEmoji = (text) =>
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(String(text));

const renderEmojiText = (text, cellWidthPt, fontSize, cellPadding) => {
  if (typeof document === "undefined") return null;

  const dpr = window.devicePixelRatio || 1;
  const innerWidthPt = Math.max(40, cellWidthPt - cellPadding * 2);
  const fontPx = fontSize * dpr;
  const fontStack = `${fontPx}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", Arial, sans-serif`;

  // Measure pass for word-wrap
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = Math.ceil(innerWidthPt * dpr);
  measureCanvas.height = 1;
  const mCtx = measureCanvas.getContext("2d");
  mCtx.font = fontStack;

  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (mCtx.measureText(test).width > innerWidthPt * dpr && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const lineHeightPx = fontPx * 1.4;
  const canvasW = Math.ceil(innerWidthPt * dpr);
  const canvasH = Math.ceil(lines.length * lineHeightPx);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = Math.max(canvasH, 1);
  const ctx = canvas.getContext("2d");
  ctx.font = fontStack;
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => ctx.fillText(line, 0, i * lineHeightPx));

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthPt: innerWidthPt,
    heightPt: Math.max(canvasH / dpr, fontSize),
  };
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
  rows.flatMap((row) => {
    const primaryRow = [
      row.label,
      formatCellValue(sheet?.[row.key], row.prefix),
    ];

    if (!row.noteField) {
      return [primaryRow];
    }

    const noteValue = sheet?.[row.noteField];

    return [
      primaryRow,
      [row.noteExportLabel ?? "Notes", formatCellValue(noteValue)],
    ];
  });

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
    autoTableModule.default ??
    autoTableModule.autoTable ??
    autoTableModule.jsPDF;

  if (
    typeof JsPdfConstructor !== "function" ||
    typeof autoTable !== "function"
  ) {
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
    headStyles: {
      fillColor: [219, 234, 254],
      textColor: 32,
      fontStyle: "bold",
    },
    columnStyles: { 1: { halign: "right" } },
  });

  currentY = doc.lastAutoTable?.finalY
    ? doc.lastAutoTable.finalY + 18
    : currentY;

  // Identify which body-row indices in the end-of-day table are note rows that
  // contain emoji. Those cells need canvas-based rendering because standard PDF
  // fonts don't carry emoji glyphs.
  const emojiNoteRows = new Map(); // bodyRowIndex → raw note text
  {
    let bodyIdx = 0;
    for (const row of endOfDayRows) {
      bodyIdx++; // primary row
      if (row.noteField) {
        const rawNote = safeSheet?.[row.noteField];
        const noteText = typeof rawNote === "string" ? rawNote : "";
        if (noteText && containsEmoji(noteText)) {
          emojiNoteRows.set(bodyIdx, noteText);
        }
        bodyIdx++; // note row
      }
    }
  }

  const CELL_PADDING = 6;
  const FONT_SIZE = 10;

  autoTable(doc, {
    head: [["At the end of the day", "Totals"]],
    body: buildSectionRows(endOfDayRows, safeSheet),
    startY: currentY,
    theme: "grid",
    margin: tableMargin,
    styles: { fontSize: FONT_SIZE, cellPadding: CELL_PADDING },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: 32,
      fontStyle: "bold",
    },
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (data) => {
      if (
        data.row.section === "body" &&
        emojiNoteRows.has(data.row.index) &&
        data.column.index === 1
      ) {
        // Reserve vertical space for the image; suppress default text drawing.
        data.cell.text = [];
        data.cell.styles.minCellHeight = 28;
      }
    },
    didDrawCell: (data) => {
      if (
        data.row.section === "body" &&
        emojiNoteRows.has(data.row.index) &&
        data.column.index === 1
      ) {
        const noteText = emojiNoteRows.get(data.row.index);
        const rendered = renderEmojiText(
          noteText,
          data.cell.width,
          FONT_SIZE,
          CELL_PADDING,
        );
        if (rendered) {
          doc.addImage(
            rendered.dataUrl,
            "PNG",
            data.cell.x + CELL_PADDING,
            data.cell.y + CELL_PADDING,
            rendered.widthPt,
            rendered.heightPt,
          );
        }
      }
    },
  });

  currentY = doc.lastAutoTable?.finalY
    ? doc.lastAutoTable.finalY + 18
    : currentY;

  autoTable(doc, {
    head: [["Product totals", ""]],
    body: buildTotalsRows(soldTotals),
    startY: currentY,
    theme: "grid",
    margin: tableMargin,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: {
      fillColor: [191, 219, 254],
      textColor: 25,
      fontStyle: "bold",
    },
    columnStyles: { 1: { halign: "right" } },
  });

  doc.save(createFilename(safeSheet));
};
