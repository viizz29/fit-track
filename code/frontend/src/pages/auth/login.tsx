import PageWrapper from "@/components/layouts/page-wrapper";
import LoginForm from "./login-form";

export default function Login() {
  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <LoginForm />
    </PageWrapper>
  );
}