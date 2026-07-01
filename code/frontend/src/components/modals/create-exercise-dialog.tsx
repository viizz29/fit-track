import { Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createExerciseApi } from "@/api/exercises-api";

type CreateExerciseDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateExerciseDialog({ open, onClose }: CreateExerciseDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExerciseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.info("Exercise created");
      onClose();
    },
    onError: (err) => {
      if ((err as any)?.response?.status === 409) {
        toast.info("Exercise already exists");
      } else {
        toast.error("Failed to create exercise");
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Exercise</DialogTitle>
      <Formik
        initialValues={{ name: "", description: "" }}
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
                {mutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Formik>
    </Dialog>
  );
}
