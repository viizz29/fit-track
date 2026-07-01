import { createAlbum } from "@/api/album-apis";
import AlbumTitleInputModal from "@/pages/photos/album-name-input-modal";
import InfiniteScrollingImageGrid from "@/components/data-display/infinite-scrolling-image-grid";
import SearchWidget from "@/components/data-display/search-widget";
import { Box, Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function PhotosPage() {

  const [albumTitleInputModalOpen, setAlbumTitleInputModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: ({ title }: { title: string }) =>
      createAlbum({ title, search: searchTerm }),

    onSuccess: (
      // data
    ) => {
      toast.info(`New album created!`);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },

    onError: () => {
      console.error("Album creation failed");
      toast.error("Could not create album");
    },
  });


  const createAlbumHandler = (title: string) => {
    mutation.mutate({ title });
  }


  return <PageWrapper>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <SearchWidget onInput={setSearchTerm} />

      <Button
        variant="contained"
        color="primary"
        onClick={() => setAlbumTitleInputModalOpen(true)}
      >
        Create Album With These Photos
      </Button>
    </Box>

    <InfiniteScrollingImageGrid searchTerm={searchTerm} />

    <AlbumTitleInputModal
      open={albumTitleInputModalOpen}
      onClose={() => setAlbumTitleInputModalOpen(false)}
      onSubmit={createAlbumHandler}
    />
  </PageWrapper>
}