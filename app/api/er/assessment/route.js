import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId, assessment } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Add ER assessment to the emergency record
    emergency.erAssessment = {
      ...assessment,
      assessedBy: auth.session.user.id,
      assessedAt: new Date()
    };

    // Update status if not already in treatment
    if (emergency.status === "Arrived") {
      emergency.status = "In Treatment";
    }

    await emergency.save();

    return Response.json({ 
      message: "ER assessment saved successfully",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error saving ER assessment:", error);
    return Response.json({ error: "Error saving ER assessment" }, { status: 500 });
  }
}