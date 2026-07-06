import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { ThemeToggleButton } from "@/components/layouts/theme-toggle-button";
import UserMenu from "./user-menu";
import LanguageSwitcher from "@/components/navigation/language-switcher";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  toggleSidebar,
  title,
  subtitle,
}) => {
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={toggleSidebar}
            sx={{
              display: { xs: "block", md: isSidebarOpen ? "none" : "block" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={700} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <LanguageSwitcher />
          <ThemeToggleButton />
          <UserMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
