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

describe("Layout", () => {
  it("includes about and MailHog navigation links", () => {
    renderLayout("/");

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Management Portal" })).toHaveAttribute("href", "/management");
    expect(screen.getByRole("link", { name: "Open MailHog inbox" })).toHaveAttribute(
      "href",
      "https://mailhog.navabe.bertawz.dev",
    );
  });

  it("shows only the right-aligned bookstore copyright on regular pages", () => {
    renderLayout("/");

    expect(screen.getByRole("main")).toHaveClass("bg-canvas");
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-[#2f2a24]");
    expect(footer).toHaveClass("text-right");
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} Navabe Bookstore`);
    expect(footer).not.toHaveTextContent("React");
    expect(footer).not.toHaveTextContent("Flask");
  });

  it.each(["/login", "/signup", "/recovery", "/management"])("hides the footer on %s", (path) => {
    renderLayout(path);

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
