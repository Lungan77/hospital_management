import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this paramedic
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance || !ambulance.currentEmergency) {
      return Response.json({ assignment: null }, { status: 200 });
    }

    // Get the current emergency assignment
    const assignment = await Emergency.findById(ambulance.currentEmergency)
      .populate("dispatcherId", "name")
      .populate("ambulanceId", "callSign vehicleNumber");

    return Response.json({ assignment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return Response.json({ error: "Error fetching assignment" }, { status: 500 });
  }
}