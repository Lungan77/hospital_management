"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login"); // Redirect to login page after logout
  };

  return logout;
}
