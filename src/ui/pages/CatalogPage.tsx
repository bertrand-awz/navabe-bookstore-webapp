import { useCallback, useEffect, useRef, useState } from "react";
import type { Book, CatalogSortField, SortDirection } from "../../domain/models";
import { api, ApiError } from "../../infrastructure/api/client";
import { BookCard } from "../components/BookCard";
import { BookModal } from "../components/BookModal";
import { CatalogSearchBar } from "../components/CatalogSearchBar";
import { Message } from "../components/Message";
import { useCatalogSearch } from "../context/CatalogSearchContext";
import { useCart } from "../context/CartContext";
import { eyebrowClass, feedbackStateClass } from "../styles";

export function CatalogPage() {
  const pageSize = 24;
  const [books, setBooks] = useState<Book[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const hero = useRef<HTMLElement | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const generationRef = useRef(0);
  const cart = useCart();
  const { query, setNavigationSearchVisible, sortValue } = useCatalogSearch();
  const [sort, direction] = sortValue.split(":") as [CatalogSortField, SortDirection];

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), query ? 300 : 0);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!hero.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavigationSearchVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero.current);
    return () => {
      observer.disconnect();
      setNavigationSearchVisible(false);
    };
  }, [setNavigationSearchVisible]);

  const loadPage = useCallback(async (page: number, replace: boolean, generation: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await api.books.list({ query: debouncedQuery, page, pageSize, sort, direction });
      if (generation !== generationRef.current) return;
      setBooks((existing) => {
        if (replace) return response.items;
        const merged = new Map(existing.map((book) => [book.isbn, book]));
        response.items.forEach((book) => merged.set(book.isbn, book));
        return [...merged.values()];
      });
      setCurrentPage(response.pagination.page);
      setHasNext(response.pagination.has_next);
      setError("");
    } catch (reason) {
      if (generation === generationRef.current) {
        setError(reason instanceof ApiError ? reason.message : "Unable to load the catalog.");
      }
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [debouncedQuery, direction, sort]);

  useEffect(() => {
    generationRef.current += 1;
    loadingRef.current = false;
    setBooks([]);
    setCurrentPage(0);
    setHasNext(true);
    setNotice("");
    void loadPage(1, true, generationRef.current);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinel.current || !hasNext || loading || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        void loadPage(currentPage + 1, false, generationRef.current);
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [currentPage, hasNext, loadPage, loading]);

  async function add(book: Book) {
    try {
      const available = await cart.add(book);
      setNotice(available ? `${book.title} was added to your cart.` : "");
      setError(available ? "" : "The requested quantity is not available.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to update the cart.");
    }
  }

  return (
    <>
      <section
        ref={hero}
        className="mb-16 grid min-h-[min(68vh,720px)] grid-cols-[1.2fr_0.8fr] bg-brand text-white dark:bg-[#243e30] max-[850px]:grid-cols-1"
        aria-label="Catalog introduction"
      >
        <div className="flex flex-col justify-between p-[clamp(2rem,6vw,6rem)]">
          <h1 className="max-w-[850px] font-display text-[clamp(4rem,9vw,8rem)] leading-[0.82] font-semibold tracking-[-0.04em]">
            Find your next story.
          </h1>
        </div>
        <div className="flex flex-col justify-end bg-paper p-[clamp(2rem,5vw,5rem)] text-ink dark:bg-[#181c18] dark:text-[#f2eee4]">
          <p className={eyebrowClass}>Browse the collection</p>
          <p className="mb-10 max-w-md font-display text-3xl leading-tight">
            Search by title, author, category or ISBN.
          </p>
          <CatalogSearchBar />
        </div>
      </section>
      <Message>{error}</Message>
      <Message tone="success">{notice}</Message>
      {loading && books.length === 0 ? <p className={feedbackStateClass}>Loading books…</p> : (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-14" aria-label="Book catalog">
          {books.map((book) => <BookCard key={book.isbn} book={book} onDetails={setSelected} onAdd={add} />)}
        </section>
      )}
      {!loading && books.length === 0 && <p className={feedbackStateClass}>No book matches your search.</p>}
      <div
        ref={sentinel}
        className="mt-12 min-h-20 border-t border-line py-8 text-center italic text-[#686157] dark:border-[#514c44] dark:text-[#aaa298]"
        aria-label="Catalog loading status"
        aria-live="polite"
      >
        {loading && books.length > 0 && "Loading more books…"}
        {!loading && books.length > 0 && !hasNext && "You reached the end of the catalog."}
      </div>
      {selected && <BookModal book={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
