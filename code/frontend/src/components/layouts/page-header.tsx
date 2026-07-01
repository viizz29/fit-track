import type { ReactNode } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type PageHeaderProps = {
  title: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};

export default function PageHeader({ title, onBack, actionLabel, onAction, actionIcon }: PageHeaderProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
        {onBack && (
          <IconButton size="small" onClick={onBack} sx={{ flexShrink: 0 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h5" noWrap>{title}</Typography>
      </Box>
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={actionIcon} onClick={onAction} sx={{ flexShrink: 0, ml: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
