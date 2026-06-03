"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";

/**
 * RoleGuard — rendered inside the dashboard layout.
 *
 * Responsibilities:
 * 1. If the user is not logged in → redirect to /login
 * 2. If the user is ADMIN → redirect to /admin/dashboard
 *    (handles existing sessions created before the cookie-middleware was added)
 * 3. Hydrates the auth cookies from localStorage so future page loads are
 *    correctly handled by the Edge middleware without requiring a re-login.
 */
export default function RoleGuard() {
  const { isLoggedIn, user, token } = useSelector((s: RootState) => s.auth);
  const router = useRouter();

  useEffect(() => {
    // Not logged in — send to login
    if (!isLoggedIn || !token) {
      router.replace("/login");
      return;
    }

    const role = (user?.role || "").toUpperCase();

    // Hydrate cookies from the existing localStorage session so the
    // middleware works correctly on subsequent navigations/refreshes
    const cookieExists = document.cookie.includes("auth_token=");
    if (!cookieExists && token) {
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `ff_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    // We no longer redirect ADMIN out of the dashboard,
    // because ADMIN has access to all routes (Super Admin + Manager features).
  }, [isLoggedIn, token, user, router]);

  // This component renders nothing — it's a pure side-effect guard
  return null;
}
