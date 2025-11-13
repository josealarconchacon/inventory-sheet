import { vi, describe, beforeEach, afterEach, test, expect } from "vitest";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.CustomEvent = dom.window.CustomEvent;

const themeService = await import("./themeService.js");

const {
  THEME_LIGHT,
  THEME_DARK,
  THEME_DEFAULT,
  applyTheme,
  getCurrentTheme,
  initializeTheme,
  isLightTheme,
  onThemeChange,
  toggleTheme,
  getStoredTheme,
} = themeService;

const THEME_STORAGE_KEY = "inventory-sheet-theme";

describe("themeService", () => {
  let root;
  let body;
  let localStorageSetSpy;

  beforeEach(() => {
    document.documentElement.innerHTML = "";
    root = document.documentElement;
    body = document.body;

    window.localStorage.clear();
    localStorageSetSpy = vi.spyOn(window.localStorage, "setItem");

    applyTheme(THEME_DEFAULT);
    localStorageSetSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("applyTheme()", () => {
    test("sets currentTheme correctly to light", () => {
      applyTheme(THEME_LIGHT);
      expect(getCurrentTheme()).toBe(THEME_LIGHT);
    });

    test("sets currentTheme correctly to dark", () => {
      applyTheme(THEME_DARK);
      expect(getCurrentTheme()).toBe(THEME_DARK);
    });

    test("normalizes invalid input and defaults to dark", () => {
      applyTheme("invalid-value");
      expect(getCurrentTheme()).toBe(THEME_DARK);
    });

    test("updates documentElement data-theme attribute", () => {
      applyTheme(THEME_LIGHT);
      expect(root.getAttribute("data-theme")).toBe(THEME_LIGHT);

      applyTheme(THEME_DARK);
      expect(root.getAttribute("data-theme")).toBe(THEME_DARK);
    });

    test("toggles body classes correctly", () => {
      applyTheme(THEME_LIGHT);
      expect(body.classList.contains("theme-light")).toBe(true);
      expect(body.classList.contains("theme-dark")).toBe(false);

      applyTheme(THEME_DARK);
      expect(body.classList.contains("theme-light")).toBe(false);
      expect(body.classList.contains("theme-dark")).toBe(true);
    });

    test("silently ignores localStorage errors", () => {
      localStorageSetSpy.mockImplementation(() => {
        throw new Error("storage error");
      });
      expect(() => applyTheme(THEME_DARK)).not.toThrow();
    });

    test("notifies listeners", () => {
      const listener = vi.fn();
      const unsubscribe = onThemeChange(listener);

      applyTheme(THEME_DARK);
      expect(listener).toHaveBeenCalledWith(THEME_DARK);

      unsubscribe();
    });
  });

  describe("onThemeChange()", () => {
    test("registers a listener and triggers on theme change", () => {
      const listener = vi.fn();
      onThemeChange(listener);

      applyTheme(THEME_DARK);
      expect(listener).toHaveBeenCalledWith(THEME_DARK);
    });

    test("returns unsubscribe function that stops notifications", () => {
      const listener = vi.fn();
      const unsubscribe = onThemeChange(listener);

      unsubscribe();
      applyTheme(THEME_DARK);
      expect(listener).not.toHaveBeenCalled();
    });

    test("no-op when listener is not a function", () => {
      const unsubscribe = onThemeChange(null);
      expect(typeof unsubscribe).toBe("function");
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe("getCurrentTheme() / isLightTheme()", () => {
    test("returns current theme", () => {
      applyTheme(THEME_DARK);
      expect(getCurrentTheme()).toBe(THEME_DARK);
    });

    test("isLightTheme determines correctly", () => {
      applyTheme(THEME_LIGHT);
      expect(isLightTheme()).toBe(true);

      applyTheme(THEME_DARK);
      expect(isLightTheme()).toBe(false);
    });
  });

  // getStoredTheme
  describe("getStoredTheme()", () => {
    test("returns stored theme when valid", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
      expect(getStoredTheme()).toBe(THEME_DARK);
    });
  });

  // initializeTheme
  describe("initializeTheme()", () => {
    test("applies stored theme when available", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
      initializeTheme();
      expect(getCurrentTheme()).toBe(THEME_DARK);
    });

    test("falls back to default", () => {
      initializeTheme();
      expect(getCurrentTheme()).toBe(THEME_DEFAULT);
    });
  });

  // toggleTheme
  describe("toggleTheme()", () => {
    test("toggles between light and dark", () => {
      applyTheme(THEME_LIGHT);
      toggleTheme();
      expect(getCurrentTheme()).toBe(THEME_DARK);

      toggleTheme();
      expect(getCurrentTheme()).toBe(THEME_LIGHT);
    });
  });
});
