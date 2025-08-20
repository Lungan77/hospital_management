import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (emergency.status !== "Dispatched") {
      return Response.json({ error: "Emergency not in dispatched status" }, { status: 400 });
    }

    // Update status to En Route
    emergency.status = "En Route";
    emergency.respondedAt = new Date();
    await emergency.save();

    return Response.json({ 
      message: "Dispatch accepted, status updated to En Route",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error accepting dispatch:", error);
    return Response.json({ error: "Error accepting dispatch" }, { status: 500 });
  }
}