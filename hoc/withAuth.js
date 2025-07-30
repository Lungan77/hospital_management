"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader"; // Import the spinner

export default function withAuth(Component, allowedRoles) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return;
      if (!session) {
        router.push("/login"); // Redirect if not logged in
      } else if (!allowedRoles.includes(session.user.role)) {
        router.push("/unauthorized"); // Redirect if role is not allowed
      }
    }, [session, status, router]);

    if (status === "loading") return <Loader />; // Show spinner while checking auth

    return <Component {...props} />;
  };
}
