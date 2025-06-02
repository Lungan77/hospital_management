import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import Sample from "@/models/Sample";
import { isAuthenticated } from "@/hoc/protectedRoute";
import { nanoid } from "nanoid"; // Optional short unique ID

export async function POST(req) {
  const auth = await isAuthenticated(req, ["labtech", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { testOrderId, testIndex, sampleType, notes } = await req.json();

    const order = await TestOrder.findById(testOrderId);
    if (!order || !order.tests[testIndex]) {
      return Response.json({ error: "Test order or test not found" }, { status: 404 });
    }

    const test = order.tests[testIndex];

    // ✅ Generate a unique, scannable barcode
    const timestamp = Date.now().toString().slice(-6);
    const shortId = nanoid(4).toUpperCase();
    const barcode = `SMP-${timestamp}-${shortId}`;

    // ✅ Create Sample record
    await Sample.create({
      testOrderId,
      testIndex,
      barcode,
      sampleType,
      collectedBy: auth.session.user.id,
      notes,
    });

    // ✅ Update test status and add barcode info
    test.status = "In Progress";
    test.sampleRegistered = true;
    test.sampleBarcode = barcode;
    await order.save();

    return Response.json({ message: "Sample collected and registered.", barcode }, { status: 200 });
  } catch (err) {
    console.error("Sample registration error:", err);
    return Response.json({ error: "Error registering sample" }, { status: 500 });
  }
}
