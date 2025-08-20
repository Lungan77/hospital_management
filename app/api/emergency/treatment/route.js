import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      emergencyId, 
      treatment, 
      medication, 
      dosage, 
      route, 
      response 
    } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Add treatment to the emergency record
    const treatmentRecord = {
      timestamp: new Date(),
      treatment,
      medication,
      dosage,
      route,
      response,
      administeredBy: auth.session.user.id
    };

    emergency.treatments.push(treatmentRecord);
    await emergency.save();

    return Response.json({ 
      message: "Treatment recorded successfully",
      treatment: treatmentRecord 
    }, { status: 201 });
  } catch (error) {
    console.error("Error recording treatment:", error);
    return Response.json({ error: "Error recording treatment" }, { status: 500 });
  }
}