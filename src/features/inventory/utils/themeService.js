const THEME_DEFAULT = "dark";
const THEME_LIGHT = "light";
const THEME_STORAGE_KEY = "inventory-sheet-theme";

const listeners = new Set();
let currentTheme = THEME_DEFAULT;

const isBrowserEnvironment = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(currentTheme);
    } catch (error) {
      console.error("themeService listener error", error);
    }
  });
};

const applyTheme = (theme) => {
  const normalizedTheme = theme === THEME_LIGHT ? THEME_LIGHT : THEME_DEFAULT;
  currentTheme = normalizedTheme;

  if (!isBrowserEnvironment()) {
    return currentTheme;
  }

  const root = document.documentElement;
  const { body } = document;

  if (root) {
    root.setAttribute("data-theme", normalizedTheme);
  }

  if (body) {
    body.classList.toggle("theme-light", normalizedTheme === THEME_LIGHT);
    body.classList.toggle("theme-dark", normalizedTheme !== THEME_LIGHT);
  }

  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    // Ignore storage errors (e.g., Safari private mode).
  }

  notifyListeners();
  return currentTheme;
};

const getStoredTheme = () => {
  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    const storedValue = window.localStorage?.getItem(THEME_STORAGE_KEY);
    if (storedValue === THEME_LIGHT || storedValue === THEME_DEFAULT) {
      return storedValue;
    }
  } catch (error) {
    // Ignore read errors.
  }

  return null;
};

const initializeTheme = () => {
  const storedTheme = getStoredTheme();
  return applyTheme(storedTheme ?? THEME_DEFAULT);
};

const toggleTheme = () => {
  const nextTheme = currentTheme === THEME_LIGHT ? THEME_DEFAULT : THEME_LIGHT;
  return applyTheme(nextTheme);
};

const onThemeChange = (listener) => {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getCurrentTheme = () => currentTheme;

const isLightTheme = () => currentTheme === THEME_LIGHT;

export {
  THEME_DEFAULT,
  THEME_LIGHT,
  applyTheme,
  getCurrentTheme,
  initializeTheme,
  isLightTheme,
  onThemeChange,
  toggleTheme,
};

