import { connectDB } from "@/lib/mongodb";
import DailyAssessment from "@/models/DailyAssessment";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return Response.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const assessments = await DailyAssessment.find({ patientAdmissionId: patientId })
      .sort({ assessmentDate: -1 })
      .populate("assessedBy", "firstName lastName");

    return Response.json({ assessments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily assessments:", error);
    return Response.json({
      error: "Failed to fetch daily assessments",
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const data = await req.json();
    const { patientAdmissionId } = data;

    if (!patientAdmissionId) {
      return Response.json({ error: "Patient admission ID is required" }, { status: 400 });
    }

    const patient = await PatientAdmission.findById(patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const assessment = await DailyAssessment.create({
      ...data,
      assessedBy: auth.session.user.id,
      assessorName: `${auth.session.user.firstName} ${auth.session.user.lastName}`,
      assessorRole: auth.session.user.role,
    });

    return Response.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating daily assessment:", error);
    return Response.json({
      error: "Failed to create daily assessment",
      details: error.message
    }, { status: 500 });
  }
}
