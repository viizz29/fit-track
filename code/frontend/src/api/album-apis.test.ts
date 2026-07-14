import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAlbum,
  getAlbums,
  createAlbum,
  getAlbumImages,
  getAlbumImagesOnePage,
} from "./album-apis";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("album-apis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAlbum fetches album by id", async () => {
    const album = { id: "a1", title: "Vacation" };
    mockApi.get.mockResolvedValue({ data: album });

    const result = await getAlbum("a1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/albums/a1");
    expect(result).toEqual(album);
  });

  it("getAlbum throws when no id provided", async () => {
    await expect(getAlbum()).rejects.toThrow("Album ID is required");
  });

  it("getAlbums fetches all albums", async () => {
    const albums = [{ id: "a1", title: "Trip" }];
    mockApi.get.mockResolvedValue({ data: albums });

    const result = await getAlbums();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/albums");
    expect(result).toEqual(albums);
  });

  it("createAlbum posts new album", async () => {
    const album = { id: "a2", title: "New" };
    mockApi.post.mockResolvedValue({ data: album });

    const result = await createAlbum({ title: "New", search: null });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/albums", {
      title: "New",
      search: null,
    });
    expect(result).toEqual(album);
  });

  it("getAlbumImages fetches paginated images", async () => {
    const data = { items: [], page: 1, limit: 10, total: 0 };
    mockApi.get.mockResolvedValue({ data });

    const result = await getAlbumImages({ albumId: "a1", page: 1, limit: 10 });

    expect(mockApi.get).toHaveBeenCalledWith("/v1/albums/a1/images?page=1&limit=10");
    expect(result).toEqual(data);
  });

  it("getAlbumImagesOnePage delegates to getAlbumImages", async () => {
    const data = { items: [], page: 2, limit: 5, total: 20 };
    mockApi.get.mockResolvedValue({ data });

    const result = await getAlbumImagesOnePage({ albumId: "a1", pageParam: 2, limit: 5 });

    expect(mockApi.get).toHaveBeenCalledWith("/v1/albums/a1/images?page=2&limit=5");
    expect(result).toEqual(data);
  });
});
