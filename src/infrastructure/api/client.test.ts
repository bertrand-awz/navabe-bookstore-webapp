import { ApiError, api } from "./client";

describe("API client", () => {
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
