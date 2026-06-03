"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";

/**
 * AdminRoleGuard — mounted in the admin layout.
 *
 * Responsibilities:
 * 1. Not logged in → /login
 * 2. Logged in but NOT ADMIN → /dashboard (non-admins cannot access admin panel)
 * 3. Hydrates cookies from localStorage session if missing (same as RoleGuard)
 */
export default function AdminRoleGuard() {
  const { isLoggedIn, user, token } = useSelector((s: RootState) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !token) {
      router.replace("/login");
      return;
    }

    const role = (user?.role || "").toUpperCase();

    // Hydrate cookies for Edge middleware
    const cookieExists = document.cookie.includes("auth_token=");
    if (!cookieExists && token) {
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `ff_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    // Only ADMIN is allowed here
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, token, user, router]);

  return null;
}
