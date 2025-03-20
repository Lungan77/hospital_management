import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Vitals from "@/models/Vitals";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["patient", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    let filter = {};
    if (auth.session.user.role === "patient") {
      filter.patientId = auth.session.user.id;
    } else if (auth.session.user.role === "doctor") {
      filter.doctorId = auth.session.user.id;
    }

    // Fetch Appointments
    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name title")
      .populate("patientId", "name")
      .sort({ date: 1 });

    // Fetch Vitals for each appointment
    const updatedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        const vitals = await Vitals.findOne({ appointmentId: appt._id });

        return {
          _id: appt._id,
          date: appt.date,
          timeSlot: appt.timeSlot,
          checkedIn: appt.checkedIn,
          patient: appt.patientId ? appt.patientId.name : "Unknown",
          doctor: appt.doctorId ? `${appt.doctorId.title} ${appt.doctorId.name}` : "Unknown",
          vitals: vitals
            ? {
                bloodPressure: vitals.bloodPressure,
                temperature: vitals.temperature,
                heartRate: vitals.heartRate,
                respiratoryRate: vitals.respiratoryRate,
                oxygenSaturation: vitals.oxygenSaturation,
                weight: vitals.weight,
                height: vitals.height,
                bmi: vitals.bmi, // Automatically calculated in Vitals schema
              }
            : null,
        };
      })
    );

    return Response.json({ appointments: updatedAppointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return Response.json({ error: "Error fetching appointments" }, { status: 500 });
  }
}
