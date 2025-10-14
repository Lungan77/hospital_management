import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let query = {};
    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ["doctor", "nurse", "specialist"] };
    }

    const staff = await User.find(query)
      .select("name email role specialty title phone")
      .sort({ name: 1 })
      .lean();

    const groupedStaff = {
      doctors: staff.filter(s => s.role === "doctor"),
      nurses: staff.filter(s => s.role === "nurse"),
      specialists: staff.filter(s => s.role === "specialist" || s.specialty)
    };

    return Response.json({
      staff: groupedStaff,
      allStaff: staff
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available staff:", error);
    return Response.json({
      error: "Error fetching available staff",
      details: error.message
    }, { status: 500 });
  }
}
