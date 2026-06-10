"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoText } from "@/components/logo";

const getSignInErrorMessage = (error: string) => {
  if (error === "CredentialsSignin") {
    return "Invalid phone number or password";
  }

  return "Unable to sign in. Please try again.";
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // OTP flow state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showOtp) {
      otpInputRef.current?.focus();
      return;
    }

    phoneInputRef.current?.focus();
  }, [showOtp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!phone || !password) {
        toast.error("Please fill in all fields");
        return;
      }
      const credentialsRes = await fetch("/api/auth/credentials/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!credentialsRes.ok) {
        const data = await credentialsRes.json().catch(() => null);
        toast.error(data?.message || "Invalid phone number or password");
        return;
      }

      const credentialsData = await credentialsRes.json();
      const verifiedPhone = credentialsData.phone || phone;

      const otpRes = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: verifiedPhone }),
      });
      if (!otpRes.ok) {
        const errData = await otpRes.json().catch(() => null);
        console.error('OTP request failed', otpRes.status, errData);
        toast.error("An error occurred. Please try again.");
        return;
      }

      setPhone(verifiedPhone);
      setShowOtp(true);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = useCallback(async () => {
    let shouldRedirect = false;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("OTP verification failed", res.status, data);
        setOtp("");
        otpInputRef.current?.focus();
        toast.error("An error occurred. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        toast.error(result?.error ? getSignInErrorMessage(result.error) : "Unable to complete sign in");
        return;
      }

      toast.success("OTP verified! Redirecting...");
      shouldRedirect = true;
      setIsRedirecting(true);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setOtp("");
      otpInputRef.current?.focus();
      toast.error("Failed to verify OTP");
    } finally {
      if (!shouldRedirect) {
        setIsLoading(false);
      }
    }
  }, [otp, password, phone, router]);

  useEffect(() => {
    if (!showOtp || otp.length !== 6 || isLoading || isRedirecting) {
      return;
    }

    void verifyOtp();
  }, [otp, showOtp, isLoading, isRedirecting, verifyOtp]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp();
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {isRedirecting && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-neutral-950/80 text-white backdrop-blur-sm"
        >
          <Loader2 className="h-10 w-10 animate-spin text-green-500" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-200">Loading dashboard...</p>
        </div>
      )}
      <header className="bg-neutral-900 backdrop-blur supports-[backdrop-filter]:bg-neutral-900">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <LogoText />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-neutral-950 px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl border-neutral-800 bg-neutral-950">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center text-white">Welcome to Globizs</CardTitle>
            <CardDescription className="text-center text-slate-400">
              {showOtp ? "Enter your verification code" : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showOtp ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={otpInputRef}
                    type="text"
                    placeholder="000000"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white text-center text-2xl tracking-widest"
                  />
                </div>
                <Button type="submit" disabled={isLoading || isRedirecting} className="w-full bg-green-600 hover:bg-green-700">
                  {isRedirecting ? "Loading dashboard..." : isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-200">Phone</label>
                  <Input
                    ref={phoneInputRef}
                    id="phone"
                    type="text"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-green-700 hover:bg-green-800">
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-neutral-900 backdrop-blur supports-[backdrop-filter]:bg-neutral-900 py-4 text-center text-sm text-slate-300">
        <p>&copy; 2026 Globizs. All rights reserved.</p>
      </footer>
    </div>
  );
}
