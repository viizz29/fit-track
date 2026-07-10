import PageWrapper from "@/components/layouts/page-wrapper";
import ResendVerificationForm from "./resend-verification-form";

export default function ResendVerification() {
  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <ResendVerificationForm />
    </PageWrapper>
  );
}
