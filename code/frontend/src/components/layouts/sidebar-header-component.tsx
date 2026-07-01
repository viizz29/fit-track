import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  showClose?: boolean;
}

export const SidebarHeader = ({ isSidebarOpen, toggleSidebar, showClose }: SidebarHeaderProps) => {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        color: "text.primary",
        p: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        FitTrack
      </Typography>

      {showClose && isSidebarOpen && (
        <IconButton onClick={toggleSidebar} size="small">
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};

