import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DataTable from "./data-table";

type TestRow = { id: string; name: string; age: number };

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "age", label: "Age", sortable: true },
];

const data: TestRow[] = [
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Bob", age: 25 },
  { id: "3", name: "Charlie", age: 35 },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        emptyMessage="Nothing here"
      />
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        loading={true}
      />
    );

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("hides search when searchable is false", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        searchable={false}
      />
    );

    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });

  it("renders custom search placeholder", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        searchPlaceholder="Find exercises..."
      />
    );

    expect(screen.getByPlaceholderText("Find exercises...")).toBeInTheDocument();
  });

  it("displays default empty message", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });
});
