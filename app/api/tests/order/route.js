import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute"; // or your protectedRoute if it's used in API

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { appointmentId, tests } = await req.json();

    if (!appointmentId || !tests || !Array.isArray(tests) || tests.length === 0) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    const newOrder = await TestOrder.create({
      appointmentId,
      tests: tests.map(test => ({
        name: test.name,
        sampleType: test.sampleType,
        instructions: test.instructions,
        reason: test.reason,
        priority: test.priority,
        expectedResultDate: test.expectedResultDate,
        status: "Pending Sample Collection",
      })),
    });

    return Response.json({ message: "Test order submitted successfully", order: newOrder }, { status: 201 });

  } catch (err) {
    console.error("Error creating test order:", err);
    return Response.json({ error: "Server error while creating test order" }, { status: 500 });
  }
}
