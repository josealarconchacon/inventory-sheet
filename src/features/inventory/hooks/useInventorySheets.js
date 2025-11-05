import { useCallback, useEffect, useMemo, useState } from "react";

import { calculateSoldTotals, generateSheetId } from "../utils/calculations.js";
import { isSheetComplete } from "../utils/sheetUtils.js";

const STORAGE_KEY = "sheet:current";
const STARTING_CASH = "200";

const getTodayIsoDate = () => new Date().toISOString().split("T")[0];

const createEmptySheet = () => ({
  id: generateSheetId(),
  createdAt: Date.now(),
  name: "",
  location: "",
  date: getTodayIsoDate(),
  startLobster: "",
  startBuns: "",
  startOysters: "",
  startCaviar: "",
  startCash: STARTING_CASH,
  endLobster: "",
  endBuns: "",
  endOysters: "",
  endCaviar: "",
  endCash: "",
});

const sanitizeSheet = (sheet) => {
  if (!sheet || typeof sheet !== "object") {
    return createEmptySheet();
  }

  const fallback = createEmptySheet();

  return {
    ...fallback,
    ...sheet,
    id: sheet.id ?? fallback.id,
    createdAt:
      typeof sheet.createdAt === "number"
        ? sheet.createdAt
        : fallback.createdAt,
    date: sheet.date ?? fallback.date,
  };
};

const getStorageClient = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.storage?.get && window.storage?.set) {
    return window.storage;
  }

  if (typeof window.localStorage !== "undefined") {
    return {
      async get(key) {
        const value = window.localStorage.getItem(key);
        return value ? { value } : null;
      },
      async set(key, value) {
        if (value === null || value === undefined) {
          window.localStorage.removeItem(key);
          return;
        }

        window.localStorage.setItem(key, value);
      },
      async remove(key) {
        window.localStorage.removeItem(key);
      },
    };
  }

  return null;
};

export const useInventorySheets = () => {
  const [sheet, setSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const applyFallbackSheet = useCallback(() => {
    const fallback = createEmptySheet();
    setSheet(fallback);
    return fallback;
  }, []);

  const persistSheet = useCallback(async (nextSheet) => {
    const storage = getStorageClient();

    if (!storage?.set || !nextSheet) {
      return;
    }

    try {
      await storage.set(STORAGE_KEY, JSON.stringify(nextSheet));
    } catch (storageError) {
      console.error("Error saving sheet", storageError);
    }
  }, []);

  const loadSheet = useCallback(async () => {
    const storage = getStorageClient();

    if (!storage?.get) {
      const fallback = applyFallbackSheet();
      void persistSheet(fallback);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stored = await storage.get(STORAGE_KEY);

      if (stored?.value) {
        const parsed = JSON.parse(stored.value);
        const normalized = sanitizeSheet(parsed);
        setSheet(normalized);
        void persistSheet(normalized);
        return;
      }

      const fallback = applyFallbackSheet();
      void persistSheet(fallback);
    } catch (loadError) {
      console.error("Failed to load sheet", loadError);
      setError(
        loadError instanceof Error
          ? loadError
          : new Error("Failed to load sheet")
      );
      const fallback = applyFallbackSheet();
      void persistSheet(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [applyFallbackSheet, persistSheet]);

  useEffect(() => {
    void loadSheet();
  }, [loadSheet]);

  const updateSheetField = useCallback(
    (field, value) => {
      setSheet((previous) => {
        const safeSheet = sanitizeSheet(previous);
        const nextSheet = {
          ...safeSheet,
          [field]: value,
        };

        void persistSheet(nextSheet);

        return nextSheet;
      });
    },
    [persistSheet]
  );

  const resetSheet = useCallback(() => {
    const fresh = createEmptySheet();
    setSheet(fresh);
    void persistSheet(fresh);
  }, [persistSheet]);

  const soldTotals = useMemo(() => calculateSoldTotals(sheet), [sheet]);

  const isComplete = useMemo(() => isSheetComplete(sheet), [sheet]);

  return {
    sheet,
    isLoading,
    error,
    soldTotals,
    updateSheetField,
    resetSheet,
    isComplete,
  };
};
