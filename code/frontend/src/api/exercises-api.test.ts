import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getExercisesApi,
  createExerciseApi,
  getExerciseApi,
  updateExerciseApi,
  deleteExerciseApi,
} from "./exercises-api";
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

describe("exercises-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getExercisesApi fetches all exercises", async () => {
    const exercises = [{ id: "1", name: "Push-ups" }];
    mockApi.get.mockResolvedValue({ data: exercises });

    const result = await getExercisesApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/exercises");
    expect(result).toEqual(exercises);
  });

  it("createExerciseApi posts new exercise", async () => {
    const exercise = { id: "2", name: "Squats" };
    mockApi.post.mockResolvedValue({ data: exercise });

    const result = await createExerciseApi({ name: "Squats", description: "Leg exercise" });

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/exercises", {
      name: "Squats",
      description: "Leg exercise",
    });
    expect(result).toEqual(exercise);
  });

  it("getExerciseApi fetches a single exercise by id", async () => {
    const exercise = { id: "1", name: "Push-ups" };
    mockApi.get.mockResolvedValue({ data: exercise });

    const result = await getExerciseApi("1");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/exercises/1");
    expect(result).toEqual(exercise);
  });

  it("updateExerciseApi sends PUT with data", async () => {
    const updated = { id: "1", name: "Updated Push-ups" };
    mockApi.put.mockResolvedValue({ data: updated });

    const result = await updateExerciseApi("1", { name: "Updated Push-ups" });

    expect(mockApi.put).toHaveBeenCalledWith("/api/v1/exercises/1", {
      name: "Updated Push-ups",
    });
    expect(result).toEqual(updated);
  });

  it("deleteExerciseApi sends DELETE request", async () => {
    mockApi.delete.mockResolvedValue({});

    await deleteExerciseApi("1");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/exercises/1");
  });
});
