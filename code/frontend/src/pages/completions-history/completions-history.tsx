import { useState } from "react";
import {
  Paper, Box, TextField, MenuItem, Button, IconButton, Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import DataTable from "@/components/data-display/data-table";
import ConfirmDeleteDialog from "@/components/modals/confirm-delete-dialog";
import { getCompletionsApi, deleteCompletionApi } from "@/api/completions-api";
import { getSchedulesApi } from "@/api/schedules-api";
import type { CompletionRecord } from "@/api/completions-api";
import type { Column } from "@/components/data-display/data-table";
import type { Dayjs } from "dayjs";

export default function CompletionsHistory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [scheduleId, setScheduleId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedulesApi,
  });

  const dateFromStr = dateFrom?.format("YYYY-MM-DD");
  const dateToStr = dateTo?.format("YYYY-MM-DD");

  const filters = {
    dateFrom: dateFromStr || undefined,
    dateTo: dateToStr || undefined,
    scheduleId: scheduleId || undefined,
  };

  const { data: completions, isLoading, isError } = useQuery({
    queryKey: ["completions", filters],
    queryFn: () => getCompletionsApi(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompletionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completions"] });
      toast.info(t("completionRecordDeleted"));
    },
    onError: () => toast.error(t("failedToDeleteCompletionRecord")),
    onSettled: () => setDeleteTarget(null),
  });

  const handleClear = () => {
    setDateFrom(null);
    setDateTo(null);
    setScheduleId("");
  };



  const columns: Column<CompletionRecord>[] = [
    { key: "_exerciseName", label: t("exercise"), sortable: true, render: (row) => row["schedule.exerciseType.name"] },
    { key: "_scheduleTitle", label: t("schedule"), hideOnMobile: true, sortable: true, render: (row) => row["schedule.recurrenceType"] },
    { key: "completionDateTime", label: t("completedAt"), sortable: true, render: (row) => new Date(row.completionDatetime).toLocaleString() },
    {
      key: "actions", label: t("actions"), align: "right", width: 70,
      render: (row) => (
        <IconButton size="small" color="error" onClick={() => setDeleteTarget(row.id)}><DeleteIcon fontSize="small" /></IconButton>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* <Typography variant="h5" sx={{ mb: 3 }}>Completions History</Typography> */}

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <DatePicker
            label={t("from")}
            value={dateFrom}
            onChange={(v) => setDateFrom(v)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <DatePicker
            label={t("to")}
            value={dateTo}
            onChange={(v) => setDateTo(v)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <TextField select label={t("schedule")} size="small" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">{t("all")}</MenuItem>
            {schedules?.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={handleClear}>{t("clear")}</Button>
        </Box>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>{t("failedToLoadCompletions")}</Alert>
      )}

      {!isError && completions && (
        <DataTable
          columns={columns}
          data={completions}
          getRowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage={t("noCompletionsMatch")}
          searchable
          searchPlaceholder={t("searchByExerciseOrSchedule")}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={t("deleteCompletionRecord")}
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
