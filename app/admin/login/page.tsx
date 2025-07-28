"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// You can replace this with your actual logo or an SVG icon
const Logo = () => (
  <div className="flex justify-center mb-4">
    <div className="bg-blue-600 rounded-full p-3 shadow-lg">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d="M8 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

const AdminLoginPage = () => {
  const [step, setStep] = useState<"login" | "otp" | "success">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // Step 1: Email/Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setInfo("");
    // Check credentials (do not sign in yet)
    const res = await fetch("/api/admin/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to send OTP");
      return;
    }
    setStep("otp");
    setInfo("OTP sent to your email. Please enter the 8-digit code.");
  };

  // Step 2: OTP
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setInfo("");
    // Verify OTP
    const res = await fetch("/api/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Invalid OTP");
      return;
    }
    // Now sign in with NextAuth (adminLogin flag)
    setStep("success");
    setInfo("You are logged in for 7 days.");
    await signIn("credentials", {
      email,
      password,
      adminLogin: true,
      callbackUrl: "/admin",
    });
  };

  React.useEffect(() => {
    if (step === "success" && session && (session.user as any)?.userType === "admin") {
      router.replace("/admin");
    }
  }, [step, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md border border-blue-100 animate-fade-in">
        <Logo />
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Admin Login</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Welcome back! Please enter your credentials to access the admin dashboard.</p>
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition-colors disabled:opacity-60 mt-2"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Next"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleOtp} className="space-y-5">
            <div className="flex flex-col items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter 8-digit OTP</label>
              <InputOTP
                maxLength={8}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
                inputMode="numeric"
                autoFocus
              >
                <InputOTPGroup>
                  {[...Array(8)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {info && <div className="text-blue-600 text-sm text-center">{info}</div>}
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition-colors disabled:opacity-60 mt-2"
              disabled={loading || otp.length !== 8}
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        )}
        {step === "success" && (
          <div className="text-green-600 text-center font-semibold py-6">
            You are logged in for 7 days.<br />Redirecting to admin dashboard...
          </div>
        )}
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminLoginPage; 