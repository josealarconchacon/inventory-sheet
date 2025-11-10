import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import {
  initializeTheme,
  isLightTheme,
  onThemeChange,
  toggleTheme,
} from "../utils/themeService.js";

const ThemeToggleButton = ({ className = "" }) => {
  const [useLightTheme, setUseLightTheme] = useState(false);

  useEffect(() => {
    initializeTheme();
    setUseLightTheme(isLightTheme());

    const unsubscribe = onThemeChange((nextTheme) => {
      setUseLightTheme(nextTheme === "light");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = toggleTheme();
    setUseLightTheme(nextTheme === "light");
  };

  const isLight = useLightTheme;
  const ariaLabel = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={handleToggleTheme}
      className={`inventory-theme-toggle ${className}`.trim()}
      aria-pressed={isLight}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {isLight ? (
        <Moon className="h-4 w-4 shrink-0" />
      ) : (
        <Sun className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
};

export default ThemeToggleButton;

