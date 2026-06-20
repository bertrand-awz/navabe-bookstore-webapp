import type { Book, CartItem } from "../domain/models";

export type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; book: Book }
  | { type: "increment"; isbn: string }
  | { type: "decrement"; isbn: string }
  | { type: "remove"; isbn: string }
  | { type: "clear" };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((item) => item.isbn === action.book.isbn);
      return existing
        ? state.map((item) =>
            item.isbn === action.book.isbn ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
          )
        : [...state, { ...action.book, cartQuantity: 1 }];
    }
    case "increment":
      return state.map((item) =>
        item.isbn === action.isbn ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
      );
    case "decrement":
      return state
        .map((item) =>
          item.isbn === action.isbn ? { ...item, cartQuantity: item.cartQuantity - 1 } : item,
        )
        .filter((item) => item.cartQuantity > 0);
    case "remove":
      return state.filter((item) => item.isbn !== action.isbn);
    case "clear":
      return [];
  }
}

export const cartTotal = (items: CartItem[]) =>
  Number(items.reduce((total, item) => total + item.price * item.cartQuantity, 0).toFixed(2));

export const cartCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.cartQuantity, 0);

