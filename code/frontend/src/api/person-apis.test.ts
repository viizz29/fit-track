import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPersons, getPersonFace, updatePersonName } from "./person-apis";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("person-apis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPersons fetches all persons", async () => {
    const persons = [{ id: "1", name: "Alice" }];
    mockApi.get.mockResolvedValue({ data: persons });

    const result = await getPersons();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/persons");
    expect(result).toEqual(persons);
  });

  it("getPersonFace fetches face image as blob", async () => {
    const blob = new Blob(["image-data"]);
    mockApi.get.mockResolvedValue({ data: blob });

    const result = await getPersonFace("p1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/persons/p1/face", {
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });

  it("updatePersonName sends PATCH with name", async () => {
    const updated = { id: "1", name: "Bob" };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await updatePersonName("1", "Bob");

    expect(mockApi.patch).toHaveBeenCalledWith("/v1/persons/1/name", { name: "Bob" });
    expect(result).toEqual(updated);
  });
});
