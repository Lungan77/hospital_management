import { connectDB } from "@/lib/mongodb";
import TreatmentPlan from "@/models/TreatmentPlan";
import Diagnosis from "@/models/Diagnosis";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { diagnosisId, lifestyleRecommendations, physiotherapy, mentalHealthSupport, followUpDate, additionalNotes } = await req.json();

    // Ensure the diagnosis exists
    const diagnosis = await Diagnosis.findById(diagnosisId);
    if (!diagnosis) {
      return Response.json({ error: "Diagnosis not found" }, { status: 404 });
    }

    // Save treatment plan
    const treatmentPlan = await TreatmentPlan.create({
      diagnosisId,
      doctorId: auth.session.user.id,
      lifestyleRecommendations,
      physiotherapy,
      mentalHealthSupport,
      followUpDate,
      additionalNotes,
    });

    return Response.json({ message: "Treatment plan recorded successfully", treatmentPlan }, { status: 201 });
  } catch (error) {
    console.error("Error recording treatment plan:", error);
    return Response.json({ error: "Error recording treatment plan" }, { status: 500 });
  }
}
