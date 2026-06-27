import { render, screen } from "@testing-library/react";
import { Message } from "./Message";

describe("Message", () => {
  it("renders feedback inside a full rectangular border", () => {
    render(<Message>Incorrect email or password</Message>);

    const message = screen.getByRole("alert");
    expect(message).toHaveClass("border");
    expect(message).toHaveClass("px-4");
    expect(message).toHaveTextContent("Incorrect email or password");
  });

  it("uses status semantics for success feedback", () => {
    render(<Message tone="success">A temporary password was sent.</Message>);

    expect(screen.getByRole("status")).toHaveTextContent("A temporary password was sent.");
  });
});
