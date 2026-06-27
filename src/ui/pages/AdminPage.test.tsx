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
        createManager: vi.fn(),
        changePassword: vi.fn(),
        logout: vi.fn(),
        statistic: vi.fn(),
      },
    },
  };
});

describe("Management Portal access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: false, must_change_password: false });
    vi.mocked(api.admin.login).mockResolvedValue({
      identifier: "MG0001",
      name: "Manager",
      first_name: "Root",
      email: "root.manager@example.com",
      must_change_password: false,
    });
    vi.mocked(api.admin.recover).mockResolvedValue(undefined);
    vi.mocked(api.admin.createManager).mockResolvedValue(undefined);
    vi.mocked(api.admin.changePassword).mockResolvedValue(undefined);
    vi.mocked(api.admin.logout).mockResolvedValue(undefined);
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
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: true, must_change_password: false });
    vi.mocked(api.admin.statistic).mockResolvedValue({ labels: ["Fiction"], values: [12.5] });

    render(<AdminPage />);

    expect(await screen.findByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Average prices" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Managers" }));

    expect(screen.getByRole("heading", { name: "Create manager" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/administrator/i);
  });

  it("shows manager creation success even when the 201 response has no body", async () => {
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: true, must_change_password: false });

    render(<AdminPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Managers" }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Root" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Manager" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "root.manager@test.navabe.bertawz.dev" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create manager" }));

    await waitFor(() => expect(api.admin.createManager).toHaveBeenCalledWith({
      first_name: "Root",
      name: "Manager",
      email: "root.manager@test.navabe.bertawz.dev",
    }));
    expect(await screen.findByText("Manager was created and received a temporary password.")).toBeInTheDocument();
  });

  it("forces managers with temporary passwords to change them before portal access", async () => {
    vi.mocked(api.admin.session).mockResolvedValue({ authenticated: true, must_change_password: true });

    render(<AdminPage />);

    expect(await screen.findByRole("heading", { name: "Change temporary password" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Managers" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-secret" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "new-secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(api.admin.changePassword).toHaveBeenCalledWith("new-secret"));
    expect(await screen.findByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
  });

  it("forces password change after logging in with a temporary manager password", async () => {
    vi.mocked(api.admin.login).mockResolvedValue({
      identifier: "MG0001",
      name: "Manager",
      first_name: "Root",
      email: "root.manager@example.com",
      must_change_password: true,
    });

    render(<AdminPage />);

    expect(await screen.findByRole("heading", { name: "Management Portal" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Manager ID"), { target: { value: "MG0001" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "temporary" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("heading", { name: "Change temporary password" })).toBeInTheDocument();
  });
});
