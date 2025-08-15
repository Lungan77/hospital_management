import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, resetLocation = false } = await req.json();

    if (!ambulanceId) {
      return Response.json({ error: "Ambulance ID is required" }, { status: 400 });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Reset ambulance to available status
    const updateData = {
      status: "Available",
      currentEmergency: null
    };

    // Optionally reset location to base station
    if (resetLocation) {
      updateData.currentLocation = {
        latitude: null,
        longitude: null,
        address: `${ambulance.baseStation || "Base Station"}`,
        lastUpdated: new Date()
      };
    }

    await Ambulance.findByIdAndUpdate(ambulanceId, updateData);

    return Response.json({ 
      message: "Ambulance reset successfully",
      ambulance: await Ambulance.findById(ambulanceId)
    }, { status: 200 });
  } catch (error) {
    console.error("Error resetting ambulance:", error);
    return Response.json({ error: "Error resetting ambulance" }, { status: 500 });
  }
}