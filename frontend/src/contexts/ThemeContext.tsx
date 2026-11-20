import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && media().matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme | null) ?? "system"
  );

  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }

    if (theme !== "system") return;

    const mq = media();
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  }
  return context;
}