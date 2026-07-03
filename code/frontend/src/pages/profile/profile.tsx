import { useMemo, useState, useEffect } from "react";
import {
  Typography, Paper, Box, Grid, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton, Alert, Tabs, Tab, TextField, Button,
  Switch, FormControlLabel, useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import PageWrapper from "@/components/layouts/page-wrapper";
// import PageHeader from "@/components/layouts/page-header";
import StatCard from "@/components/data-display/stat-card";
import LoadingState from "@/components/data-display/loading-state";
import EmptyState from "@/components/data-display/empty-state";
import { useAuth } from "@/context/use-auth";
import { getExercisesApi } from "@/api/exercises-api";
import { getSchedulesApi } from "@/api/schedules-api";
import { getCompletionsApi } from "@/api/completions-api";
import { updateProfileApi, updateEmailPreferencesApi, getProfileApi, getEmailPreferencesApi } from "@/api/auth-api";

export default function ProfilePage() {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState(0);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const exercisesQuery = useQuery({ queryKey: ["exercises"], queryFn: getExercisesApi });
  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: getSchedulesApi });
  const completionsQuery = useQuery({ queryKey: ["completions"], queryFn: () => getCompletionsApi() });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    staleTime: 0,
    refetchOnMount: true,
  });

  const emailPrefsQuery = useQuery({
    queryKey: ["email-preferences"],
    queryFn: getEmailPreferencesApi,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (emailPrefsQuery.data) {
      setEmailNotifications(emailPrefsQuery.data.emailNotifications);
    }
  }, [emailPrefsQuery.data]);

  const profileData = profileQuery.data;

  const profileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      updateProfile(data);
      toast.info("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const emailPrefsMutation = useMutation({
    mutationFn: updateEmailPreferencesApi,
    onSuccess: () => toast.info("Email preferences updated"),
    onError: () => {
      toast.error("Failed to update email preferences");
      setEmailNotifications((prev) => !prev);
    },
  });

  const handleEmailToggle = (_: unknown, checked: boolean) => {
    setEmailNotifications(checked);
    emailPrefsMutation.mutate({ emailNotifications: checked });
  };

  const recentCompletions = useMemo(() => {
    if (!completionsQuery.data) return [];
    return [...completionsQuery.data]
      .sort((a, b) => new Date(b.completionDatetime).getTime() - new Date(a.completionDatetime).getTime())
      .slice(0, 10);
  }, [completionsQuery.data]);

  const weeklyData = useMemo(() => {
    if (!completionsQuery.data) return [];
    const dayMap = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const c of completionsQuery.data) {
      const key = c.completionDatetime.slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1);
    }
    return Array.from(dayMap.entries()).map(([date, count]) => ({
      date: date.slice(5), completions: count,
    }));
  }, [completionsQuery.data]);

  const loading = exercisesQuery.isLoading || schedulesQuery.isLoading || completionsQuery.isLoading;
  const totalExercises = exercisesQuery.data?.length ?? 0;
  const totalSchedules = schedulesQuery.data?.length ?? 0;
  const totalCompletions = completionsQuery.data?.length ?? 0;

  return (
    <PageWrapper>
      {/* <PageHeader title="Profile" /> */}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<VisibilityIcon />} label="Overview" iconPosition="start" />
        <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
      </Tabs>

      {/* ──────────────── TAB 0: OVERVIEW ──────────────── */}
      {tab === 0 && (
        <>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 32 }}>
                {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{user?.name || "Unnamed User"}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  <Chip icon={<EmailIcon />} label={user?.email || "—"} size="small" variant="outlined" />
                  <Chip icon={<AccessTimeIcon />} label={user?.timezone || "—"} size="small" variant="outlined" />
                  {user?.role && (
                    <Chip icon={<PersonIcon />} label={user.role} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
            <StatCard icon={<FitnessCenterIcon color="primary" fontSize="small" />} label="Exercises" value={totalExercises} loading={loading} />
            <StatCard icon={<CalendarMonthIcon color="secondary" fontSize="small" />} label="Schedules" value={totalSchedules} loading={loading} />
            <StatCard icon={<CheckCircleIcon color="success" fontSize="small" />} label="Completions" value={totalCompletions} loading={loading} color="success.main" />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  This Week&apos;s Activity
                </Typography>
                {loading ? (
                  <LoadingState rows={1} height={200} />
                ) : weeklyData.every((d) => d.completions === 0) ? (
                  <EmptyState message="No activity this week." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="completions" name="Completions" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 2, pb: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Recent Activity</Typography>
                </Box>
                {loading ? (
                  <LoadingState rows={4} height={36} />
                ) : recentCompletions.length === 0 ? (
                  <Box sx={{ p: 2 }}><EmptyState message="No completions yet." /></Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Exercise</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentCompletions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.schedule.exerciseType.name || c.scheduleTitle || "—"}</TableCell>
                            <TableCell>
                              {new Date(c.completionDatetime).toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* ──────────────── TAB 1: SETTINGS ──────────────── */}
      {tab === 1 && (
        <>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Profile</Typography>

            {profileMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>Failed to update profile</Alert>
            )}

            {profileQuery.isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 448 }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}
              </Box>
            ) : (
              <Formik
                enableReinitialize
                initialValues={{
                  email: profileData?.email || user?.email || "",
                  name: profileData?.name || user?.name || "",

                }}
                validationSchema={Yup.object({
                  email: Yup.string().email("Invalid email").required("Required"),
                  name: Yup.string(),
                })}
                onSubmit={(values) => profileMutation.mutate(values)}
              >
                {({ handleSubmit, handleChange, values, errors, touched, dirty }) => (
                  <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 448 }}>
                    <TextField fullWidth label="Email" name="email" value={values.email} onChange={handleChange} error={touched.email && !!errors.email} helperText={touched.email && typeof errors.email === "string" ? errors.email : undefined} />
                    <TextField fullWidth label="Name" name="name" value={values.name} onChange={handleChange} error={touched.name && !!errors.name} helperText={touched.name && typeof errors.name === "string" ? errors.name : undefined} />

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button type="submit" variant="contained" disabled={!dirty || profileMutation.isPending}>
                        {profileMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Formik>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Email Preferences</Typography>
            {emailPrefsQuery.isLoading ? (
              <Skeleton width={280} height={40} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={handleEmailToggle}
                    disabled={emailPrefsMutation.isPending}
                  />
                }
                label="Receive email notifications"
              />
            )}
          </Paper>
        </>
      )}
    </PageWrapper>
  );
}
