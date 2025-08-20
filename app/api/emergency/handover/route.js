import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "dispatcher", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      emergencyId, 
      paramedicSummary, 
      treatmentSummary, 
      patientConditionOnArrival, 
      handoverNotes 
    } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (emergency.status !== "Transporting") {
      return Response.json({ error: "Cannot complete handover - not in transport status" }, { status: 400 });
    }

    // Update emergency with handover information
    emergency.status = "Completed";
    emergency.completedAt = new Date();
    emergency.arrivedHospitalAt = new Date();
    emergency.handover = {
      completed: true,
      handoverTime: new Date(),
      paramedicSummary,
      treatmentSummary,
      patientConditionOnArrival,
      receivingStaff: auth.session.user.id,
      handoverNotes,
      // receivingStaff would be set when hospital staff signs off
      // receivingStaffSignature would be added with digital signature
    };

    await emergency.save();

    // Update ambulance status back to available
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: "Available",
        currentEmergency: null,
        // Keep current location but clear emergency assignment
      });
    }

    return Response.json({ 
      message: "Handover completed successfully - Emergency response complete",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error completing handover:", error);
    return Response.json({ error: "Error completing handover" }, { status: 500 });
  }
}