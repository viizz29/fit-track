import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCompletionRateReportApi,
  getExerciseFrequencyReportApi,
  getScheduleAdherenceReportApi,
  getMissedExercisesReportApi,
} from "./reports-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("reports-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCompletionRateReportApi fetches with date range", async () => {
    const report = { overallRate: 85, currentStreak: 5, exerciseBreakdown: [] };
    mockApi.get.mockResolvedValue({ data: report });

    const result = await getCompletionRateReportApi("2026-07-01", "2026-07-31");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/reports/completion-rate?startDate=2026-07-01&endDate=2026-07-31"
    );
    expect(result).toEqual(report);
  });

  it("getExerciseFrequencyReportApi fetches frequency data", async () => {
    const data = [{ exerciseName: "Push-ups", count: 10 }];
    mockApi.get.mockResolvedValue({ data });

    const result = await getExerciseFrequencyReportApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/reports/exercise-frequency");
    expect(result).toEqual(data);
  });

  it("getScheduleAdherenceReportApi fetches adherence data", async () => {
    const data = [{ scheduleTitle: "Morning", adherenceRate: 90 }];
    mockApi.get.mockResolvedValue({ data });

    const result = await getScheduleAdherenceReportApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/reports/schedule-adherence");
    expect(result).toEqual(data);
  });

  it("getMissedExercisesReportApi fetches with date range", async () => {
    const data = { totalMissed: 3, dailyBreakdown: [] };
    mockApi.get.mockResolvedValue({ data });

    const result = await getMissedExercisesReportApi("2026-07-01", "2026-07-31");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/reports/missed?startDate=2026-07-01&endDate=2026-07-31"
    );
    expect(result).toEqual(data);
  });
});
