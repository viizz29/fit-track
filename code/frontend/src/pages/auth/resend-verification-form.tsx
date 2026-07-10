import { TextField, Button, Typography, Paper, Box, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { resendEmailVerificationLink } from "../../api/auth-api";

export default function ResendVerificationForm() {
  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      resendEmailVerificationLink(email),
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
          Resend Verification Email
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Enter your email and we'll resend the verification link.
        </Typography>

        {mutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Verification email sent! Check your inbox.
          </Alert>
        )}

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to resend verification email
          </Alert>
        )}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            mutation.mutate(values);
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

              <Button type="submit" fullWidth variant="contained">
                Resend Verification
              </Button>

              <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                <Link to="/login">Back to Login</Link>
              </Typography>
            </Box>
          )}
        </Formik>
      </Paper>
    </Box>
  );
}
