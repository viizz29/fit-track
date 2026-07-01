import "./i18n/config";
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AppRoutes from './routes/app-routes';
import { ThemeContext } from '@/theme/theme-context';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeProviderWrapper from "@/theme/theme-provider-wrapper";

dayjs.extend(utc);
dayjs.extend(timezone);

const STORAGE_KEY = "app-theme-mode";

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProviderWrapper mode={mode}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
          <ToastContainer
            position="top-center"
            transition={Slide}
          />
          <AppRoutes />
        </LocalizationProvider>
      </ThemeProviderWrapper>
    </ThemeContext.Provider>

  );
}

export default App
