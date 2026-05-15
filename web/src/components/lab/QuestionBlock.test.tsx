import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LabQuestion } from "@/lib/types";
import { QuestionBlock } from "./QuestionBlock";

const sampleQuestion: LabQuestion = {
  id: "q1",
  prompt: "Run `echo hi`",
  expectedOutput: "hi",
  solutionMarkdown: "Use `echo`.",
};

describe("QuestionBlock", () => {
  it("calls onCheck with current draft when Check answer is clicked", async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft="hi"
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={onCheck}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await waitFor(() => expect(onCheck).toHaveBeenCalledWith("hi"));
  });

  it("calls onToggle when the accordion trigger is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded={false}
        onToggle={onToggle}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Question 1/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows result badges for checked answers", () => {
    const { rerender } = render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft="x"
        result="correct"
        isExpanded={false}
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    expect(screen.getByText("Correct")).toBeInTheDocument();

    rerender(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft="y"
        result="incorrect"
        isExpanded={false}
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
  });

  it("calls onDraftChange when typing in the textarea", async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={onDraftChange}
        onCheck={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText(/Your answer/i), "a");
    await waitFor(() => expect(onDraftChange).toHaveBeenCalled());
  });

  it("uses a single-line input for short unstructured expected answers", () => {
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: /^Your answer$/ }),
    ).toBeInTheDocument();
  });

  it("uses a textarea when answerFormat is multiline", () => {
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={{ ...sampleQuestion, answerFormat: "multiline" }}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: /Your answer \(stdout\)/i }),
    ).toBeInTheDocument();
  });

  it("opens accepted-answers modal and shows expectedOutput", async () => {
    const user = userEvent.setup();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Accepted answers" }));
    expect(
      screen.getByRole("dialog", { name: /Accepted answers/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("shows all acceptedOutputs in the modal", async () => {
    const user = userEvent.setup();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={{ ...sampleQuestion, acceptedOutputs: ["hello", "hey"] }}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Accepted answers" }));
    expect(screen.getByText("hi")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("hey")).toBeInTheDocument();
  });

  it("closes the accepted-answers modal on Escape", async () => {
    const user = userEvent.setup();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Accepted answers" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal when Close is clicked", async () => {
    const user = userEvent.setup();
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft=""
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Accepted answers" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables check and textarea while onCheck is pending", async () => {
    const user = userEvent.setup();
    let resolveCheck: (() => void) | undefined;
    const onCheck = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    render(
      <QuestionBlock
        topicId="m1"
        index={0}
        question={sampleQuestion}
        draft="hi"
        result="idle"
        isExpanded
        onToggle={vi.fn()}
        onDraftChange={vi.fn()}
        onCheck={onCheck}
      />,
    );
    const clickPromise = user.click(
      screen.getByRole("button", { name: "Check answer" }),
    );
    expect(
      await screen.findByRole("button", { name: "Checking…" }),
    ).toBeDisabled();
    expect(screen.getByLabelText(/Your answer/i)).toBeDisabled();
    resolveCheck?.();
    await clickPromise;
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Check answer" }),
      ).not.toBeDisabled(),
    );
  });
});
