import { connectDB } from "@/lib/mongodb";
import Vitals from "@/models/Vitals";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId, bloodPressure, temperature, heartRate, respiratoryRate, oxygenSaturation, weight, height } = await req.json();

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if vitals are already recorded
    const existingVitals = await Vitals.findOne({ appointmentId });
    if (existingVitals) {
      return Response.json({ error: "Vitals already recorded for this appointment" }, { status: 400 });
    }

    // Save vitals
    const vitals = await Vitals.create({
      appointmentId,
      bloodPressure,
      temperature,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      recordedBy: auth.session.user.id,
    });

    return Response.json({ message: "Vitals recorded successfully", vitals }, { status: 201 });
  } catch (error) {
    console.error("Error recording vitals:", error);
    return Response.json({ error: "Error recording vitals" }, { status: 500 });
  }
}
