import { useEffect } from "react";
import type { Book } from "../../domain/models";
import { eyebrowClass, sectionTitleClass } from "../styles";

export function BookModal({ book, onClose }: { book: Book; onClose(): void }) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-none bg-black/60 p-4 backdrop-blur-md"
      role="presentation"
      onClick={onClose}
    >
      <article
        className="relative grid max-h-[92vh] w-full max-w-[1040px] grid-cols-[1fr_1fr] overflow-auto bg-paper dark:bg-[#181c18] max-[650px]:grid-cols-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute top-4 right-5 z-10 cursor-pointer bg-transparent text-3xl leading-none text-ink dark:text-[#f2eee4]"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex min-h-[560px] items-center justify-center bg-canvas p-[clamp(2rem,5vw,5rem)] dark:bg-[#111411] max-[650px]:min-h-0">
          <img className="max-h-[430px] w-full object-contain max-[560px]:max-h-60" src={book.image_url || "/icon.png"} alt="" />
        </div>
        <div className="flex flex-col justify-center p-[clamp(2rem,5vw,5rem)]">
          <p className={eyebrowClass}>{book.category || "Book"} · {book.publication_year || "Unknown year"}</p>
          <h2 className={`${sectionTitleClass} pr-8`} id="book-title">{book.title}</h2>
          <h3 className="mb-6 text-xl italic">{book.author}</h3>
          <p className="mb-8 max-w-prose text-lg leading-relaxed">{book.synopsis || "No synopsis available."}</p>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 border-t border-line pt-5 dark:border-[#3f453f]">
            <dt className="text-xs font-bold tracking-[0.14em] uppercase">ISBN</dt><dd>{book.isbn}</dd>
            <dt className="text-xs font-bold tracking-[0.14em] uppercase">Editor</dt><dd>{book.editor || "Unknown"}</dd>
            <dt className="text-xs font-bold tracking-[0.14em] uppercase">Stock</dt><dd>{book.quantity ?? "Unknown"}</dd>
          </dl>
        </div>
      </article>
    </div>
  );
}
