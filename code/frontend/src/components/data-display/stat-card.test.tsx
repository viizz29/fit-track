import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "./stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(
      <StatCard
        icon={<span>icon</span>}
        label="Total Exercises"
        value={42}
      />
    );

    expect(screen.getByText("Total Exercises")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(
      <StatCard
        icon={<span>icon</span>}
        label="Rate"
        value="85%"
      />
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(
      <StatCard
        icon={<span>icon</span>}
        label="Loading"
        value={0}
        loading={true}
      />
    );

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders icon", () => {
    render(
      <StatCard
        icon={<span data-testid="test-icon">★</span>}
        label="Stars"
        value={5}
      />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});
