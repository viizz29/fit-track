import { Suspense, lazy, type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/use-auth";
import NavigateSetter from "../components/navigate-setter";

// Layout
import MainLayout from "../components/layouts/main-layout";

// Lazy pages (code splitting)
const Dashboard = lazy(() => import("../pages/dashboard/dashboard"));
const Exercises = lazy(() => import("../pages/exercises/exercises"));
const Schedules = lazy(() => import("../pages/schedules/schedules"));

const CompletionsHistory = lazy(() => import("../pages/completions-history/completions-history"));
const Reports = lazy(() => import("../pages/reports/reports"));
const Profile = lazy(() => import("../pages/profile/profile"));
const Calendar = lazy(() => import("../pages/calendar/calendar"));
const Login = lazy(() => import("../pages/auth/login"));
const Register = lazy(() => import("../pages/auth/register"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("../pages/auth/reset-password"));
const VerifyEmail = lazy(() => import("../pages/auth/verify-email"));
const NotFound = lazy(() => import("../pages/misc/not-found"));

const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
    <CircularProgress />
  </Box>
);

// 🔐 Private Route Wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <LoadingFallback />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <LoadingFallback />;
  }

  return !user ? children : <Navigate to="/" replace />;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NavigateSetter />
      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/create" element={<Navigate to="/exercises" replace />} />
          <Route path="/exercises/edit/:exerciseId" element={<Navigate to="/exercises" replace />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/schedules/create" element={<Navigate to="/schedules" replace />} />
          <Route path="/schedules/edit/:scheduleId" element={<Navigate to="/schedules" replace />} />
          <Route path="/completions" element={<CompletionsHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Navigate to="/profile" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
