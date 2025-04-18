import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const appointment = await Appointment.findById(params.appointmentId).populate("patientId", "name");
    if (!appointment) return Response.json({ error: "Appointment not found" }, { status: 404 });

    return Response.json({ appointment }, { status: 200 });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return Response.json({ error: "Failed to load appointment" }, { status: 500 });
  }
}
