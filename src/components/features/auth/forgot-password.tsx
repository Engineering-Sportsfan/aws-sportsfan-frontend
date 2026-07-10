"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep]               = useState<Step>("email");
  const [email, setEmail]             = useState("");
  const [otpDigits, setOtpDigits]     = useState(["","","","","",""]);
  const [resetToken, setResetToken]   = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [resendMsg, setResendMsg]     = useState("");

  // ── Password validation ───────────────────────
  const has8       = password.length >= 8;
  const hasUpper   = /[A-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passValid  = has8 && hasUpper && hasSpecial;
  const passMatch  = password === confirmPass && confirmPass.length > 0;

  const otp = otpDigits.join("");

  // ── OTP input helpers ─────────────────────────
  function handleOtpChange(val: string, i: number) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val;
    setOtpDigits(next);
    if (val && i < 5) document.getElementById(`fotp-${i + 1}`)?.focus();
  }

  function handleOtpKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0)
      document.getElementById(`fotp-${i - 1}`)?.focus();
  }

  // ── Step 1: Send OTP ──────────────────────────
  async function handleSendOtp() {
    if (!email) return;
    setLoading(true); setError("");
    try {
      await axios.post("/api/auth/forgot-password/send-otp", { email });
      setStep("otp");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg    = err.response?.data?.error;
        if (status === 404) setError("No account found with this email.");
        else if (status === 403) setError(msg ?? "Account access denied.");
        else if (status === 429) setError("Too many attempts. Please wait 10 minutes.");
        else setError(msg ?? "Failed to send OTP. Please try again.");
      } else {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ────────────────────────
  async function handleVerifyOtp() {
    if (otp.length < 6) return;
    setLoading(true); setError("");
    try {
      const res = await axios.post("/api/auth/forgot-password/verify-otp", { email, otp });
      setResetToken(res.data.resetToken); // store reset token
      setStep("password");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg    = err.response?.data?.error;
        if (status === 400) setError(msg ?? "Invalid or expired OTP.");
        else setError(msg ?? "Verification failed. Please try again.");
      } else {
        setError("Unable to verify OTP. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────
  async function handleResend() {
    setResendMsg(""); setError("");
    try {
      await axios.post("/api/auth/forgot-password/send-otp", { email });
      setOtpDigits(["","","","","",""]);
      setResendMsg("New OTP sent! Check your email.");
      document.getElementById("fotp-0")?.focus();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) setError("Too many attempts. Please wait 10 minutes.");
        else setError(err.response?.data?.error ?? "Failed to resend OTP.");
      } else {
        setError("Unable to resend OTP.");
      }
    }
  }

  // ── Step 3: Reset Password ────────────────────
  async function handleResetPassword() {
    if (!passValid || !passMatch) return;
    setLoading(true); setError("");
    try {
      await axios.post("/api/auth/forgot-password/reset-password", {
        resetToken,
        password,
      });
      setStep("done");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg    = err.response?.data?.error;
        if (status === 401) setError("Reset link expired. Please start over.");
        else if (status === 400) setError(msg ?? "Invalid password.");
        else setError(msg ?? "Failed to reset password. Please try again.");
      } else {
        setError("Unable to reset password. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-black/40 text-white px-4 py-3 rounded-xl text-sm outline-none placeholder:text-gray-500 border border-transparent focus:border-gray-600 transition";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 relative bg-gradient-to-b from-[#3a0000] via-black to-[#120000]">

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-600/20 pointer-events-none" />

      {/* Logo + Title */}
      <div className="flex flex-col items-center z-10">
        <img src="/images/Logo.png" alt="logo" className="lg:w-[56px] lg:h-[66.66px] mb-2" />
        <h1 className="text-white text-2xl font-semibold text-center">
          {step === "email"    && "Forgot password?"}
          {step === "otp"      && "Verify your email"}
          {step === "password" && "Set new password"}
          {step === "done"     && "Password reset!"}
        </h1>
      </div>

      {/* ── STEP: EMAIL ── */}
      {step === "email" && (
        <div className="relative z-10 w-[300px] md:w-full max-w-sm px-5 py-8 rounded-3xl bg-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <p className="text-gray-400 text-sm text-center mb-6">
            Enter your registered email and we&apos;ll send you an OTP to reset your password.
          </p>
          <input
            type="email"
            placeholder="Email Address"
            className={inputCls + " mb-4"}
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSendOtp()}
          />
          {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
          <button
            onClick={handleSendOtp}
            disabled={loading || !email}
            className="w-full bg-gray-300 text-black py-3 rounded-full font-medium mb-4 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
          <p className="text-gray-400 text-sm text-center">
            Remember your password?{" "}
            <Link href="/auth/login">
              <span className="text-white font-semibold cursor-pointer">Log in</span>
            </Link>
          </p>
        </div>
      )}

      {/* ── STEP: OTP ── */}
      {step === "otp" && (
        <div className="relative z-10 w-[340px] md:w-full max-w-sm px-5">
          <div className="rounded-3xl bg-[#1a1a1a] px-6 py-7 shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-white text-lg font-semibold">Enter the OTP</h2>
              <button
                onClick={() => { setStep("email"); setOtpDigits(["","","","","",""]); setError(""); }}
                className="text-gray-400 hover:text-white text-xl"
              >×</button>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              OTP sent to <span className="text-white font-medium">{email}</span>
            </p>

            {/* OTP boxes */}
            <div className="flex gap-2 mb-6 justify-between">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  id={`fotp-${i}`}
                  type="text" inputMode="numeric"
                  maxLength={1} value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)}
                  className="w-11 h-12 text-center text-white text-xl font-semibold bg-black/50 border border-gray-600 rounded-xl outline-none focus:border-gray-300 transition"
                />
              ))}
            </div>

            {error     && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
            {resendMsg && <p className="text-green-400 text-xs text-center mb-3">{resendMsg}</p>}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-gray-300 text-black py-3 rounded-full font-medium mb-3 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Confirm"}
            </button>
            <button
              onClick={handleResend}
              className="w-full border border-gray-500 text-white py-3 rounded-full font-medium hover:bg-white/10 transition"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: NEW PASSWORD ── */}
      {step === "password" && (
        <div className="relative z-10 w-[300px] md:w-full max-w-sm px-5 py-8 rounded-3xl bg-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                className={inputCls + " pr-10"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                className={inputCls + " pr-10"}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleResetPassword()}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Validation hints */}
          <div className="grid grid-cols-2 gap-1 mb-5">
            {[
              { ok: has8,       label: "8+ characters"      },
              { ok: hasUpper,   label: "1 Uppercase"         },
              { ok: hasSpecial, label: "1 special character" },
              { ok: passMatch,  label: "Passwords match"     },
            ].map(({ ok, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${ok ? "text-green-400" : "text-gray-600"}`}>
                  {ok ? "✓" : "○"}
                </span>
                <span className={`text-xs ${ok ? "text-green-400" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

          <button
            onClick={handleResetPassword}
            disabled={loading || !passValid || !passMatch}
            className="w-full bg-gray-300 text-black py-3 rounded-full font-medium mb-3 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
          <button
            onClick={() => { setStep("otp"); setError(""); }}
            className="w-full border border-gray-500 text-white py-3 rounded-full font-medium hover:bg-white/10 transition"
          >
            Back
          </button>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && (
        <div className="relative z-10 w-[300px] md:w-full max-w-sm px-5 py-10 rounded-3xl bg-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white text-lg font-semibold mb-2">Password reset successfully!</h2>
          <p className="text-gray-400 text-sm mb-6">
            You can now log in with your new password.
          </p>
          <button
            onClick={() => window.location.href = "/auth/login"}
            className="w-full bg-gray-300 text-black py-3 rounded-full font-medium hover:bg-white transition"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
