import { connectDB } from "@/lib/mongodb";
import ClinicalData from "@/models/ClinicalData";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, medicalHistory } = await req.json();

    // Find or create clinical data record
    let clinicalData = await ClinicalData.findOne({ patientAdmissionId });
    
    if (!clinicalData) {
      clinicalData = await ClinicalData.create({
        patientAdmissionId,
        vitalSigns: [],
        allergies: [],
        medications: []
      });
    }

    // Update medical history
    clinicalData.medicalHistory = {
      ...medicalHistory,
      recordedBy: auth.session.user.id,
      recordedAt: new Date()
    };
    
    // Update completeness score
    clinicalData.calculateCompleteness();
    
    await clinicalData.save();

    return Response.json({ 
      message: "Medical history recorded successfully",
      clinicalData 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording medical history:", error);
    return Response.json({ error: "Error recording medical history" }, { status: 500 });
  }
}