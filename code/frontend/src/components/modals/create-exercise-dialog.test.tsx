import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CreateExerciseDialog from "./create-exercise-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("react-toastify", () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

describe("CreateExerciseDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dialog with title when open", () => {
    render(
      <CreateExerciseDialog open={true} onClose={vi.fn()} />
    );

    expect(screen.getByText("newExercise")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(
      <CreateExerciseDialog open={true} onClose={vi.fn()} />
    );

    expect(screen.getByLabelText("exerciseName")).toBeInTheDocument();
    expect(screen.getByLabelText("description")).toBeInTheDocument();
  });

  it("renders cancel and create buttons", () => {
    render(
      <CreateExerciseDialog open={true} onClose={vi.fn()} />
    );

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <CreateExerciseDialog open={false} onClose={vi.fn()} />
    );

    expect(screen.queryByText("newExercise")).not.toBeInTheDocument();
  });
});
