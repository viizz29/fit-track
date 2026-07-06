import { useState, useEffect } from "react";
import { Box, Typography, Chip, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import PageWrapper from "@/components/layouts/page-wrapper";
import LoadingState from "@/components/data-display/loading-state";
import EmptyState from "@/components/data-display/empty-state";
import { getSchedulesByDateApi, getSchedulesOfWeek } from "@/api/schedules-api";
import { useAuth } from "@/context/use-auth";
import type { ExerciseSchedule } from "@/api/schedules-api";

type ViewMode = "day" | "week";

function getMonday(d: dayjs.Dayjs): dayjs.Dayjs {
  const day = d.day();
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, "day");
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayToIndex(date: dayjs.Dayjs): number {
  const d = date.day();
  return d === 0 ? 6 : d - 1;
}

function TimelineItem({
  schedule,
  showConnector,
  tz,
}: {
  schedule: ExerciseSchedule;
  showConnector: boolean;
  tz: string;
}) {
  const { t } = useTranslation();
  const time = new Date(schedule.startDatetime).toLocaleTimeString(undefined, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  const isCompleted = schedule.completed;
  const recurrenceLabel =
    schedule.recurrenceType === "WEEKLY" && schedule.weekdays?.length
      ? ` \u00B7 ${schedule.weekdays.join(", ")}`
      : schedule.recurrenceType === "DAILY"
        ? ` \u00B7 ${t("Daily")}`
        : "";

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            bgcolor: isCompleted ? "success.main" : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            mt: 0.5,
          }}
        >
          {isCompleted ? (
            <CheckCircleIcon sx={{ fontSize: 20, color: "common.white" }} />
          ) : (
            <CircleIcon sx={{ fontSize: 12, color: "common.white" }} />
          )}
        </Box>
        {showConnector && (
          <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.5 }} />
        )}
      </Box>

      <Box sx={{ flex: 1, pb: 3, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
            {time}
          </Typography>
          {isCompleted && (
            <Chip label={t("done")} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
          )}
        </Box>
        <Typography variant="body1" fontWeight={600}>
          {schedule["exerciseType.name"] || schedule.title || "\u2014"}
        </Typography>
        {recurrenceLabel && (
          <Typography variant="caption" color="text.secondary">
            {recurrenceLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function TimelineList({ items, tz }: { items: ExerciseSchedule[]; tz: string }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort(
    (a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime(),
  );
  return (
    <Box>
      {sorted.map((schedule, idx) => (
        <TimelineItem
          key={schedule.id}
          schedule={schedule}
          showConnector={idx < sorted.length - 1}
          tz={tz}
        />
      ))}
    </Box>
  );
}

export default function Calendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => dayToIndex(selectedDate));

  const dateStr = selectedDate.format("YYYY-MM-DD");
  const monday = getMonday(selectedDate).format("YYYY-MM-DD");

  const dayQuery = useQuery({
    queryKey: ["calendar-day", dateStr],
    queryFn: () => getSchedulesByDateApi(dateStr),
    enabled: viewMode === "day",
  });

  const weekQuery = useQuery({
    queryKey: ["calendar-week", monday],
    queryFn: () => getSchedulesOfWeek(monday),
    enabled: viewMode === "week",
  });

  useEffect(() => {
    setSelectedDayIndex(dayToIndex(selectedDate));
  }, [selectedDate]);

  const isLoading = viewMode === "day" ? dayQuery.isLoading : weekQuery.isLoading;

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: 600, mx: "auto", py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6">
            {viewMode === "day"
              ? selectedDate.format("dddd, MMMM D, YYYY")
              : weekQuery.data
                ? dayjs(weekQuery.data.days[selectedDayIndex]?.date).format("dddd, MMMM D, YYYY")
                : `${dayjs(monday).format("MMM D")} \u2013 ${dayjs(monday).add(6, "day").format("MMM D, YYYY")}`}
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val: ViewMode | null) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="day"><ViewDayIcon sx={{ mr: 0.5 }} /> {t("day")}</ToggleButton>
            <ToggleButton value="week"><ViewWeekIcon sx={{ mr: 0.5 }} /> {t("week")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <DatePicker
            label={t("selectDate")}
            value={selectedDate}
            onChange={(v) => v && setSelectedDate(v)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", sx: { width: 180 } } }}
          />
        </Box>

        {isLoading && <LoadingState rows={5} height={64} />}

        {!isLoading && viewMode === "day" && (
          <>
            {(!dayQuery.data || dayQuery.data.length === 0) ? (
              <EmptyState message={t("noExercisesScheduledToday")} />
            ) : (
              <TimelineList items={dayQuery.data} tz={tz} />
            )}
          </>
        )}

        {!isLoading && viewMode === "week" && weekQuery.data && (
          <>
            {weekQuery.data.days.every((d) => d.exercises.length === 0) ? (
              <EmptyState message={t("noExercisesScheduledThisWeek")} />
            ) : (
              <>
                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                  {weekQuery.data.days.map((d, idx) => (
                    <Chip
                      key={d.date}
                      label={
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 }}>
                          <Typography variant="caption" sx={{ fontSize: 10 }}>{DAY_LABELS[idx]}</Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ fontSize: 13 }}>
                            {dayjs(d.date).format("D")}
                          </Typography>
                        </Box>
                      }
                      variant={selectedDayIndex === idx ? "filled" : "outlined"}
                      color={selectedDayIndex === idx ? "primary" : "default"}
                      onClick={() => setSelectedDayIndex(idx)}
                      sx={{ height: "auto", py: 0.5, px: 1, minWidth: 48 }}
                    />
                  ))}
                </Box>

                {(() => {
                  const dayData = weekQuery.data!.days[selectedDayIndex];
                  if (!dayData || dayData.exercises.length === 0) {
                    return <EmptyState message={t("noExercisesScheduledThisDay")} />;
                  }
                  return <TimelineList items={dayData.exercises} tz={tz} />;
                })()}
              </>
            )}
          </>
        )}
      </Box>
    </PageWrapper>
  );
}
