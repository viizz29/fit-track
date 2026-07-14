import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GenericTable from "./generic-table";

type TestRow = { id: string; name: string };

describe("GenericTable", () => {
  it("renders column headers", () => {
    render(
      <GenericTable<TestRow>
        data={[{ id: "1", name: "Alice" }]}
        fields={["id", "name"]}
      />
    );

    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(
      <GenericTable<TestRow>
        data={[
          { id: "1", name: "Alice" },
          { id: "2", name: "Bob" },
        ]}
        fields={["id", "name"]}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows 'No data available' when data is empty", () => {
    render(
      <GenericTable<TestRow>
        data={[]}
        fields={["id", "name"]}
      />
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});
