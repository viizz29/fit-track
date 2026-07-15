import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiSkeletonTable } from "./mui-skeleton-table";

describe("MuiSkeletonTable", () => {
  it("renders skeleton table", () => {
    const { container } = render(<MuiSkeletonTable />);
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders specified number of rows", () => {
    const { container } = render(<MuiSkeletonTable rows={3} />);
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
