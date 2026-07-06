import { useEffect, useState } from "react";
import { Alert, IconButton, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import DataTable from "@/components/data-display/data-table";
import ConfirmDeleteDialog from "@/components/modals/confirm-delete-dialog";
import CreateScheduleDialog from "@/components/modals/create-schedule-dialog";
import EditScheduleDialog from "@/components/modals/edit-schedule-dialog";
import { getSchedulesApi, deleteScheduleApi } from "@/api/schedules-api";
import type { ExerciseSchedule } from "@/api/schedules-api";
import type { Column } from "@/components/data-display/data-table";

export default function Schedules() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  function getRecurrenceLabel(type: string | undefined, days: string[] | undefined): string {
    if (!type) return t("oneTime");
    if (type === "WEEKLY" && days?.length) return t("weeklyWithDays", { days: days.join(", ") });
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [processedSchedules, setProcessedSchedules] = useState<ExerciseSchedule[]>([]);

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedulesApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.info(t("scheduleDeleted"));
    },
    onError: () => toast.error(t("failedToDeleteSchedule")),
    onSettled: () => setDeleteTarget(null),
  });

  const columns: Column<ExerciseSchedule>[] = [
    { key: "exerciseName", label: t("exercise"), sortable: true, render: (row) => row["exerciseType.name"] || "—" },
    {
      key: "recurrenceType", label: t("recurrence"), width: 110,
      render: (row) => <Chip label={getRecurrenceLabel(row.recurrenceType, row.weekdays)} size="small" variant="outlined" />,
    },
    { key: "exerciseTime", label: t("time"), hideOnMobile: true, sortable: true, render: (row) => new Date(row.startDatetime).toLocaleTimeString() },
    { key: "startDatetime", label: t("start"), hideOnMobile: true, sortable: true, render: (row) => new Date(row.startDatetime).toLocaleDateString() },
    { key: "timezone", label: t("timezone"), hideOnMobile: true, sortable: true, render: (row) => row.timezone || "—" },
    {
      key: "completed", label: t("status"), width: 110,
      hideOnMobile: true,
      render: (row) => (
        <Chip label={row.completed ? t("Completed") : t("active")} color={row.completed ? "success" : "primary"} size="small" variant={row.completed ? "filled" : "outlined"} />
      ),
    },
    {
      key: "actions", label: t("actions"), align: "right", width: 100,
      render: (row) => (
        <>
          <IconButton size="small" onClick={() => setEditTarget(row.id)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(row.id)}><DeleteIcon fontSize="small" /></IconButton>
        </>
      ),
    },
  ];


  // to enable searching by exercise name
  useEffect(() => {
    if (schedules) {
      const dd: ExerciseSchedule[] = schedules.map((item) => ({
        ...item,
        exerciseName: item["exerciseType.name"],
      }))
      setProcessedSchedules(dd);
    }
  }, [schedules]);

  return (
    <PageWrapper>
      <PageHeader
        title=""
        actionLabel={t("newSchedule")}
        actionIcon={<AddIcon />}
        onAction={() => setCreateOpen(true)}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>{t("failedToLoadSchedules")}</Alert>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={processedSchedules ?? []}
          getRowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage={t("noSchedulesYet")}
        />
      )}

      <CreateScheduleDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditScheduleDialog open={!!editTarget} scheduleId={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={t("deleteSchedule")}
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
