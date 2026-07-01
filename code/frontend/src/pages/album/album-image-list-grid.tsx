import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import ImageComponent from "@/pages/home/image-component";
import { getAlbumImagesOnePage } from "@/api/album-apis";


interface AlbumImageListGridProps {
  albumId: string;
}



const AlbumImageListGrid: React.FC<AlbumImageListGridProps> = ({ albumId }) => {
  const [columns, setColumns] = useState(3);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["album-images", albumId],
    queryFn: ({ pageParam }) => getAlbumImagesOnePage({ limit: 10, albumId, pageParam }),
    getNextPageParam: (lastPageResponse) => {
      const { page, total } = lastPageResponse;
      const totalPages = Math.ceil(total / 10); // Assuming limit is 10
      return page < totalPages ? page + 1 : null;
    },
    initialPageParam: 1,
  });


  const observerRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const images = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Box p={2}>
      {/* Controls */}
      <Box mb={2} display="flex" justifyContent="flex-end">
        <FormControl size="small">
          <InputLabel>Columns</InputLabel>
          <Select
            value={columns}
            label="Columns"
            onChange={(e) => setColumns(Number(e.target.value))}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grid */}
      <Grid container spacing={2}>
        {images.map((image) => (
          <Grid size={{ xs: 12 / columns }} key={image.id}>
            <Card>
              <CardContent>
                <ImageComponent imageId={image.id} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Loader */}
      <Box ref={observerRef} mt={2} display="flex" justifyContent="center">
        {isFetchingNextPage && <CircularProgress />}
      </Box>

      {/* Initial Loading */}
      {status === "pending" && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AlbumImageListGrid;