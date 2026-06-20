import type { Book } from "../../domain/models";
import { buttonClass } from "../styles";

export function BookCard({
  book,
  onDetails,
  onAdd,
}: {
  book: Book;
  onDetails(book: Book): void;
  onAdd(book: Book): void;
  }) {
  return (
    <article className="group grid grid-rows-[360px_1fr] bg-paper p-6 dark:bg-[#111411]">
      <button
        className="block h-[360px] w-full cursor-pointer overflow-hidden"
        onClick={() => onDetails(book)}
        aria-label={`Details for ${book.title}`}
      >
        <img className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" src={book.image_url || "/icon.png"} alt="" loading="lazy" />
      </button>
      <div className="flex flex-col pt-4">
        <p className="mb-2 text-[0.65rem] font-bold tracking-[0.14em] text-brand uppercase dark:text-[#9cbba7]">{book.category || "Book"}</p>
        <h3 className="mb-1 min-h-[3rem] font-display text-xl leading-tight font-semibold">{book.title}</h3>
        <p className="mb-4 italic text-[#686157] dark:text-[#aaa298]">{book.author}</p>
        <div className="mt-auto flex items-center justify-between gap-4">
          <strong className="font-semibold">{book.price.toFixed(2)} CAD</strong>
          <button className={`${buttonClass} px-3 py-2`} onClick={() => onAdd(book)} disabled={book.quantity === 0}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
