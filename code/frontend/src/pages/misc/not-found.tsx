import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageWrapper sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", gap: 2 }}>
      <Typography variant="h3">404</Typography>
      <Typography variant="h6">Page Not Found</Typography>

      <Button variant="contained" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </PageWrapper>
  );
}