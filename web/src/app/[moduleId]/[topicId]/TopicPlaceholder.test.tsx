import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopicPlaceholder } from "./TopicPlaceholder";

describe("TopicPlaceholder", () => {
  it("renders a heading derived from the topic id", () => {
    render(<TopicPlaceholder topicId="05-awk" />);
    expect(
      screen.getByRole("heading", { name: /05 — awk for fields/i }),
    ).toBeInTheDocument();
  });

  it("mentions the topics content directory", () => {
    render(<TopicPlaceholder topicId="01-environment" />);
    expect(screen.getByText(/src\/content\/topics\//i)).toBeInTheDocument();
  });
});
