import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/hoc/protectedRoute";
import Sample from "@/models/Sample";
import TestOrder from "@/models/TestOrder";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["labtech"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const barcode = params.barcode;
    const sample = await Sample.findOne({ barcode }).lean();
    if (!sample) {
      return Response.json({ error: "Sample not found." }, { status: 404 });
    }

    // Optionally populate test details
    const testOrder = await TestOrder.findById(sample.testOrderId);
    const test = testOrder?.tests?.[sample.testIndex];

    return Response.json(
      {
        sample: {
          ...sample,
          testName: test?.name || "Unknown",
          reason: test?.reason || "",
          priority: test?.priority || "",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Barcode sample fetch error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
