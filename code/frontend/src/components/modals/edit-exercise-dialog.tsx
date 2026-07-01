import { Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getExerciseApi, updateExerciseApi } from "@/api/exercises-api";

type EditExerciseDialogProps = {
  open: boolean;
  exerciseId: string | null;
  onClose: () => void;
};

export default function EditExerciseDialog({ open, exerciseId, onClose }: EditExerciseDialogProps) {
  const queryClient = useQueryClient();

  const { data: exercise, isLoading } = useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: () => getExerciseApi(exerciseId!),
    enabled: !!exerciseId && open,
  });

  const mutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) =>
      updateExerciseApi(exerciseId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercise", exerciseId] });
      toast.info("Exercise updated");
      onClose();
    },
    onError: () => toast.error("Failed to update exercise"),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Exercise</DialogTitle>
      {isLoading || !exercise ? (
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </DialogContent>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{ name: exercise.name, description: exercise.description || "" }}
          validationSchema={Yup.object({
            name: Yup.string().required("Required"),
            description: Yup.string(),
          })}
          onSubmit={(values) => mutation.mutate(values)}
        >
          {({ handleSubmit, handleChange, values, errors, touched, resetForm }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth label="Exercise Name" name="name"
                    value={values.name} onChange={handleChange}
                    error={touched.name && !!errors.name} helperText={touched.name && errors.name}
                  />
                  <TextField
                    fullWidth label="Description" name="description"
                    value={values.description} onChange={handleChange}
                    error={touched.description && !!errors.description} helperText={touched.description && errors.description}
                    multiline rows={3}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogActions>
            </Box>
          )}
        </Formik>
      )}
    </Dialog>
  );
}
