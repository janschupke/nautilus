import { useState } from "react";

export const COPY_FEEDBACK_MS = 1500;

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    });
  }

  return { copied, copy };
}
