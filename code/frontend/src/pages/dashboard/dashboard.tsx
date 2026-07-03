import { useMemo } from "react";
import { Box, Paper, Typography, Alert, Chip } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import dayjs from "dayjs";
import PageWrapper from "@/components/layouts/page-wrapper";
import LoadingState from "@/components/data-display/loading-state";
import EmptyState from "@/components/data-display/empty-state";
import StatCard from "@/components/data-display/stat-card";
import { useAuth } from "@/context/use-auth";
import { getSchedulesByDateApi, completeExerciseApi } from "@/api/schedules-api";
import { ScheduleCard, groupLabels, groupColors } from "@/components/schedule/schedule-card";
import type { GroupKey } from "@/components/schedule/schedule-card";
import type { ExerciseSchedule } from "@/api/schedules-api";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ["scheduled-tasks", today],
    queryFn: () => getSchedulesByDateApi(today),
  });

  const groups = useMemo(() => {
    const grouped: Record<GroupKey, ExerciseSchedule[]> = { DAILY: [], WEEKLY: [] };
    for (const s of schedules ?? []) {
      const key = (s.recurrenceType as GroupKey) || "DAILY";
      if (key in grouped) grouped[key].push(s);
    }
    return grouped;
  }, [schedules]);

  const completeMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      completeExerciseApi(scheduleId, new Date().toISOString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      toast.info("Exercise marked as complete");
    },
    onError: () => toast.error("Failed to mark exercise as complete"),
  });

  const allToday = useMemo(() => schedules ?? [], [schedules]);

  const summary = useMemo(() => {
    const total = allToday.length;
    const completed = allToday.filter((s) => s.completed).length;
    const pending = total - completed;
    const missed = allToday.filter(
      (s) => !s.completed && new Date(s.startDatetime) < new Date(),
    ).length;
    return { total, completed, pending, missed };
  }, [allToday]);

  const entries = (Object.entries(groupLabels) as [GroupKey, string][]).filter(
    ([key]) => groups[key].length > 0,
  );

  return (
    <PageWrapper>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Welcome{user?.name ? `, ${user.name}` : ""}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 3, mb: 3 }}>
        <StatCard icon={<FitnessCenterIcon color="primary" fontSize="small" />} label="Today's Exercises" value={summary.total} loading={isLoading} />
        <StatCard icon={<CheckCircleIcon color="success" fontSize="small" />} label="Completed" value={summary.completed} loading={isLoading} color="success.main" />
        <StatCard icon={<WarningIcon color="warning" fontSize="small" />} label="Pending" value={summary.pending} loading={isLoading} color="warning.main" />
      </Box>

      {/* {!isLoading && allToday.length > 0 && (
        <Alert severity={summary.missed > 0 ? "warning" : "info"} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <span><strong>{summary.completed}</strong> completed</span>
            <span><strong>{summary.pending}</strong> pending</span>
            {summary.missed > 0 && <span><strong>{summary.missed}</strong> missed</span>}
          </Box>
        </Alert>
      )} */}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load schedules.</Alert>
      )}

      {!isError && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Today's Scheduled Exercises
          </Typography>

          {isLoading && <LoadingState rows={3} height={48} />}

          {!isLoading && allToday.length === 0 && (
            <EmptyState message="No exercises scheduled for today." />
          )}

          {entries.map(([key, label]) => {
            const items = groups[key];
            return (
              <Box key={key} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {label}
                  </Typography>
                  <Chip label={`${items.length}`} size="small" color={groupColors[key]} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {items.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onComplete={() => completeMutation.mutate(schedule.id)}
                      isCompleting={completeMutation.isPending && completeMutation.variables === schedule.id}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}
    </PageWrapper>
  );
}
