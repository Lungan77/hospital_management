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
      bloodPressure, 
      heartRate, 
      respiratoryRate, 
      temperature, 
      oxygenSaturation, 
      glucoseLevel, 
      painScale,
      consciousnessLevel,
      symptoms
    } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Add vital signs to the emergency record
    const vitalSigns = {
      timestamp: new Date(),
      bloodPressure,
      heartRate: heartRate ? parseInt(heartRate) : null,
      respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
      glucoseLevel: glucoseLevel ? parseInt(glucoseLevel) : null,
      painScale: painScale ? parseInt(painScale) : 0,
      consciousnessLevel,
      symptoms,
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