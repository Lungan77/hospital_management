import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Update status to indicate ER has been notified
    emergency.hospitalNotified = true;
    emergency.hospitalNotifiedAt = new Date();
    
    // If patient is being transported, update to arrived
    if (emergency.status === "Transporting") {
      emergency.status = "Arrived";
      emergency.arrivedHospitalAt = new Date();
    }

    await emergency.save();

    return Response.json({ 
      message: "Patient acknowledged by ER staff",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error acknowledging patient:", error);
    return Response.json({ error: "Error acknowledging patient" }, { status: 500 });
  }
}