import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ArrowsUpDownIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FormEvent, useId } from "react";
import type { CatalogSortValue } from "../../domain/models";
import { useCatalogSearch } from "../context/CatalogSearchContext";

const sortGroups: Array<{
  label: string;
  options: Array<{ value: CatalogSortValue; label: string; selectedLabel: string }>;
}> = [
  {
    label: "Title",
    options: [
      { value: "title:asc", label: "A to Z", selectedLabel: "Title: A to Z" },
      { value: "title:desc", label: "Z to A", selectedLabel: "Title: Z to A" },
    ],
  },
  {
    label: "Price",
    options: [
      { value: "price:asc", label: "Low to high", selectedLabel: "Price: low to high" },
      { value: "price:desc", label: "High to low", selectedLabel: "Price: high to low" },
    ],
  },
  {
    label: "Publication",
    options: [
      { value: "publication_year:desc", label: "Newest first", selectedLabel: "Publication: newest first" },
      { value: "publication_year:asc", label: "Oldest first", selectedLabel: "Publication: oldest first" },
    ],
  },
];

const sortOptions = sortGroups.flatMap((group) => group.options);

export function CatalogSearchBar({
  inputLabel = "Search books",
  compact = false,
}: {
  inputLabel?: string;
  compact?: boolean;
}) {
  const inputId = useId();
  const { query, setQuery, setSortValue, sortValue } = useCatalogSearch();
  const selectedSort = sortOptions.find((option) => option.value === sortValue) ?? sortOptions[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(query.trim());
  }

  return (
    <form className="mx-auto w-full max-w-2xl" role="search" onSubmit={submit}>
      <div className="flex -space-x-px shadow-xs">
        <Menu as="div" className="relative shrink-0">
          <MenuButton
            className={`relative z-10 inline-flex h-full max-w-52 cursor-pointer items-center gap-2 border border-line bg-canvas font-semibold text-ink hover:bg-line/45 focus:z-20 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-[#454b44] dark:bg-[#111411] dark:text-[#f2eee4] dark:hover:bg-[#252b25] dark:focus:border-[#82a991] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"}`}
            aria-label={selectedSort.selectedLabel}
          >
            <ArrowsUpDownIcon className="size-4 shrink-0 text-brand dark:text-[#9cbba7]" aria-hidden="true" />
            <span className="max-w-36 truncate max-[520px]:sr-only">{selectedSort.selectedLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0" aria-hidden="true" />
          </MenuButton>
          <MenuItems
            transition
            className="absolute top-full left-0 z-30 mt-2 max-h-80 w-56 origin-top-left divide-y divide-line overflow-y-auto border border-line bg-paper shadow-lg outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 dark:divide-[#454b44] dark:border-[#454b44] dark:bg-[#181c18]"
          >
            {sortGroups.map((group) => (
              <div className="py-2" role="group" aria-label={group.label} key={group.label}>
                <p className="px-3 pb-1 text-[0.65rem] font-bold tracking-[0.16em] text-brand uppercase dark:text-[#9cbba7]">
                  {group.label}
                </p>
                {group.options.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-ink data-focus:bg-brand data-focus:text-white data-focus:outline-none dark:text-[#f2eee4] dark:data-focus:bg-[#315b45]"
                      type="button"
                      onClick={() => setSortValue(option.value)}
                    >
                      {option.label}
                    </button>
                  </MenuItem>
                ))}
              </div>
            ))}
          </MenuItems>
        </Menu>
        <label className="sr-only" htmlFor={inputId}>{inputLabel}</label>
        <input
          id={inputId}
          className={`relative min-w-0 flex-1 border-y border-line bg-paper text-ink outline-none placeholder:text-[#6f695f] focus:z-20 focus:border-brand focus:ring-1 focus:ring-brand/20 dark:border-[#454b44] dark:bg-[#191d19] dark:text-[#f2eee4] dark:placeholder:text-[#8e948c] dark:focus:border-[#82a991] ${compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-base"}`}
          aria-label={inputLabel}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, author, category or ISBN"
        />
        <button
          className={`relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border border-brand bg-brand font-bold tracking-[0.08em] text-white uppercase hover:border-brand-dark hover:bg-brand-dark focus:z-20 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-[#82a991] dark:bg-[#82a991] dark:text-[#101510] dark:hover:border-[#9cbba7] dark:hover:bg-[#9cbba7] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-xs"}`}
          type="submit"
        >
          <MagnifyingGlassIcon className="size-4" aria-hidden="true" />
          <span className="max-[520px]:sr-only">Search</span>
        </button>
      </div>
    </form>
  );
}
