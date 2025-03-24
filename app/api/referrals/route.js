import { connectDB } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import Diagnosis from "@/models/Diagnosis";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { diagnosisId, specialistName, hospitalName, reasonForReferral, additionalNotes } = await req.json();

    // Ensure the diagnosis exists
    const diagnosis = await Diagnosis.findById(diagnosisId);
    if (!diagnosis) {
      return Response.json({ error: "Diagnosis not found" }, { status: 404 });
    }

    // Save referral document
    const referral = await Referral.create({
      diagnosisId,
      referringDoctorId: auth.session.user.id,
      specialistName,
      hospitalName,
      reasonForReferral,
      additionalNotes,
    });

    await Diagnosis.findByIdAndUpdate(diagnosisId, { referralId: referral._id });
    return Response.json({ message: "Referral document created successfully", referral }, { status: 201 });
  } catch (error) {
    console.error("Error creating referral document:", error);
    return Response.json({ error: "Error creating referral document" }, { status: 500 });
  }
}
