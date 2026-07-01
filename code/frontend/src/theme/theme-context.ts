import { createContext, useContext } from 'react';

type ThemeContextValue = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggleTheme: () => {},
});

export const useThemeController = () => useContext(ThemeContext);