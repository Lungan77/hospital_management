import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Checks if the user is authenticated and has the required role.
 * @param {Request} req - The request object
 * @param {Array} allowedRoles - Roles allowed to access the resource
 * @returns {Object} Session object or API response with error
 */
export async function isAuthenticated(req, allowedRoles = []) {
  try {
    // ✅ Fixed: Pass req parameter to getServerSession to provide request context
    const session = await getServerSession(req, authOptions);

    // ✅ Check if the user is logged in
    if (!session) {
      return { error: "Unauthorized", status: 401 };
    }

    // ✅ Check if the user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      return { error: "Forbidden", status: 403 };
    }
    
    return { session };
  } catch (error) {
    console.error("Auth Error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}