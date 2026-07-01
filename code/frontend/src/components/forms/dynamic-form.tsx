import { TextField, Button, Box } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useRef } from 'react';
import * as Yup from 'yup';

type Props = {
  fields: string[];
  validationSchema: { [key: string]: Yup.AnySchema };
  onSubmit: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
};

export default function DynamicForm({
  fields,
  validationSchema,
  onSubmit,
  initialValues: providedValues,
}: Props) {
  const fieldRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Create initial values dynamically
  const initialValues = fields.reduce((acc, field) => {
    acc[field] = providedValues?.[field] ?? '';
    return acc;
  }, {} as Record<string, string>);

  // Create Yup schema dynamically
  const schema = Yup.object(validationSchema);

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit,
  });

  const focusFirstItem = () => {
    if (fieldRefs.current[0]) {
      fieldRefs.current[0].focus();
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      focusFirstItem();
    }, 500);
    return () => clearTimeout(timer);
  }, [])

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      {fields.map((field) => (
        <TextField
          key={field}
          label={field}
          {...formik.getFieldProps(field)}
          error={formik.touched[field] && Boolean(formik.errors[field])}
          helperText={formik.touched[field] && formik.errors[field]}
          fullWidth
        />
      ))}

      <Button type="submit" variant="contained">
        Submit
      </Button>
    </Box>
  );
}