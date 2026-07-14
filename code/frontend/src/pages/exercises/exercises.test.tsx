import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Exercises from "./exercises";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [
      { id: "1", name: "Push-ups", description: "Upper body exercise", createdAt: "2026-07-01", updatedAt: "2026-07-14" },
      { id: "2", name: "Squats", description: "Lower body exercise", createdAt: "2026-07-02", updatedAt: "2026-07-13" },
    ],
    isLoading: false,
    isError: false,
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

vi.mock("@/utils/format-date", () => ({
  formatDate: (date: Date) => date.toISOString().split("T")[0],
}));

describe("Exercises", () => {
  it("renders exercise data in table", () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>
    );

    expect(screen.getByText("Push-ups")).toBeInTheDocument();
    expect(screen.getByText("Squats")).toBeInTheDocument();
  });

  it("renders new exercise button", () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>
    );

    expect(screen.getByText("newExercise")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>
    );

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });
});
