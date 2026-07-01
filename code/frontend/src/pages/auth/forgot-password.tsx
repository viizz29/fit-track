import PageWrapper from "@/components/layouts/page-wrapper";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPassword() {
  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <ForgotPasswordForm />
    </PageWrapper>
  );
}
