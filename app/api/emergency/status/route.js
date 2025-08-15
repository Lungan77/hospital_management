import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["admin", "receptionist", "dispatcher", "nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId, status } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Update emergency status and timestamps
    emergency.status = status;
    
    switch (status) {
      case "En Route":
        emergency.respondedAt = new Date();
        break;
      case "On Scene":
        emergency.onSceneAt = new Date();
        break;
      case "Transporting":
        emergency.transportStartedAt = new Date();
        break;
      case "Completed":
        emergency.completedAt = new Date();
        // Reset ambulance status and assignment
        if (emergency.ambulanceId) {
          await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
            status: "Available",
            currentEmergency: null,
            currentLocation: {
              ...emergency.ambulanceId.currentLocation,
              lastUpdated: new Date()
            }
          });
        }
        break;
      case "Cancelled":
        emergency.completedAt = new Date();
        // Reset ambulance status and assignment for cancelled emergencies
        if (emergency.ambulanceId) {
          await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
            status: "Available",
            currentEmergency: null,
            currentLocation: {
              ...emergency.ambulanceId.currentLocation,
              lastUpdated: new Date()
            }
          });
        }
        break;
    }

    await emergency.save();

    // Update ambulance status if needed
    if (emergency.ambulanceId && status !== "Completed") {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: status === "En Route" ? "En Route" : 
               status === "On Scene" ? "On Scene" : 
               status === "Transporting" ? "Transporting" : "Dispatched"
      });
    }

    return Response.json({ 
      message: `Emergency status updated to ${status}`,
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating emergency status:", error);
    return Response.json({ error: "Error updating emergency status" }, { status: 500 });
  }
}