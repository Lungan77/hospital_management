import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "dispatcher", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      emergencyId, 
      symptoms, 
      medicalHistory, 
      allergies, 
      currentMedications 
    } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Update medical information
    emergency.symptoms = symptoms;
    emergency.medicalHistory = medicalHistory;
    emergency.allergies = allergies;
    emergency.currentMedications = currentMedications;

    await emergency.save();

    return Response.json({ 
      message: "Medical information updated successfully",
      emergency 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating medical information:", error);
    return Response.json({ error: "Error updating medical information" }, { status: 500 });
  }
}