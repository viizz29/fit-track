import { useMemo, useState } from "react";
import {
  Typography, Paper, Box, Tabs, Tab, LinearProgress, Chip,
  Skeleton, Alert, Button, Card, CardContent, Grid,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/layouts/page-wrapper";
import DataTable from "@/components/data-display/data-table";
import { getSchedulesApi } from "@/api/schedules-api";
import { getCompletionsApi } from "@/api/completions-api";
import { getCompletionRateReportApi, getMissedExercisesReportApi } from "@/api/reports-api";
import type { ExerciseSchedule } from "@/api/schedules-api";
import type { CompletionRecord } from "@/api/completions-api";
import type { CompletionRatePerExercise } from "@/api/reports-api";
import type { Column } from "@/components/data-display/data-table";
import type { Dayjs } from "dayjs";

function countExpectedOccurrences(startTime: string, recurrenceType?: string, recurrenceInterval?: number): number {
  if (!recurrenceType) return 1;
  const start = new Date(startTime);
  const now = new Date();
  if (start > now) return 0;
  const diffMs = now.getTime() - start.getTime();
  const interval = recurrenceInterval || 1;
  switch (recurrenceType) {
    case "hourly":
      return Math.floor(diffMs / (1000 * 60 * 60 * interval)) + 1;
    case "daily":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * interval)) + 1;
    case "weekly":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7 * interval)) + 1;
    default:
      return 1;
  }
}

function getRecurrenceLabel(recurrenceType?: string, recurrenceInterval?: number): string {
  if (!recurrenceType) return "One-time";
  const interval = recurrenceInterval || 1;
  switch (recurrenceType) {
    case "hourly": return `Every ${interval === 1 ? "hour" : `${interval} hours`}`;
    case "daily": return `Every ${interval === 1 ? "day" : `${interval} days`}`;
    case "weekly": return `Every ${interval === 1 ? "week" : `${interval} weeks`}`;
    default: return recurrenceType;
  }
}

type FrequencyRow = { exerciseName: string; count: number };

