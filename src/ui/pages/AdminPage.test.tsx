import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "../../infrastructure/api/client";
import { AdminPage } from "./AdminPage";

vi.mock("../../infrastructure/api/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../infrastructure/api/client")>();
  return {
    ...original,
    api: {
      ...original.api,
      admin: {
        ...original.api.admin,
        session: vi.fn(),
        login: vi.fn(),
        recover: vi.fn(),
        statistic: vi.fn(),
      },
    },
  };
});

describe("Management Portal access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: false });
    vi.mocked(api.admin.recover).mockResolvedValue(undefined);
    vi.mocked(api.admin.statistic).mockResolvedValue({ labels: [], values: [] });
  });

  it("shows login and account recovery as mutually exclusive views", async () => {
    render(<AdminPage />);

    expect(await screen.findByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recover management account" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/administrator/i);

    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect(screen.getByRole("heading", { name: "Recover management account" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Management Portal" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Manager ID"), { target: { value: "MG0001" } });
    fireEvent.click(screen.getByRole("button", { name: "Send temporary password" }));
    await waitFor(() => expect(api.admin.recover).toHaveBeenCalledWith("MG0001"));

    fireEvent.click(screen.getByRole("button", { name: "Back to login" }));

    expect(screen.getByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recover management account" })).not.toBeInTheDocument();
  });

  it("uses manager terminology in the authenticated portal", async () => {
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: true });

    render(<AdminPage />);

    expect(await screen.findByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Managers" }));

    expect(screen.getByRole("heading", { name: "Create manager" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/administrator/i);
  });
});
