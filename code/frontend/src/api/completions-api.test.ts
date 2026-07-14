import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCompletionsApi, deleteCompletionApi } from "./completions-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("completions-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCompletionsApi fetches all completions without filters", async () => {
    const completions = [{ id: "1", scheduleId: "s1" }];
    mockApi.get.mockResolvedValue({ data: completions });

    const result = await getCompletionsApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/completions");
    expect(result).toEqual(completions);
  });

  it("getCompletionsApi includes dateFrom filter", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await getCompletionsApi({ dateFrom: "2026-07-01" });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/completions?dateFrom=2026-07-01"
    );
  });

  it("getCompletionsApi includes dateTo filter", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await getCompletionsApi({ dateTo: "2026-07-31" });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/completions?dateTo=2026-07-31"
    );
  });

  it("getCompletionsApi includes scheduleId filter", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await getCompletionsApi({ scheduleId: "s1" });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/completions?scheduleId=s1"
    );
  });

  it("getCompletionsApi combines multiple filters", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await getCompletionsApi({
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
      scheduleId: "s1",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/completions?dateFrom=2026-07-01&dateTo=2026-07-31&scheduleId=s1"
    );
  });

  it("deleteCompletionApi sends DELETE request", async () => {
    mockApi.delete.mockResolvedValue({});

    await deleteCompletionApi("c1");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/completions/c1");
  });
});
