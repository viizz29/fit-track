import { useThemeController } from "@/theme/theme-context";
import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export const ThemeToggleButton = () => {
  const { mode, toggleTheme } = useThemeController();
  const isDark = mode === "dark";

  return (
    <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <IconButton color="inherit" onClick={toggleTheme}>
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
