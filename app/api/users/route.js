import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();
    const users = await User.find({ role: { $ne: "admin" } }).select("name title email phone gender role");

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Error fetching users" }, { status: 500 });
  }
}