import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSchedulesApi,
  getScheduleApi,
  createScheduleApi,
  updateScheduleApi,
  deleteScheduleApi,
  getSchedulesByDateApi,
  completeExerciseApi,
  getSchedulesOfWeek,
} from "./schedules-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("schedules-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSchedulesApi fetches all schedules", async () => {
    const schedules = [{ id: "1", title: "Morning Run" }];
    mockApi.get.mockResolvedValue({ data: schedules });

    const result = await getSchedulesApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/schedules");
    expect(result).toEqual(schedules);
  });

  it("getScheduleApi fetches a single schedule", async () => {
    const schedule = { id: "1", title: "Morning Run" };
    mockApi.get.mockResolvedValue({ data: schedule });

    const result = await getScheduleApi("1");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/schedules/1");
    expect(result).toEqual(schedule);
  });

  it("createScheduleApi posts new schedule", async () => {
    const schedule = { id: "2", title: "Evening Yoga" };
    mockApi.post.mockResolvedValue({ data: schedule });

    const result = await createScheduleApi({
      exerciseTypeId: "ex-1",
      startDatetime: "2026-07-14T18:00",
      timezone: "UTC",
    });

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/schedules", {
      exerciseTypeId: "ex-1",
      startDatetime: "2026-07-14T18:00",
      timezone: "UTC",
    });
    expect(result).toEqual(schedule);
  });

  it("updateScheduleApi sends PUT", async () => {
    const updated = { id: "1", title: "Updated" };
    mockApi.put.mockResolvedValue({ data: updated });

    const result = await updateScheduleApi("1", {
      startDatetime: "2026-07-15T08:00",
    });

    expect(mockApi.put).toHaveBeenCalledWith("/api/v1/schedules/1", {
      startDatetime: "2026-07-15T08:00",
    });
    expect(result).toEqual(updated);
  });

  it("deleteScheduleApi sends DELETE", async () => {
    mockApi.delete.mockResolvedValue({});

    await deleteScheduleApi("1");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/schedules/1");
  });

  it("getSchedulesByDateApi fetches schedules for a date with query param", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    const result = await getSchedulesByDateApi("2026-07-14");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/schedules/date", {
      params: { date: "2026-07-14" },
    });
    expect(result).toEqual([]);
  });

  it("completeExerciseApi posts completion with scheduleId", async () => {
    const completion = { id: "c1" };
    mockApi.post.mockResolvedValue({ data: completion });

    const result = await completeExerciseApi("s1");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/completions", {
      scheduleId: "s1",
      completionDatetime: expect.any(String),
    });
    expect(result).toEqual(completion);
  });

  it("completeExerciseApi uses provided completionDatetime", async () => {
    mockApi.post.mockResolvedValue({ data: {} });

    await completeExerciseApi("s1", "2026-07-14T10:00:00Z");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/completions", {
      scheduleId: "s1",
      completionDatetime: "2026-07-14T10:00:00Z",
    });
  });

  it("getSchedulesOfWeek fetches weekly view", async () => {
    const weekData = { weekStart: "2026-07-14", weekEnd: "2026-07-20", days: [] };
    mockApi.get.mockResolvedValue({ data: weekData });

    const result = await getSchedulesOfWeek("2026-07-14");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/schedules/week", {
      params: { date: "2026-07-14" },
    });
    expect(result).toEqual(weekData);
  });
});
