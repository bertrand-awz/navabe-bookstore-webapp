export interface Book {
  isbn: string;
  title: string;
  author: string;
  editor: string;
  category: string;
  synopsis: string;
  publication_year: number | null;
  price: number;
  image_url: string;
  quantity: number | null;
}

export type CatalogSortField = "title" | "price" | "publication_year";
export type SortDirection = "asc" | "desc";
export type CatalogSortValue = `${CatalogSortField}:${SortDirection}`;

export interface BookPage {
  items: Book[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  sort: {
    field: CatalogSortField;
    direction: SortDirection;
  };
}

export interface CartItem extends Book {
  cartQuantity: number;
}

export interface User {
  identifier: string;
  name: string;
  first_name: string;
  address: string;
  email: string;
}

export interface Manager {
  identifier: string;
  name: string;
  first_name: string;
  email: string;
}

export interface OrderDetails {
  identifier: string;
  customer: string;
  transaction_id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string;
  items: Array<{ isbn: string; title_by_author: string; book_price: number; quantity: number }>;
}

export interface Statistic {
  labels: string[];
  values: number[];
}
