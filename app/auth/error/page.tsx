"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div style={{ padding: 40, color: "white", background: "#111", minHeight: "100vh" }}>
      <h1>Auth Error</h1>
      <p>Error code: <strong style={{ color: "red" }}>{error ?? "none"}</strong></p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "white", background: "#111", minHeight: "100vh" }}>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}