import type { ReactNode } from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  color?: string;
};

export default function StatCard({ icon, label, value, loading, color }: StatCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          {icon && icon}
          <Typography variant="overline" color="text.secondary">{label}</Typography>
        </Box>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : (
          <Typography variant="h4" color={color}>{value}</Typography>
        )}
      </CardContent>
    </Card>
  );
}
