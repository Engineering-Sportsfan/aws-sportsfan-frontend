import { Suspense } from "react";
import RegisterCard from "@/src/components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterCard />
    </Suspense>
  );
}