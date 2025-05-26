import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import Appointment from "@/models/Appointment";
import TestResult from "@/models/TestResult";
import Sample from "@/models/Sample";
import User from "@/models/User";

export async function GET(req, context) {
  await connectDB();
  const { patientId } = (await context.params);

  try {
    const patient = await User.findById(patientId).select("name _id");

    if (!patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const appointments = await Appointment.find({ patientId }).select("_id");
    const appointmentIds = appointments.map((a) => a._id);

    const testOrders = await TestOrder.find({ appointmentId: { $in: appointmentIds } });
    const testOrderIds = testOrders.map((o) => o._id);

    const testResults = await TestResult.find({ testOrderId: { $in: testOrderIds } })
      .populate("sample", "barcode sampleType collectionTime")
      .populate("recordedBy", "name")
      .sort({ recordedAt: -1 });

    const records = testResults.map((result) => ({
      _id: result._id,
      testName: result.testName,
      results: result.results, // ✅ Keep as array
      comments: result.comments || "-",
      completedAt: result.recordedAt,
    }));

    return new Response(JSON.stringify({ patient, results: records }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Lab history fetch error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
