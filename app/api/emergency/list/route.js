import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const emergencies = await Emergency.find()
      .populate("dispatcherId", "name")
      .populate("ambulanceId", "callSign vehicleNumber")
      .sort({ reportedAt: -1 });

    return Response.json({ emergencies }, { status: 200 });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    return Response.json({ error: "Error fetching emergencies" }, { status: 500 });
  }
}