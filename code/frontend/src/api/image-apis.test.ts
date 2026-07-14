import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFileApi, getImages, getRandomImage, getImageFile } from "./image-apis";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("image-apis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploadFileApi posts FormData with multipart header", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    mockApi.post.mockResolvedValue({ data: { id: "img1" } });

    const result = await uploadFileApi(file);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/images",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
    expect(result).toEqual({ id: "img1" });
  });

  it("uploadFileApi calls onUploadProgress with percentage", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const onProgress = vi.fn();

    mockApi.post.mockImplementation((_url, _data, config: any) => {
      config.onUploadProgress({ loaded: 50, total: 100 });
      return Promise.resolve({ data: {} });
    });

    await uploadFileApi(file, onProgress);

    expect(onProgress).toHaveBeenCalledWith(50);
  });

  it("getImages fetches images with cursor and search params", async () => {
    const data = { items: [], nextCursorId: null };
    mockApi.get.mockResolvedValue({ data });

    const result = await getImages({ pageParam: "cursor1", search: "test" });

    expect(mockApi.get).toHaveBeenCalledWith("/v1/images", {
      params: { cursorId: "cursor1", search: "test" },
    });
    expect(result).toEqual(data);
  });

  it("getImages handles null pageParam and search", async () => {
    mockApi.get.mockResolvedValue({ data: { items: [], nextCursorId: null } });

    await getImages({ pageParam: null, search: null });

    expect(mockApi.get).toHaveBeenCalledWith("/v1/images", {
      params: { cursorId: null, search: null },
    });
  });

  it("getRandomImage fetches a random image", async () => {
    const image = { id: "r1", filename: "random.jpg", commentary: "Nice" };
    mockApi.get.mockResolvedValue({ data: image });

    const result = await getRandomImage();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/images/random");
    expect(result).toEqual(image);
  });

  it("getImageFile fetches image as blob", async () => {
    const blob = new Blob(["image"]);
    mockApi.get.mockResolvedValue({ data: blob });

    const result = await getImageFile("img1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/images/img1/file", {
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });
});
