import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "@/context/use-auth";
import type { ExerciseSchedule } from "@/api/schedules-api";

export type GroupKey = "HOURLY" | "DAILY" | "WEEKLY";

export const groupLabels: Record<GroupKey, string> = {
  HOURLY: "Hourly",
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export const groupColors: Record<GroupKey, "warning" | "primary" | "secondary"> = {
  HOURLY: "warning",
  DAILY: "primary",
  WEEKLY: "secondary",
};

export function ScheduleCard({
  schedule,
  onComplete,
  isCompleting,
}: {
  schedule: ExerciseSchedule;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const { user } = useAuth();
  const tz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {schedule.exerciseType?.name || schedule.title || "—"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(schedule.startDatetime).toLocaleTimeString(undefined, { timeZone: tz, hour: "2-digit", minute: "2-digit" })}
          {schedule.recurrenceInterval && schedule.recurrenceInterval > 1 && ` · Every ${schedule.recurrenceInterval} ${schedule.recurrenceType?.toLowerCase()}s`}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="success"
        size="small"
        startIcon={isCompleting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
        onClick={onComplete}
        disabled={isCompleting}
      >
        {isCompleting ? "Completing..." : "Complete"}
      </Button>
    </Paper>
  );
}
