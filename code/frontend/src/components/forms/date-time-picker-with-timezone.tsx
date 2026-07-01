import { useMemo } from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { getTimezones } from "@/utils/timezones";
import type { Dayjs } from "dayjs";

interface DateTimePickerWithTimezoneProps {
  dateValue: string;
  timeValue: string;
  timezoneValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
  timezoneError?: string;
  dateLabel?: string;
  timeLabel?: string;
  timezoneLabel?: string;
  disabled?: boolean;
}

export default function DateTimePickerWithTimezone({
  dateValue,
  timeValue,
  timezoneValue,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
  dateError,
  timeError,
  timezoneError,
  dateLabel = "Date",
  timeLabel = "Time",
  timezoneLabel = "Timezone",
  disabled = false,
}: DateTimePickerWithTimezoneProps) {
  const timezones = useMemo(() => getTimezones(), []);

  const dayjsDate = dateValue ? dayjs(dateValue, "YYYY-MM-DD") : null;
  const dayjsTime = timeValue
    ? dayjs(`${dateValue || "2000-01-01"}T${timeValue}`)
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <DatePicker
          label={dateLabel}
          value={dayjsDate}
          onChange={(newValue: Dayjs | null) => {
            onDateChange(newValue ? newValue.format("YYYY-MM-DD") : "");
          }}
          disabled={disabled}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!dateError,
              helperText: dateError,
              size: "small",
            },
          }}
          sx={{ flex: 1 }}
        />
        <TimePicker
          label={timeLabel}
          value={dayjsTime}
          onChange={(newValue: Dayjs | null) => {
            onTimeChange(newValue ? newValue.format("HH:mm") : "");
          }}
          disabled={disabled}
          format="hh:mm A"
          ampm={true}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!timeError,
              helperText: timeError,
              size: "small",
            },
          }}
          sx={{ flex: 1 }}
        />
      </Box>
      <TextField
        fullWidth
        select
        label={timezoneLabel}
        value={timezoneValue}
        onChange={(e) => onTimezoneChange(e.target.value)}
        error={!!timezoneError}
        helperText={timezoneError}
        size="small"
        disabled={disabled}
      >
        {timezones.map((tz) => (
          <MenuItem key={tz} value={tz}>
            {tz}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
