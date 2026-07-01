import { useState } from "react";
import {
  Box, Typography, Paper, Chip, Alert, CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PageWrapper from "@/components/layouts/page-wrapper";
import { getSchedulesByDateApi, completeExerciseApi } from "@/api/schedules-api";
import {
  ScheduleCard, groupLabels, groupColors,
} from "@/components/schedule/schedule-card";
import type { GroupKey } from "@/components/schedule/schedule-card";
import type { ExerciseSchedule } from "@/api/schedules-api";

export default function ScheduledTasks() {
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scheduled-tasks", selectedDate],
    queryFn: () => getSchedulesByDateApi(selectedDate),
  });

  const completeMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      completeExerciseApi(scheduleId, new Date().toISOString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      toast.success("Task marked as completed!");
    },
    onError: () => toast.error("Failed to mark task as completed"),
  });

  const groups = data ?? { HOURLY: [], DAILY: [], WEEKLY: [] };
  const hasTasks = Object.values(groups).some((arr) => arr.length > 0);

  return (
    <PageWrapper>
      {/* <Typography variant="h5" sx={{ mb: 1 }}>Today's Tasks</Typography> */}

      <Box sx={{ mb: 3 }}>
        <DatePicker
          label="Date"
          value={dayjs(selectedDate)}
          onChange={(v) => {
            if (v) setSelectedDate(v.format("YYYY-MM-DD"));
          }}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: "small", sx: { width: 180 } } }}
        />
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load scheduled tasks.</Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !hasTasks ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary">No tasks scheduled for this date.</Typography>
        </Paper>
      ) : (
        (Object.entries(groupLabels) as [GroupKey, string][]).map(([key, label]) => {
          const items = groups[key] as ExerciseSchedule[];
          if (!items.length) return null;
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
        })
      )}
    </PageWrapper>
  );
}
