import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";

interface SidebarMenuItemProps {
  icon: ReactNode;
  activeIcon?: ReactNode;
  path: string;
  children: ReactNode;
  onClick?: () => void;
}

export const SidebarMenuItem = ({
  icon,
  activeIcon,
  path,
  children,
  onClick,
}: SidebarMenuItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selected = location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleClick = () => {
    navigate(path);
    onClick?.();
  };

  return (
    <Paper
      elevation={selected ? 3 : 1}
      sx={{
        m: 1,
        bgcolor: selected ? "action.selected" : "background.paper",
      }}
    >
      <ListItemButton selected={selected} onClick={handleClick}>
        <ListItemIcon>
          {selected && activeIcon ? activeIcon : icon}
        </ListItemIcon>

        <ListItemText
          primary={children}
          slotProps={{
            primary: {
              sx: {
                color: selected ? "text.primary" : "text.secondary",
                fontWeight: selected ? 600 : 400,
              },
            },
          }}
        />
      </ListItemButton>
    </Paper>
  );
};