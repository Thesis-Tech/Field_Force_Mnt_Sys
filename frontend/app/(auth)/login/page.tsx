"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, MapPin, Shield, Users } from "lucide-react";

// Mock role credentials
const ROLE_CREDENTIALS = {
  admin: { email: "admin@fieldforce.com", password: "admin123", redirect: "/admin/dashboard", role: "Super Admin" },
  manager: { email: "manager@fieldforce.com", password: "manager123", redirect: "/dashboard", role: "Manager" },
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("admin@fieldforce.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager">("admin");
  const [userType, setUserType] = useState<"new" | "existing">("existing");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "new") {
        router.push("/register");
      }
    }
  }, [router]);

  // Update default credentials when role changes
  const handleRoleChange = (role: "admin" | "manager") => {
    setSelectedRole(role);
    setEmail(ROLE_CREDENTIALS[role].email);
    setPassword(ROLE_CREDENTIALS[role].password);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1000));

    if (userType === "new") {
      // Register Flow
      const displayName = email.split("@")[0];
      const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      dispatch(login({ name: capitalizedName, email, role: selectedRole === "admin" ? "Super Admin" : "Manager" }));

      if (typeof window !== "undefined") {
        localStorage.setItem("ff_password", password);
        localStorage.setItem("ff_role", selectedRole);
        localStorage.removeItem("adminSetupComplete");
        localStorage.removeItem("adminSetupData");
        window.location.href = "/admin-setup";
      }
      return;
    }

    // ── Role-based mock login ──
    const roleCreds = ROLE_CREDENTIALS[selectedRole];
    const isRoleMatch = email === roleCreds.email && password === roleCreds.password;

    if (isRoleMatch) {
      dispatch(login({ name: selectedRole === "admin" ? "Global Ops" : "Manager User", email, role: roleCreds.role }));
      if (typeof window !== "undefined") {
        localStorage.setItem("adminSetupComplete", "true");
        localStorage.setItem("auth_token", "dev_fallback_token");
        localStorage.setItem("ff_role", selectedRole);
      }
      router.push(roleCreds.redirect);
      return;
    }

    // ── Try backend ──
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data?.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", resData.data.token);
            localStorage.setItem("adminSetupComplete", "true");
            localStorage.setItem("ff_role", selectedRole);
            localStorage.setItem("ff_user_profile", JSON.stringify({ firstName: resData.data.user.name, email: resData.data.user.email }));
          }
          dispatch(login({ name: resData.data.user.name, email: resData.data.user.email, role: resData.data.user.role }));
          router.push(roleCreds.redirect);
          return;
        }
      }
    } catch (err) {
      console.warn("[Login] Backend offline. Using mock auth.", err);
    }

    // ── Offline stored creds fallback ──
    const storedEmail = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("ff_user_profile") || "{}").email || "") : "";
    const storedPassword = typeof window !== "undefined" ? (localStorage.getItem("ff_password") || "") : "";
    if (email === storedEmail && password === storedPassword) {
      const storedProfileName = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("ff_user_profile") || "{}").firstName || "User") : "User";
      dispatch(login({ name: storedProfileName, email, role: roleCreds.role }));
      if (typeof window !== "undefined") {
        localStorage.setItem("adminSetupComplete", "true");
        localStorage.setItem("auth_token", "dev_fallback_token");
        localStorage.setItem("ff_role", selectedRole);
      }
      router.push(roleCreds.redirect);
      return;
    }

    setError(`Invalid credentials for ${selectedRole === "admin" ? "Admin" : "Manager"} role. Use demo credentials shown below.`);
    setLoading(false);
  };

  return (
    <div style={{
      height: "100vh",
      background: "url(/login-bg.jpg) no-repeat center center / cover",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", position: "relative", overflow: "hidden",
    }}>

      <div style={{ width: "100%", maxWidth: "410px", animation: "fadeIn 0.5s ease", position: "relative", zIndex: 2 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "10px",
            background: "linear-gradient(135deg, #0052ff 0%, #0041cc 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 10px",
            boxShadow: "0 6px 20px rgba(0, 82, 255, 0.2)"
          }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "23px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 2px" }}>FieldSense FFMS</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(0, 82, 255, 0.12)",
          borderRadius: "14px",
          padding: "26px 28px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 15px 35px rgba(0, 82, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)",
        }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Role Selector */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Login As</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button type="button" onClick={() => handleRoleChange("admin")}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, border: selectedRole === "admin" ? "2px solid #8b5cf6" : "1px solid var(--border)", background: selectedRole === "admin" ? "rgba(139,92,246,0.08)" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: selectedRole === "admin" ? "#8b5cf6" : "var(--text-secondary)" }}>
                  <Shield size={16} color={selectedRole === "admin" ? "#8b5cf6" : "var(--text-muted)"} /> Admin
                </button>
                <button type="button" onClick={() => handleRoleChange("manager")}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, border: selectedRole === "manager" ? "2px solid #0052ff" : "1px solid var(--border)", background: selectedRole === "manager" ? "rgba(0,82,255,0.08)" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: selectedRole === "manager" ? "#0052ff" : "var(--text-secondary)" }}>
                  <Users size={16} color={selectedRole === "manager" ? "#0052ff" : "var(--text-muted)"} /> Manager
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

            {/* Demo credentials hint */}
            <div style={{ background: selectedRole === "admin" ? "rgba(139,92,246,0.08)" : "rgba(79,142,247,0.08)", border: selectedRole === "admin" ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(79,142,247,0.2)", borderRadius: "0", padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>
              {selectedRole === "admin" ? (
                <>💜 Admin Demo: <strong style={{ color: "var(--text-primary)" }}>admin@fieldforce.com</strong> / <strong style={{ color: "var(--text-primary)" }}>admin123</strong> → /admin/dashboard</>
              ) : (
                <>💡 Manager Demo: <strong style={{ color: "var(--text-primary)" }}>manager@fieldforce.com</strong> / <strong style={{ color: "var(--text-primary)" }}>manager123</strong> → /dashboard</>
              )}
            </div>

            {/* Button */}
            <button id="login-btn" type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px" }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>

            {/* Registration Direct Link */}
            <div style={{ textAlign: "center", marginTop: "2px", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => router.push("/register")}
                style={{
                  background: "none", border: "none", color: "var(--accent-blue)",
                  fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline"
                }}
              >
                Register here
              </button>
            </div>
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
