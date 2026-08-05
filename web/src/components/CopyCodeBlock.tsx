"use client";

import { useRef } from "react";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { LiveStatus } from "@/components/LiveStatus";
import { lab } from "@/ui/lab";

export { COPY_FEEDBACK_MS } from "@/hooks/use-copy-to-clipboard";

type CopyCodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
  /**
   * What this block contains, e.g. "the compose command". Names both the
   * scroll region and the copy button, which would otherwise be identical on
   * pages carrying a dozen of them.
   */
  name?: string;
};

export function CopyCodeBlock({
  children,
  className,
  name = "code",
}: CopyCodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  return (
    <>
      {/* The <pre> scrolls horizontally, so it must be focusable for keyboard
          users to reach the overflow (WCAG 2.1.1). */}
      <pre
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={name}
        className={`relative ${lab.focusRing} ${className ?? ""}`}
      >
        <button
          type="button"
          onClick={() => copy(ref.current?.innerText ?? "")}
          aria-label={copied ? "Copied" : `Copy ${name}`}
          className={`absolute right-2 top-2 ${lab.iconButtonXs}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        {children}
      </pre>
      {/* Deliberately outside the <pre>: copy() reads its innerText, so a
          nested live region would be pasted along with the code. */}
      <LiveStatus message={copied ? `Copied ${name} to clipboard` : ""} />
    </>
  );
}
