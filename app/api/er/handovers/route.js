import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get emergencies that have handover information
    const handovers = await Emergency.find({
      "handover.completed": true,
      arrivedHospitalAt: { $exists: true }
    })
    .populate("ambulanceId", "callSign vehicleNumber")
    .populate("dispatcherId", "name")
    .populate("handover.receivingStaff", "name")
    .sort({ arrivedHospitalAt: -1 });

    return Response.json({ handovers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching handovers:", error);
    return Response.json({ error: "Error fetching handovers" }, { status: 500 });
  }
}