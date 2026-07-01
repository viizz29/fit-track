import { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Switch,
  Slider,
  FormControl,
  InputLabel,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import * as Yup from "yup";

type FieldType =
  | "string"
  | "number"
  | "date"
  | "select"
  | "range"
  | "boolean";

type Option = {
  label: string;
  value: string | number;
};

type Props<T = any> = {
  name: string;
  label: string;
  type: FieldType;
  value: T;
  onValueChange: (value: T) => void;

  // Optional props
  options?: Option[]; // for select
  min?: number; // for range
  max?: number; // for range
  step?: number; // for range
  validationSchema?: Yup.Schema<T>; // optional validation
};

const DynamicField = <T,>({
  // name,
  label,
  type,
  value,
  onValueChange,
  options = [],
  min = 0,
  max = 100,
  step = 1,
  validationSchema,
}: Props<T>) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (newValue: any) => {
    if (validationSchema) {
      try {
        await validationSchema.validate(newValue);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    onValueChange(newValue);
  };

  switch (type) {
    case "string":
      return (
        <TextField
          fullWidth
          label={label}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          error={!!error}
          helperText={error}
        />
      );

    case "number":
      return (
        <TextField
          fullWidth
          type="number"
          label={label}
          value={value ?? ""}
          onChange={(e) => handleChange(Number(e.target.value))}
          error={!!error}
          helperText={error}
        />
      );

    case "date":
      return (
        <TextField
          fullWidth
          type="date"
          label={label}
          InputLabelProps={{ shrink: true }}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          error={!!error}
          helperText={error}
        />
      );

    case "select":
      return (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={value ?? ""}
            label={label}
            onChange={(e) => handleChange(e.target.value)}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      );

    case "range":
      return (
        <FormControl fullWidth error={!!error}>
          <Slider
            value={Number(value) || 0}
            min={min}
            max={max}
            step={step}
            onChange={(_, val) => handleChange(val)}
            valueLabelDisplay="auto"
          />
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      );

    case "boolean":
      return (
        <FormControl error={!!error}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleChange(e.target.checked)}
              />
            }
            label={label}
          />
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      );

    default:
      return null;
  }
};

export default DynamicField;