import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId } = params;

    const patient = await Emergency.findById(patientId)
      .populate("ambulanceId", "callSign vehicleNumber")
      .populate("dispatcherId", "name");

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json({ patient }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return Response.json({ error: "Error fetching patient details" }, { status: 500 });
  }
}