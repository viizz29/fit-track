import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DynamicField from "./dynamic-field";

describe("DynamicField", () => {
  it("renders string field as text input", () => {
    const onChange = vi.fn();
    render(
      <DynamicField
        name="test"
        label="Test Field"
        type="string"
        value=""
        onValueChange={onChange}
      />
    );

    expect(screen.getByLabelText("Test Field")).toBeInTheDocument();
  });

  it("renders number field as number input", () => {
    const onChange = vi.fn();
    render(
      <DynamicField
        name="count"
        label="Count"
        type="number"
        value={5}
        onValueChange={onChange}
      />
    );

    expect(screen.getByLabelText("Count")).toBeInTheDocument();
  });

  it("renders boolean field as switch", () => {
    const onChange = vi.fn();
    render(
      <DynamicField
        name="enabled"
        label="Enabled"
        type="boolean"
        value={true}
        onValueChange={onChange}
      />
    );

    expect(screen.getByText("Enabled")).toBeInTheDocument();
  });

  it("renders select field with options", () => {
    const onChange = vi.fn();
    render(
      <DynamicField
        name="choice"
        label="Choice"
        type="select"
        value=""
        onValueChange={onChange}
        options={[
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ]}
      />
    );

    expect(screen.getByText("Choice", { selector: "label" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onValueChange when string input changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DynamicField
        name="test"
        label="Test"
        type="string"
        value=""
        onValueChange={onChange}
      />
    );

    await user.type(screen.getByLabelText("Test"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders date field", () => {
    const onChange = vi.fn();
    render(
      <DynamicField
        name="date"
        label="Date"
        type="date"
        value=""
        onValueChange={onChange}
      />
    );

    expect(screen.getByLabelText("Date")).toBeInTheDocument();
  });
});
