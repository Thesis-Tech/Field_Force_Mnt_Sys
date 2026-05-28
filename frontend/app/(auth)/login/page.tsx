"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, MapPin } from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("admin@fieldforce.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"new" | "existing">("existing");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "new") {
        router.push("/register");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));

    if (userType === "new") {
      // Register Flow: Allow registering with ANY email and password!
      const displayName = email.split("@")[0];
      const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      dispatch(login({ name: capitalizedName, email, role: "Super Admin" }));

      if (typeof window !== "undefined") {
        localStorage.setItem("ff_password", password);
        // Clear prior setup logs so the wizard starts fresh
        localStorage.removeItem("adminSetupComplete");
        localStorage.removeItem("adminSetupData");
        window.location.href = "/admin-setup.html";
      }
    } else {
      // Existing User login
      const storedEmail = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("ff_user_profile") || "{}").email || "admin@fieldforce.com") : "admin@fieldforce.com";
      const storedPassword = typeof window !== "undefined" ? (localStorage.getItem("ff_password") || "admin123") : "admin123";

      // Allow either the default credentials OR the custom registered/updated credentials
      const isDefaultCreds = email === "admin@fieldforce.com" && password === "admin123";
      const isCustomCreds = email === storedEmail && password === storedPassword;

      if (isDefaultCreds || isCustomCreds) {
        const storedProfileName = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("ff_user_profile") || "{}").firstName || "Admin") : "Admin";
        dispatch(login({ name: storedProfileName, email, role: "Super Admin" }));
        
        if (typeof window !== "undefined") {
          localStorage.setItem("adminSetupComplete", "true");
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid email or password. Use demo details (admin@fieldforce.com / admin123) or your custom registered credentials.");
        setLoading(false);
      }
    }
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
          <h1 style={{ fontSize: "23px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 2px" }}>FieldForce Admin</h1>
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
