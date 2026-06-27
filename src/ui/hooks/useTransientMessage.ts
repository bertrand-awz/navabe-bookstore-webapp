import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const TRANSIENT_MESSAGE_TIMEOUT_MS = 7000;

export function useTransientMessage(
  timeout = TRANSIENT_MESSAGE_TIMEOUT_MS,
): [string, Dispatch<SetStateAction<string>>] {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => setMessage(""), timeout);
    return () => window.clearTimeout(timeoutId);
  }, [message, timeout]);

  return [message, setMessage];
}
