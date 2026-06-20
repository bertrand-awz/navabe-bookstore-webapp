import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { cartCount, cartReducer, cartTotal } from "../../application/cart";
import type { Book, CartItem } from "../../domain/models";
import { api } from "../../infrastructure/api/client";

interface CartValue {
  items: CartItem[];
  count: number;
  total: number;
  add(book: Book): Promise<boolean>;
  increment(item: CartItem): Promise<boolean>;
  decrement(isbn: string): void;
  remove(isbn: string): void;
  clear(): void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(
    cartReducer,
    [],
    () => JSON.parse(localStorage.getItem("navabe-cart") ?? "[]") as CartItem[],
  );

  useEffect(() => localStorage.setItem("navabe-cart", JSON.stringify(items)), [items]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: cartCount(items),
      total: cartTotal(items),
      async add(book) {
        const quantity = (items.find((item) => item.isbn === book.isbn)?.cartQuantity ?? 0) + 1;
        const { available } = await api.books.availability(book.isbn, quantity);
        if (available) dispatch({ type: "add", book });
        return available;
      },
      async increment(item) {
        const { available } = await api.books.availability(item.isbn, item.cartQuantity + 1);
        if (available) dispatch({ type: "increment", isbn: item.isbn });
        return available;
      },
      decrement: (isbn) => dispatch({ type: "decrement", isbn }),
      remove: (isbn) => dispatch({ type: "remove", isbn }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

