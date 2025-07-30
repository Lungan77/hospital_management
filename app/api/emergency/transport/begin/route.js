import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (emergency.status !== "On Scene") {
      return Response.json({ error: "Cannot begin transport - not on scene" }, { status: 400 });
    }

    // Calculate estimated arrival time (15 minutes from now as default)
    const estimatedArrival = new Date(Date.now() + 15 * 60000);

    // Update emergency with transport information
    emergency.status = "Transporting";
    emergency.transportStartedAt = new Date();
    emergency.transportProgress = {
      started: true,
      startTime: new Date(),
      estimatedArrival: estimatedArrival,
      currentLocation: {
        latitude: null, // Would be updated with real GPS coordinates
        longitude: null,
        lastUpdated: new Date()
      },
      route: []
    };

    await emergency.save();

    // Update ambulance status
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: "Transporting"
      });
    }

    return Response.json({ 
      message: "Transport begun successfully",
      emergency,
      estimatedArrival 
    }, { status: 200 });
  } catch (error) {
    console.error("Error beginning transport:", error);
    return Response.json({ error: "Error beginning transport" }, { status: 500 });
  }
}