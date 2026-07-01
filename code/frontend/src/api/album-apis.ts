import api from "./client";

export interface Album {  
  id: string;
  title: string;
}

export interface AlbumImage {
  id: string;
  filename: string;
}


export const getAlbum = async (id?: string): Promise<Album> => {

  if(!id) {
    throw new Error("Album ID is required");
  }
  const res = await api.get(`/v1/albums/${id}`);
  return res.data;
};

export const getAlbums = async (): Promise<Album[]> => {
  const res = await api.get("/v1/albums");
  return res.data;
};



export const createAlbum = async (albumData: { title: string, search: string | null}): Promise<Album> => {
  const res = await api.post("/v1/albums", albumData);
  return res.data;
};


export const getAlbumImages = async ({ albumId, page, limit }: { albumId: string; page: number; limit: number }): Promise<{ items: AlbumImage[], page: number;
  limit: number;
  total: number; }> => {
  const res = await api.get(`/v1/albums/${albumId}/images?page=${page}&limit=${limit}`);
  return res.data;
};


export const getAlbumImagesOnePage = async ({ limit, albumId, pageParam = 1 }: { limit: number, albumId: string; pageParam: number }) => {
  return await getAlbumImages({ albumId, page: pageParam, limit });
};
