import PageWrapper from "@/components/layouts/page-wrapper";
import RegisterForm from "./register-form";

export default function Register() {
  return (
    <PageWrapper sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <RegisterForm />
    </PageWrapper>
  );
}
