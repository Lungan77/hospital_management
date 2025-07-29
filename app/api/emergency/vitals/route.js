import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      emergencyId, 
      bloodPressure, 
      heartRate, 
      respiratoryRate, 
      temperature, 
      oxygenSaturation, 
      glucoseLevel, 
      painScale 
    } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Add vital signs to the emergency record
    const vitalSigns = {
      timestamp: new Date(),
      bloodPressure,
      heartRate: parseInt(heartRate),
      respiratoryRate: parseInt(respiratoryRate),
      temperature: parseFloat(temperature),
      oxygenSaturation: parseInt(oxygenSaturation),
      glucoseLevel: parseInt(glucoseLevel),
      painScale: parseInt(painScale),
      recordedBy: auth.session.user.id
    };

    emergency.vitalSigns.push(vitalSigns);
    await emergency.save();

    return Response.json({ 
      message: "Vital signs recorded successfully",
      vitalSigns 
    }, { status: 201 });
  } catch (error) {
    console.error("Error recording vital signs:", error);
    return Response.json({ error: "Error recording vital signs" }, { status: 500 });
  }
}