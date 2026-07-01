import Skeleton from "@mui/material/Skeleton";

export function MuiSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: 16, marginBottom: 10 }}
        >
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="30%" />
        </div>
      ))}
    </div>
  );
}