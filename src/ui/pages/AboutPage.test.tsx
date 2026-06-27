import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AboutPage } from "./AboutPage";

function renderAboutPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe("AboutPage", () => {
  it("explains the public demo, MailHog, management access and PayPal sandbox", () => {
    renderAboutPage();

    expect(screen.getByRole("heading", { name: "About Navabe Bookstore" })).toBeInTheDocument();
    expect(screen.getByText(/Please do not use a real email address/i)).toBeInTheDocument();
    expect(screen.getByText(/examples:/i)).toBeInTheDocument();
    expect(screen.getByText(/test@test.ca/i)).toBeInTheDocument();
    expect(screen.getByText("test@test.ca").tagName.toLowerCase()).not.toBe("code");
    expect(screen.getByText("reader@example.com").tagName.toLowerCase()).not.toBe("code");
    expect(screen.getByRole("link", { name: /Mailhog/i })).toHaveAttribute(
      "href",
      "https://mailhog.navabe.bertawz.dev",
    );
    expect(screen.getByRole("link", { name: "Open Management Portal" })).toHaveAttribute("href", "/management");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const credentials = screen.getByLabelText("Management portal credentials");
    expect(credentials.tagName.toLowerCase()).toBe("pre");
    expect(credentials).toHaveClass("font-mono", "bg-paper");
    expect(screen.getByText("manager id")).toHaveClass("font-bold", "lowercase");
    expect(screen.getByText("password")).toHaveClass("font-bold", "lowercase");
    expect(credentials).toHaveTextContent("manager id: DMGM01");
    expect(credentials).toHaveTextContent("password: &Default_89_Manager");
    expect(screen.getByText(/PayPal runs in sandbox mode/i)).toBeInTheDocument();
  });
});
