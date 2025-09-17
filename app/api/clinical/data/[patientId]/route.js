import { connectDB } from "@/lib/mongodb";
import ClinicalData from "@/models/ClinicalData";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId } = params;

    const clinicalData = await ClinicalData.findOne({ patientAdmissionId: patientId })
      .populate("vitalSigns.recordedBy", "name")
      .populate("medicalHistory.recordedBy", "name")
      .populate("physicalAssessment.assessedBy", "name");

    return Response.json({ clinicalData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching clinical data:", error);
    return Response.json({ error: "Error fetching clinical data" }, { status: 500 });
  }
}