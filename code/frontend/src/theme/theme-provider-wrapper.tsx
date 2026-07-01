// ThemeProviderWrapper.tsx
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import { useMemo } from "react";
import { getTheme } from "./theme";

export default function ThemeProviderWrapper({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "light" | "dark";
}) {
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            /* Core */
            "--color-primary": theme.palette.primary.main,
            "--color-primary-light": theme.palette.primary.light,
            "--color-primary-dark": theme.palette.primary.dark,

            "--color-secondary": theme.palette.secondary.main,

            /* Background */
            "--color-bg": theme.palette.background.default,
            "--color-surface": theme.palette.background.paper,

            /* Text */
            "--color-text": theme.palette.text.primary,
            "--color-text-secondary": theme.palette.text.secondary,

            /* Borders */
            "--color-border": theme.palette.divider,

            /* States */
            "--color-error": theme.palette.error.main,
            "--color-warning": theme.palette.warning.main,
            "--color-success": theme.palette.success.main,
            "--color-info": theme.palette.info.main,
          },
        })}
      />

      {children}
    </ThemeProvider>
  );
}