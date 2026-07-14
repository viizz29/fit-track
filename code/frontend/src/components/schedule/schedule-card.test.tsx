import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduleCard, groupLabels, groupColors } from "./schedule-card";
import type { ExerciseSchedule } from "@/api/schedules-api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({
    user: { timezone: "UTC" },
  }),
}));

const baseSchedule: ExerciseSchedule = {
  id: "1",
  title: "Morning Run",
  startDatetime: "2026-07-14T08:00:00Z",
  recurrenceType: "DAILY",
  completed: false,
  "exerciseType.id": "ex1",
  "exerciseType.name": "Running",
  "exerciseType.description": "Cardio",
  weekdays: [],
};

describe("ScheduleCard", () => {
  it("renders exercise name", () => {
    render(
      <ScheduleCard
        schedule={baseSchedule}
        onComplete={vi.fn()}
        isCompleting={false}
      />
    );

    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("renders complete button when not completed", () => {
    render(
      <ScheduleCard
        schedule={baseSchedule}
        onComplete={vi.fn()}
        isCompleting={false}
      />
    );

    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("renders Completed chip when schedule is completed", () => {
    render(
      <ScheduleCard
        schedule={{ ...baseSchedule, completed: true }}
        onComplete={vi.fn()}
        isCompleting={false}
      />
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("calls onComplete when complete button is clicked", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <ScheduleCard
        schedule={baseSchedule}
        onComplete={onComplete}
        isCompleting={false}
      />
    );

    await user.click(screen.getByText("complete"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows completing state when isCompleting is true", () => {
    render(
      <ScheduleCard
        schedule={baseSchedule}
        onComplete={vi.fn()}
        isCompleting={true}
      />
    );

    expect(screen.getByText("completing")).toBeInTheDocument();
  });

  it("disables button when isCompleting", () => {
    render(
      <ScheduleCard
        schedule={baseSchedule}
        onComplete={vi.fn()}
        isCompleting={true}
      />
    );

    expect(screen.getByText("completing")).toBeDisabled();
  });

  it("renders weekday info for weekly schedule", () => {
    const weeklySchedule = {
      ...baseSchedule,
      recurrenceType: "WEEKLY",
      weekdays: ["MON", "WED", "FRI"],
    };

    render(
      <ScheduleCard
        schedule={weeklySchedule}
        onComplete={vi.fn()}
        isCompleting={false}
      />
    );

    expect(screen.getByText((content) => content.includes("MON, WED, FRI"))).toBeInTheDocument();
  });
});

describe("groupLabels and groupColors", () => {
  it("has correct labels", () => {
    expect(groupLabels.DAILY).toBe("Daily");
    expect(groupLabels.WEEKLY).toBe("Weekly");
  });

  it("has correct colors", () => {
    expect(groupColors.DAILY).toBe("primary");
    expect(groupColors.WEEKLY).toBe("secondary");
  });
});
