import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function DELETE(req) {
  const auth = await isAuthenticated(req, ["patient", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId } = await req.json();

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Ensure only the patient who booked it or the doctor assigned can cancel
    if (
      auth.session.user.role === "patient" && auth.session.user.id !== appointment.patientId.toString() ||
      auth.session.user.role === "doctor" && auth.session.user.id !== appointment.doctorId.toString()
    ) {
      return Response.json({ error: "You are not authorized to cancel this appointment" }, { status: 403 });
    }

    await Appointment.deleteOne({ _id: appointmentId });

    return Response.json({ message: "Appointment cancelled successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return Response.json({ error: "Error cancelling appointment" }, { status: 500 });
  }
}
