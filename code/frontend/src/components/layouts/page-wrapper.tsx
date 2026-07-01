import { Box, type BoxProps } from "@mui/material";
import type { ReactNode } from "react";

type PageWrapperProps = BoxProps & {
  children: ReactNode;
};

export default function PageWrapper({ children, sx, ...props }: PageWrapperProps) {
  return (
    <Box
      sx={{
        minHeight: "100%",
        background: (theme) => {
          const primary = theme.palette.primary.main;
          const secondary = theme.palette.secondary.main;
          const isDark = theme.palette.mode === "dark";
          const bg = theme.palette.background.default;
          return isDark
            ? `linear-gradient(135deg, ${primary}38, ${secondary}1F 45%, ${bg}00 72%)`
            : `linear-gradient(135deg, ${primary}1F, #ec407a14 46%, ${bg}00 72%)`;
        },
        p: { xs: 1.5, md: 4 },
        overflowX: "hidden",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
