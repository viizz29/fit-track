import { useState } from "react";
import { Alert, IconButton } from "@mui/material";
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
      toast.info("Exercise deleted");
    },
    onError: () => toast.error("Failed to delete exercise"),
    onSettled: () => setDeleteTarget(null),
  });

  const columns: Column<Exercise>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true, hideOnMobile: true, render: (row) => snippet(row.description) },
    { key: "createdAt", label: "Created", sortable: true, hideOnMobile: true, render: (row) => row.createdAt ? formatDate(new Date(row.createdAt)) : "—" },
    { key: "updatedAt", label: "Updated", sortable: true, hideOnMobile: true, render: (row) => row.updatedAt ? formatDate(new Date(row.updatedAt)) : "—" },
    {
      key: "actions", label: "Actions", align: "right", width: 100,
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
        actionLabel="New Exercise"
        actionIcon={<AddIcon />}
        onAction={() => setCreateOpen(true)}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load exercises.</Alert>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={exercises ?? []}
          getRowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage="No exercises yet. Create your first exercise."
        />
      )}

      <CreateExerciseDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditExerciseDialog open={!!editTarget} exerciseId={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete Exercise"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
