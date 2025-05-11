import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "patient"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const filter = {};

    if (auth.session.user.role === "doctor") {
      filter["appointmentId"] = { $in: await Appointment.find({ doctorId: auth.session.user.id }).distinct("_id") };
    } else if (auth.session.user.role === "patient") {
      filter["appointmentId"] = { $in: await Appointment.find({ patientId: auth.session.user.id }).distinct("_id") };
    }

    const orders = await TestOrder.find(filter).populate("appointmentId");

    return Response.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching test orders:", error);
    return Response.json({ error: "Failed to fetch test orders" }, { status: 500 });
  }
}