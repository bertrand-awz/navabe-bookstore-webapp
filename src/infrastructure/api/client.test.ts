import { ApiError, api, resolveApiUrl } from "./client";

describe("API client", () => {
  it("uses the configured API URL in production", () => {
    expect(resolveApiUrl({ PROD: true, VITE_API_URL: "https://api.navabe.bertawz.dev/api/v1/" })).toBe(
      "https://api.navabe.bertawz.dev/api/v1",
    );
  });

  it("rejects local API URLs in production", () => {
    expect(() => resolveApiUrl({ PROD: true, VITE_API_URL: "http://localhost:5173/recovery" })).toThrow(
      "VITE_API_URL must use HTTPS in production.",
    );
    expect(() => resolveApiUrl({ PROD: true, VITE_API_URL: "https://localhost:5173/api/v1" })).toThrow(
      "VITE_API_URL must not point to a local host in production.",
    );
  });

  it("keeps the local fallback for development only", () => {
    expect(resolveApiUrl({ PROD: false })).toBe("http://localhost:5000/api/v1");
  });

  it("sends credentials and maps API errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ code: "invalid_credentials", message: "Incorrect email or password" }),
    }));

    await expect(api.auth.login("john@example.com", "wrong")).rejects.toEqual(
      new ApiError("Incorrect email or password", 401, "invalid_credentials"),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
  });

  it("requests a sorted catalog page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        items: [],
        pagination: { page: 2, page_size: 24, total: 24, total_pages: 1, has_next: false, has_previous: true },
        sort: { field: "price", direction: "desc" },
      }),
    }));

    await api.books.list({ query: "fiction", page: 2, pageSize: 24, sort: "price", direction: "desc" });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/books?q=fiction&page=2&page_size=24&sort=price&direction=desc"),
      expect.any(Object),
    );
  });

  it("accepts successful manager creation without a response body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => "",
    }));

    await expect(api.admin.createManager({
      name: "Manager",
      first_name: "Root",
      email: "root.manager@example.com",
    })).resolves.toBeUndefined();
  });
});
