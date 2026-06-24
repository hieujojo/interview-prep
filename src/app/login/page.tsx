import { Suspense } from "react";
import LoginView from "@/components/auth/LoginView";

export const metadata = {
  title: "Đăng nhập – Interview Prep",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
