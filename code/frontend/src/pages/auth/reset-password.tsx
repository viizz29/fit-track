import PageWrapper from "@/components/layouts/page-wrapper";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPassword() {
  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <ResetPasswordForm />
    </PageWrapper>
  );
}
