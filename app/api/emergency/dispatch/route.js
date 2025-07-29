import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId, ambulanceId } = await req.json();

    // Check if emergency exists and is not already dispatched
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (emergency.status !== "Reported") {
      return Response.json({ error: "Emergency already dispatched" }, { status: 400 });
    }

    // Check if ambulance is available
    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    if (ambulance.status !== "Available") {
      return Response.json({ error: "Ambulance not available" }, { status: 400 });
    }

    // Update emergency
    emergency.status = "Dispatched";
    emergency.dispatchedAt = new Date();
    emergency.dispatcherId = auth.session.user.id;
    emergency.ambulanceId = ambulanceId;
    emergency.estimatedArrival = new Date(Date.now() + 15 * 60000); // 15 minutes from now
    await emergency.save();

    // Update ambulance
    ambulance.status = "Dispatched";
    ambulance.currentEmergency = emergencyId;
    await ambulance.save();

    return Response.json({ 
      message: "Ambulance dispatched successfully",
      emergency,
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error dispatching ambulance:", error);
    return Response.json({ error: "Error dispatching ambulance" }, { status: 500 });
  }
}