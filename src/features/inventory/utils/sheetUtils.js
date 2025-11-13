import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";

const editableFieldKeys = [...startOfDayRows, ...endOfDayRows]
  .filter((row) => !row.readOnly)
  .map((row) => row.key);

export const isBlank = (value) => {
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
