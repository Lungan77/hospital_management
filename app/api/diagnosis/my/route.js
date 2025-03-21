import { connectDB } from "@/lib/mongodb";
import Diagnosis from "@/models/Diagnosis";
import Prescription from "@/models/Prescription";
import TreatmentPlan from "@/models/TreatmentPlan";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "patient"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    let filter = {};
    if (auth.session.user.role === "doctor") {
      filter.doctorId = auth.session.user.id;
    } else if (auth.session.user.role === "patient") {
      const patientAppointments = await Appointment.find({ patientId: auth.session.user.id }).select("_id");
      filter.appointmentId = { $in: patientAppointments.map((appt) => appt._id) };
    }

    const diagnoses = await Diagnosis.find(filter)
      .populate("appointmentId", "date timeSlot patientId")
      .populate("doctorId", "name")
      .populate("prescriptionId")
      .populate("treatmentPlanId");

    return Response.json({ diagnoses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return Response.json({ error: "Error fetching diagnoses" }, { status: 500 });
  }
}
