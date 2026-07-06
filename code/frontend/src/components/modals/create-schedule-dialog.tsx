import { Typography, Button, Box, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, ListItemText } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DateTimePickerWithTimezone from "@/components/forms/date-time-picker-with-timezone";
import dayjs from "dayjs";
import { useAuth } from "@/context/use-auth";
import { createScheduleApi } from "@/api/schedules-api";
import { getExercisesApi } from "@/api/exercises-api";

const RECURRENCE_TYPES = ["DAILY", "WEEKLY"];
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type CreateScheduleDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateScheduleDialog({ open, onClose }: CreateScheduleDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const defaultTz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercisesApi,
  });

  const mutation = useMutation({
    mutationFn: createScheduleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.info(t("scheduleCreated"));
      onClose();
    },
    onError: () => toast.error(t("failedToCreateSchedule")),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("newSchedule")}</DialogTitle>
      <Formik
        initialValues={{
          exerciseTypeId: "",
          startDate: dayjs().format("YYYY-MM-DD"),
          startTime: dayjs().format("HH:mm"),
          timezone: defaultTz,
          recurrenceType: "DAILY",
          weekdays: [] as string[],
        }}
        validationSchema={Yup.object({
          exerciseTypeId: Yup.string().required(t("selectExercise")),
          startDate: Yup.string().required(t("required")),
          startTime: Yup.string().required(t("required")),
          timezone: Yup.string().required(t("required")),
          recurrenceType: Yup.string(),
          weekdays: Yup.array().when("recurrenceType", {
            is: "WEEKLY",
            then: (s) => s.min(1, t("selectAtLeastOneDay")).required(t("required")),
            otherwise: (s) => s.notRequired(),
          }),
        })}
        onSubmit={(values) => {
          mutation.mutate({
            exerciseTypeId: values.exerciseTypeId,
            startDatetime: `${values.startDate}T${values.startTime}`,
            timezone: values.timezone,
            recurrenceType: values.recurrenceType || undefined,
            weekdays: values.recurrenceType === "WEEKLY" ? values.weekdays : undefined,
          });
        }}
      >
        {({ handleSubmit, handleChange, setFieldValue, values, errors, touched, resetForm }) => {
          const showWeekdays = values.recurrenceType === "WEEKLY";
          return (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth select label={t("exercise")} name="exerciseTypeId"
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

                  <Typography variant="subtitle2" sx={{ mt: 1 }}>{t("recurrenceOptional")}</Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth select label={t("type")} name="recurrenceType"
                      value={values.recurrenceType} onChange={handleChange}
                    >
                      <MenuItem value="">{t("none")}</MenuItem>
                      {RECURRENCE_TYPES.map((r) => (
                        <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
                      ))}
                    </TextField>
                    {showWeekdays && (
                      <TextField
                        fullWidth select label={t("days")} name="weekdays"
                        value={values.weekdays} onChange={handleChange}
                        error={touched.weekdays && !!errors.weekdays}
                        helperText={touched.weekdays && errors.weekdays}
                        SelectProps={{ multiple: true, renderValue: (selected: unknown) => (selected as string[]).join(", ") }}
                      >
                        {WEEKDAYS.map((d) => (
                          <MenuItem key={d} value={d}>
                            <Checkbox checked={values.weekdays.includes(d)} />
                            <ListItemText primary={d} />
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { resetForm(); onClose(); }}>{t("cancel")}</Button>
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                  {mutation.isPending ? t("creating") : t("create")}
                </Button>
              </DialogActions>
            </Box>
          );
        }}
      </Formik>
    </Dialog>
  );
}
