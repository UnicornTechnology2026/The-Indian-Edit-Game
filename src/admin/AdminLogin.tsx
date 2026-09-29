import React, { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from "lucide-react";
import { AdminSession, adminLogin } from "./adminApi";
import logo from "../assets/images/editLogo.svg";

interface AdminLoginProps {
  onLoggedIn: (session: AdminSession) => void;
  initialError?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoggedIn,
  initialError = "",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await adminLogin(email, password);
      onLoggedIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-[#faf5eb]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="The Indian Edit" className="h-16 w-auto" />
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#d4af37]/40 bg-[#140a05]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            <h1 className="font-serif text-xl font-bold text-[#f7e7a9]">
              Admin Sign In
            </h1>
          </div>
          <p className="text-xs text-[#ab9580] mb-5">
            Authorised personnel only.
          </p>

          <label className="block text-[11px] tracking-widest uppercase text-[#ab9580] mb-1">
            Email
          </label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#0c0503] border border-[#d4af37]/30 focus:border-[#d4af37] outline-none text-sm"
            placeholder="admin@example.com"
          />

          <label className="block text-[11px] tracking-widest uppercase text-[#ab9580] mb-1">
            Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#0c0503] border border-[#d4af37]/30 focus:border-[#d4af37] outline-none text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#ab9580] hover:text-[#f7e7a9]"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 px-3 py-2 rounded-lg bg-[#8b151b]/30 border border-[#e53e3e]/60 text-xs text-[#fed7d7]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm tracking-wide text-[#070403] bg-linear-to-r from-[#d4af37] to-[#f7e7a9] hover:brightness-110 disabled:opacity-60 transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
