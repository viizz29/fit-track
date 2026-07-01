import { getAlbums } from "@/api/album-apis";
import { useQuery } from "@tanstack/react-query";
import { Box, Alert, Paper } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link } from "react-router-dom";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function AlbumsPage() {


  const {
    data: albums,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: getAlbums
  });


  return <PageWrapper>
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper"
      }}
    >
      {albums && albums.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            p: 3
          }}
        >
          {albums.map((album) => (
            <div><Link to={`/album/${album.id}`}>{album.title}</Link></div>
          ))}
        </Box>
      ) : (
        <Alert severity="info" icon={<AutoAwesomeIcon />} sx={{ m: 3 }}>
          No albums found. Upload photos with recognizable faces to populate this list.
        </Alert>
      )}
    </Paper>

    </PageWrapper>
}