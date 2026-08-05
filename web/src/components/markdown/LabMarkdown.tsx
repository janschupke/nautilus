"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { LabTable } from "@/components/LabTable";
import { lab } from "@/ui/lab";

const mdProse = "mb-4 text-lg leading-relaxed text-zinc-300 last:mb-0";

function PromptParagraph({ children }: { children?: React.ReactNode }) {
  return <p className={mdProse}>{children}</p>;
}

function PromptInlineCode({ children }: { children?: React.ReactNode }) {
  return <code className={lab.docCode}>{children}</code>;
}

/** Prompts and short intros: paragraphs + inline code only. */
export function createPromptMarkdownComponents(): Components {
  return {
    p: PromptParagraph,
    code: PromptInlineCode,
    strong: ({ children }) => (
      <strong className="font-semibold text-zinc-100">{children}</strong>
    ),
  };
}

function SolutionParagraph({ children }: { children?: React.ReactNode }) {
  return <p className={mdProse}>{children}</p>;
}

function SolutionPre({ children }: { children?: React.ReactNode }) {
  return (
    <CopyCodeBlock
      name="code block"
      className="mb-4 overflow-x-auto rounded-md border border-stroke bg-black/50 p-4 font-mono text-base text-zinc-100 last:mb-0"
    >
      {children}
    </CopyCodeBlock>
  );
}

function SolutionCode({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const isBlock =
    typeof className === "string" && className.includes("language-");
  if (isBlock) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code className={lab.docCode} {...props}>
      {children}
    </code>
  );
}

function SolutionUl({ children }: { children?: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-lg text-zinc-300">
      {children}
    </ul>
  );
}

function SolutionLi({ children }: { children?: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

function SolutionStrong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-semibold text-zinc-100">{children}</strong>;
}

/** Solutions: adds block code, lists, emphasis. */
export function createSolutionMarkdownComponents(): Components {
  return {
    p: SolutionParagraph,
    pre: SolutionPre,
    code: SolutionCode,
    ul: SolutionUl,
    li: SolutionLi,
    strong: SolutionStrong,
  };
}

function SummaryParagraph({ children }: { children?: React.ReactNode }) {
  return <p className="text-lg leading-relaxed text-zinc-300">{children}</p>;
}

function SummaryH1({ children }: { children?: React.ReactNode }) {
  return (
    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
      {children}
    </h1>
  );
}

function SummaryH2({ children }: { children?: React.ReactNode }) {
  return (
    <h2 className="border-b border-zinc-800 pb-2 text-2xl font-semibold tracking-tight text-zinc-50">
      {children}
    </h2>
  );
}

function SummaryH3({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
      {children}
    </h3>
  );
}

function SummaryUl({ children }: { children?: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-lg leading-relaxed text-zinc-300">
      {children}
    </ul>
  );
}

function SummaryOl({ children }: { children?: React.ReactNode }) {
  return (
    <ol className="list-decimal space-y-2 pl-6 text-lg leading-relaxed text-zinc-300">
      {children}
    </ol>
  );
}

function SummaryLi({ children }: { children?: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

function SummaryHr() {
  return <hr className="border-zinc-800" />;
}

function SummaryBlockquote({ children }: { children?: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-accent pl-4 text-lg italic text-zinc-400">
      {children}
    </blockquote>
  );
}

function SummaryTable({ children }: { children?: React.ReactNode }) {
  return <LabTable caption="Reference table">{children}</LabTable>;
}

function SummaryTh({ children }: { children?: React.ReactNode }) {
  // GFM only emits <th> in the header row, so the scope is always columnar.
  return (
    <th scope="col" className={lab.tableTh}>
      {children}
    </th>
  );
}

function SummaryTd({ children }: { children?: React.ReactNode }) {
  return <td className={lab.tableTd}>{children}</td>;
}

function SummaryA({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const external =
    typeof href === "string" &&
    (href.startsWith("http://") || href.startsWith("https://"));
  return (
    <a
      href={href}
      className={lab.linkExternal}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
      {...rest}
    >
      {children}
      {/* Warn before the link steals the tab away. */}
      {external && <span className={lab.srOnly}> (opens in a new tab)</span>}
    </a>
  );
}

/** Module `summary.md`: headings, lists, tables (GFM), links, code blocks. */
export function createSummaryMarkdownComponents(): Components {
  return {
    h1: SummaryH1,
    h2: SummaryH2,
    h3: SummaryH3,
    p: SummaryParagraph,
    pre: SolutionPre,
    code: SolutionCode,
    ul: SummaryUl,
    ol: SummaryOl,
    li: SummaryLi,
    strong: SolutionStrong,
    em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
    hr: SummaryHr,
    blockquote: SummaryBlockquote,
    table: SummaryTable,
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: SummaryTh,
    td: SummaryTd,
    a: SummaryA,
  };
}

type LabMarkdownProps = {
  markdown: string;
  variant: "prompt" | "solution" | "summary";
};

export function LabMarkdown({ markdown, variant }: LabMarkdownProps) {
  if (variant === "summary") {
    return (
      <div className="flex flex-col gap-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={createSummaryMarkdownComponents()}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }

  const components =
    variant === "solution"
      ? createSolutionMarkdownComponents()
      : createPromptMarkdownComponents();
  return <ReactMarkdown components={components}>{markdown}</ReactMarkdown>;
}
