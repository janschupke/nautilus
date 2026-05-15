import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModuleSidebarProgressRing } from "./ModuleSidebarProgressRing";

describe("ModuleSidebarProgressRing", () => {
  it("renders nothing when total is 0", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={0} total={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when total is negative", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={0} total={-1} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders an img role with correct aria-label", () => {
    render(<ModuleSidebarProgressRing correct={3} total={5} />);
    expect(
      screen.getByRole("img", { name: "3 of 5 questions correct" }),
    ).toBeInTheDocument();
  });

  it("renders a title element matching the aria-label", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={2} total={4} />,
    );
    const title = container.querySelector("title");
    expect(title?.textContent).toBe("2 of 4 questions correct");
  });

  it("renders two circles", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={1} total={3} />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });

  it("uses emerald-400 class when fully correct", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={5} total={5} />,
    );
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1]!;
    expect(progressCircle.getAttribute("class")).toMatch(/emerald-400/);
  });

  it("uses emerald-500 class when partially correct", () => {
    const { container } = render(
      <ModuleSidebarProgressRing correct={2} total={5} />,
    );
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1]!;
    expect(progressCircle.getAttribute("class")).toMatch(/emerald-500/);
  });

  it("caps fraction at 1 when correct exceeds total", () => {
    render(<ModuleSidebarProgressRing correct={10} total={5} />);
    expect(
      screen.getByRole("img", { name: "10 of 5 questions correct" }),
    ).toBeInTheDocument();
  });
});
