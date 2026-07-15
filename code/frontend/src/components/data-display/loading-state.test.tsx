import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LoadingState from "./loading-state";

describe("LoadingState", () => {
  it("renders default number of skeleton rows", () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders specified number of rows", () => {
    const { container } = render(<LoadingState rows={3} />);
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders with custom height", () => {
    const { container } = render(<LoadingState rows={2} height={100} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
