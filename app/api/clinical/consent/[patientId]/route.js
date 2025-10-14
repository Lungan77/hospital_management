import { connectDB } from "@/lib/mongodb";
import TreatmentConsent from "@/models/TreatmentConsent";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId } = await params;

    const consent = await TreatmentConsent.findOne({ patientAdmissionId: patientId })
      .populate("generalConsent.witnessedBy", "name")
      .populate("consentStatus.completedBy", "name")
      .populate("consentStatus.reviewedBy", "name");

    return Response.json({ consent }, { status: 200 });
  } catch (error) {
    console.error("Error fetching consent data:", error);
    return Response.json({ error: "Error fetching consent data" }, { status: 500 });
  }
}