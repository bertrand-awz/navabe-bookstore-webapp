import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "../../infrastructure/api/client";
import { CatalogSearchProvider, useCatalogSearch } from "../context/CatalogSearchContext";
import { CartProvider } from "../context/CartContext";
import { CatalogPage } from "./CatalogPage";

vi.mock("../../infrastructure/api/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../infrastructure/api/client")>();
  return {
    ...original,
    api: {
      ...original.api,
      books: {
        ...original.api.books,
        list: vi.fn(),
      },
    },
  };
});

const intersections = new Map<Element, IntersectionObserverCallback>();

class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) { intersections.set(target, this.callback); }
  disconnect() {
    for (const [target, callback] of intersections) {
      if (callback === this.callback) intersections.delete(target);
    }
  }
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  root = null;
  rootMargin = "";
  thresholds = [];
}

function intersect(target: Element, isIntersecting: boolean) {
  const callback = intersections.get(target);
  if (!callback) throw new Error("The target is not observed");
  callback([{ isIntersecting, target } as IntersectionObserverEntry], {} as IntersectionObserver);
}

function NavigationSearchProbe() {
  const { navigationSearchVisible, query, setQuery } = useCatalogSearch();
  return navigationSearchVisible ? (
    <input
      aria-label="Search books from navigation"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
  ) : null;
}

function renderCatalog() {
  return render(
    <CatalogSearchProvider>
      <NavigationSearchProbe />
      <CartProvider><CatalogPage /></CartProvider>
    </CatalogSearchProvider>,
  );
}

const book = (isbn: string, title: string) => ({
  isbn,
  title,
  author: "Author",
  editor: "",
  category: "Fiction",
  synopsis: "",
  publication_year: 2000,
  price: 10,
  image_url: "",
  quantity: 5,
});

describe("CatalogPage infinite loading", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    intersections.clear();
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    vi.mocked(api.books.list).mockReset();
    vi.mocked(api.books.list)
      .mockResolvedValueOnce({
        items: [book("9780000000001", "First page book")],
        pagination: { page: 1, page_size: 24, total: 2, total_pages: 2, has_next: true, has_previous: false },
        sort: { field: "title", direction: "asc" },
      })
      .mockResolvedValueOnce({
        items: [book("9780000000002", "Second page book")],
        pagination: { page: 2, page_size: 24, total: 2, total_pages: 2, has_next: false, has_previous: true },
        sort: { field: "title", direction: "asc" },
      });
  });

  it("loads the first page automatically and the next page near the end", async () => {
    renderCatalog();

    expect(await screen.findByText("First page book")).toBeInTheDocument();

    act(() => intersect(screen.getByLabelText("Catalog loading status"), true));

    expect(await screen.findByText("Second page book")).toBeInTheDocument();
    await waitFor(() => expect(api.books.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
    expect(screen.getByText("You reached the end of the catalog.")).toBeInTheDocument();
  });

  it("shows a synchronized navigation search after the hero leaves the viewport", async () => {
    renderCatalog();
    await screen.findByText("First page book");

    expect(screen.queryByLabelText("Search books from navigation")).not.toBeInTheDocument();

    act(() => intersect(screen.getByLabelText("Catalog introduction"), false));

    const navigationSearch = screen.getByLabelText("Search books from navigation");
    fireEvent.change(navigationSearch, { target: { value: "Fiction" } });
    expect(screen.getByLabelText("Search books")).toHaveValue("Fiction");

    act(() => intersect(screen.getByLabelText("Catalog introduction"), true));
    expect(screen.queryByLabelText("Search books from navigation")).not.toBeInTheDocument();
  });

  it("reloads the first page when a sort option is selected", async () => {
    renderCatalog();
    await screen.findByText("First page book");

    fireEvent.click(screen.getByRole("button", { name: "Title: A to Z" }));
    expect(screen.getByRole("group", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Publication" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("menuitem", { name: "High to low" }));

    await waitFor(() => expect(api.books.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "price", direction: "desc", page: 1 }),
    ));
    expect(screen.getByRole("button", { name: "Price: high to low" })).toBeInTheDocument();
  });

  it("opens book details in a modal", async () => {
    renderCatalog();
    await screen.findByText("First page book");

    fireEvent.click(screen.getByRole("button", { name: "Details for First page book" }));

    const dialog = screen.getByRole("dialog", { name: "First page book" });
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).toHaveClass("backdrop-blur-md");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog", { name: "First page book" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

});
