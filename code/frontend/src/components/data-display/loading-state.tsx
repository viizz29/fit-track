import { Box, Skeleton } from "@mui/material";

type LoadingStateProps = {
  rows?: number;
  height?: number;
};

export default function LoadingState({ rows = 4, height = 52 }: LoadingStateProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={height} />
      ))}
    </Box>
  );
}
