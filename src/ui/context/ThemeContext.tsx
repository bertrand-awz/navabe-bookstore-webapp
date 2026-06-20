import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

interface ThemeValue {
  theme: Theme;
  toggleTheme(): void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function initialTheme(): Theme {
  const savedTheme = localStorage.getItem("navabe-theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("navabe-theme", theme);
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark") }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
