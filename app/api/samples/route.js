import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/hoc/protectedRoute";
import Sample from "@/models/Sample";
import TestOrder from "@/models/TestOrder"
import User from "@/models/User"

export async function GET(req) {
  const auth = await isAuthenticated(req, ["labtech", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const samples = await Sample.find()
      .populate("testOrderId", "testType testDate")
      .populate("collectedBy", "name email")
      .sort({ createdAt: -1 });

    console.log("Fetched samples:", samples);
    return Response.json({ samples }, { status: 200 });
  } catch (error) {
    console.error("Error fetching samples:", error);
    return Response.json({ error: "Failed to fetch samples" }, { status: 500 });
  }
}
