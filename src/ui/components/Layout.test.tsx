import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({ count: 0 }),
}));

vi.mock("../context/CatalogSearchContext", () => ({
  useCatalogSearch: () => ({
    navigationSearchVisible: false,
    query: "",
    setQuery: vi.fn(),
  }),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

function renderLayout(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<p>Page content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Layout footer", () => {
  it("shows only the centered bookstore copyright on regular pages", () => {
    renderLayout("/");

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("text-center");
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} Navabe Bookstore`);
    expect(footer).not.toHaveTextContent("React");
    expect(footer).not.toHaveTextContent("Flask");
  });

  it.each(["/login", "/signup", "/recovery", "/admin"])("hides the footer on %s", (path) => {
    renderLayout(path);

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
