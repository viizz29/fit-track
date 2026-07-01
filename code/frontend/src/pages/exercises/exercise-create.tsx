import { Typography, Button, Box, Paper, TextField } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import { createExerciseApi } from "@/api/exercises-api";

export default function ExerciseCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExerciseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.info("Exercise created");
      navigate("/exercises");
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
    <PageWrapper>
      <Typography variant="h5" sx={{ mb: 3 }}>
        New Exercise
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 480, borderRadius: 2 }}>
        <Formik
          initialValues={{ name: "", description: "" }}
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
                  {mutation.isPending ? "Creating..." : "Create"}
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
