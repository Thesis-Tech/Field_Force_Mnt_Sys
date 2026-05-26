"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { Zap, Eye, EyeOff, MapPin } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("admin@fieldforce.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"new" | "existing">("existing");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    if (email === "admin@fieldforce.com" && password === "admin123") {
      dispatch(login({ name: "Admin", email, role: "Super Admin" }));
      if (typeof window !== "undefined") {
        if (userType === "new") {
          // Clear any prior setup flags so they can experience the setup wizard fresh
          localStorage.removeItem("adminSetupComplete");
          localStorage.removeItem("adminSetupData");
          window.location.href = "/admin-setup.html";
        } else {
          // Existing User - mark setup as complete so they bypass it and go straight to dashboard
          localStorage.setItem("adminSetupComplete", "true");
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", position: "relative", overflow: "hidden",
    }}>
      {/* Background glow orbs */}
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,95,252,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", animation: "fadeIn 0.5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "0",
            background: "var(--accent-blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(79,142,247,0.35)"
          }}>
            <Zap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>FieldForce Admin</h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)", border: "1.5px solid var(--border)",
          borderRadius: "10px", padding: "32px",
          boxShadow: "0 0 30px rgba(5, 5, 5, 0.2), 0 0 8px rgba(0, 0, 0, 0.1)",
        }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* User Type Switcher */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Sign In As
              </label>
              <div style={{
                display: "flex",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                padding: "2px",
                borderRadius: "0",
              }}>
                <button
                  type="button"
                  id="user-type-existing"
                  onClick={() => setUserType("existing")}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "0",
                    cursor: "pointer",
                    background: userType === "existing" ? "var(--accent-blue)" : "transparent",
                    color: userType === "existing" ? "#ffffff" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  Existing User
                </button>
                <button
                  type="button"
                  id="user-type-new"
                  onClick={() => setUserType("new")}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "0",
                    cursor: "pointer",
                    background: userType === "new" ? "var(--accent-blue)" : "transparent",
                    color: userType === "new" ? "#ffffff" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  New User
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Email Address</label>
              <input
                id="login-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fieldforce.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex"
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "0", padding: "10px 14px", color: "var(--accent-red)", fontSize: "13px" }}>
                {error}
              </div>
            )}

            {/* Hint */}
            <div style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: "0", padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>
              💡 Demo: <strong style={{ color: "var(--text-primary)" }}>admin@fieldforce.com</strong> / <strong style={{ color: "var(--text-primary)" }}>admin123</strong>
            </div>

            {/* Button */}
            <button id="login-btn" type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px" }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Signing in...
                </span>
              ) : (userType === "existing" ? "Sign In →" : "Sign In & Begin Setup →")}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
          <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
          Field Force Management System v1.0
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
