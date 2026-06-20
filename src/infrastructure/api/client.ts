import type {
  Book,
  BookPage,
  CatalogSortField,
  Manager,
  OrderDetails,
  SortDirection,
  Statistic,
  User,
} from "../../domain/models";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "api_error",
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message ?? "The API request failed", response.status, body.code);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  books: {
    list: ({
      query = "",
      page = 1,
      pageSize = 24,
      sort = "title",
      direction = "asc",
    }: {
      query?: string;
      page?: number;
      pageSize?: number;
      sort?: CatalogSortField;
      direction?: SortDirection;
    } = {}) => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: String(pageSize),
        sort,
        direction,
      });
      return request<BookPage>(`/books?${params}`);
    },
    availability: (isbn: string, quantity: number) =>
      request<{ available: boolean }>(`/books/${isbn}/availability?quantity=${quantity}`),
  },
  auth: {
    me: () => request<User>("/auth/me"),
    login: (email: string, password: string) => request<User>("/auth/login", json("POST", { email, password })),
    register: (body: Record<string, string>) => request<User>("/auth/register", json("POST", body)),
    logout: () => request<void>("/auth/logout", json("POST")),
    changePassword: (password: string) => request<void>("/auth/password", json("PATCH", { password })),
    recover: (identifier: string) => request<void>("/auth/recovery", json("POST", { identifier })),
  },
  orders: {
    create: (transaction_id: string, amount: number, lines: Array<{ isbn: string; quantity: number }>) =>
      request<{ identifier: string }>("/orders", json("POST", { transaction_id, amount, lines })),
  },
  admin: {
    session: () => request<{ authenticated: boolean; identifier?: string }>("/admin/auth/session"),
    login: (identifier: string, password: string) =>
      request<Manager>("/admin/auth/login", json("POST", { identifier, password })),
    logout: () => request<void>("/admin/auth/logout", json("POST")),
    recover: (identifier: string) => request<void>("/admin/auth/recovery", json("POST", { identifier })),
    books: (query = "") => request<Book[]>(`/admin/books?q=${encodeURIComponent(query)}`),
    saveBook: (book: Partial<Book> & { quantity: number }) => request<Book>("/admin/books", json("POST", book)),
    deleteBook: (isbn: string) => request<void>(`/admin/books/${isbn}`, json("DELETE")),
    createManager: (body: { name: string; first_name: string; email: string }) =>
      request<Manager>("/admin/administrators", json("POST", body)),
    order: (identifier: string) => request<OrderDetails>(`/admin/orders/${identifier}`),
    statistic: (metric: string, groupBy = "") =>
      request<Statistic>(`/admin/statistics/${metric}?group_by=${groupBy}`),
  },
};
