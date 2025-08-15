import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, driverId, paramedicId } = await req.json();

    if (!ambulanceId) {
      return Response.json({ error: "Ambulance ID is required" }, { status: 400 });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Validate driver if provided
    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== "driver") {
        return Response.json({ error: "Invalid driver selected" }, { status: 400 });
      }
    }

    // Validate paramedic if provided
    if (paramedicId) {
      const paramedic = await User.findById(paramedicId);
      if (!paramedic || paramedic.role !== "paramedic") {
        return Response.json({ error: "Invalid paramedic selected" }, { status: 400 });
      }
    }

    // Clear existing crew
    ambulance.crew = [];

    // Assign new crew
    if (driverId) {
      ambulance.crew.push({
        memberId: driverId,
        role: "Driver",
        certificationLevel: "Emergency Vehicle Operations"
      });
    }

    if (paramedicId) {
      ambulance.crew.push({
        memberId: paramedicId,
        role: "Paramedic",
        certificationLevel: "Advanced Life Support"
      });
    }

    await ambulance.save();

    // Populate the crew member details for response
    await ambulance.populate("crew.memberId", "name");

    return Response.json({ 
      message: "Crew assigned successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning crew:", error);
    return Response.json({ error: "Error assigning crew" }, { status: 500 });
  }
}