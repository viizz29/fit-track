import { Box, Paper, Typography, Button, CircularProgress, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/use-auth";
import type { ExerciseSchedule } from "@/api/schedules-api";

export type GroupKey = "DAILY" | "WEEKLY";

export const groupLabels: Record<GroupKey, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export const groupColors: Record<GroupKey, "primary" | "secondary"> = {
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const tz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {schedule["exerciseType.name"] || schedule.title || "—"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(schedule.startDatetime).toLocaleTimeString(undefined, { timeZone: tz, hour: "2-digit", minute: "2-digit" })}
          {schedule.recurrenceType === "WEEKLY" && schedule.weekdays?.length ? ` · ${schedule.weekdays.join(", ")}` : ""}
          {schedule.recurrenceType === "DAILY" && " · Daily"}
        </Typography>
      </Box>
      {schedule.completed ? (
        <Chip icon={<TaskAltIcon />} label={t("Completed")} color="success" size="small" variant="filled" />
      ) : (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={isCompleting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          onClick={onComplete}
          disabled={isCompleting}
        >
          {isCompleting ? t("completing") : t("complete")}
        </Button>
      )}
    </Paper>
  );
}
