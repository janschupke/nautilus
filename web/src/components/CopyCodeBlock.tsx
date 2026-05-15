"use client";

import { useRef } from "react";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export { COPY_FEEDBACK_MS } from "@/hooks/use-copy-to-clipboard";

type CopyCodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
};

export function CopyCodeBlock({ children, className }: CopyCodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  return (
    <pre ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => copy(ref.current?.innerText ?? "")}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {children}
    </pre>
  );
}
