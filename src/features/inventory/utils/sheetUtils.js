import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";

const editableFieldKeys = [...startOfDayRows, ...endOfDayRows]
  .filter((row) => !row.readOnly)
  .map((row) => row.key);

const isBlank = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isNaN(value);
  }

  return String(value).trim() === "";
};

export const isSheetComplete = (sheet) => {
  if (!sheet || typeof sheet !== "object") {
    return false;
  }

  return editableFieldKeys.every((key) => !isBlank(sheet[key]));
};

export const describeSheet = (sheet, index) => {
  const baseLabel = `Sheet ${index + 1}`;

  if (!sheet) {
    return baseLabel;
  }

  const details = [];

  if (sheet.date) {
    details.push(sheet.date);
  }

  if (sheet.name) {
    details.push(sheet.name);
  } else if (sheet.location) {
    details.push(sheet.location);
  }

  if (details.length === 0) {
    return baseLabel;
  }

  return `${baseLabel} • ${details.join(" • ")}`;
};

export const getSheetIdentifier = (sheet, fallback) => {
  if (sheet?.id) {
    return String(sheet.id);
  }

  if (sheet?.date) {
    return `${sheet.date}-${fallback}`;
  }

  return fallback;
};

export const getEditableKeys = () => [...editableFieldKeys];


