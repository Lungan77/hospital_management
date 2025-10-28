import { connectDB } from "@/lib/mongodb";
import DailyAssessment from "@/models/DailyAssessment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { id } = params;
    const assessment = await DailyAssessment.findById(id)
      .populate("assessedBy", "firstName lastName")
      .populate("patientAdmissionId");

    if (!assessment) {
      return Response.json({ error: "Assessment not found" }, { status: 404 });
    }

    return Response.json({ assessment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily assessment:", error);
    return Response.json({
      error: "Failed to fetch daily assessment",
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { id } = params;
    const data = await req.json();

    const assessment = await DailyAssessment.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return Response.json({ error: "Assessment not found" }, { status: 404 });
    }

    return Response.json({ assessment }, { status: 200 });
  } catch (error) {
    console.error("Error updating daily assessment:", error);
    return Response.json({
      error: "Failed to update daily assessment",
      details: error.message
    }, { status: 500 });
  }
}
