import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get patients being transported to the hospital
    const patients = await Emergency.find({
      status: { $in: ["Transporting", "Arrived"] }
    })
    .populate("ambulanceId", "callSign vehicleNumber")
    .populate("dispatcherId", "name")
    .sort({ transportStartedAt: 1 });

    return Response.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("Error fetching incoming patients:", error);
    return Response.json({ error: "Error fetching incoming patients" }, { status: 500 });
  }
}