function computeExerciseFrequency(completions: CompletionRecord[]): FrequencyRow[] {
  const map = new Map<string, number>();
  for (const c of completions) {
    const name = c.exerciseName || c.scheduleTitle || "Unknown";
    map.set(name, (map.get(name) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([exerciseName, count]) => ({ exerciseName, count }))
    .sort((a, b) => b.count - a.count);
}

type AdherenceRow = {
  scheduleTitle: string;
  exerciseName?: string;
  recurrence: string;
  totalOccurrences: number;
  completedOnTime: number;
  adherenceRate: number;
};

function computeScheduleAdherence(schedules: ExerciseSchedule[], completions: CompletionRecord[]): AdherenceRow[] {
  const completionsBySchedule = new Map<string, CompletionRecord[]>();
  for (const c of completions) {
    if (!completionsBySchedule.has(c.scheduleId)) completionsBySchedule.set(c.scheduleId, []);
    completionsBySchedule.get(c.scheduleId)!.push(c);
  }
  const rows: AdherenceRow[] = [];
  for (const s of schedules) {
    const totalOccurrences = countExpectedOccurrences(s.startDatetime, s.recurrenceType, s.recurrenceInterval);
    if (totalOccurrences === 0) continue;
    const schedCompletions = completionsBySchedule.get(s.id) || [];
    const completedOnTime = schedCompletions.length;
    rows.push({
      scheduleTitle: s.title,
      exerciseName: s.exerciseType.name,
      recurrence: getRecurrenceLabel(s.recurrenceType, s.recurrenceInterval),
      totalOccurrences,
      completedOnTime: Math.min(completedOnTime, totalOccurrences),
      adherenceRate: Math.min(completedOnTime / totalOccurrences, 1),
    });
  }
  rows.sort((a, b) => a.adherenceRate - b.adherenceRate);
  return rows;
}

function RateBar({ value }: { value: number }) {
  const color = value >= 0.8 ? "success" : value >= 0.5 ? "warning" : "error";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <LinearProgress
        variant="determinate" value={value * 100}
        color={color}
        sx={{ flex: 1, height: 10, borderRadius: 5 }}
      />
      <Typography variant="body2" sx={{ minWidth: 40, textAlign: "right" }}>
        {(value * 100).toFixed(0)}%
      </Typography>
    </Box>
  );
}

type TabPanelProps = { children: React.ReactNode; value: number; index: number };
function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function Reports() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [dateKey, setDateKey] = useState(0);

  const startDateStr = startDate?.format("YYYY-MM-DD") || "";
  const endDateStr = endDate?.format("YYYY-MM-DD") || "";

  const completionRateQuery = useQuery({
    queryKey: ["completion-rate", startDateStr, endDateStr, dateKey],
    queryFn: () => getCompletionRateReportApi(startDateStr, endDateStr),
    enabled: !!startDateStr && !!endDateStr && tab === 0,
  });

  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: getSchedulesApi });
  const completionsQuery = useQuery({ queryKey: ["completions"], queryFn: () => getCompletionsApi() });

  const missedQuery = useQuery({
    queryKey: ["missed-exercises", startDateStr, endDateStr, dateKey],
    queryFn: () => getMissedExercisesReportApi(startDateStr, endDateStr),
    enabled: !!startDateStr && !!endDateStr && tab === 3,
  });

  const loading = schedulesQuery.isLoading || completionsQuery.isLoading;
  const error = schedulesQuery.error || completionsQuery.error;

  const filteredCompletions = useMemo(() => {
    if (!completionsQuery.data) return [];
    if (!startDate || !endDate) return completionsQuery.data;
    const from = startDate.toDate();
    const to = endDate.toDate();
    to.setHours(23, 59, 59, 999);
    return completionsQuery.data.filter((c) => {
      const d = new Date(c.completionDatetime);
      return d >= from && d <= to;
    });
  }, [completionsQuery.data, startDate, endDate]);

  const frequencyData = useMemo(() => computeExerciseFrequency(filteredCompletions), [filteredCompletions]);
  const adherenceData = useMemo(() => computeScheduleAdherence(schedulesQuery.data || [], filteredCompletions), [schedulesQuery.data, filteredCompletions]);

  const rateColumns: Column<CompletionRatePerExercise>[] = [
    { key: "exerciseName", label: "Exercise", sortable: true },
    { key: "totalScheduled", label: "Scheduled", sortable: true, align: "center" },
    { key: "totalCompleted", label: "Completed", sortable: true, align: "center" },
    { key: "rate", label: "Rate", sortable: true, render: (row) => <RateBar value={row.rate} /> },
  ];

  const freqColumns: Column<FrequencyRow>[] = [
    { key: "exerciseName", label: "Exercise", sortable: true },
    { key: "count", label: "Count", sortable: true, align: "center" },
  ];

  const adherenceColumns: Column<AdherenceRow>[] = [
    { key: "scheduleTitle", label: "Schedule", sortable: true },
    { key: "exerciseName", label: "Exercise", sortable: true, render: (row) => row.exerciseName || "—" },
    { key: "recurrence", label: "Recurrence", render: (row) => <Chip label={row.recurrence} size="small" variant="outlined" /> },
    { key: "totalOccurrences", label: "Expected", sortable: true, align: "center" },
    { key: "completedOnTime", label: "Completed", sortable: true, align: "center" },
    { key: "adherenceRate", label: "Adherence", render: (row) => <RateBar value={row.adherenceRate} /> },
  ];

  return (
    <PageWrapper>
      {/* <Typography variant="h5" sx={{ mb: 2 }}>Reports</Typography> */}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <DatePicker
            label="From"
            value={startDate}
            onChange={(v) => setStartDate(v)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <DatePicker
            label="To"
            value={endDate}
            onChange={(v) => setEndDate(v)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <Button variant="contained" onClick={() => setDateKey((k) => k + 1)}>Apply</Button>
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<BarChartIcon />} label="Completion Rate" iconPosition="start" />
        <Tab icon={<CheckCircleIcon />} label="Exercise Frequency" iconPosition="start" />
        <Tab icon={<CancelIcon />} label="Schedule Adherence" iconPosition="start" />
        <Tab icon={<EventBusyIcon />} label="Missed Exercises" iconPosition="start" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load report data</Alert>}

      <TabPanel value={tab} index={0}>
        {completionRateQuery.isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
          </Box>
        ) : completionRateQuery.error ? (
          <Alert severity="error">Failed to load completion rate report</Alert>
        ) : !completionRateQuery.data ? (
          <Alert severity="info">Select a date range and click Apply.</Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="h3" color={
                      completionRateQuery.data.overallRate >= 0.8 ? "success.main"
                        : completionRateQuery.data.overallRate >= 0.5 ? "warning.main"
                          : "error.main"
                    }>
                      {(completionRateQuery.data.overallRate * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="overline" color="text.secondary">Current Streak</Typography>
                      <WhatshotIcon color="warning" fontSize="small" />
                    </Box>
                    <Typography variant="h3" color="warning.main">{completionRateQuery.data.currentStreak}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Exercises Tracked</Typography>
                    <Typography variant="h3" color="info.main">{completionRateQuery.data.exerciseBreakdown.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Completed vs Missed</Typography>
                  {(() => {
                    const total = completionRateQuery.data.exerciseBreakdown.reduce((s, r) => s + r.totalScheduled, 0);
                    const completed = completionRateQuery.data.exerciseBreakdown.reduce((s, r) => s + r.totalCompleted, 0);
                    const missed = total - completed;
                    const pieData = [
                      { name: "Completed", value: Math.max(completed, 0) },
                      { name: "Missed", value: Math.max(missed, 0) },
                    ];
                    return (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                            {pieData.map((entry, i) => (
                              <Cell key={entry.name} fill={i === 0 ? theme.palette.success.main : theme.palette.error.main} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={24} />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <DataTable
                  columns={rateColumns}
                  data={completionRateQuery.data.exerciseBreakdown}
                  getRowKey={(row) => row.exerciseName}
                  searchable={false}
                  pageSize={10}
                />
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
          </Box>
        ) : frequencyData.length === 0 ? (
          <Alert severity="info">No completions recorded yet.</Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Completions by Exercise</Typography>
                <ResponsiveContainer width="100%" height={Math.max(200, frequencyData.length * 50)}>
                  <BarChart data={frequencyData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="exerciseName" width={130} tick={{ fontSize: 13 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <DataTable columns={freqColumns} data={frequencyData} getRowKey={(row) => row.exerciseName} searchable={false} pageSize={10} />
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tab} index={2}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
          </Box>
        ) : adherenceData.length === 0 ? (
          <Alert severity="info">No schedule data available yet.</Alert>
        ) : (
          <DataTable columns={adherenceColumns} data={adherenceData} getRowKey={(row) => row.scheduleTitle} searchable={false} pageSize={10} />
        )}
      </TabPanel>

      <TabPanel value={tab} index={3}>
        {missedQuery.isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
          </Box>
        ) : missedQuery.error ? (
          <Alert severity="error">Failed to load missed exercises report</Alert>
        ) : !missedQuery.data ? (
          <Alert severity="info">Select a date range and click Apply.</Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Total Missed</Typography>
                    <Typography variant="h3" color="error.main">{missedQuery.data.totalMissed}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Daily Average</Typography>
                    <Typography variant="h3" color="warning.main">
                      {missedQuery.data.dailyBreakdown.length > 0
                        ? (missedQuery.data.totalMissed / missedQuery.data.dailyBreakdown.length).toFixed(1)
                        : "0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Days with Misses</Typography>
                    <Typography variant="h3" color="info.main">
                      {missedQuery.data.dailyBreakdown.filter((d) => d.missedCount > 0).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Missed Exercises Trend</Typography>
              {missedQuery.data.dailyBreakdown.length === 0 ? (
                <Alert severity="info">No data for the selected date range.</Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={missedQuery.data.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip labelFormatter={(_v: unknown) => `Date: ${String(_v)}`} />
                        <Bar dataKey="missedCount" name="Missed" fill={theme.palette.error.light} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={missedQuery.data.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} hide />
                        <Tooltip labelFormatter={(_v: unknown) => `Date: ${String(_v)}`} />
                        <Area type="monotone" dataKey="missedCount" name="Missed" stroke={theme.palette.error.main} fill={theme.palette.error.light} fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </>
        )}
      </TabPanel>
    </PageWrapper>
  );
}
