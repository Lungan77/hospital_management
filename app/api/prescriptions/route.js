import { connectDB } from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
import Diagnosis from "@/models/Diagnosis";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { diagnosisId, medications, additionalNotes } = await req.json();

    // Ensure the diagnosis exists
    const diagnosis = await Diagnosis.findById(diagnosisId);
    if (!diagnosis) {
      return Response.json({ error: "Diagnosis not found" }, { status: 404 });
    }

    // Save prescription
    const prescription = await Prescription.create({
      diagnosisId,
      doctorId: auth.session.user.id,
      medications,
      additionalNotes,
    });

    return Response.json({ message: "Prescription recorded successfully", prescription }, { status: 201 });
  } catch (error) {
    console.error("Error recording prescription:", error);
    return Response.json({ error: "Error recording prescription" }, { status: 500 });
  }
}
