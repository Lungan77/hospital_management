import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const patients = await User.find({ role: "patient" })
      .select("name title email idNumber gender _id")
      .sort({ name: 1 })
      .lean();

    return Response.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return Response.json({ error: "Failed to retrieve patients" }, { status: 500 });
  }
}
