import { useState } from "react";
import { Alert, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import DataTable from "@/components/data-display/data-table";
import ConfirmDeleteDialog from "@/components/modals/confirm-delete-dialog";
import CreateExerciseDialog from "@/components/modals/create-exercise-dialog";
import EditExerciseDialog from "@/components/modals/edit-exercise-dialog";
import { getExercisesApi, deleteExerciseApi } from "@/api/exercises-api";
import { formatDate } from "@/utils/format-date";
import type { Exercise } from "@/api/exercises-api";
import type { Column } from "@/components/data-display/data-table";

function snippet(text: string | undefined, max = 60): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function Exercises() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const { data: exercises, isLoading, isError } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercisesApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExerciseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.info(t("exerciseDeleted"));
    },
    onError: () => toast.error(t("failedToDeleteExercise")),
    onSettled: () => setDeleteTarget(null),
  });

  const columns: Column<Exercise>[] = [
    { key: "name", label: t("name"), sortable: true },
    { key: "description", label: t("description"), sortable: true, render: (row) => snippet(row.description) },
    { key: "createdAt", label: t("created"), sortable: true, hideOnMobile: true, render: (row) => row.createdAt ? formatDate(new Date(row.createdAt)) : "—" },
    { key: "updatedAt", label: t("updated"), sortable: true, hideOnMobile: true, render: (row) => row.updatedAt ? formatDate(new Date(row.updatedAt)) : "—" },
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

  return (
    <PageWrapper>
      <PageHeader
        title=""
        actionLabel={t("newExercise")}
        actionIcon={<AddIcon />}
        onAction={() => setCreateOpen(true)}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>{t("failedToLoadExercises")}</Alert>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={exercises ?? []}
          getRowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage={t("noExercisesYet")}
        />
      )}

      <CreateExerciseDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditExerciseDialog open={!!editTarget} exerciseId={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={t("deleteExercise")}
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
