"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "business" ? "business_owner" : "student_worker";

  const [role, setRole] = useState<"student_worker" | "business_owner">(defaultRole as any);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    business_name: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Record<string, string[]>>("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register/", { ...form, role });
      await login(form.email, form.password);
      router.push(role === "business_owner" ? "/dashboard" : "/");
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === "object") setError(data);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorStr = typeof error === "string" ? error : "";
  const fieldErrors = typeof error === "object" ? error : {};

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--cream)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, animation: "fadeUp 0.5s ease" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 10,
              overflow: "hidden",
              flexShrink: 0,
              margin: "0 auto",
            }}
          >
            <img
              src="/small_logo.png"
              alt="LastBite logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900,
              color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 6,
            }}
          >
            Join LastBite
          </h1>
        </div>

        <div
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 28, boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <label className="section-label" style={{ display: "block", marginBottom: 8 }}>
              I am a…
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { value: "student_worker", label: "Student / Worker"},
                { value: "business_owner", label: "Business Owner"},
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value as any)}
                  style={{
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${role === opt.value ? "var(--primary)" : "var(--border)"}`,
                    background: role === opt.value ? "rgba(222,44,0,0.04)" : "var(--cream)",
                    textAlign: "left", transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}></div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}></div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>First Name</label>
                <input className="input" placeholder="Jane" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
                {fieldErrors.first_name && <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{fieldErrors.first_name[0]}</div>}
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Last Name</label>
                <input className="input" placeholder="Doe" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
                {fieldErrors.last_name && <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{fieldErrors.last_name[0]}</div>}
              </div>
            </div>

            {role === "business_owner" && (
              <div style={{ marginBottom: 14 }}>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Business Name</label>
                <input className="input" placeholder="My Restaurant" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} required={role === "business_owner"} />
                {fieldErrors.business_name && <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{fieldErrors.business_name[0]}</div>}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              {fieldErrors.email && <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{fieldErrors.email[0]}</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{fieldErrors.password[0]}</div>}
            </div>

            {errorStr && (
              <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "8px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {errorStr}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
              {loading ? (
                <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider" style={{ margin: "20px 0" }} />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
