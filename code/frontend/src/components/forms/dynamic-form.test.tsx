import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DynamicForm from "./dynamic-form";
import * as Yup from "yup";

describe("DynamicForm", () => {
  it("renders fields based on fields prop", () => {
    render(
      <DynamicForm
        fields={["name", "email"]}
        validationSchema={{
          name: Yup.string().required(),
          email: Yup.string().email().required(),
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText("name")).toBeInTheDocument();
    expect(screen.getByLabelText("email")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <DynamicForm
        fields={["field1"]}
        validationSchema={{ field1: Yup.string() }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("renders correct number of text fields", () => {
    render(
      <DynamicForm
        fields={["a", "b", "c"]}
        validationSchema={{
          a: Yup.string(),
          b: Yup.string(),
          c: Yup.string(),
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText("a")).toBeInTheDocument();
    expect(screen.getByLabelText("b")).toBeInTheDocument();
    expect(screen.getByLabelText("c")).toBeInTheDocument();
  });
});
