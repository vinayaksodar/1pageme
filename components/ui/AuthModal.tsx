"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) => {
  const { initializeServerSync } = useResumeStore();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      await initializeServerSync(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setConfirmPassword("");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        <div className="p-8 md:p-12">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {mode === "login"
                  ? "Sign in to access your resumes"
                  : "Start building your professional resume today"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="group -mr-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pr-4 pl-12 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pr-4 pl-12 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              {mode === "register" && (
                <div className="animate-in fade-in slide-in-from-top-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify Password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pr-4 pl-12 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-sm font-black tracking-[0.1em] text-white uppercase shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={toggleMode}
              className="text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
            >
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <span className="text-blue-600">Register</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="text-blue-600">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
