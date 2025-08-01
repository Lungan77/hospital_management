import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, status } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Update ambulance status
    ambulance.status = status;
    
    // Clear current emergency if going out of service
    if (["Out of Service", "Maintenance"].includes(status)) {
      ambulance.currentEmergency = null;
    }

    await ambulance.save();

    return Response.json({ 
      message: `Ambulance status updated to ${status}`,
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating ambulance status:", error);
    return Response.json({ error: "Error updating ambulance status" }, { status: 500 });
  }
}