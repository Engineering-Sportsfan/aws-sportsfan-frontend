


import { Suspense } from "react";
import LoginScreen from "@/src/components/features/auth/LoginForm";

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginScreen />
        </Suspense>
    );
}