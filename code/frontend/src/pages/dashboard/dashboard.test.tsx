import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./dashboard";

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    isAuthenticated: true,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [
      {
        id: "1",
        title: "Morning Run",
        startDatetime: new Date().toISOString(),
        recurrenceType: "DAILY",
        completed: false,
        "exerciseType.name": "Running",
      },
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

vi.mock("@/components/schedule/schedule-card", () => ({
  ScheduleCard: ({ schedule }: any) => (
    <div data-testid="schedule-card">{schedule["exerciseType.name"]}</div>
  ),
  groupLabels: { DAILY: "Daily", WEEKLY: "Weekly" },
  groupColors: { DAILY: "primary", WEEKLY: "secondary" },
}));

describe("Dashboard", () => {
  it("renders welcome message with user name", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it("renders stat cards", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("todaysExercises")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders schedule cards when data is present", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId("schedule-card")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });
});
