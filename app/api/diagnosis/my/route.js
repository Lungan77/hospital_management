import { connectDB } from "@/lib/mongodb";
import Diagnosis from "@/models/Diagnosis";
import Prescription from "@/models/Prescription";
import TreatmentPlan from "@/models/TreatmentPlan";
import Referral from "@/models/Referral";
import User from "@/models/User"
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
      .populate({
        path: "appointmentId",
        select: "date timeSlot patientId",
        populate: { path: "patientId", select: "name" }, // ✅ Ensure Patient Name is populated
      })
      .populate("doctorId", "name")
      .populate("prescriptionId")
      .populate("treatmentPlanId")
      .populate("referralId");

    return Response.json({ diagnoses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return Response.json({ error: "Error fetching diagnoses" }, { status: 500 });
  }
}
