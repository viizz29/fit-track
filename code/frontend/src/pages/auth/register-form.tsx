import { useState } from "react";
import { TextField, Button, Typography, Paper, Box, Alert, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerApi } from "../../api/auth-api";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      registerApi(name, email, password),

    onSuccess: (response) => {
      if (response.status === 201) {
        setSuccessMessage(response.data.message);
      }
    },

    onError: () => {
      console.error("Registration failed");
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
            {(mutation.error as any)?.response?.status === 409
              ? "An account with this email already exists"
              : "Registration failed"}
          </Alert>
        )}

        {successMessage ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
            <Alert severity="success" sx={{ width: "100%" }}>
              {successMessage}
            </Alert>
            <Button component={Link} to="/login" fullWidth variant="contained">
              Go to Login
            </Button>
          </Box>
        ) : (
          <Formik
            initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
            validationSchema={Yup.object({
              name: Yup.string().required("Required"),
              email: Yup.string().email("Invalid email").required("Required"),
              password: Yup.string().min(6, "At least 6 characters").required("Required"),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("Required"),
            })}
            onSubmit={(values, { setSubmitting }) => {
              mutation.mutate({ name: values.name, email: values.email, password: values.password });
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
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />

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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />

                <Button type="submit" fullWidth variant="contained">
                  Register
                </Button>

                <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                  Already have an account? <Link to="/login">Login</Link>
                </Typography>
              </Box>
            )}
          </Formik>
        )}
      </Paper>
    </Box>
  );
}
