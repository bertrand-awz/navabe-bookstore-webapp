import { createContext, useContext, useMemo, useState } from "react";
import type { CatalogSortValue } from "../../domain/models";

interface CatalogSearchValue {
  query: string;
  setQuery(query: string): void;
  sortValue: CatalogSortValue;
  setSortValue(sort: CatalogSortValue): void;
  navigationSearchVisible: boolean;
  setNavigationSearchVisible(visible: boolean): void;
}

const CatalogSearchContext = createContext<CatalogSearchValue | null>(null);

export function CatalogSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [sortValue, setSortValue] = useState<CatalogSortValue>("title:asc");
  const [navigationSearchVisible, setNavigationSearchVisible] = useState(false);
  const value = useMemo(
    () => ({
      query,
      setQuery,
      sortValue,
      setSortValue,
      navigationSearchVisible,
      setNavigationSearchVisible,
    }),
    [navigationSearchVisible, query, sortValue],
  );

  return <CatalogSearchContext.Provider value={value}>{children}</CatalogSearchContext.Provider>;
}

export function useCatalogSearch() {
  const context = useContext(CatalogSearchContext);
  if (!context) throw new Error("useCatalogSearch must be used inside CatalogSearchProvider");
  return context;
}
