import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId, verificationNotes } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (!emergency.handover?.completed) {
      return Response.json({ error: "Handover not completed by EMS" }, { status: 400 });
    }

    // Mark handover as verified by ER
    emergency.handover.verified = true;
    emergency.handover.verifiedBy = auth.session.user.id;
    emergency.handover.verifiedAt = new Date();
    emergency.handover.verificationNotes = verificationNotes;
    
    // Update status to completed
    emergency.status = "Completed";
    emergency.completedAt = new Date();

    await emergency.save();

    // Update ambulance status back to available
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: "Available",
        currentEmergency: null
      });
    }

    return Response.json({ 
      message: "Handover verified successfully - Emergency response completed",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error verifying handover:", error);
    return Response.json({ error: "Error verifying handover" }, { status: 500 });
  }
}