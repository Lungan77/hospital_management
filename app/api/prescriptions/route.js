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

    // Ensure prescription doesn't already exist
    if (diagnosis.prescriptionId) {
      return Response.json({ error: "Prescription already exists for this diagnosis" }, { status: 400 });
    }

    // Create Prescription
    const prescription = await Prescription.create({
      diagnosisId,
      doctorId: auth.session.user.id,
      medications,
      additionalNotes,
    });

    // Update Diagnosis with Prescription ID
    await Diagnosis.findByIdAndUpdate(diagnosisId, { prescriptionId: prescription._id });

    return Response.json({ message: "Prescription recorded successfully", prescription }, { status: 201 });
  } catch (error) {
    console.error("Error recording prescription:", error);
    return Response.json({ error: "Error recording prescription" }, { status: 500 });
  }
}
