import { connectDB } from "@/lib/mongodb";
import NutritionalAssessment from "@/models/NutritionalAssessment";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const data = await req.json();

    const admission = await PatientAdmission.findById(data.patientAdmissionId);
    if (!admission) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    const assessment = await NutritionalAssessment.create({
      ...data,
      patientId: auth.session.user.id,
      assessedBy: auth.session.user.id
    });

    return Response.json({
      message: "Nutritional assessment created successfully",
      assessment
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating nutritional assessment:", error);
    return Response.json({
      error: "Failed to create assessment",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");
    const patientId = searchParams.get("patientId");

    let query = {};
    if (patientAdmissionId) {
      query.patientAdmissionId = patientAdmissionId;
    } else if (patientId) {
      query.patientId = patientId;
    }

    const assessments = await NutritionalAssessment.find(query)
      .populate("assessedBy", "name")
      .populate("patientId", "name email")
      .sort({ assessmentDate: -1 })
      .lean();

    return Response.json({ assessments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching nutritional assessments:", error);
    return Response.json({
      error: "Failed to fetch assessments",
      details: error.message
    }, { status: 500 });
  }
}
