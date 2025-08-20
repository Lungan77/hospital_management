import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "paramedic"]);
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
      case "On Scene":
        emergency.onSceneAt = new Date();
        break;
      case "Transporting":
        emergency.transportStartedAt = new Date();
        break;
    }

    await emergency.save();

    // Update ambulance status
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: status === "On Scene" ? "On Scene" : 
               status === "Transporting" ? "Transporting" : "En Route"
      });
    }

    return Response.json({ 
      message: `Status updated to ${status}`,
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating status:", error);
    return Response.json({ error: "Error updating status" }, { status: 500 });
  }
}