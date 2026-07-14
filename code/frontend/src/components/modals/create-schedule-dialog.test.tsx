import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CreateScheduleDialog from "./create-schedule-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [
      { id: "ex1", name: "Push-ups" },
      { id: "ex2", name: "Squats" },
    ],
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
  }),
}));

vi.mock("@/components/forms/date-time-picker-with-timezone", () => ({
  default: () => <div data-testid="datetime-picker">DateTimePicker</div>,
}));

describe("CreateScheduleDialog", () => {
  it("renders the dialog with title when open", () => {
    render(<CreateScheduleDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText("newSchedule")).toBeInTheDocument();
  });

  it("renders exercise select field", () => {
    render(<CreateScheduleDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText("exercise")).toBeInTheDocument();
  });

  it("renders date time picker", () => {
    render(<CreateScheduleDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("datetime-picker")).toBeInTheDocument();
  });

  it("renders recurrence type field", () => {
    render(<CreateScheduleDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText("type")).toBeInTheDocument();
  });

  it("renders cancel and create buttons", () => {
    render(<CreateScheduleDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<CreateScheduleDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("newSchedule")).not.toBeInTheDocument();
  });
});
