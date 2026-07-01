import { Typography, Button, Box, TextField, MenuItem, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import FormCard from "@/components/forms/form-card";
import DateTimePickerWithTimezone from "@/components/forms/date-time-picker-with-timezone";
import dayjs from "dayjs";
import { useAuth } from "@/context/use-auth";
import { createScheduleApi } from "@/api/schedules-api";
import { getExercisesApi } from "@/api/exercises-api";

const RECURRENCE_TYPES = ["HOURLY", "DAILY", "WEEKLY"];

export default function ScheduleCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const defaultTz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: exercises, isError: exercisesError } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercisesApi,
  });

  const mutation = useMutation({
    mutationFn: createScheduleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.info("Schedule created");
      navigate("/schedules");
    },
    onError: () => toast.error("Failed to create schedule"),
  });

  return (
    <PageWrapper>
      {exercisesError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load exercises.</Alert>
      )}

      <PageHeader title="New Schedule" onBack={() => navigate(-1)} />

      <FormCard title="New Schedule" maxWidth={480}>
        <Formik
          initialValues={{
            exerciseTypeId: "",
            startDate: dayjs().format("YYYY-MM-DD"),
            startTime: dayjs().format("HH:mm"),
            timezone: defaultTz,
            recurrenceType: "DAILY",
            recurrenceInterval: 1,
          }}
          validationSchema={Yup.object({
            exerciseTypeId: Yup.string().required("Select an exercise"),
            startDate: Yup.string().required("Required"),
            startTime: Yup.string().required("Required"),
            timezone: Yup.string().required("Required"),
            recurrenceType: Yup.string(),
            recurrenceInterval: Yup.number().when("recurrenceType", {
              is: (v: string) => v.length > 0,
              then: (s) => s.min(1, "Must be > 0").required("Required"),
              otherwise: (s) => s.notRequired(),
            }),
          })}
          onSubmit={(values) => {
            mutation.mutate({
              exerciseTypeId: values.exerciseTypeId,
              startDatetime: `${values.startDate}T${values.startTime}`,
              timezone: values.timezone,
              recurrenceType: values.recurrenceType || undefined,
              recurrenceInterval: values.recurrenceType ? values.recurrenceInterval : undefined,
            });
          }}
        >
          {({ handleSubmit, handleChange, handleBlur, setFieldValue, values, errors, touched }) => (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth select label="Exercise" name="exerciseTypeId"
                value={values.exerciseTypeId} onChange={handleChange}
                error={touched.exerciseTypeId && !!errors.exerciseTypeId} helperText={touched.exerciseTypeId && errors.exerciseTypeId}
              >
                {exercises?.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
                ))}
              </TextField>

              <DateTimePickerWithTimezone
                dateValue={values.startDate}
                timeValue={values.startTime}
                timezoneValue={values.timezone}
                onDateChange={(v) => setFieldValue("startDate", v)}
                onTimeChange={(v) => setFieldValue("startTime", v)}
                onTimezoneChange={(v) => setFieldValue("timezone", v)}
                dateError={touched.startDate && typeof errors.startDate === "string" ? errors.startDate : undefined}
                timeError={touched.startTime && typeof errors.startTime === "string" ? errors.startTime : undefined}
                timezoneError={touched.timezone && typeof errors.timezone === "string" ? errors.timezone : undefined}
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Recurrence (optional)</Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth select label="Type" name="recurrenceType"
                  value={values.recurrenceType} onChange={handleChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {RECURRENCE_TYPES.map((r) => (
                    <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth label="Interval" type="number" name="recurrenceInterval"
                  value={values.recurrenceInterval} onChange={handleChange} onBlur={handleBlur}
                  error={touched.recurrenceInterval && !!errors.recurrenceInterval}
                  helperText={touched.recurrenceInterval && errors.recurrenceInterval}
                  disabled={!values.recurrenceType}
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/schedules")}>Cancel</Button>
              </Box>
            </Box>
          )}
        </Formik>
      </FormCard>
    </PageWrapper>
  );
}
