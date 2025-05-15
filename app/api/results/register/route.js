import { connectDB } from "@/lib/mongodb";
import TestResult from "@/models/TestResult";
import Sample from "@/models/Sample";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  await connectDB();

  const { session, error, status } = await isAuthenticated(req, ["labtech"]);
  if (error) return Response.json({ message: error }, { status });

  try {
    const body = await req.json();
    const { barcode, results, testName, comments } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return Response.json({ message: "At least one result is required" }, { status: 400 });
    }

    const sample = await Sample.findOne({ barcode });
    if (!sample) {
      return Response.json({ message: "Sample not found" }, { status: 404 });
    }

    // Create TestResult linked to sample and test order
    const testResult = await TestResult.create({
      sample: sample._id,
      testOrderId: sample.testOrderId,
      recordedBy: session.user.id,
      testName,
      results,
      comments,
      recordedAt: new Date(),
    });

    // Update sample status to completed
    await Sample.updateOne({ _id: sample._id }, { status: "completed" });

    return Response.json({ message: "Test result recorded successfully", testResult }, { status: 201 });
  } catch (err) {
    console.error("Error recording test result:", err);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
