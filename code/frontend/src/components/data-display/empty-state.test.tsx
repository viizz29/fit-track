import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./empty-state";

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState message="No data found" />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders with default severity", () => {
    render(<EmptyState message="Empty" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("renders with custom severity", () => {
    render(<EmptyState message="Error occurred" severity="error" />);
    expect(screen.getByText("Error occurred")).toBeInTheDocument();
  });
});
