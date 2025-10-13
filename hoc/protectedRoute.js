import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Checks if the user is authenticated and has the required role.
 * @param {Request} req - The request object (optional, for compatibility)
 * @param {Array} allowedRoles - Roles allowed to access the resource
 * @returns {Object} Session object or API response with error
 */
export async function isAuthenticated(req, allowedRoles = []) {
  try {
    // If only one argument is passed and it's an array, treat it as allowedRoles
    if (Array.isArray(req)) {
      allowedRoles = req;
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return { error: "Unauthorized", status: 401 };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      return { error: "Forbidden", status: 403 };
    }

    return { session };
  } catch (error) {
    console.error("Auth Error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}
