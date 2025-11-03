import { useCallback, useEffect, useMemo, useState } from "react";

import { calculateSold, generateSheetId } from "../utils/calculations.js";

const STORAGE_PREFIX = "sheet:";
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

const getComparableDate = (date) => {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getCreationTime = (sheet) => {
  if (!sheet) {
    return 0;
  }

  if (typeof sheet.createdAt === "number") {
    return sheet.createdAt;
  }

  const comparableDate = getComparableDate(sheet.date);

  return comparableDate === 0 ? Date.now() : comparableDate;
};

const getStorageClient = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.storage?.get && window.storage?.set && window.storage?.list) {
    return window.storage;
  }

  if (typeof window.localStorage !== "undefined") {
    return {
      async get(key) {
        const value = window.localStorage.getItem(key);
        return value ? { value } : null;
      },
      async set(key, value) {
        window.localStorage.setItem(key, value);
      },
      async remove(key) {
        window.localStorage.removeItem(key);
      },
      async list(prefix) {
        const keys = [];

        for (let index = 0; index < window.localStorage.length; index += 1) {
          const key = window.localStorage.key(index);

          if (key?.startsWith(prefix)) {
            keys.push(key);
          }
        }

        return { keys };
      },
    };
  }

  return null;
};

export const useInventorySheets = () => {
  const [sheets, setSheets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const applyFallbackSheet = useCallback(() => {
    setSheets([createEmptySheet()]);
    setCurrentIndex(0);
  }, []);

  const persistSheet = useCallback(async (sheet) => {
    const storage = getStorageClient();

    if (!storage?.set || !sheet) {
      return;
    }

    try {
      await storage.set(`${STORAGE_PREFIX}${sheet.id}`, JSON.stringify(sheet));
    } catch (storageError) {
      console.error("Error saving sheet", storageError);
    }
  }, []);

  const removeSheetFromStorage = useCallback(async (sheetId) => {
    if (!sheetId) {
      return;
    }

    const storage = getStorageClient();

    if (!storage) {
      return;
    }

    const key = `${STORAGE_PREFIX}${sheetId}`;

    try {
      if (typeof storage.remove === "function") {
        await storage.remove(key);
      } else if (typeof storage.delete === "function") {
        await storage.delete(key);
      } else if (typeof storage.set === "function") {
        await storage.set(key, null);
      } else if (typeof window?.localStorage !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (storageError) {
      console.error("Error removing sheet", storageError);
    }
  }, []);

  const loadSheets = useCallback(async () => {
    const storage = getStorageClient();

    if (!storage?.list) {
      applyFallbackSheet();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await storage.list(STORAGE_PREFIX);
      const keys = result?.keys ?? [];

      if (keys.length === 0) {
        applyFallbackSheet();
        return;
      }

      const loadedSheets = [];

      for (const key of keys) {
        try {
          const sheetResult = await storage.get(key);

          if (sheetResult?.value) {
            loadedSheets.push(JSON.parse(sheetResult.value));
          }
        } catch (sheetError) {
          console.warn("Sheet not found:", key, sheetError);
        }
      }

      if (loadedSheets.length > 0) {
        const normalizedSheets = loadedSheets.map((sheet) =>
          sheet.createdAt
            ? sheet
            : {
                ...sheet,
                createdAt: getCreationTime(sheet),
              }
        );

        normalizedSheets.sort((a, b) => {
          const dateDifference =
            getComparableDate(b.date) - getComparableDate(a.date);

          if (dateDifference !== 0) {
            return dateDifference;
          }

          return getCreationTime(b) - getCreationTime(a);
        });

        setSheets(normalizedSheets);
        setCurrentIndex(0);
        return;
      }

      applyFallbackSheet();
    } catch (loadError) {
      console.error("Failed to load sheets", loadError);
      setError(
        loadError instanceof Error
          ? loadError
          : new Error("Failed to load sheets")
      );
      applyFallbackSheet();
    } finally {
      setIsLoading(false);
    }
  }, [applyFallbackSheet]);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  const createSheet = useCallback(() => {
    const sheet = createEmptySheet();
    setSheets((previous) => {
      setCurrentIndex(previous.length);
      return [...previous, sheet];
    });
    void persistSheet(sheet);
    return sheet;
  }, [persistSheet]);

  const updateSheetField = useCallback(
    (field, value) => {
      setSheets((previous) => {
        if (!previous[currentIndex]) {
          return previous;
        }

        const updatedSheet = {
          ...previous[currentIndex],
          createdAt: previous[currentIndex].createdAt ?? Date.now(),
          [field]: value,
        };

        const nextSheets = [...previous];
        nextSheets[currentIndex] = updatedSheet;

        void persistSheet(updatedSheet);

        return nextSheets;
      });
    },
    [currentIndex, persistSheet]
  );

  const deleteSheet = useCallback(
    (sheetId) => {
      let nextIndex = currentIndex;
      let fallbackSheet = null;
      let removedSheetId = null;

      setSheets((previous) => {
        if (!previous.length) {
          return previous;
        }

        const targetId = sheetId ?? previous[currentIndex]?.id;
        const indexToRemove = previous.findIndex(
          (sheet) => sheet.id === targetId
        );

        if (indexToRemove === -1) {
          return previous;
        }

        removedSheetId = targetId;

        const filtered = previous.filter((sheet) => sheet.id !== targetId);

        if (filtered.length === 0) {
          fallbackSheet = createEmptySheet();
          nextIndex = 0;
          return [fallbackSheet];
        }

        nextIndex = Math.max(Math.min(indexToRemove, filtered.length - 1), 0);
        return filtered;
      });

      if (!removedSheetId) {
        return;
      }

      void removeSheetFromStorage(removedSheetId);

      if (fallbackSheet) {
        void persistSheet(fallbackSheet);
      }

      setCurrentIndex(nextIndex);
    },
    [currentIndex, persistSheet, removeSheetFromStorage]
  );

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => {
      const lastIndex = Math.max(sheets.length - 1, 0);
      return Math.min(index + 1, lastIndex);
    });
  }, [sheets.length]);

  const currentSheet = useMemo(
    () => sheets[currentIndex] ?? null,
    [sheets, currentIndex]
  );

  const soldTotals = useMemo(
    () => ({
      lobster: calculateSold(
        currentSheet?.startLobster,
        currentSheet?.endLobster
      ),
      buns: calculateSold(currentSheet?.startBuns, currentSheet?.endBuns),
      oysters: calculateSold(
        currentSheet?.startOysters,
        currentSheet?.endOysters
      ),
    }),
    [currentSheet]
  );

  const refresh = useCallback(() => {
    void loadSheets();
  }, [loadSheets]);

  return {
    sheets,
    currentSheet,
    currentIndex,
    totalSheets: sheets.length,
    isLoading,
    error,
    soldTotals,
    createSheet,
    updateSheetField,
    deleteSheet,
    goToPrevious,
    goToNext,
    refresh,
  };
};
