import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EditScheduleDialog from "./edit-schedule-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("dayjs", () => {
  const mockDayjs = (input?: string) => ({
    tz: (_tz?: string) => ({
      format: (fmt: string) => {
        if (!input) return "2026-07-14";
        if (fmt === "YYYY-MM-DD") return input.split("T")[0];
        if (fmt === "HH:mm") return input.split("T")[1]?.slice(0, 5) || "08:00";
        return input;
      },
    }),
    format: (fmt: string) => {
      if (!input) return "2026-07-14";
      if (fmt === "YYYY-MM-DD") return input.split("T")[0];
      if (fmt === "HH:mm") return input.split("T")[1]?.slice(0, 5) || "08:00";
      return input;
    },
  });
  mockDayjs.tz = vi.fn((_input?: string, _tz?: string) => ({
    format: (fmt: string) => {
      if (fmt === "YYYY-MM-DD") return "2026-07-14";
      if (fmt === "HH:mm") return "08:00";
      return "2026-07-14T08:00";
    },
  }));
  return { default: mockDayjs };
});

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((opts: any) => {
    if (opts.queryKey[0] === "exercises") {
      return {
        data: [{ id: "ex1", name: "Push-ups" }],
      };
    }
    if (opts.queryKey[0] === "schedule") {
      return {
        data: {
          id: "s1",
          exerciseTypeId: "ex1",
          startDatetime: "2026-07-14T08:00:00Z",
          timezone: "UTC",
          recurrenceType: "DAILY",
          weekdays: [],
        },
        isLoading: false,
      };
    }
    return { data: null, isLoading: true };
  }),
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

describe("EditScheduleDialog", () => {
  it("renders the dialog with title when open", () => {
    render(<EditScheduleDialog open={true} scheduleId="s1" onClose={vi.fn()} />);
    expect(screen.getByText("editSchedule")).toBeInTheDocument();
  });

  it("renders exercise select field", () => {
    render(<EditScheduleDialog open={true} scheduleId="s1" onClose={vi.fn()} />);
    expect(screen.getByLabelText("exercise")).toBeInTheDocument();
  });

  it("renders cancel and save buttons", () => {
    render(<EditScheduleDialog open={true} scheduleId="s1" onClose={vi.fn()} />);
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("save")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<EditScheduleDialog open={false} scheduleId="s1" onClose={vi.fn()} />);
    expect(screen.queryByText("editSchedule")).not.toBeInTheDocument();
  });
});
