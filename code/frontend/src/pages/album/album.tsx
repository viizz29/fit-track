import { useParams } from "react-router-dom";
import AlbumImageListGrid from "@/pages/album/album-image-list-grid";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function AlbumPage() {
  const { id } = useParams();

  return (
    <PageWrapper>
      <AlbumImageListGrid albumId={id!} />
    </PageWrapper>
  );
}