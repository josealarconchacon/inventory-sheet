import { useCallback, useEffect, useMemo, useState } from 'react';

import { calculateSold, generateSheetId } from '../utils/calculations.js';

const STORAGE_PREFIX = 'sheet:';
const STARTING_CASH = '200';

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

const createEmptySheet = () => ({
  id: generateSheetId(),
  name: '',
  location: '',
  date: getTodayIsoDate(),
  startLobster: '',
  startBuns: '',
  startOysters: '',
  startCaviar: '',
  startCash: STARTING_CASH,
  endLobster: '',
  endBuns: '',
  endOysters: '',
  endCaviar: '',
  endCash: '',
});

const getComparableDate = (date) => {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getStorageClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.storage?.get && window.storage?.set && window.storage?.list) {
    return window.storage;
  }

  if (typeof window.localStorage !== 'undefined') {
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
      console.error('Error saving sheet', storageError);
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
          console.warn('Sheet not found:', key, sheetError);
        }
      }

      if (loadedSheets.length > 0) {
        loadedSheets.sort((a, b) => getComparableDate(b.date) - getComparableDate(a.date));
        setSheets(loadedSheets);
        setCurrentIndex(0);
        return;
      }

      applyFallbackSheet();
    } catch (loadError) {
      console.error('Failed to load sheets', loadError);
      setError(loadError instanceof Error ? loadError : new Error('Failed to load sheets'));
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
    setSheets((previous) => [sheet, ...previous]);
    setCurrentIndex(0);
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
          [field]: value,
        };

        const nextSheets = [...previous];
        nextSheets[currentIndex] = updatedSheet;

        void persistSheet(updatedSheet);

        return nextSheets;
      });
    },
    [currentIndex, persistSheet],
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

  const currentSheet = useMemo(() => sheets[currentIndex] ?? null, [sheets, currentIndex]);

  const soldTotals = useMemo(
    () => ({
      lobster: calculateSold(currentSheet?.startLobster, currentSheet?.endLobster),
      buns: calculateSold(currentSheet?.startBuns, currentSheet?.endBuns),
      oysters: calculateSold(currentSheet?.startOysters, currentSheet?.endOysters),
    }),
    [currentSheet],
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
    goToPrevious,
    goToNext,
    refresh,
  };
};

