const toNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateSold = (start, end) => toNumber(start) - toNumber(end);

export const formatSoldValue = (value) => toNumber(value).toFixed(2);

const soldFieldMap = {
  lobster: { start: "startLobster", end: "endLobster" },
  buns: { start: "startBuns", end: "endBuns" },
  oysters: { start: "startOysters", end: "endOysters" },
};

export const calculateSoldTotals = (sheet) => {
  const safeSheet = sheet ?? {};

  return Object.entries(soldFieldMap).reduce((totals, [key, fields]) => {
    totals[key] = calculateSold(safeSheet[fields.start], safeSheet[fields.end]);
    return totals;
  }, {});
};

export const generateSheetId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return Date.now().toString();
};
