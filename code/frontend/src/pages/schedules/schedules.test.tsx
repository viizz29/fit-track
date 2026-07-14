import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Schedules from "./schedules";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSchedules = [
  {
    id: "1",
    title: "Morning Run",
    "exerciseType.name": "Running",
    startDatetime: "2026-07-14T08:00:00Z",
    recurrenceType: "DAILY",
    timezone: "UTC",
    completed: false,
    weekdays: [],
  },
];

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: mockSchedules,
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

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({
    user: { timezone: "UTC" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/components/modals/create-schedule-dialog", () => ({
  default: () => <div data-testid="create-schedule-dialog" />,
}));

vi.mock("@/components/modals/edit-schedule-dialog", () => ({
  default: () => <div data-testid="edit-schedule-dialog" />,
}));

vi.mock("@/components/modals/confirm-delete-dialog", () => ({
  default: () => <div data-testid="confirm-delete-dialog" />,
}));

describe("Schedules", () => {
  it("renders schedule data", () => {
    render(
      <MemoryRouter>
        <Schedules />
      </MemoryRouter>
    );

    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("renders new schedule button", () => {
    render(
      <MemoryRouter>
        <Schedules />
      </MemoryRouter>
    );

    expect(screen.getByText("newSchedule")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(
      <MemoryRouter>
        <Schedules />
      </MemoryRouter>
    );

    expect(screen.getByText("exercise")).toBeInTheDocument();
    expect(screen.getByText("recurrence")).toBeInTheDocument();
  });
});
