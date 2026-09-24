"use client";
import Onboarding from "@/src/components/NewROARComponent/screens/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  return <Onboarding onComplete={() => router.push("/MainModules/HomePage")} />;
}
