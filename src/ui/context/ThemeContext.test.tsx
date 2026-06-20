import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("toggles and persists the dark theme", () => {
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    fireEvent.click(screen.getByRole("button", { name: "light" }));

    expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("navabe-theme")).toBe("dark");
  });

  it("restores the persisted theme", () => {
    localStorage.setItem("navabe-theme", "dark");

    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });
});
