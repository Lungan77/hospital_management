import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Checks if the user is authenticated and has the required role.
 * @param {Array} allowedRoles - Roles allowed to access the resource
 * @returns {Object} Session object or API response with error
 */
export async function isAuthenticated(allowedRoles = []) {
  try {
    // ✅ Fixed: Remove req parameter - getServerSession implicitly accesses request context in App Router
    const session = await getServerSession(authOptions);

    // ✅ Check if the user is logged in
    if (!session) {
      return { error: "Unauthorized", status: 401 };
    }

    // ✅ Check if the user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      return { error: "Forbidden", status: 403 };
    }
    console.log(session)
    return { session };
  } catch (error) {
    console.error("Auth Error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}