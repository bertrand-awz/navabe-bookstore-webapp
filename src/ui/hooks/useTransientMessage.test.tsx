import { act, fireEvent, render, screen } from "@testing-library/react";
import { Message } from "../components/Message";
import { TRANSIENT_MESSAGE_TIMEOUT_MS, useTransientMessage } from "./useTransientMessage";

function DemoMessage() {
  const [message, setMessage] = useTransientMessage();
  return (
    <>
      <button onClick={() => setMessage("Temporary feedback")}>Show message</button>
      <Message>{message}</Message>
    </>
  );
}

describe("useTransientMessage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears a message after seven seconds and allows the same message again", () => {
    vi.useFakeTimers();
    render(<DemoMessage />);

    fireEvent.click(screen.getByRole("button", { name: "Show message" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Temporary feedback");

    act(() => {
      vi.advanceTimersByTime(TRANSIENT_MESSAGE_TIMEOUT_MS);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show message" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Temporary feedback");
  });
});
