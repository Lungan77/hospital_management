import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filter = { date: { $gte: today, $lt: tomorrow } };

    if (auth.session.user.role === "doctor") {
      filter.doctorId = auth.session.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name")
      .populate("doctorId", "name title")
      .sort({ timeSlot: 1 });

    return Response.json({
      appointments: appointments.map((appt) => ({
        _id: appt._id,
        date: appt.date.toISOString().split("T")[0],
        timeSlot: appt.timeSlot,
        patientName: appt.patientId?.name || "Unknown",
        doctorName: `${appt.doctorId?.title} ${appt.doctorId?.name}`,
        checkedIn: appt.checkedIn,
        checkInTime: appt.checkInTime ? new Date(appt.checkInTime).toLocaleTimeString() : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return Response.json({ error: "Error fetching today's appointments" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId } = await req.json();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.checkedIn) {
      return Response.json({ error: "Patient is already checked in" }, { status: 400 });
    }

    appointment.checkedIn = true;
    appointment.checkInTime = new Date();
    await appointment.save();

    return Response.json({ message: "Patient checked in successfully", checkInTime: appointment.checkInTime }, { status: 200 });
  } catch (error) {
    console.error("Error checking in patient:", error);
    return Response.json({ error: "Error checking in patient" }, { status: 500 });
  }
}
