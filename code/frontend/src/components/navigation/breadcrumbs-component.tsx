import { Box, Link, Typography } from "@mui/material";

export interface BreadcrumbItem {
  id: string | number;
  caption: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onClick?: (id: BreadcrumbItem["id"]) => void;
}

export const BreadCrumbsComponent: React.FC<BreadcrumbsProps> = ({
  items,
  onClick,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem" }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isLast ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", cursor: "default" }}
              >
                {item.caption}
              </Typography>
            ) : (
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={() => onClick?.(item.id)}
                sx={{ color: "primary.main", cursor: "pointer" }}
              >
                {item.caption}
              </Link>
            )}

            {!isLast && (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                /
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};