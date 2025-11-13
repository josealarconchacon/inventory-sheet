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
  try {
    const maybeCrypto =
      typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
    if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
      return maybeCrypto.randomUUID();
    }
  } catch {
    // If randomUUID access or call fails, fall back below.
  }

  return Date.now().toString();
};
