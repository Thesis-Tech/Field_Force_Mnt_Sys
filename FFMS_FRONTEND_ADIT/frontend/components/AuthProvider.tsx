"use client";

if (typeof window !== "undefined" && window.crypto && !window.crypto.randomUUID) {
  window.crypto.randomUUID = function () {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
    ) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "@/lib/neon-auth";
import "@neondatabase/auth-ui/css";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider authClient={authClient}>
      {children}
    </NeonAuthUIProvider>
  );
}
