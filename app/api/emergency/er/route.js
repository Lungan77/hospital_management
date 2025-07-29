import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get incoming patients (being transported)
    const incoming = await Emergency.find({
      status: "Transporting"
    })
    .populate("ambulanceId", "callSign vehicleNumber")
    .sort({ transportStartedAt: 1 });

    // Get current ER patients (arrived but not completed)
    const current = await Emergency.find({
      status: { $in: ["Arrived", "In Treatment"] }
    })
    .sort({ arrivedHospitalAt: 1 });

    return Response.json({ 
      incoming,
      current 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ER data:", error);
    return Response.json({ error: "Error fetching ER data" }, { status: 500 });
  }
}