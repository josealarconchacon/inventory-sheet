const toNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateSold = (start, end) => toNumber(start) - toNumber(end);

export const formatSoldValue = (value) => toNumber(value).toFixed(2);

export const generateSheetId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return Date.now().toString();
};
