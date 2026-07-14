import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EditExerciseDialog from "./edit-exercise-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: { id: "1", name: "Push-ups", description: "Upper body" },
    isLoading: false,
  })),
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

describe("EditExerciseDialog", () => {
  it("renders the dialog with title when open", () => {
    render(
      <EditExerciseDialog open={true} exerciseId="1" onClose={vi.fn()} />
    );

    expect(screen.getByText("editExercise")).toBeInTheDocument();
  });

  it("renders form fields with exercise data", () => {
    render(
      <EditExerciseDialog open={true} exerciseId="1" onClose={vi.fn()} />
    );

    expect(screen.getByLabelText("exerciseName")).toBeInTheDocument();
    expect(screen.getByLabelText("description")).toBeInTheDocument();
  });

  it("renders save and cancel buttons", () => {
    render(
      <EditExerciseDialog open={true} exerciseId="1" onClose={vi.fn()} />
    );

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("save")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <EditExerciseDialog open={false} exerciseId="1" onClose={vi.fn()} />
    );

    expect(screen.queryByText("editExercise")).not.toBeInTheDocument();
  });
});
