import { Typography, Button, Box, Paper, TextField, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import { getExerciseApi, updateExerciseApi } from "@/api/exercises-api";

export default function ExerciseEdit() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: exercise, isLoading, isError } = useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: () => getExerciseApi(exerciseId!),
    enabled: !!exerciseId,
  });

  const mutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) =>
      updateExerciseApi(exerciseId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercise", exerciseId] });
      toast.info("Exercise updated");
      navigate("/exercises");
    },
    onError: () => toast.error("Failed to update exercise"),
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <Typography sx={{ color: "text.secondary" }}>Loading...</Typography>
      </PageWrapper>
    );
  }

  if (isError || !exercise) {
    return (
      <PageWrapper>
        <Alert severity="error">Exercise not found.</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/exercises")}>
          Back to Exercises
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Exercise
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 480, borderRadius: 2 }}>
        <Formik
          enableReinitialize
          initialValues={{ name: exercise.name, description: exercise.description || "" }}
          validationSchema={Yup.object({
            name: Yup.string().required("Required"),
            description: Yup.string(),
          })}
          onSubmit={(values) => mutation.mutate(values)}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Exercise Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                multiline
                rows={3}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/exercises")}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      </Paper>
    </PageWrapper>
  );
}
