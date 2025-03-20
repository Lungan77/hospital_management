import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId } = await req.json();

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.checkedIn) {
      return Response.json({ error: "Patient is already checked in" }, { status: 400 });
    }

    // Mark as checked-in
    appointment.checkedIn = true;
    appointment.checkInTime = new Date();
    await appointment.save({ validateBeforeSave: false });
    console.log("Patient checked in successfully at:", appointment.checkInTime);

    return Response.json({ message: "Patient checked in successfully", checkInTime: appointment.checkInTime }, { status: 200 });
  } catch (error) {
    console.error("Error checking in patient:", error);
    return Response.json({ error: "Error checking in patient" }, { status: 500 });
  }
}
