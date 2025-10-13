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
    .populate({
      path: "ambulanceId",
      select: "callSign vehicleNumber",
      strictPopulate: false
    })
    .populate({
      path: "dispatcherId",
      select: "name",
      strictPopulate: false
    })
    .populate({
      path: "handover.receivingStaff",
      select: "name",
      strictPopulate: false
    })
    .sort({ arrivedHospitalAt: -1 })
    .lean();

    return Response.json({ handovers: handovers || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching handovers:", error);
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error fetching handovers",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}