import { useEffect } from "react";
import { Typography, Paper, Alert, CircularProgress, Link } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyEmailApi } from "../../api/auth-api";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const mutation = useMutation({
    mutationFn: () => verifyEmailApi(token),
    onSuccess: () => {},
    onError: () => {},
  });

  useEffect(() => {
    if (token) {
      mutation.mutate();
    }
  }, [token]);

  if (!token) {
    return (
      <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Paper sx={{ p: 3, width: "100%", maxWidth: 448 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or missing verification token.
          </Alert>
        </Paper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 448, textAlign: "center" }}>
        {mutation.isPending && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {mutation.isSuccess && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your email has been verified successfully!
            </Alert>
            <Typography variant="body2">
              <Link href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                Go to Login
              </Link>
            </Typography>
          </>
        )}

        {mutation.isError && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {(mutation.error as any)?.response?.status === 409
                ? "Email is already verified"
                : "Failed to verify email. The link may be invalid or expired."}
            </Alert>
            <Typography variant="body2">
              <Link href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                Go to Login
              </Link>
            </Typography>
          </>
        )}
      </Paper>
    </PageWrapper>
  );
}
