import { cartCount, cartReducer, cartTotal } from "./cart";
import type { Book } from "../domain/models";

const book: Book = {
  isbn: "9780020199854",
  title: "The Love of the Last Tycoon",
  author: "F. Scott Fitzgerald",
  editor: "Scribner",
  category: "Fiction",
  synopsis: "",
  publication_year: 1994,
  price: 25,
  image_url: "",
  quantity: 4,
};

describe("cart domain", () => {
  it("adds a book once and then increments the existing line", () => {
    const first = cartReducer([], { type: "add", book });
    const second = cartReducer(first, { type: "add", book });

    expect(second).toHaveLength(1);
    expect(second[0].cartQuantity).toBe(2);
    expect(cartCount(second)).toBe(2);
    expect(cartTotal(second)).toBe(50);
  });

  it("removes the line when its quantity reaches zero", () => {
    const state = cartReducer([{ ...book, cartQuantity: 1 }], { type: "decrement", isbn: book.isbn });
    expect(state).toEqual([]);
  });
});

