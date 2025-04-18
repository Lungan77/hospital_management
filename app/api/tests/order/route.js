import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId, tests } = await req.json();

    if (!appointmentId || !tests?.length) {
      return Response.json({ error: "Appointment and at least one test are required" }, { status: 400 });
    }

    // You can populate patientId from the appointment if needed
    const appointment = await (await import("@/models/Appointment")).default.findById(appointmentId).populate("patientId");
    if (!appointment) return Response.json({ error: "Appointment not found" }, { status: 404 });

    const newOrder = await TestOrder.create({
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: auth.session.user.id,
      tests,
    });

    return Response.json({ message: "Test order created", order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Test order error:", error);
    return Response.json({ error: "Failed to create test order" }, { status: 500 });
  }
}
