import { Typography, Button, Box, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DateTimePickerWithTimezone from "@/components/forms/date-time-picker-with-timezone";
import dayjs from "dayjs";
import { useAuth } from "@/context/use-auth";
import { getScheduleApi, updateScheduleApi } from "@/api/schedules-api";
import { getExercisesApi } from "@/api/exercises-api";

const RECURRENCE_TYPES = ["HOURLY", "DAILY", "WEEKLY"];

function toDateInput(iso: string, tz: string): string {
  return dayjs(iso).tz(tz).format("YYYY-MM-DD");
}

function toTimeInput(iso: string, tz: string): string {
  return dayjs(iso).tz(tz).format("HH:mm");
}

type EditScheduleDialogProps = {
  open: boolean;
  scheduleId: string | null;
  onClose: () => void;
};

export default function EditScheduleDialog({ open, scheduleId, onClose }: EditScheduleDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const defaultTz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercisesApi,
  });

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getScheduleApi(scheduleId!),
    enabled: !!scheduleId && open,
  });

  const mutation = useMutation({
    mutationFn: (values: {
      exerciseTypeId: string;
      startDatetime: string;
      timezone: string;
      recurrenceType?: string;
      recurrenceInterval?: number;
    }) => updateScheduleApi(scheduleId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });
      toast.info("Schedule updated");
      onClose();
    },
    onError: () => toast.error("Failed to update schedule"),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Schedule</DialogTitle>
      {isLoading || !schedule ? (
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </DialogContent>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{
            exerciseTypeId: schedule.exerciseTypeId || "",
            startDate: toDateInput(schedule.startDatetime, schedule.timezone || defaultTz),
            startTime: toTimeInput(schedule.startDatetime, schedule.timezone || defaultTz),
            timezone: schedule.timezone || defaultTz,
            recurrenceType: schedule.recurrenceType || "",
            recurrenceInterval: schedule.recurrenceInterval || 1,
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
          {({ handleSubmit, handleChange, setFieldValue, values, errors, touched, resetForm }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                      value={values.recurrenceInterval} onChange={handleChange}
                      error={touched.recurrenceInterval && !!errors.recurrenceInterval}
                      helperText={touched.recurrenceInterval && errors.recurrenceInterval}
                      disabled={!values.recurrenceType}
                      inputProps={{ min: 1 }}
                    />
                  </Box>
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
