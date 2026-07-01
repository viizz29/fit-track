import type { ReactNode } from "react";
import { Paper, Typography } from "@mui/material";

type FormCardProps = {
  title: string;
  children: ReactNode;
  maxWidth?: number;
};

export default function FormCard({ title, children, maxWidth = 480 }: FormCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth }}>
      <Typography variant="h6" sx={{ mb: 3 }}>{title}</Typography>
      {children}
    </Paper>
  );
}
