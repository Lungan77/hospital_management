import { connectDB } from "@/lib/mongodb";
import Diagnosis from "@/models/Diagnosis";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId, symptoms, symptomsDuration, diagnosis, severity, labTestsOrdered, notes } = await req.json();

    // ✅ Ensure `severity` is provided
    if (!severity) {
      return Response.json({ error: "`severity` is required (Mild, Moderate, or Severe)." }, { status: 400 });
    }

    // Ensure the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Ensure diagnosis hasn't already been added for this appointment
    const existingDiagnosis = await Diagnosis.findOne({ appointmentId });
    if (existingDiagnosis) {
      return Response.json({ error: "Diagnosis already recorded for this appointment" }, { status: 400 });
    }

    // Save diagnosis
    const diagnosisEntry = await Diagnosis.create({
      appointmentId,
      doctorId: auth.session.user.id,
      symptoms,
      symptomsDuration,
      diagnosis,
      severity, // ✅ Ensure severity is always included
      labTestsOrdered,
      notes,
    });

    return Response.json({ message: "Diagnosis recorded successfully", diagnosis: diagnosisEntry }, { status: 201 });
  } catch (error) {
    console.error("Error recording diagnosis:", error);
    return Response.json({ error: "Error recording diagnosis" }, { status: 500 });
  }
}
