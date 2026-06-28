import { render, screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("link", { name: /MailHog/i })).toHaveAttribute(
      "href",
      "https://mailhog.navabe.bertawz.dev",
    );
    const mailhogCredentials = screen.getByLabelText("MailHog credentials");
    expect(mailhogCredentials).toHaveTextContent("url: https://mailhog.navabe.bertawz.dev");
    expect(mailhogCredentials).toHaveTextContent("username: navabe-demo");
    expect(mailhogCredentials).toHaveTextContent("password: 8SFwlh2m6NE3TA74y6Q9K2ABlSOIBaeC");
    expect(screen.getByRole("link", { name: "Open Management Portal" })).toHaveAttribute("href", "/management");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Management portal access" })).toBeInTheDocument();
    expect(screen.getByText(/click the link in the navbar and use the credentials below/i)).toBeInTheDocument();
    expect(screen.queryByText(/database migration/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Forgot password/i)).not.toBeInTheDocument();
    const credentials = screen.getByLabelText("Management portal credentials");
    expect(credentials.tagName.toLowerCase()).toBe("pre");
    expect(credentials).toHaveClass("font-mono", "bg-paper");
    expect(within(credentials).getByText("manager id")).toHaveClass("font-bold", "lowercase");
    expect(within(credentials).getByText("email")).toHaveClass("font-bold", "lowercase");
    expect(within(credentials).getByText("password")).toHaveClass("font-bold", "lowercase");
    expect(credentials).toHaveTextContent("manager id: RTMGM1");
    expect(credentials).toHaveTextContent("email: root.manager@test.navabe.bertawz.dev");
    expect(credentials).toHaveTextContent("password: 74?PluieSoleilPariesien%25");
    expect(screen.getByText(/PayPal runs in sandbox mode/i)).toBeInTheDocument();
  });
});
