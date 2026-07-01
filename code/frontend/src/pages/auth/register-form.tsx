import { useMemo } from "react";
import { TextField, Button, Typography, Paper, Box, Alert, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerApi } from "../../api/auth-api";
import { getTimezones } from "@/utils/timezones";

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function RegisterForm() {
  const navigate = useNavigate();
  const timezones = useMemo(() => getTimezones(), []);

  const mutation = useMutation({
    mutationFn: ({ email, password, timezone }: { email: string; password: string; timezone: string }) =>
      registerApi(email, password, timezone),

    onSuccess: () => {
      navigate("/login");
    },

    onError: () => {
      console.error("Registration failed");
      alert("Registration failed");
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper sx={{ p: 3, width: "100%", maxWidth: 448 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Register
        </Typography>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Registration failed
          </Alert>
        )}

        <Formik
          initialValues={{ email: "", password: "", timezone: DEFAULT_TIMEZONE }}
          validationSchema={Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            password: Yup.string().min(6, "At least 6 characters").required("Required"),
            timezone: Yup.string().required("Required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            mutation.mutate({ email: values.email, password: values.password, timezone: values.timezone });
            setSubmitting(false);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
          }) => (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />

              <TextField
                fullWidth
                select
                label="Timezone"
                name="timezone"
                value={values.timezone}
                onChange={handleChange}
                error={touched.timezone && !!errors.timezone}
                helperText={touched.timezone && errors.timezone}
              >
                {timezones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>

              <Button type="submit" fullWidth variant="contained">
                Register
              </Button>

              <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </Box>
          )}
        </Formik>
      </Paper>
    </Box>
  );
}
