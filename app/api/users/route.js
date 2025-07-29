import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const users = await User.find({ role: { $ne: "admin" } }).select("name title email phone gender role");

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Error fetching users" }, { status: 500 });
  }
}